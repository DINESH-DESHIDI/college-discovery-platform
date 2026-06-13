// src/services/college.service.js
// College query logic aligned with the actual Prisma schema:
//   College { id, instCode, instituteName, place, districtCode, collegeType, affiliatedTo, cutoffs[] }
//   Branch  { id, code, name, cutoffs[] }
//   Cutoff  { id, category, gender, closingRank, year, collegeId, branchId }

const prisma = require("../config/prisma");
const { getGlobalRankings } = require("./ranking.service");

// ─── Include shape for list view (lightweight) ────────────────────────────────
const COLLEGE_LIST_INCLUDE = {
  _count: { select: { cutoffs: true } },
};

// ─── Include shape for detail view (full cutoff data) ─────────────────────────
const COLLEGE_DETAIL_INCLUDE = {
  cutoffs: {
    include: { branch: { select: { id: true, code: true, name: true } } },
    orderBy: [{ year: "desc" }, { category: "asc" }, { gender: "asc" }],
  },
};

/**
 * Build Prisma `where` clause from query params.
 * Searches across instituteName, place, districtCode, collegeType, affiliatedTo.
 */
const buildWhereClause = ({ search, q, collegeType, place, districtCode, rank, category, gender, branch }) => {
  const where = {};
  const term = (search || q || "").trim();
  if (term) {
    where.OR = [
      { instituteName:  { contains: term, mode: "insensitive" } },
      { place:          { contains: term, mode: "insensitive" } },
      { instCode:       { contains: term, mode: "insensitive" } },
      { districtCode:   { contains: term, mode: "insensitive" } },
      { collegeType:    { contains: term, mode: "insensitive" } },
      { affiliatedTo:   { contains: term, mode: "insensitive" } },
    ];
  }

  if (collegeType && collegeType !== "All" && collegeType !== "") {
    where.collegeType = { contains: collegeType, mode: "insensitive" };
  }

  if (place && place !== "All" && place !== "") {
    where.place = { contains: place, mode: "insensitive" };
  }

  if (districtCode && districtCode !== "All" && districtCode !== "") {
    where.districtCode = { equals: districtCode, mode: "insensitive" };
  }

  // Advanced cutoff filter mapping
  const cutoffFilter = {};
  let hasCutoffFilter = false;

  if (rank) {
    cutoffFilter.closingRank = { gte: parseInt(rank, 10) };
    hasCutoffFilter = true;
  }
  if (category && category !== "All" && category !== "") {
    cutoffFilter.category = category.toUpperCase().replace(/\s+/g, "_");
    hasCutoffFilter = true;
  }
  if (gender && gender !== "All" && gender !== "") {
    cutoffFilter.gender = gender.toUpperCase();
    hasCutoffFilter = true;
  }
  if (branch && branch !== "All" && branch !== "") {
    cutoffFilter.branch = {
      OR: [
        { code: { equals: branch, mode: "insensitive" } },
        { name: { contains: branch, mode: "insensitive" } }
      ]
    };
    hasCutoffFilter = true;
  }

  if (hasCutoffFilter) {
    where.cutoffs = {
      some: cutoffFilter
    };
  }

  return where;
};

/**
 * Build Prisma `orderBy` from sort param.
 */
const buildOrderBy = (sort) => {
  const map = {
    name:     { instituteName: "asc" },
    nameDesc: { instituteName: "desc" },
    code:     { instCode: "asc" },
    place:    { place: "asc" },
  };
  return map[sort] || { instituteName: "asc" };
};

/**
 * Get paginated list of colleges with optional filters.
 * Includes cutoff count per college.
 */
const getColleges = async (query) => {
  const page  = Math.max(1, parseInt(query.page  || "1",  10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip  = (page - 1) * limit;

  const where   = buildWhereClause(query);
  const orderBy = buildOrderBy(query.sort);

  const [colleges, total] = await Promise.all([
    prisma.college.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: COLLEGE_LIST_INCLUDE,
    }),
    prisma.college.count({ where }),
  ]);

  return { colleges, total, page, limit };
};

/**
 * Get a single college by its `id` or `instCode`.
 * Includes full cutoff data with branch names.
 * Returns null if not found.
 */
const getCollegeById = async (idOrCode) => {
  const college = await prisma.college.findFirst({
    where: {
      OR: [{ id: idOrCode }, { instCode: idOrCode }],
    },
    include: COLLEGE_DETAIL_INCLUDE,
  });

  if (college) {
    const placement = await prisma.placement.findUnique({
      where: { collegeId: college.id }
    });
    return {
      ...college,
      placement: placement || null
    };
  }

  return college;
};

/**
 * Get cutoffs for a specific college, optionally filtered by year, category, gender.
 */
const getCollegeCutoffs = async (collegeId, { year, category, gender } = {}) => {
  const where = { collegeId };

  if (year)     where.year     = parseInt(year, 10);
  if (category) where.category = category.toUpperCase();
  if (gender)   where.gender   = gender.toUpperCase();

  const cutoffs = await prisma.cutoff.findMany({
    where,
    include: {
      branch: { select: { id: true, code: true, name: true } },
    },
    orderBy: [
      { branch: { name: "asc" } },
      { category: "asc" },
      { gender: "asc" },
    ],
  });

  return cutoffs;
};

/**
 * Get multiple colleges by their IDs — used for comparison.
 */
const getCollegesForComparison = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const [colleges, rankingsMap, placements] = await Promise.all([
    prisma.college.findMany({
      where: { id: { in: ids } },
      include: COLLEGE_DETAIL_INCLUDE,
    }),
    getGlobalRankings(),
    prisma.placement.findMany({
      where: { collegeId: { in: ids } }
    })
  ]);

  const placementMap = new Map(placements.map((p) => [p.collegeId, p]));

  return colleges.map((college) => {
    const rankData = rankingsMap.get(college.id);
    const placementData = placementMap.get(college.id);
    return {
      ...college,
      ranking: rankData || null,
      placement: placementData || null,
    };
  });
};

/**
 * Get all distinct places (for filter dropdowns).
 */
const getDistinctPlaces = async () => {
  const results = await prisma.college.findMany({
    select: { place: true },
    distinct: ["place"],
    where: { place: { not: null } },
    orderBy: { place: "asc" },
  });
  return results.map((r) => r.place).filter(Boolean);
};

/**
 * Get all distinct college types (for filter dropdowns).
 */
const getDistinctCollegeTypes = async () => {
  const results = await prisma.college.findMany({
    select: { collegeType: true },
    distinct: ["collegeType"],
    where: { collegeType: { not: null } },
    orderBy: { collegeType: "asc" },
  });
  return results.map((r) => r.collegeType).filter(Boolean);
};

/**
 * Predict eligible colleges based on EAMCET rank, category, gender.
 * Queries real Cutoff data: finds colleges where closingRank >= userRank.
 */
const predictColleges = async ({ rank, category, gender, year = 2025, branch, collegeType, place }) => {
  const userRank = Math.max(1, parseInt(rank, 10) || 1);
  const cat = (category || "OC").toUpperCase().replace(/\s+/g, "_");
  const gen = (gender || "BOYS").toUpperCase();

  const where = {
    year,
    category: cat,
    gender: gen,
    closingRank: { gte: Math.round(userRank * 0.7) },
  };

  if (branch && branch !== "All" && branch !== "") {
    where.branch = {
      code: { equals: branch, mode: "insensitive" }
    };
  }

  const collegeFilter = {};
  let hasCollegeFilter = false;

  if (collegeType && collegeType !== "All" && collegeType !== "") {
    collegeFilter.collegeType = { contains: collegeType, mode: "insensitive" };
    hasCollegeFilter = true;
  }

  if (place && place !== "All" && place !== "") {
    collegeFilter.OR = [
      { place: { contains: place, mode: "insensitive" } },
      { districtCode: { equals: place, mode: "insensitive" } }
    ];
    hasCollegeFilter = true;
  }

  if (hasCollegeFilter) {
    where.college = collegeFilter;
  }

  // Find all cutoffs matching user's constraints
  const cutoffs = await prisma.cutoff.findMany({
    where,
    include: {
      college: {
        select: {
          id: true,
          instCode: true,
          instituteName: true,
          place: true,
          districtCode: true,
          collegeType: true,
          affiliatedTo: true,
        },
      },
      branch: { select: { id: true, code: true, name: true } },
    },
    orderBy: { closingRank: "asc" },
    take: 100,
  });

  const calculateProbability = (uRank, cRank) => {
    if (!cRank) return 0;
    const exponent = (uRank - cRank) / (cRank * 0.15);
    const prob = Math.round(100 / (1 + Math.exp(exponent)));
    return Math.min(99, Math.max(1, prob));
  };

  // Group by college
  const collegeMap = new Map();
  for (const cutoff of cutoffs) {
    const cid = cutoff.collegeId;
    const prob = calculateProbability(userRank, cutoff.closingRank);
    
    let chance = "Low";
    if (prob >= 75) chance = "High";
    else if (prob >= 40) chance = "Medium";

    if (!collegeMap.has(cid)) {
      collegeMap.set(cid, {
        college: cutoff.college,
        branches: [],
        bestRank: cutoff.closingRank,
        bestProbability: prob,
        bestChance: chance,
      });
    }
    const entry = collegeMap.get(cid);
    entry.branches.push({
      branch: cutoff.branch,
      closingRank: cutoff.closingRank,
      admissionProbability: prob,
      chance,
    });
    
    if (cutoff.closingRank < entry.bestRank) entry.bestRank = cutoff.closingRank;
    if (prob > entry.bestProbability) {
      entry.bestProbability = prob;
      entry.bestChance = chance;
    }
  }

  const results = Array.from(collegeMap.values())
    .map(({ college, branches, bestRank, bestProbability, bestChance }) => {
      return {
        id:            college.id,
        instCode:      college.instCode,
        instituteName: college.instituteName,
        place:         college.place,
        collegeType:   college.collegeType,
        affiliatedTo:  college.affiliatedTo,
        bestClosingRank: bestRank,
        admissionProbability: bestProbability,
        chance: bestChance,
        category: cat,
        gender: gen,
        branches: branches.sort((a, b) => b.admissionProbability - a.admissionProbability).slice(0, 5),
      };
    })
    // Sort colleges by best probability descending (highest chance of getting in first)
    .sort((a, b) => b.admissionProbability - a.admissionProbability);

  return results;
};

/**
 * Get all branches.
 */
const getAllBranches = async () => {
  return prisma.branch.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { cutoffs: true } } },
  });
};

module.exports = {
  getColleges,
  getCollegeById,
  getCollegeCutoffs,
  getCollegesForComparison,
  getDistinctPlaces,
  getDistinctCollegeTypes,
  predictColleges,
  getAllBranches,
};

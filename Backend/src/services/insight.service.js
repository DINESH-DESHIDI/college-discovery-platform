// src/services/insight.service.js
// Insight analytics using the REAL schema:
//   College { id, instCode, instituteName, place, districtCode, collegeType, affiliatedTo, cutoffs[] }
//   Branch  { id, code, name }
//   Cutoff  { id, category, gender, closingRank, year, collegeId, branchId }

const prisma = require("../config/prisma");

/**
 * Get all colleges with cutoff count (used for analytics).
 */
const getAllCollegesWithDetails = async () => {
  return prisma.college.findMany({
    include: {
      _count: { select: { cutoffs: true } },
    },
    orderBy: { instituteName: "asc" },
  });
};

/**
 * Get a single college with full cutoff data and branch names.
 */
const getCollegeByIdWithDetails = async (idOrCode) => {
  return prisma.college.findFirst({
    where: { OR: [{ id: idOrCode }, { instCode: idOrCode }] },
    include: {
      cutoffs: {
        include: { branch: { select: { id: true, code: true, name: true } } },
        orderBy: [{ year: "desc" }, { category: "asc" }],
      },
    },
  });
};

/**
 * Get top N colleges by cutoff count (most branches/courses = most data).
 */
const getTrendingColleges = async (limit = 10) => {
  const colleges = await prisma.college.findMany({
    include: {
      _count: { select: { cutoffs: true } },
    },
    orderBy: { cutoffs: { _count: "desc" } },
    take: limit,
  });

  return colleges.map((c) => ({
    id:            c.id,
    instCode:      c.instCode,
    instituteName: c.instituteName,
    place:         c.place,
    collegeType:   c.collegeType,
    affiliatedTo:  c.affiliatedTo,
    cutoffCount:   c._count.cutoffs,
  }));
};

/**
 * Get similar colleges based on same place or college type.
 */
const getSimilarColleges = async (idOrCode, limit = 5) => {
  const target = await getCollegeByIdWithDetails(idOrCode);
  if (!target) return null;

  const candidates = await prisma.college.findMany({
    where: {
      id: { not: target.id },
      OR: [
        { place:       target.place       || undefined },
        { collegeType: target.collegeType || undefined },
        { affiliatedTo: target.affiliatedTo || undefined },
      ],
    },
    include: { _count: { select: { cutoffs: true } } },
    take: limit * 3,
  });

  // Score by similarity
  const scored = candidates.map((c) => {
    let score = 0;
    if (c.place       === target.place)       score += 40;
    if (c.collegeType === target.collegeType)  score += 30;
    if (c.affiliatedTo === target.affiliatedTo) score += 20;
    score += Math.min(c._count.cutoffs, 100) * 0.1;
    return { ...c, similarityScore: score };
  });

  return scored
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map(({ similarityScore, _count, ...c }) => ({
      ...c,
      cutoffCount: _count.cutoffs,
      similarityScore,
    }));
};

/**
 * Get ranking details based on cutoff count and data availability.
 */
const getRankingDetails = async (idOrCode) => {
  const all    = await getAllCollegesWithDetails();
  const target = all.find((c) => c.id === idOrCode || c.instCode === idOrCode);
  if (!target) return null;

  const sorted     = [...all].sort((a, b) => b._count.cutoffs - a._count.cutoffs);
  const overallRank = sorted.findIndex((c) => c.id === target.id) + 1;
  const statePeers  = all.filter((c) => c.place === target.place);
  const stateRank   = statePeers
    .sort((a, b) => b._count.cutoffs - a._count.cutoffs)
    .findIndex((c) => c.id === target.id) + 1;

  return {
    id:            target.id,
    instCode:      target.instCode,
    instituteName: target.instituteName,
    place:         target.place,
    collegeType:   target.collegeType,
    cutoffCount:   target._count.cutoffs,
    overallRank,
    stateRank:     stateRank > 0 ? stateRank : null,
    overallRankLabel: `#${overallRank} by Data Coverage`,
    stateRankLabel: stateRank > 0 ? `#${stateRank} in ${target.place}` : null,
  };
};

/**
 * Get predicted colleges using real cutoff data.
 * (Delegates to college.service.predictColleges for DRY code.)
 */
const { predictColleges: predictCollegesFromService } = require("./college.service");

const getPredictedColleges = async ({ examType, rank, category, gender }) => {
  return predictCollegesFromService({ rank, category, gender });
};

module.exports = {
  getSimilarColleges,
  getTrendingColleges,
  getRankingDetails,
  getPredictedColleges,
  getAllCollegesWithDetails,
  getCollegeByIdWithDetails,
};

// src/controllers/college.controller.js

const {
  getColleges,
  getCollegeById,
  getCollegeCutoffs,
  getCollegesForComparison,
  getDistinctPlaces,
  getDistinctCollegeTypes,
  predictColleges,
  getAllBranches,
} = require("../services/college.service");
const prisma = require("../config/prisma");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");

// GET /api/colleges  — paginated list with filters
const listColleges = async (req, res, next) => {
  try {
    const { colleges, total, page, limit } = await getColleges(req.query);
    return sendPaginated(res, colleges, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/colleges/search  — alias (same as list with q param)
const searchColleges = async (req, res, next) => {
  try {
    const { colleges, total, page, limit } = await getColleges(req.query);
    return sendPaginated(res, colleges, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/colleges/compare?ids=id1,id2,id3
const compareColleges = async (req, res, next) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return sendError(res, "Provide college IDs as ?ids=id1,id2,id3", 400);
    }
    const idList = ids.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 4);
    if (idList.length < 2) {
      return sendError(res, "Provide at least 2 college IDs to compare.", 400);
    }
    const colleges = await getCollegesForComparison(idList);
    return sendSuccess(res, colleges, "Comparison data fetched.");
  } catch (err) {
    next(err);
  }
};

// GET /api/colleges/predict?rank=5000&category=OC&gender=BOYS
const predictCollegesController = async (req, res, next) => {
  try {
    const { rank, category, gender, year, branch, collegeType, place, district } = req.query;
    if (!rank) {
      return sendError(res, "rank parameter is required.", 400);
    }
    const results = await predictColleges({
      rank:     Math.max(1, Number(rank) || 1),
      category: category || "OC",
      gender:   gender   || "BOYS",
      year:     year     ? parseInt(year, 10) : 2025,
      branch,
      collegeType,
      place:    place || district,
    });
    return sendSuccess(res, results, "Predictions generated successfully.");
  } catch (err) {
    next(err);
  }
};

// GET /api/colleges/filters — distinct filter values for UI dropdowns
const getFilterOptions = async (req, res, next) => {
  try {
    const [places, collegeTypes] = await Promise.all([
      getDistinctPlaces(),
      getDistinctCollegeTypes(),
    ]);
    return sendSuccess(res, { places, collegeTypes }, "Filter options fetched.");
  } catch (err) {
    next(err);
  }
};

// GET /api/colleges/:id  — single college by id or instCode
const getCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await getCollegeById(id);
    if (!college) {
      return sendError(res, "College not found.", 404);
    }
    return sendSuccess(res, college, "College fetched.");
  } catch (err) {
    next(err);
  }
};

// GET /api/colleges/:id/cutoffs?year=2025&category=OC&gender=BOYS
const getCollegeCutoffsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await prisma.college.findFirst({
      where: { OR: [{ id }, { instCode: id }] },
      select: { id: true },
    });
    if (!college) {
      return sendError(res, "College not found.", 404);
    }
    const cutoffs = await getCollegeCutoffs(college.id, req.query);
    return sendSuccess(res, cutoffs, "Cutoffs fetched.");
  } catch (err) {
    next(err);
  }
};

// GET /api/branches
const getBranches = async (req, res, next) => {
  try {
    const branches = await getAllBranches();
    return sendSuccess(res, branches, "Branches fetched.");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listColleges,
  searchColleges,
  compareColleges,
  predictColleges: predictCollegesController,
  getFilterOptions,
  getCollege,
  getCollegeCutoffs: getCollegeCutoffsController,
  getBranches,
};

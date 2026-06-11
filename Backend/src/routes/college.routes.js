// src/routes/college.routes.js

const express = require("express");
const router  = express.Router();

const {
  listColleges,
  searchColleges,
  compareColleges,
  getFilterOptions,
  predictColleges,
  getCollege,
  getCollegeCutoffs,
  getBranches,
} = require("../controllers/college.controller");

// ── Static routes (MUST come before /:id) ─────────────────────────────────────

// GET /api/colleges                  — paginated list with filters
router.get("/", listColleges);

// GET /api/colleges/search           — search alias
router.get("/search", searchColleges);

// GET /api/colleges/compare          — comparison endpoint
router.get("/compare", compareColleges);

// GET /api/colleges/predict          — EAMCET rank prediction
// query: rank, category (OC|BC_A|...|ST|EWS), gender (BOYS|GIRLS), year
router.get("/predict", predictColleges);

// GET /api/colleges/filters          — distinct filter values for UI dropdowns
router.get("/filters", getFilterOptions);

// GET /api/colleges/branches         — all branches (alias under colleges)
router.get("/branches", getBranches);

// ── Dynamic routes ─────────────────────────────────────────────────────────────

// GET /api/colleges/:id              — single college by id or instCode
router.get("/:id", getCollege);

// GET /api/colleges/:id/cutoffs      — all cutoffs for a college
// query: year, category, gender
router.get("/:id/cutoffs", getCollegeCutoffs);

module.exports = router;

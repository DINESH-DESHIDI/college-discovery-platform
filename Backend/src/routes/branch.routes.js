const express = require("express");
const { getBranches } = require("../controllers/college.controller");

const router = express.Router();

// GET /api/branches
router.get("/", getBranches);

module.exports = router;

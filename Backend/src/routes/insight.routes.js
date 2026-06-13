const express = require("express");
const router = express.Router();
const {
  predictor,
  similarColleges,
  rankingDetails,
  trending,
} = require("../controllers/insight.controller");
const {
  recommendColleges,
  collegeAIInsights
} = require("../controllers/ai.controller");

router.get("/predict", predictor);
router.get("/colleges/:id/similar", similarColleges);
router.get("/colleges/:id/rankings", rankingDetails);
router.get("/trending", trending);

// AI Gemini routes
router.post("/recommend", recommendColleges);
router.get("/colleges/:id/ai-insights", collegeAIInsights);

module.exports = router;

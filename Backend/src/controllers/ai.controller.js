const {
  getPersonalizedRecommendations,
  getCollegeAIInsights
} = require("../services/ai.service");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Endpoint: POST /api/insights/recommend
 */
const recommendColleges = async (req, res, next) => {
  try {
    const { rank, category, gender, location, branchPreference } = req.body;
    if (!rank) {
      return sendError(res, "Rank parameter is required.", 400);
    }

    const results = await getPersonalizedRecommendations({
      rank,
      category,
      gender,
      location,
      branchPreference
    });
    return sendSuccess(res, results, "Personalized college recommendations generated.");
  } catch (err) {
    next(err);
  }
};

/**
 * Endpoint: GET /api/insights/colleges/:id
 */
const collegeAIInsights = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getCollegeAIInsights(id);
    return sendSuccess(res, result, "AI insights generated successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  recommendColleges,
  collegeAIInsights
};

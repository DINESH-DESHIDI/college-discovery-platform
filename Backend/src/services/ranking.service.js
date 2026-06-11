// src/services/ranking.service.js
const prisma = require("../config/prisma");

/**
 * Fetch and calculate global college rankings based on Cutoff data.
 * The formula:
 * score = (0.7 * avgRank) + (0.2 * bestRank) - (branchCount * 500)
 * Lower score = better rank.
 *
 * @returns {Promise<Map<string, Object>>} Map of collegeId to their ranking data.
 */
const getGlobalRankings = async () => {
  // Use queryRaw for optimal performance and counting distinct branches
  const stats = await prisma.$queryRaw`
    SELECT 
      "collegeId", 
      AVG("closingRank") as "avgRank", 
      MIN("closingRank") as "bestRank", 
      COUNT(DISTINCT "branchId") as "branchCount"
    FROM "Cutoff" 
    GROUP BY "collegeId"
  `;

  const rankings = stats.map((stat) => {
    // Note: avgRank from raw query is a BigInt or Number depending on driver, bestRank is Number, branchCount is BigInt
    const avgRank = Number(stat.avgRank);
    const bestRank = Number(stat.bestRank);
    const branchCount = Number(stat.branchCount);

    const score = (0.7 * avgRank) + (0.2 * bestRank) - (branchCount * 500);

    return {
      collegeId: stat.collegeId,
      avgRank: Math.round(avgRank),
      bestRank,
      branchCount,
      score,
    };
  });

  // Sort by score ascending (lower score is better)
  rankings.sort((a, b) => a.score - b.score);

  // Assign overall rank
  const rankingMap = new Map();
  rankings.forEach((r, index) => {
    rankingMap.set(r.collegeId, {
      overallRank: index + 1,
      score: r.score,
      avgRank: r.avgRank,
      bestRank: r.bestRank,
      branchCount: r.branchCount,
    });
  });

  return rankingMap;
};

module.exports = {
  getGlobalRankings,
};

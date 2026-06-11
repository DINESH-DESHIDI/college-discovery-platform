// src/services/analytics.service.js
// Analytics based on real imported college/cutoff data

const prisma = require("../config/prisma");

const recordEvent = async ({ type, userId, metadata }) => {
  return prisma.analyticsEvent.create({
    data: {
      type,
      userId,
      metadata: metadata || {},
    },
  });
};

const getAnalyticsDashboard = async ({ place, collegeType } = {}) => {
  const where = {};
  if (place) where.place = { contains: place, mode: "insensitive" };
  if (collegeType) where.collegeType = { contains: collegeType, mode: "insensitive" };

  const [colleges, cutoffStats, places, types] = await Promise.all([
    prisma.college.findMany({
      where,
      take: 6,
      orderBy: { instituteName: "asc" },
      include: { _count: { select: { cutoffs: true } } },
    }),
    prisma.cutoff.groupBy({
      by: ["year"],
      _count: { _all: true },
      _avg: { closingRank: true },
      orderBy: { year: "asc" },
    }),
    prisma.college.findMany({
      select: { place: true },
      distinct: ["place"],
      where: { place: { not: null } },
      orderBy: { place: "asc" },
    }),
    prisma.college.findMany({
      select: { collegeType: true },
      distinct: ["collegeType"],
      where: { collegeType: { not: null } },
      orderBy: { collegeType: "asc" },
    }),
  ]);

  const trends = cutoffStats.map((row) => ({
    year: String(row.year),
    cutoffCount: row._count._all,
    averageClosingRank: Math.round(row._avg.closingRank || 0),
  }));

  const topTrendingColleges = colleges
    .map((college) => ({
      id: college.id,
      name: college.instituteName,
      instCode: college.instCode,
      place: college.place,
      collegeType: college.collegeType,
      cutoffCount: college._count.cutoffs,
      score: college._count.cutoffs,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    trends,
    topTrendingColleges,
    filters: {
      places: places.map((p) => p.place).filter(Boolean),
      collegeTypes: types.map((t) => t.collegeType).filter(Boolean),
      place: place || null,
      collegeType: collegeType || null,
    },
  };
};

module.exports = { recordEvent, getAnalyticsDashboard };

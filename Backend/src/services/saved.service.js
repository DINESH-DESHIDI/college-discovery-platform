// src/services/saved.service.js
// Business logic for saving and un-saving colleges per user

const prisma = require("../config/prisma");

/**
 * Save a college for a user.
 * Returns the new saved record, or the existing one if already saved.
 */
const saveCollege = async (userId, collegeId) => {
  // Resolve by id or instCode
  const college = await prisma.college.findFirst({
    where: { OR: [{ id: collegeId }, { instCode: collegeId }] },
    select: { id: true },
  });

  if (!college) {
    const err = new Error("College not found.");
    err.statusCode = 404;
    throw err;
  }

  const existing = await prisma.savedCollege.findUnique({
    where: { userId_collegeId: { userId, collegeId: college.id } },
  });

  if (existing) {
    const collegeData = await prisma.college.findUnique({
      where: { id: college.id },
      select: {
        id: true,
        instCode: true,
        instituteName: true,
        place: true,
        collegeType: true,
        affiliatedTo: true,
      },
    });
    return { ...existing, college: collegeData };
  }

  const created = await prisma.savedCollege.create({
    data: { userId, collegeId: college.id },
  });

  const collegeData = await prisma.college.findUnique({
    where: { id: college.id },
    select: {
      id: true,
      instCode: true,
      instituteName: true,
      place: true,
      collegeType: true,
      affiliatedTo: true,
    },
  });

  return { ...created, college: collegeData };
};

/**
 * Get all colleges saved by a user.
 */
const getSavedColleges = async (userId) => {
  const saved = await prisma.savedCollege.findMany({
    where: { userId },
    orderBy: { savedAt: "desc" },
  });

  if (saved.length === 0) return [];

  const colleges = await prisma.college.findMany({
    where: { id: { in: saved.map((s) => s.collegeId) } },
    select: {
      id: true,
      instCode: true,
      instituteName: true,
      place: true,
      districtCode: true,
      collegeType: true,
      affiliatedTo: true,
      _count: { select: { cutoffs: true } },
    },
  });

  const collegeMap = new Map(colleges.map((c) => [c.id, c]));

  return saved
    .map((s) => {
      const college = collegeMap.get(s.collegeId);
      if (!college) return null;
      return { ...college, savedAt: s.savedAt, savedId: s.id };
    })
    .filter(Boolean);
};

/**
 * Remove a saved college by its SavedCollege record ID.
 */
const unsaveCollege = async (userId, savedId) => {
  const record = await prisma.savedCollege.findUnique({ where: { id: savedId } });

  if (!record) {
    const err = new Error("Saved record not found.");
    err.statusCode = 404;
    throw err;
  }

  if (record.userId !== userId) {
    const err = new Error("You can only remove your own saved colleges.");
    err.statusCode = 403;
    throw err;
  }

  await prisma.savedCollege.delete({ where: { id: savedId } });
  return true;
};

module.exports = { saveCollege, getSavedColleges, unsaveCollege };

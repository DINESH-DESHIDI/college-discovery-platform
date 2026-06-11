/**
 * Normalize API college objects for shared UI components.
 */
export function getCollegeDisplayName(college) {
  return college?.instituteName || college?.name || "Unnamed College";
}

export function getCollegeLocation(college) {
  return college?.place || college?.location || "Location N/A";
}

export function getCollegeType(college) {
  return college?.collegeType || college?.type || "";
}

export function getCollegeShortName(college) {
  if (college?.shortName) return college.shortName;
  const name = getCollegeDisplayName(college);
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "CV";
}

export function normalizeCollegeForCard(college) {
  if (!college) return null;
  return {
    ...college,
    name: getCollegeDisplayName(college),
    location: getCollegeLocation(college),
    type: getCollegeType(college),
    shortName: getCollegeShortName(college),
  };
}

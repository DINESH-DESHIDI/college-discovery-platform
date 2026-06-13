// src/data/colleges.js
// Static reference data used by the UI (category icons, exam categories, etc.)
// Real college data is fetched from the backend API via src/utils/api.js

// ── EAMCET reservation categories ─────────────────────────────────────────────
export const EAMCET_CATEGORIES = [
  { value: "OC", label: "OC (Open Category)" },
  { value: "BC_A", label: "BC-A" },
  { value: "BC_B", label: "BC-B" },
  { value: "BC_C", label: "BC-C" },
  { value: "BC_D", label: "BC-D" },
  { value: "BC_E", label: "BC-E" },
  { value: "SC_I", label: "SC-I" },
  { value: "SC_II", label: "SC-II" },
  { value: "SC_III", label: "SC-III" },
  { value: "ST", label: "ST (Scheduled Tribe)" },
  { value: "EWS", label: "EWS (Economically Weaker Section)" },
];

export const GENDERS = [
  { value: "BOYS", label: "Boys" },
  { value: "GIRLS", label: "Girls" },
];

// ── Course stream categories (used on Home page) ──────────────────────────────
export const courseCategories = [
  { slug: "engineering", name: "Engineering", icon: "Cpu", count: 2840 },
  { slug: "management", name: "Management", icon: "Briefcase", count: 1620 },
  { slug: "medical", name: "Medical", icon: "Stethoscope", count: 980 },
  { slug: "law", name: "Law", icon: "Scale", count: 540 },
  { slug: "design", name: "Design", icon: "Palette", count: 410 },
  { slug: "arts", name: "Arts & Humanities", icon: "BookOpen", count: 1230 },
  { slug: "science", name: "Science", icon: "FlaskConical", count: 1750 },
  { slug: "commerce", name: "Commerce", icon: "TrendingUp", count: 1340 },
];

// ── College type labels ────────────────────────────────────────────────────────
export const COLLEGE_TYPES = [
  "Government",
  "Private",
  "Aided",
  "Autonomous",
  "Deemed",
  "University",
];

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000,
});

// ── Auth token helper ──────────────────────────────────────────────────────────
api.setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// ── Response interceptor — normalizes error messages ──────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      err.userMessage = err.response.data?.message || "An error occurred.";
    } else if (err.code === "ECONNABORTED") {
      err.userMessage = "Request timed out. Please check your connection.";
    } else {
      err.userMessage = "Cannot connect to server.";
    }
    return Promise.reject(err);
  },
);

// ── College API helpers ────────────────────────────────────────────────────────

/**
 * Fetch paginated list of colleges.
 * @param {Object} params - { search, collegeType, place, sort, page, limit }
 */
export const fetchColleges = (params = {}) =>
  api.get("/api/colleges", { params }).then((r) => r.data);

/**
 * Fetch a single college by id or instCode.
 */
export const fetchCollege = (id) => api.get(`/api/colleges/${id}`).then((r) => r.data);

/**
 * Fetch cutoffs for a college.
 * @param {string} id - college id
 * @param {Object} params - { year, category, gender }
 */
export const fetchCollegeCutoffs = (id, params = {}) =>
  api.get(`/api/colleges/${id}/cutoffs`, { params }).then((r) => r.data);

/**
 * Fetch distinct filter values (places, collegeTypes) for dropdowns.
 */
export const fetchFilterOptions = () => api.get("/api/colleges/filters").then((r) => r.data);

/**
 * Predict eligible colleges based on EAMCET rank + category + gender.
 * @param {Object} params - { rank, category, gender, year }
 */
export const fetchPredictions = (params = {}) =>
  api.get("/api/colleges/predict", { params }).then((r) => r.data);

/**
 * Fetch all branches.
 */
export const fetchBranches = () => api.get("/api/branches").then((r) => r.data);

export default api;

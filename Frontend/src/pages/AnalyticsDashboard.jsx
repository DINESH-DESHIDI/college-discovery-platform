import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import api from "@/utils/api";
import { getCollegeDisplayName, getCollegeLocation } from "@/utils/college";
import { Loader2 } from "lucide-react";

export default function AnalyticsDashboard() {
  const [placeFilter, setPlaceFilter] = useState("");
  const [collegeTypeFilter, setCollegeTypeFilter] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Cutoff Analytics — CollVerse";
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (placeFilter) params.place = placeFilter;
    if (collegeTypeFilter) params.collegeType = collegeTypeFilter;

    api
      .get("/api/analytics/dashboard", { params })
      .then((res) => setData(res.data.data || null))
      .catch((err) => setError(err.userMessage || "Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [placeFilter, collegeTypeFilter]);

  const chartData = useMemo(
    () => (data?.trends || []).map((row) => ({
      year: row.year,
      cutoffs: row.cutoffCount,
      avgRank: row.averageClosingRank,
    })),
    [data]
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-destructive">
        {error}
      </div>
    );
  }

  const places = data?.filters?.places || [];
  const collegeTypes = data?.filters?.collegeTypes || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Cutoff analytics</p>
              <h1 className="mt-3 font-display text-3xl font-bold">EAMCET cutoff trends from imported data</h1>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={placeFilter}
                onChange={(e) => setPlaceFilter(e.target.value)}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">All places</option>
                {places.map((place) => (
                  <option key={place} value={place}>{place}</option>
                ))}
              </select>
              <select
                value={collegeTypeFilter}
                onChange={(e) => setCollegeTypeFilter(e.target.value)}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">All types</option>
                {collegeTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cutoffs" fill="#2563EB" name="Cutoff entries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <h2 className="text-lg font-semibold">Colleges with most cutoff data</h2>
          <p className="mt-2 text-sm text-muted-foreground">Based on imported EAMCET cutoff records.</p>
          <ul className="mt-6 space-y-4">
            {(data?.topTrendingColleges || []).map((college) => (
              <li key={college.id} className="rounded-2xl border border-border p-4">
                <Link to={`/colleges/${college.id}`} className="font-semibold hover:text-primary">
                  {getCollegeDisplayName(college)}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getCollegeLocation(college)} · {college.cutoffCount} cutoffs
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

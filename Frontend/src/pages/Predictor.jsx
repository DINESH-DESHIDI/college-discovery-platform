import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { EAMCET_CATEGORIES, GENDERS } from "@/data/colleges";
import { fetchPredictions } from "@/utils/api";
import { getCollegeDisplayName, getCollegeLocation, getCollegeType, getCollegeShortName } from "@/utils/college";

export default function Predictor() {
  const [rank, setRank] = useState(5000);
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("BOYS");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasPredicted, setHasPredicted] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    setError("");
    setHasPredicted(true);
    try {
      const res = await fetchPredictions({ rank, category, gender, year: 2025 });
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.userMessage || "Failed to fetch college predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elegant">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3 w-3" /> EAMCET College Predictor
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Estimate your admission chances</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Enter your EAMCET rank, reservation category, and gender to see colleges where your rank is within the 2025 closing rank.
            </p>
          </div>
          <div className="rounded-3xl bg-background p-5 shadow-soft border border-border flex items-center gap-3 text-sm text-muted-foreground sm:max-w-xs">
            <Search className="h-5 w-5 shrink-0 text-primary animate-pulse" />
            <span>Uses real imported EAMCET cutoff data from the database.</span>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-background p-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rank</label>
            <input
              type="number"
              min="1"
              value={rank}
              onChange={(e) => setRank(Math.max(1, Number(e.target.value) || 1))}
              className="mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="rounded-3xl border border-border bg-background p-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            >
              {EAMCET_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="rounded-3xl border border-border bg-background p-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="mt-8 inline-flex items-center gap-2 rounded-3xl bg-gradient-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-75"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analysing cutoff data...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Predict Colleges
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {hasPredicted && !loading && !error && (
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              Eligible Colleges
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{results.length} found</span>
            </h2>
            <span className="text-sm text-muted-foreground">Colleges where closing rank is at or above your rank for {category} / {gender}.</span>
          </div>

          {results.length === 0 ? (
            <div className="mt-8 text-center rounded-3xl border border-dashed border-border bg-card p-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/60" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No matches found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Try a higher rank or different category/gender combination.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((college) => (
                <article
                  key={college.id}
                  className="group relative flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elegant hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{getCollegeLocation(college)}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        college.chance === "High"
                          ? "bg-emerald-100 text-emerald-800"
                          : college.chance === "Medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {college.chance} Chance
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
                      {getCollegeShortName(college)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {getCollegeDisplayName(college)}
                      </h3>
                      <p className="text-xs text-muted-foreground font-semibold">{college.instCode} · {getCollegeType(college)}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Best closing rank</span>
                      <span className="font-semibold text-foreground">{college.bestClosingRank?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eligible branches</span>
                      <span className="font-semibold text-foreground">{college.branches?.length || 0}</span>
                    </div>
                    {college.branches?.slice(0, 3).map((b) => (
                      <div key={b.branch?.id || b.branch?.code} className="flex justify-between text-xs">
                        <span>{b.branch?.name || b.branch?.code}</span>
                        <span className="font-semibold text-foreground">{b.closingRank?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60">
                    <Link
                      to={`/colleges/${college.id}`}
                      className="font-bold text-primary hover:underline text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

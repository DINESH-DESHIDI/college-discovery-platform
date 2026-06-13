import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Heart,
  GitCompare,
  Building2,
  GraduationCap,
  Loader2,
  AlertCircle,
  MessageSquare,
  Star,
  Sparkles,
  Send,
  Plus,
  ArrowRight,
  User,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchCollege } from "@/utils/api";
import api from "@/utils/api";
import {
  getCollegeDisplayName,
  getCollegeLocation,
  getCollegeType,
  getCollegeShortName,
} from "@/utils/college";
import { useSavedColleges } from "@/hooks/useSavedColleges";
import { useCompare } from "@/hooks/useCompare";
import { useAuth } from "@/context/AuthContext";
import { EAMCET_CATEGORIES, GENDERS } from "@/data/colleges";

const tabs = ["Overview", "Cutoffs", "Reviews", "Discussions", "Predictor", "AI Insights"];

export default function CollegeDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Overview");
  const { isSaved, toggle: toggleSave } = useSavedColleges();
  const { inCompare, toggle: toggleCompare } = useCompare();

  // Reviews Tab States
  const [reviews, setReviews] = useState([]);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  // Discussions Tab States
  const [discussions, setDiscussions] = useState([]);
  const [discTitle, setDiscTitle] = useState("");
  const [discBody, setDiscBody] = useState("");
  const [discTags, setDiscTags] = useState("");
  const [submittingDisc, setSubmittingDisc] = useState(false);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [discussionsError, setDiscussionsError] = useState("");

  // Predictor Widget States
  const [predRank, setPredRank] = useState(5000);
  const [predCategory, setPredCategory] = useState("OC");
  const [predGender, setPredGender] = useState("BOYS");
  const [predictorResults, setPredictorResults] = useState(null);
  const [calculatingChance, setCalculatingChance] = useState(false);
  const [predError, setPredError] = useState("");

  // AI Insights States
  const [aiInsights, setAiInsights] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchCollege(id)
      .then((res) => {
        if (!active) return;
        setCollege(res.data || null);
        if (res.data) {
          document.title = `${getCollegeDisplayName(res.data)} — CollVerse`;
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err.userMessage || "Failed to load college.");
        setCollege(null);
        document.title = "College Not Found — CollVerse";
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  // Sync data when active tab changes
  useEffect(() => {
    if (!college?.id) return;

    if (tab === "Reviews") {
      setLoadingReviews(true);
      setReviewsError("");
      api
        .get(`/api/reviews/${college.id}`)
        .then((res) => setReviews(res.data.data || []))
        .catch(() => setReviews([]))
        .finally(() => setLoadingReviews(false));
    } else if (tab === "Discussions") {
      setLoadingDiscussions(true);
      setDiscussionsError("");
      api
        .get(`/api/discussions?collegeId=${college.id}`)
        .then((res) => setDiscussions(res.data.data || []))
        .catch(() => setDiscussions([]))
        .finally(() => setLoadingDiscussions(false));
    } else if (tab === "AI Insights" && !aiInsights) {
      setLoadingAI(true);
      api
        .get(`/api/insights/colleges/${college.id}/ai-insights`)
        .then((res) => setAiInsights(res.data.data?.insights || ""))
        .catch(() => setAiInsights("Failed to load AI Insights. Please try again."))
        .finally(() => setLoadingAI(false));
    }
  }, [tab, college?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 font-display text-3xl font-bold">College not found</h1>
        <p className="mt-2 text-muted-foreground">
          {error || "The college you're looking for doesn't exist."}
        </p>
        <Link
          to="/colleges"
          className="mt-6 inline-flex rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Browse all colleges
        </Link>
      </div>
    );
  }

  const displayName = getCollegeDisplayName(college);
  const location = getCollegeLocation(college);
  const collegeType = getCollegeType(college);
  const shortName = getCollegeShortName(college);
  const saved = isSaved(college.id);
  const compared = inCompare(college.id);
  const cutoffs = college.cutoffs || [];

  const cutoffsByBranch = cutoffs.reduce((acc, cutoff) => {
    const key = cutoff.branch?.name || cutoff.branch?.code || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(cutoff);
    return acc;
  }, {});

  return (
    <div>
      <div className="relative h-24 w-full overflow-hidden">
        <div className="h-full w-full bg-gradient-primary/50 opacity-90" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-10 rounded-3xl border border-border bg-card p-5 shadow-elegant sm:p-8">
          <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-elegant sm:h-24 sm:w-24">
              {shortName}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {collegeType && <Badge>{collegeType}</Badge>}
                {college.instCode && <Badge>Code: {college.instCode}</Badge>}
                {college.affiliatedTo && <Badge>{college.affiliatedTo}</Badge>}
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{displayName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
                {college.districtCode && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    District: {college.districtCode}
                  </span>
                )}
                {college.affiliatedTo && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    {college.affiliatedTo}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleSave(college.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  saved
                    ? "bg-primary text-primary-foreground shadow-elegant"
                    : "border border-border hover:border-primary hover:text-primary"
                }`}
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => toggleCompare(college.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  compared
                    ? "bg-foreground text-background"
                    : "border border-border hover:border-primary hover:text-primary"
                }`}
              >
                <GitCompare className="h-4 w-4" />
                {compared ? "In Compare" : "Compare"}
              </button>
            </div>
          </div>

          <div className="mt-6 sm:mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            <Stat label="Institute Code" value={college.instCode || "—"} />
            <Stat label="College Type" value={collegeType || "—"} />
            <Stat label="Cutoff Entries" value={String(cutoffs.length)} />
          </div>
        </div>

        <div className="sticky top-16 z-30 -mx-4 mt-8 border-b border-border bg-background/90 px-4 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                  tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
                {tab === t && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="py-10">
          {tab === "Overview" && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card title="About">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {displayName} is located in {location}.
                    {college.affiliatedTo ? ` It is affiliated to ${college.affiliatedTo}.` : ""}
                    {cutoffs.length > 0
                      ? ` EAMCET 2025 cutoff data is available for ${Object.keys(cutoffsByBranch).length} branch(es).`
                      : " Cutoff data is not yet available for this institute."}
                  </p>
                </Card>
              </div>
              <div className="space-y-6">
                <Card title="Quick Info">
                  <dl className="space-y-3 text-sm">
                    <Row label="Institute Code" value={college.instCode} />
                    <Row label="Type" value={collegeType} />
                    <Row label="Place" value={location} />
                    <Row label="District Code" value={college.districtCode || "—"} />
                    <Row label="Affiliated To" value={college.affiliatedTo || "—"} />
                  </dl>
                </Card>
              </div>
            </div>
          )}

          {tab === "Cutoffs" && (
            <div className="space-y-6">
              {cutoffs.length === 0 ? (
                <Card title="EAMCET Cutoffs">
                  <p className="text-sm text-muted-foreground">
                    No cutoff data available for this college yet.
                  </p>
                </Card>
              ) : (
                Object.entries(cutoffsByBranch).map(([branchName, branchCutoffs]) => (
                  <Card key={branchName} title={`${branchName} — EAMCET 2025 Closing Ranks`}>
                    <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
                      <table className="w-full min-w-[500px] text-left text-sm">
                        <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="py-3 pr-4">Category</th>
                            <th className="py-3 pr-4">Gender</th>
                            <th className="py-3 pr-4">Year</th>
                            <th className="py-3 text-right">Closing Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {branchCutoffs
                            .sort(
                              (a, b) =>
                                a.category.localeCompare(b.category) ||
                                a.gender.localeCompare(b.gender),
                            )
                            .map((c) => (
                              <tr key={c.id} className="border-b border-border/60 last:border-0">
                                <td className="py-3 pr-4 font-medium">{c.category}</td>
                                <td className="py-3 pr-4 text-muted-foreground">{c.gender}</td>
                                <td className="py-3 pr-4 text-muted-foreground">{c.year}</td>
                                <td className="py-3 text-right font-semibold">
                                  {c.closingRank.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {tab === "Reviews" && (
            <div className="space-y-8">
              {/* Submit Review Form */}
              <Card title="Write a review">
                {isAuthenticated ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSubmittingReview(true);
                      setReviewsError("");
                      try {
                        const res = await api.post("/api/reviews", {
                          collegeId: college.id,
                          title: reviewTitle,
                          body: reviewBody,
                          rating: Number(reviewRating),
                        });
                        setReviews((prev) => [res.data.data, ...prev]);
                        setReviewTitle("");
                        setReviewBody("");
                        setReviewRating(5);
                      } catch (err) {
                        setReviewsError(err.userMessage || "Failed to submit review.");
                      } finally {
                        setSubmittingReview(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    {reviewsError && (
                      <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                        {reviewsError}
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Rating
                      </label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="mt-2 w-full max-w-xs rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Good</option>
                        <option value={2}>2 Stars - Below Average</option>
                        <option value={1}>1 Star - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                        Review Title
                      </label>
                      <input
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Summarize your experience (e.g. Excellent placement cell)"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                        Review Details (Min 20 characters)
                      </label>
                      <textarea
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        rows={4}
                        placeholder="Tell us about placements, academics, campus life, hostels..."
                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-75"
                    >
                      <Send className="h-4 w-4" />{" "}
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground border border-border">
                    Please{" "}
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                      Log in
                    </Link>{" "}
                    to share your experience and write a review.
                  </div>
                )}
              </Card>

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" /> Verified Reviews (
                  {reviews.length})
                </h3>
                {loadingReviews ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    No reviews yet. Be the first to share your feedback!
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-1.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < r.rating ? "fill-current" : "text-border"}`}
                              />
                            ))}
                            <span className="text-xs font-bold text-foreground ml-1">
                              ({r.rating})
                            </span>
                          </div>
                          <h4 className="mt-2 font-display text-base font-bold text-foreground">
                            {r.title}
                          </h4>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {r.body}
                      </p>
                      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-3">
                        <User className="h-3.5 w-3.5 text-primary" /> By{" "}
                        <span className="font-bold text-foreground">{r.author || "Anonymous"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "Discussions" && (
            <div className="space-y-8">
              {/* Ask Question Form */}
              <Card title="Start a new discussion thread">
                {isAuthenticated ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSubmittingDisc(true);
                      setDiscussionsError("");
                      try {
                        const res = await api.post("/api/discussions", {
                          title: discTitle,
                          body: discBody,
                          tags: discTags
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                          collegeId: college.id,
                        });
                        setDiscussions((prev) => [res.data.data, ...prev]);
                        setDiscTitle("");
                        setDiscBody("");
                        setDiscTags("");
                      } catch (err) {
                        setDiscussionsError(err.userMessage || "Failed to post question.");
                      } finally {
                        setSubmittingDisc(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    {discussionsError && (
                      <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                        {discussionsError}
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                        Question Title
                      </label>
                      <input
                        value={discTitle}
                        onChange={(e) => setDiscTitle(e.target.value)}
                        placeholder="e.g., How is the hostel facility and food quality?"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                        Details
                      </label>
                      <textarea
                        value={discBody}
                        onChange={(e) => setDiscBody(e.target.value)}
                        rows={4}
                        placeholder="Detail your question so other students can answer easily..."
                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                        Tags (comma separated)
                      </label>
                      <input
                        value={discTags}
                        onChange={(e) => setDiscTags(e.target.value)}
                        placeholder="hostel, food, transport"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingDisc}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-75"
                    >
                      <Plus className="h-4 w-4" /> {submittingDisc ? "Posting..." : "Post Question"}
                    </button>
                  </form>
                ) : (
                  <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground border border-border">
                    Please{" "}
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                      Log in
                    </Link>{" "}
                    to ask the community a question about this college.
                  </div>
                )}
              </Card>

              {/* Discussions List */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Active Discussions (
                  {discussions.length})
                </h3>
                {loadingDiscussions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    No discussions yet. Start a discussion above!
                  </div>
                ) : (
                  discussions.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:border-primary/20 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <h4 className="font-display text-base font-bold text-foreground">
                          {d.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{d.body}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(d.tags || []).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 border-t border-border/40 pt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <MessageSquare className="h-4 w-4" /> {d.answers?.length || 0} answers
                        </span>
                        <Link
                          to="/community"
                          className="font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          View details <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "Predictor" && (
            <div className="space-y-6">
              <Card title={`EAMCET Admission Estimator for ${displayName}`}>
                <p className="text-sm text-muted-foreground mb-6">
                  Input your reservation rank below to estimate your probability of getting into
                  various branches in this college.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Your Rank
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={predRank}
                      onChange={(e) => setPredRank(Math.max(1, Number(e.target.value) || 1))}
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </label>
                    <select
                      value={predCategory}
                      onChange={(e) => setPredCategory(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                      {EAMCET_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Gender
                    </label>
                    <select
                      value={predGender}
                      onChange={(e) => setPredGender(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                      {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {predError && (
                  <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    {predError}
                  </div>
                )}

                <button
                  onClick={async () => {
                    setCalculatingChance(true);
                    setPredError("");
                    try {
                      const res = await api.get("/api/colleges/predict", {
                        params: {
                          rank: predRank,
                          category: predCategory,
                          gender: predGender,
                          year: 2025,
                        },
                      });
                      const resultsList = res.data.data || [];
                      const matchingCollege = resultsList.find((c) => c.id === college.id);
                      setPredictorResults(matchingCollege || "none");
                    } catch (err) {
                      setPredError(
                        "Failed to calculate admission probabilities. Please try again.",
                      );
                    } finally {
                      setCalculatingChance(false);
                    }
                  }}
                  disabled={calculatingChance}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:scale-[1.01] transition-all"
                >
                  <Sparkles className="h-4 w-4" />{" "}
                  {calculatingChance ? "Calculating..." : "Estimate Chances"}
                </button>
              </Card>

              {predictorResults && (
                <div className="space-y-4 animate-fade-in">
                  {predictorResults === "none" ? (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
                      Admission chance is <strong>Very Low</strong>. EAMCET 2025 closing ranks for
                      this college are below your rank for your category/gender.
                    </div>
                  ) : (
                    <Card title="Admission Probability Results">
                      <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4 flex-wrap gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Overall College Chance
                          </div>
                          <div className="font-display text-xl font-bold flex items-center gap-2 mt-1">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                predictorResults.chance === "High"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : predictorResults.chance === "Medium"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {predictorResults.chance}
                            </span>
                            <span className="text-primary">
                              {predictorResults.admissionProbability}% Probability
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Best Closing Rank Offered
                          </div>
                          <div className="font-display text-lg font-bold text-foreground mt-1">
                            {predictorResults.bestClosingRank?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                          Branch-by-Branch breakdown
                        </div>
                        {predictorResults.branches?.map((b) => (
                          <div
                            key={b.branch?.id || b.branch?.code}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="font-medium text-foreground">
                              {b.branch?.name || b.branch?.code}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground font-medium">
                                Cutoff: {b.closingRank?.toLocaleString()}
                              </span>
                              <span
                                className={`font-bold ${
                                  b.chance === "High"
                                    ? "text-emerald-600"
                                    : b.chance === "Medium"
                                      ? "text-amber-600"
                                      : "text-rose-600"
                                }`}
                              >
                                {b.admissionProbability}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "AI Insights" && (
            <div className="space-y-6">
              <Card title={`Gemini AI Insights — ${displayName}`}>
                {loadingAI ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Consulting Gemini to generate custom insights...
                    </span>
                  </div>
                ) : aiInsights ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-muted-foreground whitespace-pre-line font-sans border border-border bg-background/50 rounded-2xl p-6">
                    {aiInsights}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Unable to generate insights at this moment.
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
      {children}
    </span>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      {title && <h3 className="mb-4 font-display text-lg font-semibold">{title}</h3>}
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col gap-2 bg-card p-4 sm:p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold">{value}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

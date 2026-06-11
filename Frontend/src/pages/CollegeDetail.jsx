import { Link, useParams } from "react-router-dom";
import { MapPin, Heart, GitCompare, Building2, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchCollege } from "@/utils/api";
import { getCollegeDisplayName, getCollegeLocation, getCollegeType, getCollegeShortName } from "@/utils/college";
import { useSavedColleges } from "@/hooks/useSavedColleges";
import { useCompare } from "@/hooks/useCompare";

const tabs = ["Overview", "Cutoffs"];

export default function CollegeDetail() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Overview");
  const { isSaved, toggle: toggleSave } = useSavedColleges();
  const { inCompare, toggle: toggleCompare } = useCompare();

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
        <p className="mt-2 text-muted-foreground">{error || "The college you're looking for doesn't exist."}</p>
        <Link to="/colleges" className="mt-6 inline-flex rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
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
        <div className="-mt-10 rounded-3xl border border-border bg-card p-6 shadow-elegant sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
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
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{location}</span>
                {college.districtCode && (
                  <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />District: {college.districtCode}</span>
                )}
                {college.affiliatedTo && (
                  <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" />{college.affiliatedTo}</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleSave(college.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${saved ? "bg-primary text-primary-foreground shadow-elegant" : "border border-border hover:border-primary hover:text-primary"
                  }`}
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => toggleCompare(college.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${compared ? "bg-foreground text-background" : "border border-border hover:border-primary hover:text-primary"
                  }`}
              >
                <GitCompare className="h-4 w-4" />
                {compared ? "In Compare" : "Compare"}
              </button>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
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
                className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t}
                {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-primary" />}
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
                  <p className="text-sm text-muted-foreground">No cutoff data available for this college yet.</p>
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
                            .sort((a, b) => a.category.localeCompare(b.category) || a.gender.localeCompare(b.gender))
                            .map((c) => (
                              <tr key={c.id} className="border-b border-border/60 last:border-0">
                                <td className="py-3 pr-4 font-medium">{c.category}</td>
                                <td className="py-3 pr-4 text-muted-foreground">{c.gender}</td>
                                <td className="py-3 pr-4 text-muted-foreground">{c.year}</td>
                                <td className="py-3 text-right font-semibold">{c.closingRank.toLocaleString()}</td>
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
        </div>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{children}</span>;
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {title && <h3 className="mb-4 font-display text-lg font-semibold">{title}</h3>}
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col gap-2 bg-card p-5">
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

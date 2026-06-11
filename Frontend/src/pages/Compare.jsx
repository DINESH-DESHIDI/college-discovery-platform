import { Link } from "react-router-dom";
import { GitCompare, X, Plus, Loader2, AlertCircle } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { EmptyState } from "@/components/ui/EmptyState";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { getCollegeDisplayName, getCollegeLocation, getCollegeType, getCollegeShortName } from "@/utils/college";

export default function Compare() {
  const { ids, toggle, clear } = useCompare();
  const [items, setItems] = useState([]);
  const [pickerList, setPickerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picker, setPicker] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Compare Colleges — CollVerse";
  }, []);

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");
    api
      .get(`/api/colleges/compare?ids=${ids.join(",")}`)
      .then((res) => {
        let fetched = res.data.data || [];
        fetched.sort((a, b) => {
          const rankA = a.ranking?.overallRank ?? Infinity;
          const rankB = b.ranking?.overallRank ?? Infinity;
          return rankA - rankB;
        });
        setItems(fetched);
      })
      .catch((err) => setError(err.userMessage || "Failed to load comparison data."))
      .finally(() => setLoading(false));
  }, [ids]);

  useEffect(() => {
    if (!picker) return;
    api
      .get("/api/colleges", { params: { limit: 50, sort: "name" } })
      .then((res) => setPickerList(res.data.data || []))
      .catch(() => setPickerList([]));
  }, [picker]);

  if (!ids || ids.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<GitCompare className="h-7 w-7" />}
          title="Your compare list is empty"
          description="Add up to 4 colleges from the listings or detail pages to compare them side-by-side."
          action={
            <Link to="/colleges" className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant">
              Browse colleges
            </Link>
          }
        />
      </div>
    );
  }

  const rows = [
    { label: "Overall Rank", render: (c) => c.ranking ? `#${c.ranking.overallRank}` : "N/A" },
    { label: "Average Closing Rank", render: (c) => c.ranking ? c.ranking.avgRank.toLocaleString() : "—" },
    { label: "Best Branch Rank", render: (c) => c.ranking ? c.ranking.bestRank.toLocaleString() : "—" },
    { label: "Institute Code", render: (c) => c.instCode || "—" },
    { label: "Type", render: (c) => getCollegeType(c) || "—" },
    { label: "Place", render: (c) => getCollegeLocation(c) },
    { label: "District", render: (c) => c.districtCode || "—" },
    { label: "Affiliated To", render: (c) => c.affiliatedTo || "—" },
    { label: "Cutoff Entries", render: (c) => String((c.cutoffs || []).length), winner: (c) => (c.cutoffs || []).length },
  ];

  const remaining = pickerList.filter((c) => !ids.includes(c.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Compare Colleges</h1>
          <p className="mt-1 text-sm text-muted-foreground">Comparing {ids.length} of 4 colleges side-by-side.</p>
        </div>
        <button onClick={clear} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-destructive hover:text-destructive">
          Clear all
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-48 p-5 text-xs uppercase tracking-wider text-muted-foreground">Attribute</th>
                  {items.map((c) => (
                    <th key={c.id} className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/colleges/${c.id}`} className="block">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary font-bold text-primary-foreground">
                            {getCollegeShortName(c)}
                          </div>
                          <div className="mt-3 font-display text-base font-semibold hover:text-primary">{getCollegeDisplayName(c)}</div>
                          <div className="mt-1 text-xs font-normal text-muted-foreground">{getCollegeLocation(c)}</div>
                        </Link>
                        <button onClick={() => toggle(c.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Remove">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                  {items.length < 4 && (
                    <th className="w-48 p-5">
                      <button
                        onClick={() => setPicker(true)}
                        className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
                      >
                        <Plus className="h-5 w-5" /> Add college
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/60 last:border-0">
                    <td className="p-5 align-top text-xs font-semibold uppercase tracking-wider text-muted-foreground">{row.label}</td>
                    {items.map((c) => (
                      <td key={c.id} className="p-5 align-top text-sm text-foreground/80">
                        {row.render(c)}
                      </td>
                    ))}
                    {items.length < 4 && <td />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Swipe Cards */}
          <div className="mt-6 flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory md:hidden -mx-4 px-4 sm:-mx-6 sm:px-6">
            {items.map((c) => (
              <div key={c.id} className="w-[85vw] max-w-[320px] shrink-0 snap-center rounded-2xl border border-border bg-card flex flex-col overflow-hidden shadow-soft">
                <div className="p-5 border-b border-border bg-muted/20 relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary font-bold text-primary-foreground mb-3">
                    {getCollegeShortName(c)}
                  </div>
                  <button onClick={() => toggle(c.id)} className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Remove">
                    <X className="h-4 w-4" />
                  </button>
                  <Link to={`/colleges/${c.id}`} className="block">
                    <div className="font-display text-base font-semibold hover:text-primary">{getCollegeDisplayName(c)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{getCollegeLocation(c)}</div>
                  </Link>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  {rows.map((row) => (
                    <div key={row.label} className="flex flex-col gap-1">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{row.label}</div>
                      <div className="text-sm font-medium">{row.render(c)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {items.length < 4 && (
              <div className="w-[85vw] max-w-[320px] shrink-0 snap-center rounded-2xl border-2 border-dashed border-border bg-transparent flex items-center justify-center p-8">
                <button
                  onClick={() => setPicker(true)}
                  className="flex flex-col items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <Plus className="h-8 w-8 mb-2" /> Add college
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {picker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPicker(false)} />
          <div className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="font-display text-lg font-semibold">Add to compare</h3>
              <button onClick={() => setPicker(false)} className="rounded-lg p-2 hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {remaining.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { toggle(c.id); setPicker(false); }}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-secondary"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-sm font-bold text-primary-foreground">
                    {getCollegeShortName(c)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{getCollegeDisplayName(c)}</div>
                    <div className="text-xs text-muted-foreground">{getCollegeLocation(c)} · {c.instCode}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

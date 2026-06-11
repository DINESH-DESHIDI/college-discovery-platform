import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, Grid3x3, ChevronLeft, ChevronRight, Loader2, AlertCircle, Building2, MapPin, GraduationCap } from "lucide-react";
import { fetchColleges, fetchFilterOptions } from "@/utils/api";
import { Link } from "react-router-dom";

const PAGE_SIZE = 20;

// ─── College Card ─────────────────────────────────────────────────────────────
function CollegeCard({ college }) {
  const initials = college.instituteName
    ?.split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || "??";

  return (
    <Link
      to={`/colleges/${college.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary text-lg font-bold text-primary-foreground shadow-sm">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {college.instituteName}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            Code: {college.instCode}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {college.place && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {college.place}
          </span>
        )}
        {college.collegeType && (
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {college.collegeType}
          </span>
        )}
        {college.affiliatedTo && (
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {college.affiliatedTo.length > 30
              ? college.affiliatedTo.slice(0, 30) + "…"
              : college.affiliatedTo}
          </span>
        )}
      </div>

      {college._count?.cutoffs > 0 && (
        <div className="mt-auto border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
            {college._count.cutoffs} cutoff entries
          </span>
        </div>
      )}
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CollegeCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded bg-muted w-3/4" />
          <div className="h-3 rounded bg-muted w-1/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Colleges() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ──
  const [colleges, setColleges]         = useState([]);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [page, setPage]                 = useState(() => parseInt(searchParams.get("page") || "1", 10));
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [searchTerm, setSearchTerm]     = useState(searchParams.get("search") || searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [collegeType, setCollegeType]   = useState(searchParams.get("collegeType") || "");
  const [place, setPlace]               = useState(searchParams.get("place") || "");
  const [sort, setSort]                 = useState(searchParams.get("sort") || "name");
  const [filterOptions, setFilterOptions] = useState({ places: [], collegeTypes: [] });
  const [filtersOpen, setFiltersOpen]   = useState(false);

  // ── Load filter options once ──
  useEffect(() => {
    fetchFilterOptions()
      .then((res) => setFilterOptions(res.data || { places: [], collegeTypes: [] }))
      .catch(() => {});
    document.title = "Browse Colleges — CollVerse";
  }, []);

  // ── Debounce search ──
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Fetch colleges when filters/page change ──
  const loadColleges = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: PAGE_SIZE, sort };
      if (debouncedSearch) params.search      = debouncedSearch;
      if (collegeType)     params.collegeType = collegeType;
      if (place)           params.place       = place;

      const res = await fetchColleges(params);
      setColleges(res.data || []);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 0);

      // Sync URL
      const urlParams = {};
      if (page > 1)         urlParams.page        = String(page);
      if (debouncedSearch)  urlParams.search       = debouncedSearch;
      if (collegeType)      urlParams.collegeType  = collegeType;
      if (place)            urlParams.place        = place;
      if (sort !== "name")  urlParams.sort         = sort;
      setSearchParams(urlParams);
    } catch (err) {
      setError(err.userMessage || "Failed to load colleges.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, collegeType, place, sort, setSearchParams]);

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  const resetFilters = () => {
    setSearchTerm("");
    setCollegeType("");
    setPlace("");
    setSort("name");
    setPage(1);
  };

  const hasFilters = debouncedSearch || collegeType || place;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* ── Header ── */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-background p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Explore Colleges
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse {total > 0 ? total.toLocaleString() : "all"} verified EAMCET colleges with real cutoff data.
        </p>

        {/* Search bar */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-background p-2 px-4 shadow-soft">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              id="college-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code, place…"
              className="w-full bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} aria-label="Clear search">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium hover:border-primary hover:text-primary sm:w-auto sm:py-2 md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        {/* ── Sidebar filters (desktop) ── */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Filters</h3>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="ml-auto text-xs text-primary hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <FilterGroup label="College Type">
              <select
                id="filter-type"
                value={collegeType}
                onChange={(e) => { setCollegeType(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">All Types</option>
                {filterOptions.collegeTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Place / District">
              <select
                id="filter-place"
                value={place}
                onChange={(e) => { setPlace(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">All Places</option>
                {filterOptions.places.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Sort By">
              <select
                id="filter-sort"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="name">Name (A–Z)</option>
                <option value="nameDesc">Name (Z–A)</option>
                <option value="code">Institute Code</option>
                <option value="place">Place</option>
              </select>
            </FilterGroup>
          </div>
        </aside>

        {/* ── Results ── */}
        <div className="min-w-0 flex-1">
          {/* Results header */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Grid3x3 className="h-4 w-4" />
              {loading ? (
                <span>Loading…</span>
              ) : (
                <span>
                  <strong className="text-foreground">{total.toLocaleString()}</strong> colleges found
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-muted-foreground">Sort:</label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="name">Name (A–Z)</option>
                <option value="nameDesc">Name (Z–A)</option>
                <option value="code">Code</option>
                <option value="place">Place</option>
              </select>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
              <button onClick={loadColleges} className="ml-auto text-xs font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <CollegeCardSkeleton key={i} />
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Building2 className="h-9 w-9 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold">No colleges found</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try adjusting your search or filters to see more results.
              </p>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {colleges.map((c) => (
                  <CollegeCard key={c.id} college={c} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex items-center gap-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page <strong className="text-foreground">{page}</strong> of{" "}
                    <strong className="text-foreground">{totalPages}</strong>
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-card shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="font-display text-lg font-semibold">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="rounded-lg p-2 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <FilterGroup label="College Type">
                <select
                  value={collegeType}
                  onChange={(e) => { setCollegeType(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                >
                  <option value="">All Types</option>
                  {filterOptions.collegeTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FilterGroup>

              <FilterGroup label="Place">
                <select
                  value={place}
                  onChange={(e) => { setPlace(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                >
                  <option value="">All Places</option>
                  {filterOptions.places.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </FilterGroup>
            </div>

            <div className="border-t border-border bg-background p-5 space-y-3 mt-auto">
              {hasFilters && (
                <button
                  onClick={() => { resetFilters(); setFiltersOpen(false); }}
                  className="w-full rounded-xl border border-border py-2.5 text-sm font-medium hover:border-primary"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 py-3 text-sm font-semibold text-primary-foreground"
              >
                Show {total.toLocaleString()} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

import { Link } from "react-router-dom";
import { MapPin, Heart, GitCompare, Building2, GraduationCap } from "lucide-react";
import { getCollegeDisplayName, getCollegeLocation, getCollegeType, getCollegeShortName } from "@/utils/college";
import { useSavedColleges } from "@/hooks/useSavedColleges";
import { useCompare } from "@/hooks/useCompare";

export function CollegeCard({ college }) {
  const { isSaved, toggle: toggleSave } = useSavedColleges();
  const { inCompare, toggle: toggleCompare, ids, max } = useCompare();

  if (!college) return null;

  const displayName = getCollegeDisplayName(college);
  const location = getCollegeLocation(college);
  const collegeType = getCollegeType(college);
  const shortName = getCollegeShortName(college);
  const saved = isSaved(college.id);
  const compared = inCompare(college.id);
  const canCompare = compared || (ids && ids.length < max);
  const cutoffCount = college._count?.cutoffs;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <div className="flex h-full w-full items-center justify-center bg-gradient-primary text-2xl font-bold text-primary-foreground">
          {shortName}
        </div>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {collegeType && (
            <span className="rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
              {collegeType}
            </span>
          )}
          {college.instCode && (
            <span className="rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
              {college.instCode}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSave(college.id);
          }}
          aria-label={saved ? "Unsave" : "Save"}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all ${
            saved
              ? "bg-primary text-primary-foreground"
              : "bg-background/95 text-foreground hover:bg-primary hover:text-primary-foreground"
          }`}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/colleges/${college.id}`} className="line-clamp-2 font-display text-base font-semibold hover:text-primary">
          {displayName}
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {location}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {college.affiliatedTo && (
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {college.affiliatedTo}
            </span>
          )}
          {college.districtCode && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {college.districtCode}
            </span>
          )}
        </div>

        {cutoffCount > 0 && (
          <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
              {cutoffCount} cutoff entries
            </span>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Link
            to={`/colleges/${college.id}`}
            className="flex-1 rounded-lg bg-foreground px-3 py-2.5 text-center text-xs font-semibold text-background transition-colors hover:bg-foreground/90 sm:py-2"
          >
            View Details
          </Link>
          <button
            onClick={() => canCompare && toggleCompare(college.id)}
            disabled={!canCompare}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors sm:py-2 ${
              compared
                ? "border-primary bg-primary/10 text-primary"
                : canCompare
                ? "border-border text-foreground hover:border-primary hover:text-primary"
                : "border-border text-muted-foreground opacity-50"
            }`}
            title={!canCompare ? "Compare list is full" : ""}
          >
            <GitCompare className="h-3.5 w-3.5" />
            {compared ? "Added" : "Compare"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CollegeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-px bg-border" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-8 animate-pulse rounded bg-muted" />
          <div className="h-8 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

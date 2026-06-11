import { Link } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { useSavedColleges } from "@/hooks/useSavedColleges";
import { CollegeCard } from "@/components/college/CollegeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useEffect, useState } from "react";
import { fetchCollege } from "@/utils/api";
import { normalizeCollegeForCard } from "@/utils/college";

export default function Saved() {
  const { saved } = useSavedColleges();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Saved Colleges — CollVerse";
  }, []);

  useEffect(() => {
    if (!saved || saved.length === 0) {
      setItems([]);
      return;
    }

    setLoading(true);
    Promise.all(
      saved.map((id) =>
        fetchCollege(id)
          .then((res) => normalizeCollegeForCard(res.data))
          .catch(() => null)
      )
    )
      .then((results) => setItems(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [saved]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Saved Colleges</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your personal shortlist. {items.length} saved.</p>
        </div>
        <Link to="/colleges" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary">
          Discover more
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-7 w-7" />}
            title="No saved colleges yet"
            description="Tap the heart icon on any college to save it to your shortlist."
            action={
              <Link to="/colleges" className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant">
                Explore colleges
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => <CollegeCard key={c.id} college={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}

import { Star } from "lucide-react";
import { useMemo } from "react";

export const defaultFilters = {
  q: "",
  state: "All",
  city: "All",
  category: "All",
  type: "All",
  minRating: 0,
  minPackage: 0,
  maxFees: 3000000,
  sort: "ranking",
};

export function Filters({
  state,
  onChange,
  locations,
  cities,
  categories,
}) {
  const update = (k, v) => onChange({ ...state, [k]: v });
  const feePct = useMemo(() => ((state.maxFees || 3000000) / 3000000) * 100, [state.maxFees]);
  const packagePct = useMemo(() => Math.min(100, ((state.minPackage || 0) / 3000000) * 100), [state.minPackage]);

  return (
    <div className="space-y-6">
      <Section label="State">
        <select
          value={state.state}
          onChange={(e) => update("state", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {locations.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </Section>

      <Section label="City">
        <select
          value={state.city}
          onChange={(e) => update("city", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </Section>

      <Section label="Course Type">
        <select
          value={state.category}
          onChange={(e) => update("category", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Section>

      <Section label="Institution Type">
        <div className="flex flex-wrap gap-2">
          {["All", "Government", "Private", "Deemed"].map((t) => (
            <button
              key={t}
              onClick={() => update("type", t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                state.type === t
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section label={`Minimum Rating: ${(state.minRating || 0).toFixed(1)}+`}>
        <div className="flex gap-1">
          {[0, 3, 3.5, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => update("minRating", r)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs transition-colors ${
                state.minRating === r
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === 0 ? "Any" : (
                <>
                  <Star className="h-3 w-3 fill-current" />
                  {r}
                </>
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section label={`Min Package: ₹${((state.minPackage || 0) / 100000).toFixed(1)}L`}>
        <input
          type="range"
          min={0}
          max={3000000}
          step={50000}
          value={state.minPackage}
          onChange={(e) => update("minPackage", Number(e.target.value))}
          className="w-full accent-primary"
          style={{ background: `linear-gradient(to right, var(--primary) ${packagePct}%, var(--secondary) ${packagePct}%)` }}
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>₹0</span>
          <span>₹30L</span>
        </div>
      </Section>

      <Section label={`Max Fees: ₹${((state.maxFees || 3000000) / 100000).toFixed(1)}L / year`}>
        <input
          type="range"
          min={50000}
          max={3000000}
          step={50000}
          value={state.maxFees}
          onChange={(e) => update("maxFees", Number(e.target.value))}
          className="w-full accent-primary"
          style={{ background: `linear-gradient(to right, var(--primary) ${feePct}%, var(--secondary) ${feePct}%)` }}
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>₹50K</span>
          <span>₹30L</span>
        </div>
      </Section>

      <button
        onClick={() => onChange(defaultFilters)}
        className="w-full rounded-lg border border-border bg-background py-2 text-sm font-medium hover:bg-secondary"
      >
        Reset Filters
      </button>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h4>
      {children}
    </div>
  );
}

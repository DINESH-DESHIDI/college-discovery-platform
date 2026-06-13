export function Field({ label, icon, type, value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-background px-3 transition-colors ${error ? "border-destructive" : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"}`}
      >
        <span className="text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-2.5 text-sm outline-none"
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

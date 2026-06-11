import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="hidden flex-col justify-between rounded-3xl bg-gradient-primary p-10 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-5 w-5" />
          </span>
          CollVerse
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            "CollVerse helped me shortlist 8 perfect-fit colleges in one evening."
          </h2>
          <p className="mt-4 text-sm text-primary-foreground/80">— Ananya R., admitted to IIT Bombay '28</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          {[
            { k: "10K+", v: "Colleges" },
            { k: "2M+", v: "Students" },
            { k: "4.9★", v: "Rating" },
          ].map((s) => (
            <div key={s.v}>
              <div className="font-display text-xl font-bold">{s.k}</div>
              <div className="text-primary-foreground/70">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}

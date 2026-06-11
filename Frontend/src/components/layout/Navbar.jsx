import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Heart, GitCompare, Menu, X, Search, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useSavedColleges } from "@/hooks/useSavedColleges";
import { useCompare } from "@/hooks/useCompare";
import { useAuth } from "@/context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/colleges", label: "Colleges" },
  { to: "/predictor", label: "Predictor" },
  { to: "/community", label: "Community" },
  { to: "/compare", label: "Compare" },
  { to: "/saved", label: "Saved" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { pathname } = useLocation();
  const { saved } = useSavedColleges();
  const { ids } = useCompare();
  const { user, logout } = useAuth();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span>Coll<span className="text-gradient">Verse</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
                {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/colleges"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            onClick={toggleTheme}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/compare"
            className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            aria-label="Compare"
          >
            <GitCompare className="h-4 w-4" />
            {ids.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {ids.length}
              </span>
            )}
          </Link>
          <Link
            to="/saved"
            className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            aria-label="Saved"
          >
            <Heart className="h-4 w-4" />
            {saved.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {saved.length}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <span className="hidden rounded-lg px-3 py-2 text-sm font-medium text-foreground sm:inline-flex">
                Hello, {user.name.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                className="hidden rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:inline-flex"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="hidden rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 sm:inline-flex"
              >
                Sign up
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-64 transform border-l border-border bg-background p-6 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="font-display text-lg font-bold">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                (l.to === "/" ? pathname === "/" : pathname.startsWith(l.to))
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-6">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl bg-gradient-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-elegant"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

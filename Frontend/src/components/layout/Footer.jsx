import { Link } from "react-router-dom";
import { GraduationCap, Twitter, Linkedin, Instagram, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            Coll<span className="text-gradient">Verse</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Discover, compare, and choose from 10,000+ colleges across the country. Make informed
            decisions with verified data.
          </p>
          <div className="mt-5 flex gap-2">
            {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/colleges" className="hover:text-foreground">
                All Colleges
              </Link>
            </li>
            <li>
              <Link to="/compare" className="hover:text-foreground">
                Compare
              </Link>
            </li>
            <li>
              <Link to="/saved" className="hover:text-foreground">
                Saved
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} CollVerse. Crafted for ambitious students.
        </div>
      </div>
    </footer>
  );
}

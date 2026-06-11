import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles, TrendingUp, Shield, Users, Cpu, Briefcase, Stethoscope, Scale, Palette, BookOpen, FlaskConical, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { courseCategories } from "@/data/colleges";
import { CollegeCard, CollegeCardSkeleton } from "@/components/college/CollegeCard";
import { fetchColleges } from "@/utils/api";
import { normalizeCollegeForCard } from "@/utils/college";

const iconMap = { Cpu, Briefcase, Stethoscope, Scale, Palette, BookOpen, FlaskConical, TrendingUp };

export default function Home() {
  const [q, setQ] = useState("");
  const [featured, setFeatured] = useState([]);
  const [totalColleges, setTotalColleges] = useState(0);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CollVerse — Discover Your Perfect College";
    fetchColleges({ limit: 6, sort: "name" })
      .then((res) => {
        setFeatured((res.data || []).map(normalizeCollegeForCard));
        setTotalColleges(res.pagination?.total || 0);
      })
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/colleges?search=${encodeURIComponent(q)}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Trusted by 2M+ aspiring students
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find the college that{" "}
              <span className="text-gradient">shapes your future</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Compare 10,000+ colleges with verified data on fees, placements, rankings and real student reviews — all in one place.
            </p>

            <form onSubmit={onSearch} className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-elegant">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search colleges, courses, cities…"
                  className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button type="submit" className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5">
                Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Popular:</span>
              {["IIT Bombay", "IIM Ahmedabad", "AIIMS Delhi", "BITS Pilani"].map((t) => (
                <Link key={t} to={`/colleges?q=${encodeURIComponent(t)}`} className="rounded-full border border-border bg-background/60 px-3 py-1 hover:border-primary hover:text-primary">
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
            {[
              { label: "Colleges", value: totalColleges > 0 ? totalColleges.toLocaleString() : "163+" },
              { label: "Courses", value: "850+" },
              { label: "Cities", value: "320+" },
              { label: "Reviews", value: "2M+" },
            ].map((s) => (
              <div key={s.label} className="bg-card p-6 text-center">
                <div className="font-display text-2xl font-bold sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHead
          eyebrow="Explore by stream"
          title="Popular courses & categories"
          subtitle="From engineering to design, browse colleges by what you want to study."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {courseCategories.map((c) => {
            const Icon = iconMap[c.icon] ?? BookOpen;
            return (
              <Link
                key={c.slug}
                to={`/colleges?category=${encodeURIComponent(c.name)}`}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-elegant"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.count.toLocaleString()} colleges</div>
                </div>
                <ChevronRight className="absolute right-4 top-5 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <SectionHead
            eyebrow="Featured"
            title="Top-ranked colleges of 2025"
            subtitle="Hand-picked institutions with stellar academics and placements."
          />
          <Link to="/colleges" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:gap-2 sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loadingFeatured
            ? Array.from({ length: 6 }).map((_, i) => <CollegeCardSkeleton key={i} />)
            : featured.map((c) => <CollegeCard key={c.id} college={c} />)}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Shield, title: "Verified Data", text: "Every fee, placement and ranking figure is independently verified for accuracy." },
            { icon: TrendingUp, title: "Smart Comparison", text: "Compare up to 4 colleges side-by-side across 20+ data points in seconds." },
            { icon: Users, title: "Real Reviews", text: "Authentic experiences from current students and verified alumni — no fluff." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <SectionHead eyebrow="Trending now" title="EAMCET colleges with cutoff data" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loadingFeatured
            ? Array.from({ length: 3 }).map((_, i) => <CollegeCardSkeleton key={i} />)
            : featured.slice(0, 3).map((c) => <CollegeCard key={`t-${c.id}`} college={c} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-primary-foreground sm:p-14">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to take the next step?</h2>
            <p className="mt-3 text-primary-foreground/80">
              Create a free account, save your shortlist, and get personalized college recommendations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/signup" className="rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-elegant transition-transform hover:-translate-y-0.5">
                Get started free
              </Link>
              <Link to="/colleges" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-white/10">
                Browse colleges
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ eyebrow, title, subtitle }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
    </div>
  );
}

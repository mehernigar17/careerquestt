import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import {
  ArrowRight,
  Brain,
  Gamepad2,
  GraduationCap,
  Rocket,
  Star,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const trending = [
  { name: "Software Engineer", salary: "$95k", demand: "Very High", tag: "SWE" },
  { name: "UX Designer", salary: "$78k", demand: "High", tag: "UX" },
  { name: "Data Scientist", salary: "$112k", demand: "Very High", tag: "DS" },
  { name: "Cyber Security", salary: "$104k", demand: "Extreme", tag: "SEC" },
  { name: "Product Manager", salary: "$120k", demand: "High", tag: "PM" },
  { name: "Doctor", salary: "$180k", demand: "High", tag: "MD" },
];

const futureJobs = [
  { year: "2028", title: "AI Ethicist", note: "Every big company will need one." },
  { year: "2030", title: "Climate Engineer", note: "Rebuilding cities for a hotter world." },
  { year: "2032", title: "Neuro-Interface Designer", note: "UX for brain-computer devices." },
  { year: "2035", title: "Space Logistics Manager", note: "Supply chains beyond Earth." },
];

function Index() {
  return (
    <div className="min-h-screen bg-paper-grid">
      <SiteHeader />

      {/* HERO — editorial magazine style */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16">
        <span className="chip-ink">
          <Zap className="h-3 w-3" strokeWidth={3} /> Career Simulator · v1.0
        </span>

        <h1 className="mt-6 font-display text-[13vw] font-extrabold leading-[0.9] tracking-tighter sm:text-7xl md:text-8xl">
          Don't <span className="italic">guess</span>
          <br />
          your future.
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 text-primary-foreground">Live it.</span>
            <span
              aria-hidden
              className="absolute inset-x-[-8px] inset-y-[6px] -z-0 rounded-md bg-primary"
              style={{ transform: "rotate(-2deg)" }}
            />
          </span>
        </h1>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
          <p className="max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Step into a virtual day inside real careers. Make decisions, feel the stress,
            earn XP, level up — and find the path that <em>actually</em> fits you. No
            more career quizzes that just ask if you like dogs.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/quiz"
              className="btn-brut inline-flex items-center gap-2 bg-primary px-5 py-3 font-semibold text-primary-foreground"
            >
              Take the Quiz <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/simulation"
              className="btn-brut inline-flex items-center gap-2 bg-card px-5 py-3 font-semibold text-foreground"
            >
              Try a Day →
            </Link>
          </div>
        </div>

        {/* Career doors — brutalist cards */}
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Engineer", tag: "SWE", color: "oklch(0.85 0.13 55)" },
            { label: "Doctor", tag: "MD", color: "oklch(0.85 0.13 145)" },
            { label: "Designer", tag: "UX", color: "oklch(0.85 0.13 320)" },
            { label: "Lawyer", tag: "LAW", color: "oklch(0.85 0.13 240)" },
          ].map((d, i) => (
            <Link
              key={d.label}
              to="/simulation"
              className="card-brut card-brut-hover group flex flex-col justify-between p-5"
              style={{ background: d.color, minHeight: 160 }}
            >
              <span className="font-mono text-xs font-bold text-foreground/70">
                #{String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="font-mono text-[11px] font-bold tracking-widest text-foreground/60">
                  {d.tag}
                </div>
                <div className="mt-1 font-display text-2xl font-extrabold">
                  {d.label}
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium">
                  Open door <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y-2 border-foreground bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-2 w-8 bg-primary" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-background/70">
              The Loop
            </span>
          </div>
          <h2 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">
            Four steps. One clear future.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              { n: "01", icon: Brain, title: "AI Quiz", body: "How you think — not what you like." },
              { n: "02", icon: Rocket, title: "Get matched", body: "Careers ranked by real fit." },
              { n: "03", icon: Gamepad2, title: "Simulate", body: "Real scenarios. Real trade-offs." },
              { n: "04", icon: GraduationCap, title: "Learn", body: "A weekly roadmap of skills." },
            ].map((s) => (
              <div key={s.title} className="border-2 border-background/20 p-5">
                <div className="flex items-center justify-between">
                  <s.icon className="h-5 w-5 text-primary" strokeWidth={2.5} />
                  <span className="font-mono text-xs text-background/50">{s.n}</span>
                </div>
                <div className="mt-4 font-display text-xl font-bold">{s.title}</div>
                <p className="mt-1 text-sm text-background/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending careers */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="chip-ink">
              <Star className="h-3 w-3" strokeWidth={3} /> Hot Right Now
            </span>
            <h2 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
              Trending careers
            </h2>
          </div>
          <Link to="/quiz" className="hidden shrink-0 font-semibold underline decoration-primary decoration-[3px] underline-offset-4 sm:block">
            Find yours →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {trending.map((c, i) => (
            <div key={c.name} className="card-brut card-brut-hover p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-widest text-foreground/60">
                  {c.tag}
                </span>
                <span className="font-mono text-xs text-foreground/40">
                  #{String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-3 font-display text-2xl font-bold">{c.name}</div>
              <div className="mt-6 flex items-end justify-between border-t border-dashed border-foreground/20 pt-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
                    Avg. Salary
                  </div>
                  <div className="font-display text-xl font-bold">{c.salary}</div>
                </div>
                <span
                  className="rounded-full border-2 border-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: "var(--accent)" }}
                >
                  {c.demand}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Future jobs */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <span className="chip-ink">Future Timeline · 2028–2035</span>
        <h2 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
          Jobs your school<br />hasn't heard of.
        </h2>
        <div className="mt-8 space-y-3">
          {futureJobs.map((j) => (
            <div
              key={j.title}
              className="card-brut grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-4 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:gap-6 sm:p-5"
            >
              <div
                className="grid h-14 w-14 shrink-0 place-items-center rounded-md border-2 border-foreground font-mono text-sm font-bold sm:h-16 sm:w-20"
                style={{ background: "var(--coin)" }}
              >
                {j.year}
              </div>
              <div className="min-w-0">
                <div className="font-display text-xl font-bold sm:text-2xl">{j.title}</div>
                <p className="text-sm text-foreground/60">{j.note}</p>
              </div>
              <ArrowRight className="hidden shrink-0 text-foreground/40 sm:block" />
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="card-brut grid grid-cols-2 divide-foreground bg-primary text-primary-foreground md:grid-cols-4 md:divide-x-2">
          {[
            { n: "500+", l: "scenarios" },
            { n: "40", l: "careers" },
            { n: "92%", l: "quiz accuracy" },
            { n: "1M+", l: "XP earned" },
          ].map((s) => (
            <div key={s.l} className="p-6 text-center">
              <div className="font-display text-4xl font-extrabold sm:text-5xl">{s.n}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-widest opacity-80">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-display text-4xl font-extrabold sm:text-6xl">
          Two minutes of quiz.<br />
          <span className="italic text-primary">A lifetime</span> of clarity.
        </h2>
        <Link
          to="/quiz"
          className="btn-brut mt-8 inline-flex items-center gap-2 bg-foreground px-6 py-4 font-semibold text-background"
        >
          Start the quiz <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t-2 border-foreground bg-foreground py-6 text-center font-mono text-xs uppercase tracking-widest text-background/60">
        CareerQuest · Experience your future
      </footer>
    </div>
  );
}

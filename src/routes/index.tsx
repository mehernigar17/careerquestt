import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import {
  ArrowUpRight,
  Brain,
  Gamepad2,
  GraduationCap,
  Rocket,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

// CareerQuest landing page — hero, trending careers, and quick-entry doors

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

const doors = [
  { label: "Software Engineer", tag: "SWE", grad: "linear-gradient(135deg, oklch(0.65 0.2 265), oklch(0.72 0.18 200))" },
  { label: "Doctor", tag: "MD", grad: "linear-gradient(135deg, oklch(0.72 0.2 340), oklch(0.68 0.22 20))" },
  { label: "UX Designer", tag: "UX", grad: "linear-gradient(135deg, oklch(0.72 0.19 295), oklch(0.78 0.15 200))" },
  { label: "Lawyer", tag: "LAW", grad: "linear-gradient(135deg, oklch(0.6 0.15 250), oklch(0.5 0.1 265))" },
];

function Index() {
  return (
    <div className="min-h-screen bg-aurora">
      <SiteHeader />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
        <span className="chip-glass">
          <Sparkles className="h-3 w-3" /> AI Career Simulator
        </span>

        <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl md:text-[88px]">
          Don't <em className="text-gradient">guess</em> your future.
          <br />
          <span className="text-foreground/60">Step inside it.</span>
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
          <p className="max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            A day inside real careers — decisions, stress, salary, mentorship. Live the role
            before you pick it. Powered by an AI that adapts every scene to the career you're
            exploring.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/quiz"
              className="btn-primary-grad inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
            >
              Take the AI quiz <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/simulation"
              search={{ career: "Software Engineer" }}
              className="btn-ghost-glass inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
            >
              Try a live day
            </Link>
          </div>
        </div>

        {/* Career doors */}
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {doors.map((d, i) => (
            <Link
              key={d.label}
              to="/simulation"
              search={{ career: d.label }}
              className="glass-card glass-card-hover group relative overflow-hidden p-5"
              style={{ minHeight: 180 }}
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-24 opacity-70"
                style={{ background: d.grad, filter: "blur(30px)", transform: "translateY(-40%)" }}
              />
              <div className="relative flex h-full flex-col justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                  0{i + 1} · {d.tag}
                </span>
                <div>
                  <div className="font-display text-2xl">{d.label}</div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-foreground/60">
                    Enter the day <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="divider-glow" /></div>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <span className="chip-glass">The Loop</span>
          <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
            Four steps.<br />
            <em className="text-gradient">One clear</em> future.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            { n: "01", icon: Brain, title: "AI Quiz", body: "How you think — not what you like." },
            { n: "02", icon: Rocket, title: "Get matched", body: "Careers ranked by real fit." },
            { n: "03", icon: Gamepad2, title: "Simulate", body: "Real scenarios. Real trade-offs." },
            { n: "04", icon: GraduationCap, title: "Learn", body: "A weekly roadmap of skills." },
          ].map((s) => (
            <div key={s.title} className="glass-card p-6">
              <div className="flex items-center justify-between">
                <span
                  className="grid h-9 w-9 place-items-center rounded-lg"
                  style={{ background: "var(--grad-cool)" }}
                >
                  <s.icon className="h-4 w-4 text-background" strokeWidth={2.5} />
                </span>
                <span className="font-mono text-xs text-foreground/40">{s.n}</span>
              </div>
              <div className="mt-6 font-display text-2xl">{s.title}</div>
              <p className="mt-2 text-sm text-foreground/60">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending careers */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="chip-glass">Trending</span>
            <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
              Careers people are <em className="text-gradient">simulating</em> right now
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {trending.map((c, i) => (
            <Link
              key={c.name}
              to="/simulation"
              search={{ career: c.name }}
              className="glass-card glass-card-hover group p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                  {c.tag}
                </span>
                <span className="font-mono text-xs text-foreground/30">0{i + 1}</span>
              </div>
              <div className="mt-4 font-display text-2xl">{c.name}</div>
              <div className="mt-6 flex items-end justify-between border-t border-white/5 pt-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                    Avg. Salary
                  </div>
                  <div className="mt-1 font-display text-2xl">{c.salary}</div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
                  {c.demand}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Future jobs */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <span className="chip-glass">2028 — 2035</span>
        <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
          Jobs your school <em className="text-gradient">hasn't heard of</em>.
        </h2>
        <div className="mt-10 space-y-3">
          {futureJobs.map((j) => (
            <div
              key={j.title}
              className="glass-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 p-5"
            >
              <div
                className="grid h-14 w-16 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold text-background"
                style={{ background: "var(--grad-warm)" }}
              >
                {j.year}
              </div>
              <div className="min-w-0">
                <div className="font-display text-xl sm:text-2xl">{j.title}</div>
                <p className="text-sm text-foreground/60">{j.note}</p>
              </div>
              <ArrowUpRight className="hidden h-5 w-5 shrink-0 text-foreground/40 sm:block" />
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="glass-card grid grid-cols-2 divide-white/5 md:grid-cols-4 md:divide-x">
          {[
            { n: "500+", l: "scenarios" },
            { n: "40", l: "careers" },
            { n: "92%", l: "quiz accuracy" },
            { n: "1M+", l: "XP earned" },
          ].map((s) => (
            <div key={s.l} className="p-8 text-center">
              <div className="font-display text-4xl sm:text-5xl text-gradient">{s.n}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h2 className="font-display text-4xl leading-tight sm:text-6xl">
          Two minutes of quiz.
          <br />
          <em className="text-gradient">A lifetime</em> of clarity.
        </h2>
        <Link
          to="/quiz"
          className="btn-primary-grad mt-10 inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold"
        >
          Start the quiz <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-white/5 py-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/40">
        CareerQuest · Experience your future
      </footer>
    </div>
  );
}

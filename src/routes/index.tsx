import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import {
  ArrowRight,
  Brain,
  Briefcase,
  Gamepad2,
  GraduationCap,
  Rocket,
  Sparkles,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const trending = [
  { name: "Software Engineer", salary: "$95k", demand: "Very High", emoji: "💻" },
  { name: "UX Designer", salary: "$78k", demand: "High", emoji: "🎨" },
  { name: "Data Scientist", salary: "$112k", demand: "Very High", emoji: "📊" },
  { name: "Cyber Security", salary: "$104k", demand: "Extreme", emoji: "🛡️" },
  { name: "Product Manager", salary: "$120k", demand: "High", emoji: "🧭" },
  { name: "Doctor", salary: "$180k", demand: "High", emoji: "🩺" },
];

const futureJobs = [
  { year: "2028", title: "AI Ethicist", note: "Every big company will need one." },
  { year: "2030", title: "Climate Engineer", note: "Rebuilding cities for a hotter world." },
  { year: "2032", title: "Neuro-Interface Designer", note: "UX for brain-computer devices." },
  { year: "2035", title: "Space Logistics Manager", note: "Supply chains beyond Earth." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 40% at 20% 10%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(50% 40% at 90% 90%, rgba(255,255,255,0.2), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 text-primary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered career simulator
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Don't guess your future.
            <br />
            <span className="italic opacity-90">Experience it.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg opacity-90">
            Step into a virtual day inside real careers. Make decisions, feel the stress,
            earn XP, level up — and find the path that actually fits you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/quiz">
                Take the Career Quiz <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
            >
              <Link to="/simulation">Try a Simulation</Link>
            </Button>
          </div>

          {/* Career doors illustration */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { emoji: "💻", label: "Engineer" },
              { emoji: "🩺", label: "Doctor" },
              { emoji: "🎨", label: "Designer" },
              { emoji: "⚖️", label: "Lawyer" },
            ].map((d) => (
              <div
                key={d.label}
                className="group rounded-2xl border border-white/25 bg-white/10 p-6 text-center backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
              >
                <div className="text-4xl transition-transform group-hover:scale-110">
                  {d.emoji}
                </div>
                <div className="mt-3 text-sm font-medium">{d.label}</div>
                <div className="mt-1 text-xs opacity-70">Open door →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight">How CareerQuest works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            { icon: Brain, title: "AI Quiz", body: "Tell us how you think — not just what you like." },
            { icon: Rocket, title: "Get matched", body: "AI ranks careers that actually fit you." },
            { icon: Gamepad2, title: "Simulate a day", body: "Real scenarios. Real trade-offs. Real XP." },
            { icon: GraduationCap, title: "Learn the path", body: "A weekly roadmap of skills to master." },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-border p-6"
              style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}
            >
              <s.icon className="h-6 w-6 text-primary" />
              <div className="mt-3 font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending careers */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Trending careers</h2>
          <Link to="/quiz" className="text-sm font-medium text-primary hover:underline">
            Find yours →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {trending.map((c) => (
            <div
              key={c.name}
              className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="text-3xl">{c.emoji}</div>
              <div className="mt-3 font-semibold">{c.name}</div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. salary</span>
                <span className="font-medium">{c.salary}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Demand</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {c.demand}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Future jobs */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Future jobs (2028–2035)</h2>
        <p className="mt-2 text-muted-foreground">
          Careers your school hasn't heard of yet.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {futureJobs.map((j) => (
            <div
              key={j.title}
              className="rounded-2xl border border-border bg-card p-6"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                <span
                  className="rounded px-2 py-0.5"
                  style={{ background: "oklch(0.94 0.09 85)" }}
                >
                  {j.year}
                </span>
              </div>
              <div className="mt-3 font-semibold">{j.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{j.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div
          className="grid gap-8 rounded-3xl p-10 text-primary-foreground md:grid-cols-4"
          style={{ background: "var(--gradient-hero)" }}
        >
          {[
            { n: "500+", l: "career scenarios" },
            { n: "40", l: "careers to simulate" },
            { n: "92%", l: "quiz match accuracy" },
            { n: "1M+", l: "XP earned by users" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-4xl font-bold">{s.n}</div>
              <div className="text-sm opacity-80">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Trophy className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-4xl font-bold tracking-tight">
          Ready to try on your future?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Two minutes of quiz. A lifetime of clarity.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/quiz">
            Start the quiz <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <Briefcase className="mx-auto mb-2 h-4 w-4" />
        CareerQuest · Experience your future
      </footer>
    </div>
  );
}

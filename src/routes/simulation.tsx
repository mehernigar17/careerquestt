import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  ArrowRight,
  Coffee,
  Loader2,
  MessageSquare,
  Moon,
  Sun,
  Trophy,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Day in the Life — CareerQuest Simulation" },
      {
        name: "description",
        content:
          "Live a virtual day as a Software Engineer. Make decisions, gain XP, and see the consequences.",
      },
      { property: "og:title", content: "Live a day as a Software Engineer" },
      {
        property: "og:description",
        content: "Make decisions. Gain XP. See the real trade-offs of the job.",
      },
    ],
  }),
  component: SimPage,
});

type Choice = { label: string; xp: number; stress: number; salary: number; feedback: string };
type Scene = { time: string; icon: typeof Sun; title: string; body: string; choices: Choice[] };

const scenes: Scene[] = [
  {
    time: "9:00 AM",
    icon: Sun,
    title: "Boss assigned a critical bug",
    body: "Production is throwing 500s. Your PM pings: 'How fast can you fix it?' You haven't touched this module before.",
    choices: [
      {
        label: "Ship a quick patch to stop the bleeding",
        xp: 40, stress: 15, salary: 0,
        feedback: "Fire is out. But your senior notices the tech debt you added.",
      },
      {
        label: "Dig in and fix it properly (2 hours)",
        xp: 80, stress: 25, salary: 0,
        feedback: "Clean fix. PM is impatient — but engineering respects you.",
      },
      {
        label: "Ask a senior teammate for help",
        xp: 55, stress: -5, salary: 0,
        feedback: "You learned a new pattern. Collaboration +1.",
      },
      {
        label: "Ignore, hope it goes away",
        xp: -20, stress: 30, salary: 0,
        feedback: "It didn't go away. On-call escalation. Ouch.",
      },
    ],
  },
  {
    time: "12:30 PM",
    icon: Coffee,
    title: "Client meeting: explain the API design",
    body: "The client's product lead is non-technical but curious. You have 10 minutes.",
    choices: [
      {
        label: "Go deep on REST vs GraphQL trade-offs",
        xp: 20, stress: 10, salary: 0,
        feedback: "You lost them at 'schema stitching'. Awkward silence.",
      },
      {
        label: "Use a coffee-shop analogy",
        xp: 70, stress: -5, salary: 100,
        feedback: "Their eyes lit up. Communication +1. Small budget bump for your team.",
      },
      {
        label: "Ask a senior to lead, listen carefully",
        xp: 40, stress: -10, salary: 0,
        feedback: "Safe move. You learned how to frame technical answers for execs.",
      },
    ],
  },
  {
    time: "6:00 PM",
    icon: Moon,
    title: "Deadline tomorrow, feature not done",
    body: "Your PR needs 3 more hours. Gym plans at 7. What do you do?",
    choices: [
      {
        label: "Stay late and finish it tonight",
        xp: 60, stress: 35, salary: 0,
        feedback: "Shipped on time. But you skipped the gym and didn't sleep enough.",
      },
      {
        label: "Go to the gym, wake up early to finish",
        xp: 45, stress: -5, salary: 0,
        feedback: "Balanced. Manager notices you consistently ship without burning out.",
      },
      {
        label: "Pair with a teammate to split the work",
        xp: 70, stress: 5, salary: 0,
        feedback: "Delivered faster and taught someone. Leadership +1.",
      },
      {
        label: "Push the deadline with a clear plan",
        xp: 30, stress: -10, salary: 0,
        feedback: "PM was skeptical, but respected the honesty and plan.",
      },
    ],
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function levelFor(xp: number) {
  if (xp < 100) return { name: "Intern", next: 100 };
  if (xp < 250) return { name: "Junior Developer", next: 250 };
  if (xp < 450) return { name: "Mid-level Engineer", next: 450 };
  if (xp < 700) return { name: "Senior Engineer", next: 700 };
  if (xp < 1000) return { name: "Tech Lead", next: 1000 };
  return { name: "CTO", next: 1000 };
}

function SimPage() {
  const [step, setStep] = useState(0);
  const [xp, setXp] = useState(50);
  const [stress, setStress] = useState(30);
  const [salary, setSalary] = useState(900);
  const [log, setLog] = useState<{ scene: string; choice: string; feedback: string }[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scene = scenes[step];
  const done = step >= scenes.length;
  const level = useMemo(() => levelFor(xp), [xp]);

  function apply(c: Choice) {
    setXp((v) => clamp(v + c.xp, 0, 9999));
    setStress((v) => clamp(v + c.stress, 0, 100));
    setSalary((v) => Math.max(0, v + c.salary));
    setLog((L) => [...L, { scene: scene.title, choice: c.label, feedback: c.feedback }]);
    setStep(step + 1);
  }

  async function generateSummary() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system:
            "You are an encouraging senior engineering mentor. In 3-4 short sentences, reflect on the user's day. Highlight one strength and one area to grow. Warm, specific, no bullet points.",
          prompt: `Career: Software Engineer\nFinal XP: ${xp}\nStress: ${stress}/100\nSalary: $${salary}/mo\nLevel: ${level.name}\n\nDecisions:\n${log.map((l) => `- ${l.scene}: chose "${l.choice}"`).join("\n")}`,
        }),
      });
      const { content } = (await res.json()) as { content: string };
      setSummary(content);
    } catch {
      setSummary("Great work today — you made real trade-offs like a working engineer.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(0);
    setXp(50);
    setStress(30);
    setSalary(900);
    setLog([]);
    setSummary(null);
  }

  return (
    <div className="min-h-screen bg-paper-grid">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        {/* HUD — game dashboard */}
        <div className="card-brut bg-foreground p-5 text-background">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-background/60">
                Career · Day 1
              </div>
              <div className="mt-1 truncate font-display text-2xl font-extrabold sm:text-3xl">
                Software Engineer
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span
                  className="rounded-md border-2 border-background px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest"
                  style={{ background: "var(--primary)" }}
                >
                  {level.name}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <HudMeter label="XP" value={xp} max={level.next} color="var(--xp)" fmt={(v) => `${v}`} />
            <HudMeter label="Stress" value={stress} max={100} color="var(--stress)" fmt={(v) => `${v}%`} />
            <HudMeter label="Salary" value={salary} max={20000} color="var(--coin)" fmt={(v) => `$${v}/mo`} />
          </div>
        </div>

        {/* Scene */}
        {!done && (
          <div className="card-brut mt-6 p-6 sm:p-8">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest">
              <scene.icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
              {scene.time} · Scene {step + 1} / {scenes.length}
            </div>
            <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
              {scene.title}
            </h2>
            <p className="mt-3 text-foreground/70">{scene.body}</p>

            <div className="mt-6 grid gap-3">
              {scene.choices.map((c) => (
                <button
                  key={c.label}
                  onClick={() => apply(c)}
                  className="card-brut card-brut-hover group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="font-display text-base font-semibold sm:text-lg">
                      {c.label}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge>{c.xp >= 0 ? `+${c.xp}` : c.xp} XP</Badge>
                      <Badge tone={c.stress > 0 ? "stress" : "calm"}>
                        {c.stress >= 0 ? `+${c.stress}` : c.stress} stress
                      </Badge>
                      {c.salary > 0 && <Badge tone="coin">+${c.salary}</Badge>}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              ))}
            </div>

            {log.length > 0 && (
              <div
                className="mt-6 border-l-4 border-primary bg-secondary p-4 text-sm text-foreground/80"
              >
                <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                  Feedback
                </div>
                {log[log.length - 1].feedback}
              </div>
            )}
          </div>
        )}

        {/* End of day */}
        {done && (
          <div className="card-brut mt-6 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" strokeWidth={2.5} />
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                End of your workday
              </h2>
            </div>
            <p className="mt-2 text-foreground/70">
              You finished at level <b>{level.name}</b> with <b>{xp} XP</b>,{" "}
              <b>{stress}/100</b> stress, and a salary of <b>${salary}/mo</b>.
            </p>

            <div className="mt-6 space-y-2">
              {log.map((l, i) => (
                <div key={i} className="card-brut p-3 text-sm">
                  <div className="font-display font-bold">{l.scene}</div>
                  <div className="text-foreground/60">→ {l.choice}</div>
                  <div className="mt-1 text-xs text-primary">{l.feedback}</div>
                </div>
              ))}
            </div>

            <div className="card-brut mt-6 p-5" style={{ background: "var(--accent)" }}>
              <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest">
                <Zap className="h-4 w-4" /> AI Mentor's take
              </div>
              {!summary && !loading && (
                <button
                  onClick={generateSummary}
                  className="btn-brut bg-foreground px-4 py-2 text-sm font-semibold text-background"
                >
                  Get AI reflection
                </button>
              )}
              {loading && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Reflecting…
                </div>
              )}
              {summary && <p className="text-sm leading-relaxed">{summary}</p>}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={reset} className="btn-brut bg-card px-4 py-2 font-semibold text-foreground">
                Replay the day
              </button>
              <Link
                to="/mentor"
                className="btn-brut inline-flex items-center gap-2 bg-primary px-4 py-2 font-semibold text-primary-foreground"
              >
                <MessageSquare className="h-4 w-4" /> Chat with AI Mentor
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HudMeter({
  label,
  value,
  max,
  color,
  fmt,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  fmt: (v: number) => string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-background/60">
          {label}
        </span>
        <span className="font-display text-sm font-bold">{fmt(value)}</span>
      </div>
      <div className="mt-1 h-2 w-full border-2 border-background bg-background/10">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Badge({
  children,
  tone = "xp",
}: {
  children: React.ReactNode;
  tone?: "xp" | "stress" | "calm" | "coin";
}) {
  const bg =
    tone === "stress"
      ? "oklch(0.85 0.15 25)"
      : tone === "calm"
        ? "oklch(0.85 0.15 145)"
        : tone === "coin"
          ? "oklch(0.85 0.15 85)"
          : "oklch(0.85 0.13 55)";
  return (
    <span
      className="inline-block rounded-full border-[1.5px] border-foreground px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground"
      style={{ background: bg }}
    >
      {children}
    </span>
  );
}
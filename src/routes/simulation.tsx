import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Dashboard */}
        <div
          className="rounded-3xl p-6 text-primary-foreground"
          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-70">Career</div>
              <div className="text-2xl font-bold">Software Engineer</div>
              <div className="mt-1 text-sm opacity-90">Level: {level.name}</div>
            </div>
            <div className="flex gap-6 text-sm">
              <Stat label="XP" value={`${xp}/${level.next}`} />
              <Stat label="Stress" value={`${stress}/100`} />
              <Stat label="Salary" value={`$${salary}/mo`} />
            </div>
          </div>
          <div className="mt-5">
            <Progress
              value={(xp / level.next) * 100}
              className="h-2 bg-white/20 [&>*]:bg-white"
            />
          </div>
          <div className="mt-3 flex gap-4 text-xs opacity-90">
            <MeterBar label="Stress" value={stress} color="var(--stress)" />
          </div>
        </div>

        {/* Scene */}
        {!done && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <scene.icon className="h-4 w-4 text-primary" />
              {scene.time} · Scenario {step + 1} of {scenes.length}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">{scene.title}</h2>
            <p className="mt-2 text-muted-foreground">{scene.body}</p>

            <div className="mt-6 grid gap-3">
              {scene.choices.map((c) => (
                <button
                  key={c.label}
                  onClick={() => apply(c)}
                  className="group flex items-center justify-between rounded-2xl border-2 border-border bg-background p-4 text-left transition hover:border-primary hover:shadow-md"
                >
                  <div>
                    <div className="font-medium">{c.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <Badge>{c.xp >= 0 ? `+${c.xp}` : c.xp} XP</Badge>{" "}
                      <Badge tone={c.stress > 0 ? "stress" : "calm"}>
                        {c.stress >= 0 ? `+${c.stress}` : c.stress} stress
                      </Badge>{" "}
                      {c.salary > 0 && <Badge tone="coin">+${c.salary}</Badge>}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              ))}
            </div>

            {log.length > 0 && (
              <div className="mt-6 rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                <div className="mb-1 font-medium text-foreground">Last feedback:</div>
                {log[log.length - 1].feedback}
              </div>
            )}
          </div>
        )}

        {/* End of day */}
        {done && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">End of your workday</h2>
            </div>
            <p className="mt-2 text-muted-foreground">
              You finished at level <b>{level.name}</b> with <b>{xp} XP</b>,{" "}
              <b>{stress}/100</b> stress, and a salary of <b>${salary}/mo</b>.
            </p>

            <div className="mt-6 space-y-2">
              {log.map((l, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-background p-3 text-sm"
                >
                  <div className="font-medium">{l.scene}</div>
                  <div className="text-muted-foreground">→ {l.choice}</div>
                  <div className="mt-1 text-xs text-primary">{l.feedback}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <Zap className="h-4 w-4" /> AI Mentor's take
              </div>
              {!summary && !loading && (
                <Button onClick={generateSummary} size="sm">
                  Get AI reflection
                </Button>
              )}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Reflecting…
                </div>
              )}
              {summary && <p className="text-sm leading-relaxed">{summary}</p>}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={reset} variant="outline">
                Replay the day
              </Button>
              <Button asChild>
                <Link to="/mentor">
                  <MessageSquare className="mr-1 h-4 w-4" /> Chat with AI Mentor
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-widest opacity-70">{label}</div>
      <div className="font-semibold">{value}</div>
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
      ? "oklch(0.95 0.08 25)"
      : tone === "calm"
        ? "oklch(0.94 0.08 145)"
        : tone === "coin"
          ? "oklch(0.94 0.09 85)"
          : "oklch(0.94 0.07 275)";
  return (
    <span
      className="mr-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-foreground"
      style={{ background: bg }}
    >
      {children}
    </span>
  );
}

function MeterBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="opacity-80">{label}</span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
        <div className="h-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
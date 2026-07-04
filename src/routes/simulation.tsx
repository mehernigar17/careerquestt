import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/site-header";
import {
  ArrowUpRight,
  Coffee,
  Loader2,
  MessageSquare,
  Moon,
  RefreshCw,
  Sun,
  Sunrise,
  Trophy,
  Zap,
} from "lucide-react";

const searchSchema = z.object({
  career: z.string().optional(),
});

export const Route = createFileRoute("/simulation")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "A Day in the Life — CareerQuest Simulation" },
      {
        name: "description",
        content:
          "Live a virtual day inside any career. Make real decisions, gain XP, and see the trade-offs of the job.",
      },
      { property: "og:title", content: "Live a day in any career" },
      {
        property: "og:description",
        content: "AI-generated day-in-the-life scenarios. Real decisions, real trade-offs.",
      },
    ],
  }),
  component: SimPage,
});

type TaskType = "code" | "written" | "diagnosis" | "argument" | "plan";
type Scene = {
  time: string;
  title: string;
  body: string;
  taskType: TaskType;
  language?: string; // for code tasks: javascript | python | sql | typescript
  prompt: string;   // the actual challenge
  starter?: string; // starter template
  rubric: string;   // what a good answer looks like (for AI grading)
};
type Grade = {
  score: number;      // 0-100 quality
  xp: number;         // -30..+120
  stress: number;     // -20..+40
  salary: number;     // usually 0, occasionally +50..+500 or negative
  verdict: "excellent" | "good" | "okay" | "poor" | "failed";
  feedback: string;   // 2-4 sentences, mentor-style, specific
  punishment?: string; // optional consequence line (e.g. "PR rejected", "malpractice review")
};
type Attempt = { scene: string; answer: string; grade: Grade };

const POPULAR_CAREERS = [
  "Software Engineer",
  "Doctor",
  "UX Designer",
  "Lawyer",
  "Data Scientist",
  "Product Manager",
  "Teacher",
  "Architect",
];

const timeIcons = [Sunrise, Sun, Coffee, Moon];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function levelFor(xp: number, career: string) {
  const titles = career.toLowerCase().includes("doctor")
    ? ["Intern", "Resident", "Attending", "Senior Attending", "Department Head", "Chief"]
    : career.toLowerCase().includes("lawyer")
      ? ["Paralegal", "Associate", "Senior Associate", "Junior Partner", "Partner", "Managing Partner"]
      : career.toLowerCase().includes("design")
        ? ["Junior Designer", "Designer", "Senior Designer", "Design Lead", "Design Director", "VP Design"]
        : career.toLowerCase().includes("teach")
          ? ["Student Teacher", "Teacher", "Lead Teacher", "Dept. Head", "Principal", "Superintendent"]
          : ["Intern", "Junior", "Mid-level", "Senior", "Lead", "Director"];
  const thresholds = [100, 250, 450, 700, 1000, 1500];
  for (let i = 0; i < thresholds.length; i++) {
    if (xp < thresholds[i]) return { name: titles[i], next: thresholds[i] };
  }
  return { name: titles[titles.length - 1], next: thresholds[thresholds.length - 1] };
}

function baseSalary(career: string) {
  const c = career.toLowerCase();
  if (c.includes("doctor")) return 5000;
  if (c.includes("lawyer")) return 4200;
  if (c.includes("data")) return 3800;
  if (c.includes("product")) return 4000;
  if (c.includes("design")) return 2800;
  if (c.includes("teach")) return 1800;
  return 3000;
}

function SimPage() {
  const { career } = Route.useSearch();
  const navigate = useNavigate();

  if (!career) return <PickCareer onPick={(c) => navigate({ to: "/simulation", search: { career: c } })} />;

  return <Simulation key={career} career={career} />;
}

function PickCareer({ onPick }: { onPick: (c: string) => void }) {
  const [custom, setCustom] = useState("");
  return (
    <div className="min-h-screen bg-aurora">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="chip-glass"><Zap className="h-3 w-3" /> Choose your role</span>
        <h1 className="mt-5 font-display text-4xl leading-tight sm:text-6xl">
          Which career should we <em className="text-gradient">simulate</em>?
        </h1>
        <p className="mt-4 max-w-xl text-foreground/65">
          AI generates a realistic day tailored to whatever career you pick — from the first
          coffee to the last meeting.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {POPULAR_CAREERS.map((c) => (
            <button
              key={c}
              onClick={() => onPick(c)}
              className="glass-card glass-card-hover p-4 text-left text-sm font-medium"
            >
              {c}
              <ArrowUpRight className="mt-6 h-4 w-4 text-foreground/40" />
            </button>
          ))}
        </div>

        <div className="mt-10">
          <label className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/50">
            Or type any career
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (custom.trim()) onPick(custom.trim());
            }}
            className="mt-3 flex gap-2"
          >
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. Marine Biologist, Chef, Journalist…"
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm outline-none placeholder:text-foreground/40 focus:border-white/25"
            />
            <button className="btn-primary-grad px-5 py-3 text-sm font-semibold">
              Simulate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Simulation({ career }: { career: string }) {
  const [scenes, setScenes] = useState<Scene[] | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [xp, setXp] = useState(50);
  const [stress, setStress] = useState(25);
  const [salary, setSalary] = useState(baseSalary(career));
  const [log, setLog] = useState<Attempt[]>([]);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [lastGrade, setLastGrade] = useState<Grade | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const level = useMemo(() => levelFor(xp, career), [xp, career]);
  const done = scenes !== null && step >= scenes.length;
  const currentScene = scenes && !done ? scenes[step] : null;

  useEffect(() => {
    if (currentScene) setAnswer(currentScene.starter ?? "");
    setLastGrade(null);
    setGradeError(null);
  }, [step, scenes]);

  useEffect(() => {
    let cancelled = false;
    async function gen() {
      setGenError(null);
      try {
        const prompt = `Generate a realistic "day in the life" simulation for a ${career} where the user must ACTUALLY SOLVE each problem (not pick from options). Return strict JSON.

Shape:
{"scenes":[
  {
    "time":"9:00 AM",
    "title":"short specific problem title",
    "body":"2-4 sentences giving concrete context — real tools, real jargon, real stakes for a ${career}",
    "taskType":"code" | "written" | "diagnosis" | "argument" | "plan",
    "language":"javascript" | "python" | "sql" | "typescript",   // required ONLY when taskType is "code"
    "prompt":"the exact task to complete — a coding problem to solve, a case to diagnose, a legal argument to write, a design plan to describe. Be concrete and self-contained.",
    "starter":"optional starter code / template / prompt scaffold the user can edit",
    "rubric":"what a strong answer must demonstrate — used later to grade the user"
  },
  ... exactly 4 scenes for morning, midday, afternoon, evening
]}

Rules by career:
- Software Engineer / Data Scientist / anything technical: taskType="code" with a real algorithm/bug/query challenge. Include starter code.
- Doctor: taskType="diagnosis" — a real patient case (symptoms, vitals, history). User writes differential + plan.
- Lawyer: taskType="argument" — a client fact pattern. User writes their legal argument or advice.
- UX Designer: taskType="written" or "plan" — a real design brief. User describes their approach and key decisions.
- Teacher: taskType="plan" — a real classroom situation. User writes their lesson/response plan.
- Product Manager: taskType="written" — a real trade-off memo the user must write.
- Other: pick the best taskType.

Every scene must be a REAL problem the user solves by typing, not a multiple choice. Vary difficulty across the day. Use profession-specific detail (frameworks, drugs, statutes, laws, methodologies). No emojis, no markdown.`;
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: `You are a senior ${career} who designs realistic on-the-job challenges. Output only valid JSON.`,
            prompt,
            json: true,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const { content } = (await res.json()) as { content: string };
        const parsed = JSON.parse(content) as { scenes: Scene[] };
        if (!cancelled && parsed.scenes?.length) setScenes(parsed.scenes);
      } catch (e) {
        if (!cancelled) setGenError(e instanceof Error ? e.message : "Failed to generate simulation");
      }
    }
    gen();
    return () => {
      cancelled = true;
    };
  }, [career]);

  async function submitAnswer() {
    if (!currentScene || !answer.trim() || grading) return;
    setGrading(true);
    setGradeError(null);
    try {
      const gradingPrompt = `You are a strict but fair senior ${career} grading a junior's attempt on this real task.

TASK:
${currentScene.prompt}

STARTER (if any) — do not count the untouched starter as the user's work:
${currentScene.starter ?? "(none)"}

WHAT A STRONG ANSWER LOOKS LIKE:
${currentScene.rubric}

THE USER'S ANSWER:
"""
${answer}
"""

Grade harshly and honestly like a real senior would. If the answer is empty, gibberish, off-topic, or clearly not attempting the task, treat as "failed" with low score, negative xp, high stress, and a real punishment (e.g. "PR rejected by review", "Attending overruled your call", "Client fired the firm").
If it's a genuine strong attempt, reward with high xp and possibly a small salary bump.

Return strict JSON:
{
  "score": 0-100,
  "xp": integer between -40 and 120,
  "stress": integer between -25 and 45,
  "salary": integer usually 0, occasionally between -200 and +600 for standout work or major screw-ups,
  "verdict": "excellent" | "good" | "okay" | "poor" | "failed",
  "feedback": "2-4 sentences of specific mentor feedback — call out concrete things in the answer",
  "punishment": "optional 1-line real-world consequence when verdict is poor or failed, otherwise omit"
}`;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are an honest, exacting senior ${career}. You do not hand out participation trophies. Output only valid JSON.`,
          prompt: gradingPrompt,
          json: true,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { content } = (await res.json()) as { content: string };
      const g = JSON.parse(content) as Grade;
      setLastGrade(g);
      setXp((v) => clamp(v + (g.xp ?? 0), 0, 9999));
      setStress((v) => clamp(v + (g.stress ?? 0), 0, 100));
      setSalary((v) => Math.max(0, v + (g.salary ?? 0)));
      setLog((L) => [...L, { scene: currentScene.title, answer, grade: g }]);
    } catch (e) {
      setGradeError(e instanceof Error ? e.message : "Grading failed");
    } finally {
      setGrading(false);
    }
  }

  function nextScene() {
    setStep((s) => s + 1);
  }

  async function generateSummary() {
    if (!scenes) return;
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a warm, experienced senior ${career} mentoring a curious student. In 3-5 short sentences, reflect on their day — reference their actual work quality. Highlight one strength and one honest area to grow. No bullet points, no lists.`,
          prompt: `Career: ${career}\nFinal XP: ${xp}\nStress: ${stress}/100\nSalary: $${salary}/mo\nLevel: ${level.name}\n\nAttempts:\n${log.map((l) => `- ${l.scene}: verdict=${l.grade.verdict} (score ${l.grade.score}/100)`).join("\n")}`,
        }),
      });
      const { content } = (await res.json()) as { content: string };
      setSummary(content);
    } catch {
      setSummary("Real work today — you made trade-offs like a working professional.");
    } finally {
      setSummaryLoading(false);
    }
  }

  function reset() {
    setStep(0);
    setXp(50);
    setStress(25);
    setSalary(baseSalary(career));
    setLog([]);
    setSummary(null);
    setLastGrade(null);
    setAnswer("");
  }

  return (
    <div className="min-h-screen bg-aurora">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* HUD */}
        <div className="glass-card relative overflow-hidden p-6">
          <div
            aria-hidden
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-40"
            style={{ background: "var(--grad-primary)", filter: "blur(80px)" }}
          />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="chip-glass">Day 1 · Live simulation</span>
              <Link
                to="/simulation"
                search={{}}
                className="chip-glass hover:border-white/25"
                aria-label="Change career"
              >
                <RefreshCw className="h-3 w-3" /> switch
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <div className="min-w-0">
                <div className="font-display text-3xl leading-tight sm:text-4xl">{career}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/50">
                  Level · <span className="text-foreground/80">{level.name}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <HudMeter label="XP" value={xp} max={level.next} grad="linear-gradient(90deg, oklch(0.78 0.17 175), oklch(0.72 0.18 200))" fmt={(v) => `${v}`} />
              <HudMeter label="Stress" value={stress} max={100} grad="linear-gradient(90deg, oklch(0.7 0.22 20), oklch(0.72 0.2 340))" fmt={(v) => `${v}%`} />
              <HudMeter label="Salary" value={salary} max={20000} grad="linear-gradient(90deg, oklch(0.85 0.15 90), oklch(0.78 0.19 40))" fmt={(v) => `$${v.toLocaleString()}`} />
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {!scenes && !genError && (
          <div className="glass-card mt-6 flex flex-col items-center gap-4 p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <div className="font-display text-2xl">Writing your day as a {career}…</div>
            <div className="text-sm text-foreground/60">
              Generating realistic scenarios and trade-offs.
            </div>
          </div>
        )}
        {genError && (
          <div className="glass-card mt-6 border-destructive/40 p-6">
            <div className="text-destructive">{genError}</div>
            <button
              onClick={() => window.location.reload()}
              className="btn-ghost-glass mt-3 px-4 py-2 text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Scene */}
        {scenes && !done && (
          <div className="glass-card mt-6 p-6 sm:p-8">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
              {(() => {
                const Icon = timeIcons[step] || Sun;
                return <Icon className="h-4 w-4 text-accent" />;
              })()}
              {scenes[step].time} · Scene {step + 1} / {scenes.length}
            </div>
            <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              {scenes[step].title}
            </h2>
            <p className="mt-3 leading-relaxed text-foreground/70">{scenes[step].body}</p>

            <div className="mt-8 grid gap-3">
              {scenes[step].choices.map((c) => (
                <button
                  key={c.label}
                  onClick={() => apply(c)}
                  className="glass-card glass-card-hover group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5 text-left"
                >
                  <div className="min-w-0">
                    <div className="text-base font-medium leading-snug">{c.label}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge tone="xp">{c.xp >= 0 ? `+${c.xp}` : c.xp} XP</Badge>
                      <Badge tone={c.stress > 0 ? "stress" : "calm"}>
                        {c.stress >= 0 ? `+${c.stress}` : c.stress} stress
                      </Badge>
                      {c.salary > 0 && <Badge tone="coin">+${c.salary}</Badge>}
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-foreground/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </button>
              ))}
            </div>

            {log.length > 0 && (
              <div
                className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-foreground/85"
              >
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  Consequence
                </div>
                {log[log.length - 1].feedback}
              </div>
            )}
          </div>
        )}

        {/* End of day */}
        {scenes && done && (
          <div className="glass-card mt-6 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-accent" strokeWidth={2} />
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">
                End of your workday
              </h2>
            </div>
            <p className="mt-3 text-foreground/70">
              You finished at level <span className="text-gradient font-semibold">{level.name}</span> with{" "}
              <b>{xp} XP</b>, <b>{stress}/100</b> stress, and <b>${salary.toLocaleString()}/mo</b>.
            </p>

            <div className="mt-6 space-y-2">
              {log.map((l, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <div className="font-display text-lg">{l.scene}</div>
                  <div className="mt-0.5 text-sm text-foreground/60">→ {l.choice}</div>
                  <div className="mt-2 text-xs text-accent/90">{l.feedback}</div>
                </div>
              ))}
            </div>

            <div
              className="mt-6 rounded-xl border border-white/10 p-5"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 295 / 0.12), oklch(0.78 0.15 200 / 0.08))" }}
            >
              <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                <Zap className="h-4 w-4 text-accent" /> AI Mentor's take
              </div>
              {!summary && !summaryLoading && (
                <button
                  onClick={generateSummary}
                  className="btn-primary-grad px-4 py-2 text-sm font-semibold"
                >
                  Get AI reflection
                </button>
              )}
              {summaryLoading && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Reflecting…
                </div>
              )}
              {summary && <p className="text-sm leading-relaxed text-foreground/85">{summary}</p>}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={reset} className="btn-ghost-glass px-5 py-2.5 text-sm font-medium">
                Replay the day
              </button>
              <Link
                to="/mentor"
                className="btn-primary-grad inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
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
  grad,
  fmt,
}: {
  label: string;
  value: number;
  max: number;
  grad: string;
  fmt: (v: number) => string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
          {label}
        </span>
        <span className="font-display text-base">{fmt(value)}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: grad }} />
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
  const color =
    tone === "stress"
      ? "oklch(0.7 0.22 20)"
      : tone === "calm"
        ? "oklch(0.78 0.17 175)"
        : tone === "coin"
          ? "oklch(0.85 0.15 90)"
          : "oklch(0.78 0.15 200)";
  return (
    <span
      className="inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em]"
      style={{ borderColor: `${color}`, color }}
    >
      {children}
    </span>
  );
}
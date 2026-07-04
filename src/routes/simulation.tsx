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

function taskTypeForCareer(career: string): TaskType {
  const c = career.toLowerCase();
  if (c.includes("software") || c.includes("engineer") || c.includes("developer") || c.includes("data")) return "code";
  if (c.includes("doctor") || c.includes("nurse") || c.includes("medical") || c.includes("therapist")) return "diagnosis";
  if (c.includes("law") || c.includes("legal") || c.includes("attorney")) return "argument";
  if (c.includes("teacher") || c.includes("architect") || c.includes("manager") || c.includes("designer")) return "plan";
  return "written";
}

function buildFastScenes(career: string): Scene[] {
  const taskType = taskTypeForCareer(career);
  const technical = taskType === "code";
  const diagnostic = taskType === "diagnosis";
  const legal = taskType === "argument";
  const planning = taskType === "plan";

  if (technical) {
    return [
      {
        time: "9:00 AM",
        title: "Fix the failing production path",
        body: `A dashboard used by customers is showing stale results. As the ${career}, you need to find the bad logic quickly without breaking the happy path.`,
        taskType: "code",
        language: career.toLowerCase().includes("data") ? "sql" : "typescript",
        prompt: career.toLowerCase().includes("data")
          ? "Write a SQL query that returns each active user's latest completed order, including users with no completed orders. Explain any edge case you handle."
          : "Write a small function that removes duplicate records by id, keeps the newest updatedAt value, and returns the records sorted newest first.",
        starter: career.toLowerCase().includes("data")
          ? "-- tables: users(id, active), orders(id, user_id, status, updated_at)\nSELECT ..."
          : "type Record = { id: string; updatedAt: string; value: string }\nfunction latestById(records: Record[]) {\n  // your code\n}",
        rubric: "Correctness, edge-case handling, clear data structure choice, readable implementation, and brief reasoning.",
      },
      {
        time: "11:30 AM",
        title: "Review a risky change",
        body: "A teammate wants to ship a shortcut before lunch. The change looks small, but it touches authentication, cache behavior, and user-visible state.",
        taskType: "code",
        language: "typescript",
        prompt: "List the risks you would check before approving this change, then write one guard or test that would catch the most dangerous failure.",
        starter: "// Write your review notes and a small test/guard here",
        rubric: "Identifies realistic production risks, prioritizes user impact, includes a concrete test or guard, and avoids vague review comments.",
      },
      {
        time: "2:15 PM",
        title: "Design the next API endpoint",
        body: `Product needs a new endpoint today. The ${career} team cares about latency, validation, permissions, and future maintenance.`,
        taskType: "plan",
        prompt: "Design the endpoint contract, validation rules, error states, and rollout plan. Be specific about request/response shape and failure handling.",
        rubric: "Covers contract, validation, authorization, observability, failure cases, and safe rollout trade-offs.",
      },
      {
        time: "5:40 PM",
        title: "Explain the incident clearly",
        body: "A non-technical stakeholder asks what happened and what will prevent it next time. They need a clear answer without blame or jargon overload.",
        taskType: "written",
        prompt: "Write a short incident update with cause, user impact, fix, prevention, and next check-in. Keep it professional and concrete.",
        rubric: "Clear communication, accountability, accurate impact, realistic prevention, and calm professional tone.",
      },
    ];
  }

  return [
    {
      time: "9:00 AM",
      title: diagnostic ? "Triage a high-pressure case" : legal ? "Assess the client fact pattern" : `Prioritize the ${career} morning`,
      body: diagnostic
        ? "A patient arrives with conflicting symptoms, incomplete history, and anxious family members asking for certainty. You have limited time before escalation."
        : legal
          ? "A client brings an urgent dispute with messy facts, missing documents, and a deadline today. Your first advice will shape the whole matter."
          : `Your inbox is full and two people need opposite things from you. As the ${career}, you have to decide what matters first and why.`,
      taskType,
      prompt: diagnostic
        ? "Write your differential diagnosis, the first three questions/tests you would prioritize, and the immediate management plan."
        : legal
          ? "Write your initial legal argument or advice, including the strongest facts, weak points, and what evidence you still need."
          : "Write your priority plan for the next two hours. Include what you do first, what you defer, and how you communicate it.",
      rubric: "Uses concrete professional reasoning, names risks, prioritizes well, and explains the decision clearly.",
    },
    {
      time: "11:45 AM",
      title: "Handle a difficult stakeholder",
      body: `Someone senior challenges your recommendation in front of the room. You need to defend the work without becoming defensive.`,
      taskType: legal ? "argument" : "written",
      prompt: "Write your response. Include the evidence you rely on, the trade-off you accept, and the next step you recommend.",
      rubric: "Professional tone, evidence-based reasoning, acknowledgement of uncertainty, and a concrete next step.",
    },
    {
      time: "2:30 PM",
      title: planning ? "Build the execution plan" : "Make the judgment call",
      body: `The easy answer is not the responsible answer. Your choice affects quality, trust, timeline, and someone else's workload.`,
      taskType: planning ? "plan" : taskType,
      prompt: "Create the plan or decision memo. State your goal, constraints, options considered, recommendation, and success metric.",
      rubric: "Specific goal, realistic constraints, thoughtful options, clear recommendation, and measurable success criteria.",
    },
    {
      time: "5:20 PM",
      title: "Close the day with accountability",
      body: `The work is not perfect, but the day is ending. A strong ${career} leaves a clean handoff and shows what changed.`,
      taskType: "written",
      prompt: "Write the end-of-day update to your team or client. Include progress, unresolved risks, decisions made, and tomorrow's first action.",
      rubric: "Concise status, honest risk framing, useful handoff detail, and clear ownership of the next step.",
    },
  ];
}

function evaluateLocally(career: string, scene: Scene, answer: string): Grade {
  const trimmed = answer.trim();
  const starter = scene.starter?.trim();
  if (trimmed.length < 20 || (starter && trimmed === starter)) {
    return {
      score: trimmed.length < 20 ? 8 : 18,
      xp: -25,
      stress: 25,
      salary: 0,
      verdict: "failed",
      feedback: "This does not show enough real work to trust in a professional setting. Add specific reasoning, concrete steps, and the trade-offs behind your decision.",
      punishment: scene.taskType === "code" ? "Review blocked until the solution is complete." : "Senior review required before this can move forward.",
    };
  }

  const text = trimmed.toLowerCase();
  const words = text.match(/[a-z0-9_]+/g) ?? [];
  const uniqueWords = new Set(words);
  const sourceTerms = `${scene.prompt} ${scene.rubric} ${career}`
    .toLowerCase()
    .match(/[a-z][a-z0-9_]{4,}/g) ?? [];
  const meaningfulTerms = Array.from(new Set(sourceTerms)).slice(0, 28);
  const termHits = meaningfulTerms.filter((term) => text.includes(term)).length;
  const structureHits = ["\n", "-", "1.", "because", "therefore", "risk", "trade", "metric", "test", "plan"].filter((term) => text.includes(term)).length;
  const specificHits = [/\d/.test(text), /\b(if|when|then|else|return|select|from|where|join|function|const|let|class)\b/.test(text), /\b(first|next|finally|priority|evidence|impact|edge|validate|measure)\b/.test(text)].filter(Boolean).length;
  const taskHits = scene.taskType === "code"
    ? ["function", "return", "if", "test", "select", "where", "join", "edge"].filter((term) => text.includes(term)).length
    : scene.taskType === "diagnosis"
      ? ["differential", "history", "test", "vitals", "treatment", "monitor", "rule out"].filter((term) => text.includes(term)).length
      : scene.taskType === "argument"
        ? ["because", "evidence", "client", "risk", "fact", "argument", "weak"].filter((term) => text.includes(term)).length
        : ["goal", "step", "risk", "metric", "timeline", "owner", "priority"].filter((term) => text.includes(term)).length;

  const lengthScore = clamp(Math.round(words.length * 0.45), 0, 28);
  const vocabularyScore = clamp(uniqueWords.size, 0, 22);
  const relevanceScore = clamp(termHits * 4, 0, 24);
  const structureScore = clamp(structureHits * 4, 0, 14);
  const detailScore = clamp((specificHits * 4) + (taskHits * 3), 0, 22);
  const score = clamp(lengthScore + vocabularyScore + relevanceScore + structureScore + detailScore, 0, 100);
  const verdict: Grade["verdict"] = score >= 86 ? "excellent" : score >= 70 ? "good" : score >= 50 ? "okay" : score >= 30 ? "poor" : "failed";
  const xp = verdict === "excellent" ? 110 : verdict === "good" ? 75 : verdict === "okay" ? 35 : verdict === "poor" ? -5 : -30;
  const stress = verdict === "excellent" ? -12 : verdict === "good" ? -4 : verdict === "okay" ? 8 : verdict === "poor" ? 22 : 35;
  const salary = verdict === "excellent" ? 150 : verdict === "failed" ? -80 : 0;
  const feedback = verdict === "excellent" || verdict === "good"
    ? "Strong professional attempt: it is specific, structured, and tied to the task. To make it even sharper, name the biggest risk and how you would verify the outcome."
    : verdict === "okay"
      ? "This is a real attempt, but it needs sharper prioritization and more concrete evidence. Add exact steps, constraints, and how you would know the work succeeded."
      : "The answer is too thin or generic for a senior to approve confidently. Use task-specific details, explain your reasoning, and include a concrete next action.";

  return {
    score,
    xp,
    stress,
    salary,
    verdict,
    feedback,
    ...(verdict === "poor" || verdict === "failed" ? { punishment: scene.taskType === "code" ? "The change would be sent back in review." : "The recommendation would be escalated for correction." } : {}),
  };
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
  const [scenes] = useState<Scene[]>(() => buildFastScenes(career));
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
  const done = step >= scenes.length;
  const currentScene = !done ? scenes[step] : null;

  useEffect(() => {
    if (currentScene) setAnswer(currentScene.starter ?? "");
    setLastGrade(null);
    setGradeError(null);
  }, [step, scenes]);

  async function submitAnswer() {
    if (!currentScene || !answer.trim() || grading) return;
    setGrading(true);
    setGradeError(null);
    try {
      const g = evaluateLocally(career, currentScene, answer);
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
    const averageScore = log.length
      ? Math.round(log.reduce((total, item) => total + item.grade.score, 0) / log.length)
      : 0;
    const best = log.reduce<Attempt | null>((top, item) => (!top || item.grade.score > top.grade.score ? item : top), null);
    setSummary(
      `You finished a realistic ${career} day at ${level.name} with an average review score of ${averageScore}. ${best ? `Your strongest moment was “${best.scene},” where your work earned a ${best.grade.verdict} review.` : "You completed the core workflow and saw the trade-offs of the role."} Keep improving by making each answer more specific, more evidence-based, and easier for a senior to trust.`,
    );
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

        {/* Scene — real task */}
        {scenes && !done && currentScene && (
          <div className="glass-card mt-6 p-6 sm:p-8">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
              {(() => {
                const Icon = timeIcons[step] || Sun;
                return <Icon className="h-4 w-4 text-accent" />;
              })()}
              {currentScene.time} · Scene {step + 1} / {scenes.length}
              <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-[0.1em] text-foreground/60">
                {currentScene.taskType}{currentScene.language ? ` · ${currentScene.language}` : ""}
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              {currentScene.title}
            </h2>
            <p className="mt-3 leading-relaxed text-foreground/70">{currentScene.body}</p>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                Your task
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                {currentScene.prompt}
              </p>
            </div>

            {!lastGrade && (
              <div className="mt-4">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                  {currentScene.taskType === "code" ? "Write your solution" : "Write your answer"}
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={grading}
                  spellCheck={currentScene.taskType !== "code"}
                  placeholder={
                    currentScene.taskType === "code"
                      ? "// Solve it. Real code. The AI will review it."
                      : "Type your real answer. Be specific — this gets graded."
                  }
                  className={`mt-2 min-h-[240px] w-full resize-y rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-foreground/30 focus:border-white/25 ${
                    currentScene.taskType === "code" ? "font-mono" : ""
                  }`}
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={submitAnswer}
                    disabled={grading || !answer.trim()}
                    className="btn-primary-grad inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
                  >
                    {grading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Senior reviewing…</>
                    ) : (
                      <>Submit for review <ArrowUpRight className="h-4 w-4" /></>
                    )}
                  </button>
                  <span className="text-xs text-foreground/40">
                    Senior {career} grades your work — XP, stress, salary all depend on quality.
                  </span>
                </div>
                {gradeError && (
                  <div className="mt-3 text-sm text-destructive">{gradeError}</div>
                )}
              </div>
            )}

            {lastGrade && (
              <GradeCard grade={lastGrade} onNext={nextScene} lastStep={step === scenes.length - 1} />
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

            <div className="mt-6 space-y-3">
              {log.map((l, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-display text-lg">{l.scene}</div>
                    <VerdictPill verdict={l.grade.verdict} score={l.grade.score} />
                  </div>
                  <div className="mt-2 text-xs text-foreground/85">{l.grade.feedback}</div>
                  {l.grade.punishment && (
                    <div className="mt-1 text-xs text-destructive/90">⚠ {l.grade.punishment}</div>
                  )}
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

const verdictMeta: Record<Grade["verdict"], { label: string; color: string; bg: string }> = {
  excellent: { label: "Excellent", color: "oklch(0.85 0.15 145)", bg: "oklch(0.85 0.15 145 / 0.12)" },
  good:      { label: "Good",      color: "oklch(0.78 0.17 175)", bg: "oklch(0.78 0.17 175 / 0.12)" },
  okay:      { label: "Okay",      color: "oklch(0.85 0.15 90)",  bg: "oklch(0.85 0.15 90 / 0.12)" },
  poor:      { label: "Poor",      color: "oklch(0.78 0.19 40)",  bg: "oklch(0.78 0.19 40 / 0.14)" },
  failed:    { label: "Failed",    color: "oklch(0.7 0.22 20)",   bg: "oklch(0.7 0.22 20 / 0.15)" },
};

function VerdictPill({ verdict, score }: { verdict: Grade["verdict"]; score: number }) {
  const m = verdictMeta[verdict] ?? verdictMeta.okay;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em]"
      style={{ borderColor: m.color, color: m.color, background: m.bg }}
    >
      {m.label} · {score}
    </span>
  );
}

function GradeCard({
  grade,
  onNext,
  lastStep,
}: {
  grade: Grade;
  onNext: () => void;
  lastStep: boolean;
}) {
  const m = verdictMeta[grade.verdict] ?? verdictMeta.okay;
  return (
    <div
      className="mt-6 rounded-xl border p-5"
      style={{ borderColor: m.color, background: m.bg }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <VerdictPill verdict={grade.verdict} score={grade.score} />
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="xp">{grade.xp >= 0 ? `+${grade.xp}` : grade.xp} XP</Badge>
          <Badge tone={grade.stress > 0 ? "stress" : "calm"}>
            {grade.stress >= 0 ? `+${grade.stress}` : grade.stress} stress
          </Badge>
          {grade.salary !== 0 && (
            <Badge tone={grade.salary > 0 ? "coin" : "stress"}>
              {grade.salary > 0 ? `+$${grade.salary}` : `-$${Math.abs(grade.salary)}`}
            </Badge>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{grade.feedback}</p>
      {grade.punishment && (
        <p className="mt-2 text-sm font-medium text-destructive">⚠ {grade.punishment}</p>
      )}
      <div className="mt-4">
        <button
          onClick={onNext}
          className="btn-primary-grad inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
        >
          {lastStep ? "Finish the day" : "Next scene"} <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
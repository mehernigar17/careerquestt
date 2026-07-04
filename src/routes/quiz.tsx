import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ArrowUpRight, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "AI Career Quiz — CareerQuest" },
      {
        name: "description",
        content:
          "Answer 6 quick questions. Our AI ranks careers that actually fit how you think, work, and live.",
      },
      { property: "og:title", content: "AI Career Quiz — CareerQuest" },
      {
        property: "og:description",
        content: "Find careers that fit how you actually think and work.",
      },
    ],
  }),
  component: QuizPage,
});

type Q = { q: string; options: string[] };

const questions: Q[] = [
  {
    q: "I enjoy solving…",
    options: ["Puzzles & logic", "People problems", "Creative challenges", "Team & strategy"],
  },
  {
    q: "On a free Saturday, I'd rather…",
    options: ["Build something", "Help a friend", "Sketch or design", "Organize an event"],
  },
  {
    q: "My ideal workday feels like…",
    options: ["Deep focus, few meetings", "Talking with people all day", "Creating things", "Making decisions"],
  },
  {
    q: "Money vs. meaning?",
    options: ["Money first", "Meaning first", "Balanced", "Freedom above both"],
  },
  {
    q: "I learn best by…",
    options: ["Doing / experimenting", "Reading / studying", "Watching / observing", "Teaching others"],
  },
  {
    q: "Under pressure, I…",
    options: ["Focus and grind", "Ask for help", "Get creative", "Take charge"],
  },
];

type Match = { career: string; match: number; why: string; emoji: string };

function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const done = step >= questions.length;

  async function submit(all: string[]) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `The user answered a career-personality quiz. Return the 4 best-fit careers as strict JSON.

Questions & answers:
${questions.map((q, i) => `${i + 1}. ${q.q} → ${all[i]}`).join("\n")}

Return JSON with shape:
{"matches":[{"career":"...","match":92,"why":"one short sentence","emoji":"💻"}, ...]}

Rules: 4 items, match 60-99, careers should be diverse and realistic (not just tech).`;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system:
            "You are a concise career-matching AI. Respond only with valid JSON, no prose, no markdown.",
          prompt,
          json: true,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { content } = (await res.json()) as { content: string };
      const parsed = JSON.parse(content) as { matches: Match[] };
      setResults(parsed.matches);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function pick(opt: string) {
    const next = [...answers, opt];
    setAnswers(next);
    if (next.length >= questions.length) {
      setStep(questions.length);
      submit(next);
    } else {
      setStep(step + 1);
    }
  }

  return (
    <div className="min-h-screen bg-aurora">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
        {!done && (
          <>
            <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/50">
              <span>Question {String(step + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}</span>
              <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="mb-12 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / questions.length) * 100}%`, background: "var(--grad-primary)" }}
              />
            </div>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              {questions[step].q}
            </h1>
            <div className="mt-8 grid gap-3">
              {questions[step].options.map((o) => (
                <button
                  key={o}
                  onClick={() => pick(o)}
                  className="glass-card glass-card-hover group flex items-center justify-between p-5 text-left"
                >
                  <span className="text-base font-medium">{o}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </button>
              ))}
            </div>
          </>
        )}

        {done && loading && (
          <div className="glass-card flex flex-col items-center gap-4 p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <div className="font-display text-2xl">AI is matching your careers…</div>
            <div className="text-sm text-foreground/60">
              Weighing personality, interests, and how you learn.
            </div>
          </div>
        )}

        {done && !loading && error && (
          <div className="glass-card border-destructive/40 p-6 text-destructive">
            {error}
            <div className="mt-3">
              <button
                onClick={() => submit(answers)}
                className="btn-ghost-glass px-4 py-2 text-sm font-medium text-foreground"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {done && !loading && results && (
          <div>
            <span className="chip-glass"><Sparkles className="h-3 w-3" /> Results</span>
            <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
              Your <em className="text-gradient">top</em> matches
            </h1>
            <div className="mt-8 space-y-4">
              {results.map((m, i) => (
                <div key={m.career} className="glass-card p-6">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                        <span>0{i + 1}</span>
                        <span className="text-lg">{m.emoji}</span>
                      </div>
                      <div className="mt-2 font-display text-2xl">{m.career}</div>
                      <p className="mt-2 text-sm text-foreground/65 leading-relaxed">{m.why}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-4xl leading-none text-gradient">
                        {m.match}
                      </div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40">
                        match
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${m.match}%`, background: "var(--grad-primary)" }} />
                  </div>
                  <div className="mt-5 flex gap-3">
                    <Link
                      to="/simulation"
                      search={{ career: m.career }}
                      className="btn-primary-grad inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                    >
                      Simulate a day <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to="/mentor"
                      className="btn-ghost-glass px-4 py-2 text-xs font-medium"
                    >
                      Ask an AI mentor
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setStep(0);
                  setAnswers([]);
                  setResults(null);
                }}
                className="btn-ghost-glass px-5 py-2.5 text-sm font-medium"
              >
                Retake quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
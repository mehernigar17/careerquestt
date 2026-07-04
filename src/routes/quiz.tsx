import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ArrowRight, Loader2, Star } from "lucide-react";

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
    <div className="min-h-screen bg-paper-grid">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        {!done && (
          <>
            <div className="mb-3 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest">
              <span>Q{String(step + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}</span>
              <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="mb-10 h-3 w-full border-2 border-foreground bg-card">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              />
            </div>
            <h1 className="font-display text-3xl font-extrabold sm:text-5xl">
              {questions[step].q}
            </h1>
            <div className="mt-8 grid gap-3">
              {questions[step].options.map((o) => (
                <button
                  key={o}
                  onClick={() => pick(o)}
                  className="card-brut card-brut-hover group flex items-center justify-between p-4 text-left sm:p-5"
                >
                  <span className="font-display text-lg font-semibold">{o}</span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </>
        )}

        {done && loading && (
          <div className="card-brut flex flex-col items-center gap-4 p-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="font-display text-2xl font-bold">AI is matching your careers…</div>
            <div className="text-sm text-foreground/60">
              Weighing personality, interests, and how you learn.
            </div>
          </div>
        )}

        {done && !loading && error && (
          <div className="card-brut bg-destructive/10 p-6 text-destructive">
            {error}
            <div className="mt-3">
              <button
                onClick={() => submit(answers)}
                className="btn-brut bg-card px-4 py-2 font-semibold text-foreground"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {done && !loading && results && (
          <div>
            <span className="chip-ink"><Star className="h-3 w-3" strokeWidth={3}/> Results</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
              Your top matches
            </h1>
            <div className="mt-8 space-y-4">
              {results.map((m, i) => (
                <div key={m.career} className="card-brut p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-foreground/50">
                          #{i + 1}
                        </span>
                        <span className="text-2xl">{m.emoji}</span>
                      </div>
                      <div className="mt-1 font-display text-2xl font-bold">{m.career}</div>
                      <p className="mt-2 text-sm text-foreground/70">{m.why}</p>
                    </div>
                    <div
                      className="grid h-16 w-16 shrink-0 place-items-center rounded-md border-2 border-foreground text-center sm:h-20 sm:w-20"
                      style={{ background: "var(--accent)" }}
                    >
                      <div>
                        <div className="font-display text-xl font-extrabold leading-none sm:text-2xl">
                          {m.match}
                        </div>
                        <div className="font-mono text-[9px] font-bold uppercase tracking-widest">
                          match
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full border border-foreground bg-card">
                    <div className="h-full bg-primary" style={{ width: `${m.match}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/simulation"
                className="btn-brut inline-flex items-center gap-2 bg-primary px-5 py-3 font-semibold text-primary-foreground"
              >
                Try a Day in the Life <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => {
                  setStep(0);
                  setAnswers([]);
                  setResults(null);
                }}
                className="btn-brut bg-card px-5 py-3 font-semibold text-foreground"
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
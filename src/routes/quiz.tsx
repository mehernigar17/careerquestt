import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-16">
        {!done && (
          <>
            <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Question {step + 1} of {questions.length}
              </span>
              <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
            </div>
            <Progress value={((step + 1) / questions.length) * 100} className="mb-10" />
            <h1 className="text-3xl font-bold tracking-tight">{questions[step].q}</h1>
            <div className="mt-8 grid gap-3">
              {questions[step].options.map((o) => (
                <button
                  key={o}
                  onClick={() => pick(o)}
                  className="group flex items-center justify-between rounded-2xl border-2 border-border bg-card p-5 text-left transition hover:border-primary hover:shadow-lg"
                >
                  <span className="font-medium">{o}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </>
        )}

        {done && loading && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-lg font-medium">AI is matching your careers…</div>
            <div className="text-sm text-muted-foreground">
              Weighing personality, interests, and how you learn.
            </div>
          </div>
        )}

        {done && !loading && error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
            {error}
            <div className="mt-3">
              <Button variant="outline" onClick={() => submit(answers)}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {done && !loading && results && (
          <div>
            <div className="mb-8 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Your top matches</h1>
            </div>
            <div className="space-y-4">
              {results.map((m) => (
                <div
                  key={m.career}
                  className="rounded-2xl border border-border bg-card p-6"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{m.emoji}</div>
                      <div>
                        <div className="text-xl font-semibold">{m.career}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{m.why}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-2xl font-bold text-primary">{m.match}%</div>
                      <div className="text-xs text-muted-foreground">match</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/simulation">
                  Try a Day in the Life <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep(0);
                  setAnswers([]);
                  setResults(null);
                }}
              >
                Retake quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
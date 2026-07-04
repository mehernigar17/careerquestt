import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Loader2, Send } from "lucide-react";

export const Route = createFileRoute("/mentor")({
  head: () => ({
    meta: [
      { title: "AI Mentor — CareerQuest" },
      {
        name: "description",
        content:
          "Chat with an AI senior engineer, doctor, designer, or lawyer. Ask anything about the career.",
      },
      { property: "og:title", content: "Chat with an AI Career Mentor" },
      {
        property: "og:description",
        content: "Ask an AI senior anything about the career you're exploring.",
      },
    ],
  }),
  component: MentorPage,
});

const mentors = [
  { id: "engineer", label: "Senior Software Engineer", tag: "SWE", color: "oklch(0.85 0.13 55)" },
  { id: "doctor", label: "Attending Physician", tag: "MD", color: "oklch(0.85 0.13 145)" },
  { id: "designer", label: "Lead UX Designer", tag: "UX", color: "oklch(0.85 0.13 320)" },
  { id: "lawyer", label: "Corporate Lawyer", tag: "LAW", color: "oklch(0.85 0.13 240)" },
  { id: "pm", label: "Product Manager", tag: "PM", color: "oklch(0.85 0.13 85)" },
];

type Msg = { role: "user" | "assistant"; content: string };

function MentorPage() {
  const [mentor, setMentor] = useState(mentors[0]);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi — I'm a ${mentors[0].label.toLowerCase()}. Ask me anything about the job: a typical week, hard days, how to break in, what I wish I'd known.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  function switchMentor(m: (typeof mentors)[number]) {
    setMentor(m);
    setMessages([
      {
        role: "assistant",
        content: `Hi — I'm a ${m.label.toLowerCase()}. What do you want to know about this career?`,
      },
    ]);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a warm, honest, experienced ${mentor.label} mentoring a curious student exploring this career. Speak in first person about your work. Be specific with concrete examples. Keep answers to 3-6 short paragraphs. No lists unless asked.`,
            },
            ...next,
          ],
        }),
      });
      const { content } = (await res.json()) as { content: string };
      setMessages((m) => [...m, { role: "assistant", content }]);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry — I hit a snag. Can you try again?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper-grid">
      <SiteHeader />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 sm:py-10 md:grid-cols-[260px_1fr]">
        <aside>
          <span className="chip-ink">Pick a mentor</span>
          <div className="mt-3 space-y-2">
            {mentors.map((m) => {
              const active = mentor.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => switchMentor(m)}
                  className={`card-brut flex w-full items-center gap-3 p-3 text-left transition ${
                    active ? "translate-x-[-2px] translate-y-[-2px]" : ""
                  }`}
                  style={active ? { background: m.color, boxShadow: "var(--shadow-hard-lg)" } : {}}
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-md border-2 border-foreground font-mono text-[10px] font-bold"
                    style={{ background: m.color }}
                  >
                    {m.tag}
                  </span>
                  <span className="min-w-0 truncate font-display text-sm font-semibold">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="card-brut flex h-[75vh] min-h-[500px] flex-col overflow-hidden bg-card">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b-2 border-foreground p-4">
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                Chatting with
              </div>
              <div className="truncate font-display text-lg font-bold">{mentor.label}</div>
            </div>
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 border-foreground font-mono text-xs font-bold"
              style={{ background: mentor.color }}
            >
              {mentor.tag}
            </span>
          </div>
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "user" ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-lg border-2 border-foreground bg-primary px-4 py-2.5 text-sm font-medium leading-relaxed text-primary-foreground shadow-[3px_3px_0_0_var(--ink)]">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[90%] whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {m.content}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground/60">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>
          <div className="border-t-2 border-foreground bg-secondary/40 p-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about a typical day, hard moments, or how to break in…"
                className="min-h-[48px] flex-1 resize-none rounded-md border-2 border-foreground bg-card px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_0_var(--ink)]"
                rows={2}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="btn-brut grid h-12 w-12 shrink-0 place-items-center self-end bg-primary text-primary-foreground disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
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
  { id: "engineer", label: "Senior Software Engineer", tag: "SWE", grad: "linear-gradient(135deg, oklch(0.65 0.2 265), oklch(0.72 0.18 200))" },
  { id: "doctor", label: "Attending Physician", tag: "MD", grad: "linear-gradient(135deg, oklch(0.72 0.2 340), oklch(0.68 0.22 20))" },
  { id: "designer", label: "Lead UX Designer", tag: "UX", grad: "linear-gradient(135deg, oklch(0.72 0.19 295), oklch(0.78 0.15 200))" },
  { id: "lawyer", label: "Corporate Lawyer", tag: "LAW", grad: "linear-gradient(135deg, oklch(0.6 0.15 250), oklch(0.5 0.1 265))" },
  { id: "pm", label: "Product Manager", tag: "PM", grad: "linear-gradient(135deg, oklch(0.78 0.19 40), oklch(0.7 0.22 350))" },
];
  
const extraMentors = [
  { id: "data", label: "Senior Data Scientist", tag: "DS", grad: "linear-gradient(135deg, oklch(0.7 0.18 220), oklch(0.78 0.17 175))" },
  { id: "cyber", label: "Cyber Security Lead", tag: "SEC", grad: "linear-gradient(135deg, oklch(0.55 0.18 30), oklch(0.5 0.15 300))" },
  { id: "teacher", label: "Veteran Teacher", tag: "EDU", grad: "linear-gradient(135deg, oklch(0.78 0.16 145), oklch(0.72 0.15 90))" },
  { id: "architect", label: "Principal Architect", tag: "ARC", grad: "linear-gradient(135deg, oklch(0.68 0.14 85), oklch(0.55 0.1 60))" },
  { id: "marketer", label: "Head of Marketing", tag: "MKT", grad: "linear-gradient(135deg, oklch(0.75 0.2 15), oklch(0.72 0.2 340))" },
  { id: "founder", label: "Startup Founder", tag: "CEO", grad: "linear-gradient(135deg, oklch(0.72 0.19 295), oklch(0.78 0.19 40))" },
  { id: "finance", label: "Investment Banker", tag: "FIN", grad: "linear-gradient(135deg, oklch(0.5 0.12 250), oklch(0.65 0.15 195))" },
  { id: "writer", label: "Senior Journalist", tag: "JRN", grad: "linear-gradient(135deg, oklch(0.6 0.08 60), oklch(0.5 0.06 40))" },
  { id: "chef", label: "Executive Chef", tag: "CHF", grad: "linear-gradient(135deg, oklch(0.7 0.2 30), oklch(0.75 0.18 85))" },
  { id: "psych", label: "Clinical Psychologist", tag: "PSY", grad: "linear-gradient(135deg, oklch(0.72 0.15 200), oklch(0.75 0.14 155))" },
];

const allMentors = [...mentors, ...extraMentors];

type Msg = { role: "user" | "assistant"; content: string };

function MentorPage() {
  const [mentor, setMentor] = useState(allMentors[0]);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi — I'm a ${allMentors[0].label.toLowerCase()}. Ask me anything about the job: a typical week, hard days, how to break in, what I wish I'd known.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  function switchMentor(m: (typeof allMentors)[number]) {
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
    <div className="min-h-screen bg-aurora">
      <SiteHeader />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[280px_1fr]">
        <aside>
          <span className="chip-glass">Pick a mentor</span>
          <div className="mt-4 space-y-2">
            {allMentors.map((m) => {
              const active = mentor.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => switchMentor(m)}
                  className={`glass-card flex w-full items-center gap-3 p-3 text-left transition ${
                    active ? "border-white/25" : "hover:border-white/15"
                  }`}
                  style={active ? { boxShadow: "var(--shadow-glow)" } : {}}
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-semibold text-background"
                    style={{ background: m.grad }}
                  >
                    {m.tag}
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="glass-card flex h-[75vh] min-h-[500px] flex-col overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/5 p-4">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                Chatting with
              </div>
              <div className="truncate font-display text-xl">{mentor.label}</div>
            </div>
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg font-mono text-xs font-semibold text-background"
              style={{ background: mentor.grad }}
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
                  <div
                    className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed text-primary-foreground"
                    style={{ background: "var(--grad-primary)" }}
                  >
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-white/5 bg-white/5 px-4 py-2.5 text-sm leading-relaxed text-foreground/90">
                    {m.content}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/50">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>
          <div className="border-t border-white/5 bg-white/[0.02] p-3">
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
                className="min-h-[48px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm outline-none placeholder:text-foreground/40 focus:border-white/25"
                rows={2}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="btn-primary-grad grid h-12 w-12 shrink-0 place-items-center self-end disabled:opacity-40"
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
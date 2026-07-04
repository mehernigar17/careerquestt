import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Sparkles } from "lucide-react";

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
  { id: "engineer", label: "Senior Software Engineer", emoji: "💻" },
  { id: "doctor", label: "Attending Physician", emoji: "🩺" },
  { id: "designer", label: "Lead UX Designer", emoji: "🎨" },
  { id: "lawyer", label: "Corporate Lawyer", emoji: "⚖️" },
  { id: "pm", label: "Product Manager", emoji: "🧭" },
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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 md:grid-cols-[240px_1fr]">
        <aside className="space-y-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Pick a mentor
          </div>
          {mentors.map((m) => (
            <button
              key={m.id}
              onClick={() => switchMentor(m)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${
                mentor.id === m.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="font-medium">{m.label}</span>
            </button>
          ))}
        </aside>

        <section className="flex h-[70vh] flex-col rounded-3xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="text-sm text-muted-foreground">Chatting with</div>
            <div className="font-semibold">
              {mentor.emoji} {mentor.label}
            </div>
          </div>
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about a typical day, hard moments, or how to break in…"
                className="min-h-[44px] resize-none"
              />
              <Button onClick={send} disabled={loading || !input.trim()} size="lg">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
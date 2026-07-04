import { createFileRoute } from "@tanstack/react-router";

type Body = {
  system?: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  json?: boolean;
};

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const messages =
          body.messages ??
          [
            ...(body.system ? [{ role: "system" as const, content: body.system }] : []),
            { role: "user" as const, content: body.prompt ?? "" },
          ];

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages,
            ...(body.json ? { response_format: { type: "json_object" } } : {}),
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          return new Response(text || "AI gateway error", { status: res.status });
        }
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content ?? "";
        return Response.json({ content });
      },
    },
  },
});
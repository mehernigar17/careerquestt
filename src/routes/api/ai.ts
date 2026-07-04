import { createFileRoute } from "@tanstack/react-router";

type Body = {
  system?: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  json?: boolean;
  model?: string;
  fast?: boolean;
  timeoutMs?: number;
};

function boundedTimeout(ms: unknown) {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return 20000;
  return Math.max(1000, Math.min(60000, Math.round(ms)));
}

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

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), boundedTimeout(body.timeoutMs));
        request.signal.addEventListener("abort", () => controller.abort(), { once: true });

        let res: Response;
        try {
          res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": key,
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: body.model ?? "google/gemini-3-flash-preview",
              messages,
              ...(body.json ? { response_format: { type: "json_object" } } : {}),
              ...(body.fast ? { service_tier: "priority" } : {}),
            }),
          });
        } catch (error) {
          if (controller.signal.aborted) {
            return new Response("AI request timed out", { status: 504 });
          }
          throw error;
        } finally {
          clearTimeout(timeout);
        }

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
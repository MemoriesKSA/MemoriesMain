import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPromptParts } from "../../concierge-data";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== requestUrl.host) {
        return Response.json({ error: "Invalid request origin." }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  if (Number(request.headers.get("content-length") ?? 0) > 20_000) {
    return Response.json({ error: "Request is too large." }, { status: 413 });
  }

  let body: { locale?: unknown; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const locale: "en" | "ar" = clean(body.locale, 2) === "ar" ? "ar" : "en";
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = rawMessages
    .filter((entry): entry is { role: unknown; content: unknown } => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      role: (entry as { role: unknown }).role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: clean((entry as { content: unknown }).content, MAX_MESSAGE_LENGTH),
    }))
    .filter((entry) => entry.content.length > 0)
    .slice(-MAX_MESSAGES);

  if (messages.length === 0) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "The concierge isn't configured yet." }, { status: 503 });
  }

  const conversationText = messages.map((entry) => entry.content).join(" ");
  const { stable, dynamic } = buildSystemPromptParts(locale, conversationText);
  const anthropic = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic.messages.stream({
          // Sonnet 5: strong quality for grounded Q&A at a fraction of
          // Opus's cost, with faster streaming for a live chat widget.
          model: "claude-sonnet-5",
          max_tokens: 600,
          system: [
            // Persona/instructions are identical on every request, so this
            // block caches; only the grounded-facts block below varies.
            { type: "text", text: stable, cache_control: { type: "ephemeral" } },
            { type: "text", text: dynamic },
          ],
          messages: messages.map((entry) => ({ role: entry.role, content: entry.content })),
        });
        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        console.error("Concierge stream failed", error);
        controller.enqueue(encoder.encode("\n\nSomething went wrong on our end, please try again in a moment."));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

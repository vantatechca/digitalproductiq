import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are Brain, an AI assistant inside DigitalProductIQ — a tool for indie founders researching, validating, and building digital products (Notion templates, Etsy printables, Gumroad packs, micro-SaaS, Whop communities, AI/GPT bundles, courses, PLR arbitrage, etc.).

Your audience is solo founders / small teams with 5-20 hours per week, building toward $1K-10K/month in digital product revenue.

Style:
- Direct and tactical. No fluff, no "great question!"
- Use markdown (## headings, **bold**, bullet lists, numbered steps)
- When relevant, cite specific platforms (Etsy, Gumroad, Whop, Notion Marketplace, Pinterest, TikTok, Reddit, Indie Hackers)
- When giving build estimates, use ranges (e.g. "12-24 hours")
- When giving revenue estimates, use ranges with caveats (e.g. "$200-1500 first 30 days, depending on launch effort")

If asked about something outside digital products / indie business (general knowledge, math, code unrelated to products), still help — just stay concise.

Today's date: ${new Date().toISOString().split("T")[0]}.`;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    message: string;
    thread_id?: string;
    context_idea_id?: string;
  };

  const userMessage = (body.message ?? "").trim();
  if (!userMessage) {
    return new Response(JSON.stringify({ error: "Empty message" }), { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server missing ANTHROPIC_API_KEY" }), { status: 500 });
  }

  const model = process.env.TIER3_MODEL ?? "claude-sonnet-4-6";

  const messageId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const threadId = body.thread_id ?? `t_${Date.now()}`;

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send("meta", {
        type: "meta",
        id: messageId,
        thread_id: threadId,
        sources: [model],
        confidence: 0.9,
      });

      try {
        const anthropicStream = await client.messages.stream({
          model,
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });

        let inputTokens = 0;
        let outputTokens = 0;

        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send("token", { type: "token", text: event.delta.text });
          } else if (event.type === "message_delta" && event.usage) {
            outputTokens = event.usage.output_tokens ?? outputTokens;
          } else if (event.type === "message_start" && event.message.usage) {
            inputTokens = event.message.usage.input_tokens ?? 0;
          }
        }

        // Sonnet 4.5 / 4.6 share rates: $3/MTok input, $15/MTok output.
        // If you ever switch TIER3_MODEL to Opus or Haiku, update this table.
        const costUsd = (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;

        send("done", {
          type: "done",
          message_id: messageId,
          cost_usd: Number(costUsd.toFixed(5)),
          input_tokens: inputTokens,
          output_tokens: outputTokens,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[brain/chat] Anthropic error:", message);
        send("error", { type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
import { getThreadMessages } from "@/lib/mock-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const messages = getThreadMessages(id);
  return Response.json({ data: messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json() as { content: string };
  const userMsg = {
    id: `m_${Date.now()}_u`,
    thread_id: id,
    role: "user" as const,
    content: body.content,
    meta: null,
    created_at: new Date().toISOString(),
  };
  const assistantMsg = {
    id: `m_${Date.now()}_a`,
    thread_id: id,
    role: "assistant" as const,
    content: "_(Mock response — wire to /api/brain/chat for streaming)_",
    meta: null,
    created_at: new Date().toISOString(),
  };
  return Response.json({ data: { user: userMsg, assistant: assistantMsg } });
}

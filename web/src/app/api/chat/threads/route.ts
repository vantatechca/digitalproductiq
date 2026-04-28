import { CHAT_THREADS } from "@/lib/mock-data";

export async function GET() {
  const sorted = [...CHAT_THREADS].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
  return Response.json({ data: sorted });
}

export async function POST(req: Request) {
  const body = await req.json() as { title?: string; thread_type?: string; context_idea_id?: string };
  const newThread = {
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    user_id: "00000000-0000-0000-0000-000000000001",
    title: body.title ?? "New conversation",
    thread_type: (body.thread_type ?? "general") as "general",
    context_idea_id: body.context_idea_id ?? null,
    pinned: false,
    created_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  };
  return Response.json({ data: newThread });
}

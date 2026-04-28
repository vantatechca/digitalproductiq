import { getIdeaById } from "@/lib/mock-data";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json() as { action: string; reason?: string; note?: string };
  const idea = getIdeaById(id);
  if (!idea) return Response.json({ error: "Not found" }, { status: 404 });

  const status_map: Record<string, string> = {
    approve: "approved",
    decline: "declined",
    star: "starred",
    archive: "archived",
    move_to_incubating: "incubating",
    move_to_in_build: "in_build",
    move_to_launched: "launched",
  };
  const newStatus = status_map[body.action] ?? idea.status;
  return Response.json({ data: { ...idea, status: newStatus, updated_at: new Date().toISOString() } });
}

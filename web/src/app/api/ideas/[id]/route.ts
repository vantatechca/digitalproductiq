import { getIdeaById } from "@/lib/mock-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = getIdeaById(id);
  if (!idea) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ data: idea });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const idea = getIdeaById(id);
  if (!idea) return Response.json({ error: "Not found" }, { status: 404 });
  // Mock: in real impl this would persist
  return Response.json({ data: { ...idea, ...body, updated_at: new Date().toISOString() } });
}

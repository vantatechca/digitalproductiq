import { RULES } from "@/lib/mock-data";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const rule = RULES.find(r => r.id === id);
  if (!rule) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ data: { ...rule, ...body } });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return Response.json({ data: { id, deleted: true } });
}

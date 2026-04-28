export async function POST(req: Request) {
  const body = await req.json() as { idea_ids: string[]; action: string };
  return Response.json({ data: { updated: body.idea_ids.length, action: body.action } });
}

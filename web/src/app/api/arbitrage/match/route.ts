import { ARBITRAGE_SOURCES, getIdeaById } from "@/lib/mock-data";

export async function POST(req: Request) {
  const body = await req.json() as { idea_id: string };
  const idea = getIdeaById(body.idea_id);
  if (!idea) return Response.json({ error: "Idea not found" }, { status: 404 });

  const matches = ARBITRAGE_SOURCES
    .map(s => ({
      source: s,
      match_score: (s.matched_idea_id === body.idea_id ? 60 : 0) +
        (s.format && s.format.includes(idea.product_format.split("_")[0]) ? 20 : 0) +
        (idea.sub_niche.some(n => s.product_title.toLowerCase().includes(n.split("_")[0])) ? 15 : 0) +
        (s.est_arbitrage_potential ?? 0) * 0.3,
    }))
    .filter(m => m.match_score >= 20)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 8);

  return Response.json({ data: { idea_id: body.idea_id, matches } });
}

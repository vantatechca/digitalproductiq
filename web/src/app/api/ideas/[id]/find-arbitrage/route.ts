import { ARBITRAGE_SOURCES, getIdeaById } from "@/lib/mock-data";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = getIdeaById(id);
  if (!idea) return Response.json({ error: "Not found" }, { status: 404 });

  // Score each arbitrage source against the idea using simple heuristic
  const scored = ARBITRAGE_SOURCES.map(s => {
    let score = 0;
    if (s.matched_idea_id === id) score += 60;
    if (s.format && idea.product_format && s.format.includes(idea.product_format.split("_")[0])) score += 20;
    if (idea.sub_niche.some(n => s.product_title.toLowerCase().includes(n.split("_")[0]))) score += 15;
    if (s.est_arbitrage_potential) score += s.est_arbitrage_potential * 0.3;
    return { source: s, match_score: Math.round(score) };
  })
    .filter(s => s.match_score >= 20)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 8);

  return Response.json({ data: { idea_id: id, matches: scored, generated_at: new Date().toISOString() } });
}

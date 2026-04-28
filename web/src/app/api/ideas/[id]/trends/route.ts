import { getIdeaById } from "@/lib/mock-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = getIdeaById(id);
  if (!idea) return Response.json({ error: "Not found" }, { status: 404 });

  // Generate 12 weeks of synthetic trend data
  const data = [];
  const now = Date.now();
  let sv = idea.search_volume_monthly * 0.7;
  let cc = idea.competitor_count * 0.6;
  let mp = idea.median_price_usd * 0.95;
  let cs = idea.composite_score * 0.85;

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now - i * 7 * 86400_000).toISOString().slice(0, 10);
    sv = sv * (1 + (Math.random() - 0.4) * 0.06 + (idea.trend_velocity_pct / 1000));
    cc = cc * (1 + (Math.random() - 0.45) * 0.04);
    mp = mp * (1 + (Math.random() - 0.5) * 0.02);
    cs = Math.min(100, cs * (1 + (Math.random() - 0.45) * 0.02));
    data.push({
      date,
      search_volume: Math.round(sv),
      mention_count: Math.round(sv * 0.012),
      competitor_count: Math.round(cc),
      median_price_usd: Math.round(mp * 100) / 100,
      composite_score: Math.round(cs * 10) / 10,
    });
  }
  return Response.json({ data });
}

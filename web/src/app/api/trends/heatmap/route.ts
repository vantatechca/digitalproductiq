import { TREND_KEYWORDS } from "@/lib/mock-data";

export async function GET() {
  const data = TREND_KEYWORDS.map(k => ({
    keyword: k.keyword,
    category: k.category,
    direction: k.direction,
    velocity_pct: k.velocity_pct,
    current_volume: k.current_volume,
  }));
  return Response.json({ data });
}

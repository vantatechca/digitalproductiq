import { getCompetitorById, getProductsForCompetitor } from "@/lib/mock-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCompetitorById(id);
  if (!c) return Response.json({ error: "Not found" }, { status: 404 });
  const products = getProductsForCompetitor(id);

  const prices = products.map(p => p.price_usd).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)] ?? 0;
  const p25 = prices[Math.floor(prices.length * 0.25)] ?? 0;
  const p75 = prices[Math.floor(prices.length * 0.75)] ?? 0;

  const buckets = ["0-10","10-30","30-79","79-199","199+"];
  const distribution = buckets.map(b => {
    const [lo, hi] = b.includes("+") ? [199, 99999] : b.split("-").map(Number);
    return { bucket: b, count: products.filter(p => p.price_usd >= lo && p.price_usd < hi).length };
  });

  return Response.json({
    data: {
      ...c,
      products,
      pricing_analysis: { median, p25, p75, distribution },
      social_presence: [
        { platform: "twitter", handle: "@" + c.name.toLowerCase().replace(/\s+/g, ""), followers: Math.round(c.follower_count * 0.4) },
        { platform: "instagram", handle: "@" + c.name.toLowerCase().replace(/\s+/g, ""), followers: Math.round(c.follower_count * 0.6) },
      ],
      recent_activity: [
        { date: new Date(Date.now() - 2 * 86400_000).toISOString().slice(0, 10), event: "New product launched" },
        { date: new Date(Date.now() - 5 * 86400_000).toISOString().slice(0, 10), event: "Price increase across 3 products" },
        { date: new Date(Date.now() - 12 * 86400_000).toISOString().slice(0, 10), event: "Featured in newsletter" },
      ],
    },
  });
}

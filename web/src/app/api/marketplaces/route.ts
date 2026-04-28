import { MARKETPLACES, COMPETITORS, COMPETITOR_PRODUCTS } from "@/lib/mock-data";

export async function GET() {
  const data = MARKETPLACES.map(m => {
    const comps = COMPETITORS.filter(c => c.marketplace_id === m.id);
    const total_products_tracked = COMPETITOR_PRODUCTS.filter(p => p.marketplace_id === m.id).length;
    const total_revenue_tracked_usd = comps.reduce((s, c) => s + c.estimated_monthly_revenue_usd, 0);
    return {
      ...m,
      total_products_tracked,
      total_revenue_tracked_usd,
      top_sellers_count: comps.filter(c => c.is_top_seller).length,
      competitors_count: comps.length,
    };
  });
  return Response.json({ data });
}

export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({ data: { ...body, id: `mp_${Date.now()}`, is_active: true } });
}

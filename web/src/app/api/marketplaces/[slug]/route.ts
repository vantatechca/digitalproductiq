import { getMarketplaceBySlug, COMPETITORS, COMPETITOR_PRODUCTS } from "@/lib/mock-data";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mp = getMarketplaceBySlug(slug);
  if (!mp) return Response.json({ error: "Not found" }, { status: 404 });

  const comps = COMPETITORS.filter(c => c.marketplace_id === mp.id);
  const top_sellers = comps.filter(c => c.is_top_seller).slice(0, 8);
  const trending_products = COMPETITOR_PRODUCTS.filter(p => p.marketplace_id === mp.id)
    .sort((a, b) => (b.estimated_monthly_revenue_usd ?? 0) - (a.estimated_monthly_revenue_usd ?? 0))
    .slice(0, 12);

  return Response.json({
    data: {
      ...mp,
      total_products_tracked: COMPETITOR_PRODUCTS.filter(p => p.marketplace_id === mp.id).length,
      total_revenue_tracked_usd: comps.reduce((s, c) => s + c.estimated_monthly_revenue_usd, 0),
      top_sellers,
      trending_products,
      competitors_count: comps.length,
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();
  const mp = getMarketplaceBySlug(slug);
  if (!mp) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ data: { ...mp, ...body } });
}

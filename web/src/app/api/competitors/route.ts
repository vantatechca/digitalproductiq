import { COMPETITORS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const marketplace = url.searchParams.get("marketplace");
  const category = url.searchParams.get("category");
  let data = [...COMPETITORS];
  if (marketplace && marketplace !== "all") data = data.filter(c => c.marketplace_id === marketplace);
  if (category && category !== "all") data = data.filter(c => c.primary_category === category);
  return Response.json({ data });
}

export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({ data: { ...body, id: `c_${Date.now()}`, total_products: 0, estimated_monthly_revenue_usd: 0, is_top_seller: false } });
}

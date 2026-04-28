import { IDEAS } from "@/lib/mock-data";
import type { Idea } from "@/types/database";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const product_format = url.searchParams.get("product_format");
  const build_path = url.searchParams.get("build_path");
  const search = url.searchParams.get("search")?.toLowerCase();
  const sort = url.searchParams.get("sort") ?? "score";
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
  const min_price = url.searchParams.get("min_price");
  const max_price = url.searchParams.get("max_price");
  const max_effort = url.searchParams.get("max_effort");

  let data: Idea[] = [...IDEAS];

  if (status && status !== "all") data = data.filter(i => i.status === status);
  if (category && category !== "all") data = data.filter(i => i.category === category);
  if (product_format && product_format !== "all") data = data.filter(i => i.product_format === product_format);
  if (build_path && build_path !== "all") data = data.filter(i => i.build_path === build_path);
  if (min_price) data = data.filter(i => i.median_price_usd >= parseFloat(min_price));
  if (max_price) data = data.filter(i => i.median_price_usd <= parseFloat(max_price));
  if (max_effort) data = data.filter(i => i.build_effort_hours_min <= parseInt(max_effort, 10));
  if (search) data = data.filter(i =>
    i.title.toLowerCase().includes(search) ||
    i.summary.toLowerCase().includes(search) ||
    i.sub_niche.some(s => s.toLowerCase().includes(search)),
  );

  switch (sort) {
    case "newest": data.sort((a, b) => b.discovered_at.localeCompare(a.discovered_at)); break;
    case "oldest": data.sort((a, b) => a.discovered_at.localeCompare(b.discovered_at)); break;
    case "signals": data.sort((a, b) => b.signals_count - a.signals_count); break;
    case "revenue_potential": data.sort((a, b) => b.estimated_monthly_revenue_high_usd - a.estimated_monthly_revenue_high_usd); break;
    default: data.sort((a, b) => b.composite_score - a.composite_score);
  }

  const total = data.length;
  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  return Response.json({
    data: paged,
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  });
}

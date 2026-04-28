import { IDEAS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();
  const status = url.searchParams.get("status");

  let data = [...IDEAS];
  if (status && status !== "all") data = data.filter(i => i.status === status);

  if (format === "json") {
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="dpiq-ideas.json"',
      },
    });
  }

  // CSV
  const headers = ["id","title","category","product_format","build_path","status","composite_score","trend_score","demand_score","competition_score","feasibility_score","revenue_potential_score","trend_direction","median_price_usd","competitor_count","est_monthly_revenue_low_usd","est_monthly_revenue_high_usd","signals_count","discovered_at"];
  const rows = data.map(i => [
    i.id, csvEscape(i.title), i.category, i.product_format, i.build_path, i.status,
    i.composite_score, i.trend_score, i.demand_score, i.competition_score, i.feasibility_score, i.revenue_potential_score,
    i.trend_direction, i.median_price_usd, i.competitor_count,
    i.estimated_monthly_revenue_low_usd, i.estimated_monthly_revenue_high_usd, i.signals_count, i.discovered_at,
  ].join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="dpiq-ideas.csv"',
    },
  });
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

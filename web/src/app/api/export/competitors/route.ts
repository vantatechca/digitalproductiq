import { COMPETITORS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();

  if (format === "json") {
    return new Response(JSON.stringify(COMPETITORS, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="dpiq-competitors.json"' },
    });
  }

  const headers = ["id","name","primary_category","total_products","est_monthly_revenue_usd","avg_product_price","avg_rating","follower_count","is_top_seller","shop_url"];
  const rows = COMPETITORS.map(c => [
    c.id, csvEscape(c.name), c.primary_category, c.total_products, c.estimated_monthly_revenue_usd,
    c.avg_product_price, c.avg_rating, c.follower_count, c.is_top_seller, c.shop_url ?? "",
  ].join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="dpiq-competitors.csv"' },
  });
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

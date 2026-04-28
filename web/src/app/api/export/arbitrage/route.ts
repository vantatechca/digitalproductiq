import { ARBITRAGE_SOURCES } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();

  if (format === "json") {
    return new Response(JSON.stringify(ARBITRAGE_SOURCES, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="dpiq-arbitrage.json"' },
    });
  }

  const headers = ["id","source_type","source_platform","product_title","cost_usd","license_type","format","est_arbitrage_potential","matched_idea_id","product_url"];
  const rows = ARBITRAGE_SOURCES.map(a => [
    a.id, a.source_type, a.source_platform, csvEscape(a.product_title), a.cost_usd,
    csvEscape(a.license_type), a.format ?? "", a.est_arbitrage_potential ?? "",
    a.matched_idea_id ?? "", a.product_url ?? "",
  ].join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="dpiq-arbitrage.csv"' },
  });
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

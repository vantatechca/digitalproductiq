import { RULES } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();

  if (format === "json") {
    return new Response(JSON.stringify(RULES, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="dpiq-rules.json"' },
    });
  }

  const headers = ["id","rule_type","direction","rule_text","weight","source","active","applied_count","created_at"];
  const rows = RULES.map(r => [
    r.id, r.rule_type, r.direction, csvEscape(r.rule_text), r.weight, r.source, r.active, r.applied_count, r.created_at,
  ].join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="dpiq-rules.csv"' },
  });
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

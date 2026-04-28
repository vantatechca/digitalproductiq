import { RULES } from "@/lib/mock-data";

export async function GET() {
  const by_type: Record<string, number> = {};
  for (const r of RULES) by_type[r.rule_type] = (by_type[r.rule_type] || 0) + 1;
  const active_count = RULES.filter(r => r.active).length;
  return Response.json({ data: RULES, meta: { total: RULES.length, by_type, active_count } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const newRule = {
    id: `r_${Date.now()}`,
    user_id: "00000000-0000-0000-0000-000000000001",
    rule_type: body.rule_type ?? "category",
    direction: body.direction ?? "prefer",
    rule_text: body.rule_text ?? "",
    conditions: body.conditions ?? {},
    weight: body.weight ?? 1.0,
    source: "manual" as const,
    active: body.active ?? true,
    applied_count: 0,
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  return Response.json({ data: newRule });
}

import { ARBITRAGE_SOURCES } from "@/lib/mock-data";

export async function POST(req: Request) {
  const body = await req.json() as { source_id: string; target_marketplace?: string };
  const source = ARBITRAGE_SOURCES.find(s => s.id === body.source_id);
  if (!source) return Response.json({ error: "Source not found" }, { status: 404 });

  const target = body.target_marketplace ?? "etsy";
  return Response.json({
    data: {
      source_id: body.source_id,
      target_marketplace: target,
      new_title: `Premium ${source.product_title.replace(/\(.+\)/, "")} — Curated Edition`,
      new_audience: target === "etsy" ? "Etsy aesthetic-driven buyers, 25-45F" : target === "gumroad" ? "Indie creators and solo founders" : "Whop community-led buyers",
      new_price_usd: target === "etsy" ? Math.max(14, source.cost_usd * 1.8) : target === "gumroad" ? Math.max(29, source.cost_usd * 2.5) : Math.max(39, source.cost_usd * 3.5),
      new_format: source.format ?? "pdf_guide",
      marketing_angle: `Repositioned for ${target}: lead with aesthetic + curation, NOT 'PLR'. Add 30% original content (intro, framework, worksheets). Bundle with companion checklist.`,
      compliance_check: {
        ok: source.license_type.toLowerCase().includes("public") || source.license_type.toLowerCase().includes("plr") || source.license_type.toLowerCase().includes("mrr"),
        notes: source.source_type === "plr"
          ? "Must rewrite ≥30% per IDPLR/PLR Database ToS. Don't redistribute the source files; ship a derivative."
          : source.source_type === "public_domain"
          ? "Public domain in US. Verify per-region (EU/AU rules differ). Cannot trademark the original work itself."
          : "License is reseller-friendly. Verify against destination marketplace ToS (Etsy, Gumroad, Whop all permit licensed digital products).",
      },
      estimated_monthly_revenue_usd: source.est_arbitrage_potential ? source.est_arbitrage_potential * 30 : 1500,
      generated_at: new Date().toISOString(),
    },
  });
}

import { getIdeaById } from "@/lib/mock-data";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = getIdeaById(id);
  if (!idea) return Response.json({ error: "Not found" }, { status: 404 });

  // Mock Tier-3 deep dive
  return Response.json({
    data: {
      idea_id: id,
      generated_at: new Date().toISOString(),
      market_analysis: `## Market Analysis — ${idea.title}\n\n**TAM/SAM/SOM**: ${(idea.market_size_estimate_usd / 1_000_000).toFixed(1)}M total. Realistic SOM for a single creator at the right price point: 0.5-2% capture.\n\n**Demand drivers**:\n- ${idea.source_platforms.join(", ")} — sustained engagement\n- Search velocity ${idea.trend_velocity_pct >= 0 ? "+" : ""}${idea.trend_velocity_pct}% MoM\n- Trend direction: **${idea.trend_direction}**\n\n**Buyer psychology**: Buyers in this category prioritize (1) perceived completeness, (2) social proof from peers, (3) aesthetic finish. Price is not the primary objection at this tier.`,
      competitive_deep_dive: `## Competitive Landscape\n\n**${idea.competitor_count} competitors** in active sale. Median price **$${idea.median_price_usd}** (range $${idea.price_floor_usd}-$${idea.price_ceiling_usd}).\n\n**Top 3 competitor patterns**:\n1. Generic incumbent — high volume, low aesthetic, undifferentiated\n2. Aesthetic-led — fewer features, premium price, design-driven moat\n3. Bundled — combines 2-4 adjacent formats, premium price ($49-149)\n\n**Open positioning**: ${idea.composite_score >= 75 ? "There's a clear wedge between (1) and (2). Bundled aesthetic execution is uncrowded." : "Saturated. Need a sharp niche cut to win."}`,
      regulatory_tos: idea.compliance_flag === "green"
        ? `## Compliance & ToS\n\nGreen-lit. Standard digital product disclaimers apply. Confirm before launch:\n- Marketplace ToS for "${idea.product_format}"\n- Refund policy required by Gumroad/Etsy/Whop\n- Tax handling (Lemon Squeezy / Paddle as MoR if international)`
        : `## Compliance & ToS — ⚠️ ${idea.compliance_flag.toUpperCase()}\n\n${idea.compliance_notes ?? "Review notes before proceeding."}\n\n**Required disclaimers**:\n- "Not professional advice" if applicable\n- License terms must be displayed prominently\n- Verify per-region restrictions (EU, US states)`,
      build_plan: `## Build Plan\n\n**Effort range**: ${idea.build_effort_hours_min}-${idea.build_effort_hours_max}h\n**Skills**: ${idea.skill_required.join(", ")}\n**Build path**: ${idea.build_path}\n\n### Phases\n1. Spec + outline (10% of time)\n2. Core build (60%)\n3. Polish + assets (15%)\n4. Listing + marketing setup (15%)\n\n### Recommended starting templates\n${idea.build_path === "arbitrage_flip" ? "- Source the licensed material first; verify license terms and rewrite percentage required\n- Redesign cover + first 30% of content\n- Stress-test on 2 fresh eyes before listing" : "- Wireframe the deliverable end-to-end before building any single component\n- Use Figma/Notion as the spec, not your IDE\n- Time-box each phase to prevent overbuilding"}`,
      monetization_plan: `## Monetization\n\n**Recommended tier**: $${Math.round(idea.median_price_usd * 1.2)} launch / $${Math.round(idea.median_price_usd * 1.6)} ongoing\n\n**Bundling**: ${idea.delivery_model === "monthly_recurring" ? "Recurring — anchor on the monthly tier, offer annual at 30% discount" : "One-time — bundle 3-5 deliverables to push perceived value above $30"}\n\n**Upsell ladder**:\n- Free lead magnet (1-pager / mini-template)\n- Core product\n- Premium tier with custom support / extras\n- (Optional) DFY service at $${Math.round(idea.price_ceiling_usd * 4)}+`,
      marketing_plan: `## Marketing\n\n**Distribution channels**:\n${idea.source_platforms.slice(0, 4).map(p => `- ${p}`).join("\n")}\n\n**Content engine**:\n- 3 hero pieces (long-form)\n- 12 short pieces (X/LinkedIn carousels, TikTok)\n- 3 collab cross-promotions (DM 30 creators)\n\n**Launch sequence**:\nWeek 1: Soft-launch to email list / Twitter\nWeek 2: Product Hunt + reddit posts\nWeek 3: Cross-platform paid post boost ($200 cap)\nOngoing: Daily SEO listing optimization`,
      risks: [
        `Competitive saturation if execution is slow — ${idea.competitor_count} active competitors`,
        `Trend reversal — current ${idea.trend_direction} (${idea.trend_velocity_pct >= 0 ? "+" : ""}${idea.trend_velocity_pct}% MoM)`,
        `Platform ToS shift on "${idea.product_format}"`,
        idea.build_path === "arbitrage_flip" ? "License compliance — must follow source terms exactly" : "Build effort overrun if scope creeps",
      ],
      opportunities: [
        `Underserved sub-niches: ${idea.sub_niche.slice(0, 2).join(", ")}`,
        `Cross-platform distribution lift via ${idea.source_platforms.slice(0, 2).join(" + ")}`,
        `Recurring upsell potential at $${idea.price_ceiling_usd}+`,
        `Bundle expansion into adjacent formats`,
      ],
      recommendation: idea.composite_score >= 75
        ? `**SHIP IT.** Composite ${idea.composite_score.toFixed(1)}, ${idea.trend_direction} trend, est $${idea.estimated_monthly_revenue_low_usd}-${idea.estimated_monthly_revenue_high_usd}/mo. Build in ${idea.build_effort_hours_min}-${idea.build_effort_hours_max}h. Don't overthink — your move is to ship a v1 in 2 weekends.`
        : idea.composite_score >= 60
        ? `**INVESTIGATE.** Composite ${idea.composite_score.toFixed(1)}. Worth a deeper market test before committing. Run a 1-week pre-launch interest check (LinkedIn poll, waitlist) before building.`
        : `**HOLD.** Composite ${idea.composite_score.toFixed(1)} doesn't clear your threshold. Either find a sharper niche cut or wait for stronger demand signals.`,
      confidence: idea.confidence_score,
      cost_usd: 0.042,
    },
  });
}

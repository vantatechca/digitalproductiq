export async function POST(req: Request) {
  const body = await req.json() as { competitor_ids?: string[]; focus_area?: string; marketplace?: string };
  return Response.json({
    data: {
      competitor_ids: body.competitor_ids ?? [],
      gaps: [
        { type: "product_format", title: "No 'AI x Notion' bundle from any top seller", description: "All current top Notion templates are static; none integrate Claude/GPT API. Bundle with prompt pack = 3-5x perceived value.", opportunity_score: 84, suggested_action: "Build a 'Notion + Claude Project' bundle priced at $79-99." },
        { type: "price", title: "Gap between $29-79 in your category", description: "Median competitor sits at $39, but no premium tier above $79 with extras (community, support, 1:1 onboarding).", opportunity_score: 76, suggested_action: "Launch premium tier at $99 with 30 min onboarding call." },
        { type: "audience", title: "Solo founders ignored — everyone targets 'creators'", description: "Top sellers focus on creators (artists, course-creators). Solo SaaS founders get scraps despite higher willingness-to-pay.", opportunity_score: 80, suggested_action: "Pivot positioning explicitly to 'solo founders running SaaS/services'." },
        { type: "feature", title: "No 'compliance / disclaimer' built-in for finance/wellness templates", description: "Buyers want done-for-you legal/disclaimer language in templates touching finance, wellness, health. None ship with this.", opportunity_score: 68, suggested_action: "Add a 'Legal Pack' add-on at $19 to any wellness/finance template." },
        { type: "product_format", title: "Mobile-first delivery is missing", description: "Every competitor delivers desktop-only. Mobile-friendly Notion or app-wrapped version would dominate younger demographic.", opportunity_score: 72, suggested_action: "Test 'mobile companion' version — same content, mobile UI." },
        { type: "audience", title: "Non-English-speaking creators are underserved", description: "Spanish, Portuguese, German creator markets have <5% template density vs English. Translation + light localization = blue ocean.", opportunity_score: 60, suggested_action: "Translate top 3 sellers into Spanish; price in BRL/MXN/EUR with regional adjustments." },
      ],
      generated_at: new Date().toISOString(),
    },
  });
}

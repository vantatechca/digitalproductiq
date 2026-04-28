export async function GET() {
  return Response.json({
    data: {
      user: {
        name: "Owner",
        email: "owner@digitalproductiq.local",
        skills: ["copywriting","notion","figma","javascript"],
        hours_per_week: 15,
        target_revenue_usd: 5000,
        niches_of_interest: ["productivity_systems","ai_prompts_gpts","business_templates"],
        ethical_lines: ["no_mlm","no_get_rich_quick","no_unlicensed_resell"],
      },
      notifications: {
        breakout_alerts: true,
        new_approved: true,
        scraper_errors: true,
        digest_frequency: "daily",
        digest_time_local: "09:00",
      },
      ai_models: {
        tier1_model: "deepseek-v3",
        tier2_model: "claude-haiku-4.5",
        tier3_model: "claude-sonnet-4.6",
        daily_budget_usd: 5.00,
      },
      score_weights: { trend: 0.20, demand: 0.25, competition: 0.20, feasibility: 0.15, revenue: 0.20 },
    },
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  return Response.json({ data: { ...body, updated_at: new Date().toISOString() } });
}

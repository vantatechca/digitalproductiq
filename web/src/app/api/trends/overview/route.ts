import { TREND_KEYWORDS, PLATFORM_PULSE } from "@/lib/mock-data";

export async function GET() {
  const keywords = TREND_KEYWORDS.map(k => ({
    keyword: k.keyword,
    direction: k.direction,
    velocity_pct: k.velocity_pct,
    sparkline: k.data.map(d => d.value),
  }));

  const reddit_pulse = PLATFORM_PULSE.find(p => p.platform === "reddit")?.items.map(i => ({
    subreddit: i.title.split(":")[0]?.replace("r/", "") ?? "",
    top_post: i.title,
    engagement: parseInt(i.metric.replace(/[^0-9]/g, ""), 10) || 0,
  })) ?? [];

  const youtube_pulse = PLATFORM_PULSE.find(p => p.platform === "youtube")?.items.map(i => ({
    channel: "@various",
    topic: i.title,
    views: parseInt(i.metric.replace(/[^0-9]/g, ""), 10) * 1000 || 0,
  })) ?? [];

  const etsy_pulse = PLATFORM_PULSE.find(p => p.platform === "etsy")?.items.map(i => ({
    search: i.title,
    results_count: 0,
    trend: i.trend,
  })) ?? [];

  return Response.json({
    data: {
      keywords,
      reddit_pulse,
      youtube_pulse,
      etsy_pulse,
      summary: "Multi-niche heat with 4 active breakouts. AI categories show strongest velocity. Printables show one breakout (no-spend year).",
    },
  });
}

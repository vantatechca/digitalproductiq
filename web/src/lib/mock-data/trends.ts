// 30 keywords × 12 weeks of trend snapshots (~360 points)
import type { Category, TrendDirection } from "@/lib/utils/constants";

export interface TrendKeyword {
  keyword: string;
  category: Category;
  direction: TrendDirection;
  velocity_pct: number;
  current_volume: number;
  data: { week: string; value: number }[];
  evidence: string[];
}

const weeks = (n: number): string[] => {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 7 * 86400_000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

const W = weeks(12);

function makeSeries(start: number, mode: "rising"|"breakout"|"stable"|"declining"|"flat"): { week: string; value: number }[] {
  const out: { week: string; value: number }[] = [];
  let cur = start;
  for (let i = 0; i < W.length; i++) {
    let next = cur;
    if (mode === "rising") next = cur * (1 + 0.03 + Math.random() * 0.04);
    else if (mode === "breakout") next = i < 8 ? cur * (1 + 0.02 + Math.random() * 0.03) : cur * (1 + 0.18 + Math.random() * 0.10);
    else if (mode === "stable") next = cur * (1 + (Math.random() - 0.5) * 0.04);
    else if (mode === "declining") next = cur * (1 - 0.04 - Math.random() * 0.03);
    else next = cur * (1 + (Math.random() - 0.5) * 0.02);
    out.push({ week: W[i], value: Math.round(next) });
    cur = next;
  }
  return out;
}

export const TREND_KEYWORDS: TrendKeyword[] = [
  // Breakout (4)
  { keyword: "no spend year tracker", category: "printables", direction: "breakout", velocity_pct: 220,
    current_volume: 56000, data: makeSeries(18000, "breakout"),
    evidence: ["TikTok #NoSpendYear at 480M views", "Etsy search +180% YoY", "Pinterest +340% YoY"] },
  { keyword: "claude project for pms", category: "ai_prompts_gpts", direction: "breakout", velocity_pct: 240,
    current_volume: 6800, data: makeSeries(2200, "breakout"),
    evidence: ["Twitter thread 4.4K bookmarks", "Whop launches 4 in 30 days", "Claude Projects gallery surfacing PM templates"] },
  { keyword: "n8n ai workflow", category: "ai_prompts_gpts", direction: "breakout", velocity_pct: 180,
    current_volume: 28000, data: makeSeries(10000, "breakout"),
    evidence: ["n8n cloud Product Hunt #1", "Twitter thread 8K bookmarks", "Google Trends +180% MoM"] },
  { keyword: "ai resume layoff", category: "ai_prompts_gpts", direction: "breakout", velocity_pct: 210,
    current_volume: 142000, data: makeSeries(46000, "breakout"),
    evidence: ["Reddit r/cscareerquestions trending", "LinkedIn viral post 1.8K reactions", "YouTube tutorial 84K views in 7d"] },

  // Rising (8)
  { keyword: "lo-fi botanical procreate", category: "design_assets", direction: "rising", velocity_pct: 28,
    current_volume: 18000, data: makeSeries(14200, "rising"),
    evidence: ["Pinterest +340% YoY", "Top brush pack 1840 sales", "TikTok #procreatehaul 280K views"] },
  { keyword: "ai app figma kit", category: "design_assets", direction: "rising", velocity_pct: 31,
    current_volume: 12000, data: makeSeries(9000, "rising"),
    evidence: ["Free Figma kit hit 18K downloads in 2 weeks", "12 viral designer tweets", "No quality top result on Creative Market"] },
  { keyword: "stoicism printable", category: "ebooks_guides", direction: "rising", velocity_pct: 22,
    current_volume: 41000, data: makeSeries(33000, "rising"),
    evidence: ["#Stoicism 8.4B TikTok views", "Etsy 18K searches/mo", "Top wall-art listing 3.4K sales"] },
  { keyword: "tech to climate pivot", category: "careers_resumes", direction: "rising", velocity_pct: 36,
    current_volume: 6200, data: makeSeries(4500, "rising"),
    evidence: ["LinkedIn workforce report +36%", "r/climateactionplan hiring posts"] },
  { keyword: "tailwind ai pricing", category: "web_themes_uikits", direction: "rising", velocity_pct: 26,
    current_volume: 9000, data: makeSeries(7000, "rising"),
    evidence: ["Tailwind v4 launch 1.2K upvotes", "Top kit 184 sales at $79"] },
  { keyword: "k-2 singapore math", category: "children_education", direction: "rising", velocity_pct: 12,
    current_volume: 14000, data: makeSeries(12400, "rising"),
    evidence: ["Homeschool FB groups +32% members", "Amazon KDP K-2 +24% Q1"] },
  { keyword: "ai second brain notion", category: "productivity_systems", direction: "rising", velocity_pct: 14,
    current_volume: 88000, data: makeSeries(76000, "rising"),
    evidence: ["Easlo Founder OS at $11K/mo", "Reddit r/Notion trending", "Thomas Frank Ultimate Brain $18K/mo"] },
  { keyword: "open source ai newsletter", category: "newsletters_paid", direction: "rising", velocity_pct: 32,
    current_volume: 11000, data: makeSeries(8200, "rising"),
    evidence: ["TLDR AI 80K free subs", "GitHub awesome lists 4 over 10K stars", "Substack opens up paid"] },

  // Stable (12)
  { keyword: "wedding welcome bag printable", category: "wedding_event_planning", direction: "stable", velocity_pct: 8,
    current_volume: 32000, data: makeSeries(30000, "stable"),
    evidence: ["Top bundle $14, 880 sales/mo", "Pinterest +84% YoY for maximalist"] },
  { keyword: "etsy seller community paid", category: "membership_communities", direction: "stable", velocity_pct: 6,
    current_volume: 31000, data: makeSeries(29400, "stable"),
    evidence: ["Etsy Growth Lab 184 paid members", "Reddit r/EtsySellers active"] },
  { keyword: "anxiety workbook pdf", category: "fitness_wellness_digital", direction: "stable", velocity_pct: 4,
    current_volume: 36000, data: makeSeries(34800, "stable"),
    evidence: ["IDPLR PLR available", "Top Gumroad 920 sales at $19"] },
  { keyword: "saas runway calculator", category: "business_templates", direction: "stable", velocity_pct: 6,
    current_volume: 12000, data: makeSeries(11400, "stable"),
    evidence: ["IH milestone $12K/2yr", "11 active competitors"] },
  { keyword: "linkedin carousel template", category: "social_media_creator", direction: "stable", velocity_pct: 6,
    current_volume: 24000, data: makeSeries(22600, "stable"),
    evidence: ["Founder carousel impressions +84%", "Top template $24, 1240 sales"] },
  { keyword: "real estate landlord docs", category: "real_estate_landlord", direction: "stable", velocity_pct: 6,
    current_volume: 18000, data: makeSeries(17000, "stable"),
    evidence: ["BiggerPockets 240 active threads", "Reddit r/realestate ongoing"] },
  { keyword: "discord pod template", category: "membership_communities", direction: "stable", velocity_pct: 4,
    current_volume: 4400, data: makeSeries(4200, "stable"),
    evidence: ["480 active indie pods on Discord"] },
  { keyword: "real estate cash on cash", category: "finance_money", direction: "stable", velocity_pct: 6,
    current_volume: 22000, data: makeSeries(20800, "stable"),
    evidence: ["BiggerPockets calculator threads 320/yr"] },
  { keyword: "burnout meditation knowledge worker", category: "fitness_wellness_digital", direction: "stable", velocity_pct: 4,
    current_volume: 8000, data: makeSeries(7700, "stable"),
    evidence: ["Insight Timer +42% YoY for 'burnout'"] },
  { keyword: "bedtime audio public domain", category: "audio_assets", direction: "stable", velocity_pct: 4,
    current_volume: 22000, data: makeSeries(21200, "stable"),
    evidence: ["LibriVox 120+ available stories", "$19 Gumroad pack 184 sales"] },
  { keyword: "dark academia stock photos", category: "photography_stock", direction: "stable", velocity_pct: 4,
    current_volume: 14000, data: makeSeries(13400, "stable"),
    evidence: ["Pinterest +80% YoY", "$39 pack 184 sales"] },
  { keyword: "weekly etsy trend newsletter", category: "newsletters_paid", direction: "rising", velocity_pct: 14,
    current_volume: 18000, data: makeSeries(15800, "rising"),
    evidence: ["Beehiiv 4 active newsletters 600-2000 subs", "r/EtsySellers 144 comments"] },

  // Declining (4)
  { keyword: "habit tracker notion", category: "productivity_systems", direction: "declining", velocity_pct: -8,
    current_volume: 28000, data: makeSeries(38000, "declining"),
    evidence: ["1840+ saturated competitors", "Median price $4"] },
  { keyword: "side hustle ideas pdf", category: "ebooks_guides", direction: "declining", velocity_pct: -14,
    current_volume: 12000, data: makeSeries(18000, "declining"),
    evidence: ["2400+ competitors", "Median $3, low engagement"] },
  { keyword: "nft generator software", category: "software_tools", direction: "declining", velocity_pct: -22,
    current_volume: 8000, data: makeSeries(15000, "declining"),
    evidence: ["NFT interest down 60% YoY", "Few new launches"] },
  { keyword: "metaverse template", category: "gaming_assets", direction: "declining", velocity_pct: -34,
    current_volume: 4000, data: makeSeries(11000, "declining"),
    evidence: ["Meta de-emphasized push", "Search volume crater"] },

  // Flat (2)
  { keyword: "wordpress theme multipurpose", category: "web_themes_uikits", direction: "flat", velocity_pct: 1,
    current_volume: 84000, data: makeSeries(83400, "flat"),
    evidence: ["ThemeForest mature category", "Salient steady at 480 sales/mo"] },
  { keyword: "general crochet pattern", category: "crafts_patterns", direction: "flat", velocity_pct: 2,
    current_volume: 38000, data: makeSeries(37800, "flat"),
    evidence: ["410 competitors, mature category"] },
];

export interface PlatformPulse {
  platform: string;
  items: { title: string; metric: string; trend: string }[];
}

export const PLATFORM_PULSE: PlatformPulse[] = [
  { platform: "reddit", items: [
    { title: "r/sidehustle: 'AI side hustles 2026'", metric: "+180% comments WoW", trend: "rising" },
    { title: "r/Notion: 'best 2nd brain template?'", metric: "92 active replies", trend: "stable" },
    { title: "r/EtsySellers: 'paid trend tools'", metric: "144 comments", trend: "rising" },
    { title: "r/cscareerquestions: 'layoff GPTs'", metric: "482 upvotes/24h", trend: "breakout" },
  ]},
  { platform: "etsy", items: [
    { title: "'no spend year tracker'", metric: "+180% YoY searches", trend: "breakout" },
    { title: "'wedding welcome bag'", metric: "+24% YoY", trend: "rising" },
    { title: "'stoicism printable'", metric: "+22% MoM", trend: "rising" },
    { title: "'habit tracker'", metric: "-12% MoM", trend: "declining" },
  ]},
  { platform: "gumroad", items: [
    { title: "Easlo Founder OS", metric: "$11.7K/mo", trend: "rising" },
    { title: "AI Sales GPT Pack", metric: "$5.4K/mo", trend: "stable" },
    { title: "Senior PM Claude Project", metric: "120 sales in 14d", trend: "breakout" },
  ]},
  { platform: "tiktok", items: [
    { title: "#NoSpendYear", metric: "480M views, +220%", trend: "breakout" },
    { title: "#crochettiktok", metric: "12B views, +28%", trend: "rising" },
    { title: "#robloxy2k", metric: "480M views", trend: "rising" },
    { title: "#stoicism", metric: "8.4B views", trend: "stable" },
  ]},
  { platform: "youtube", items: [
    { title: "Tutorial: 'Sell Notion templates'", metric: "1.4M views", trend: "rising" },
    { title: "Tutorial: 'AI for layoffs'", metric: "84K views/7d", trend: "breakout" },
    { title: "Tutorial: 'Etsy digital downloads 2026'", metric: "640K views", trend: "stable" },
  ]},
];

export interface BreakoutEvent {
  keyword: string;
  category: Category;
  velocity_pct: number;
  detected_at: string;
  evidence: string[];
}

export const BREAKOUTS: BreakoutEvent[] = [
  { keyword: "no spend year tracker", category: "printables", velocity_pct: 220, detected_at: new Date(Date.now() - 6 * 3600_000).toISOString(), evidence: ["TikTok 480M views","Etsy +180% YoY","Pinterest +340% YoY"] },
  { keyword: "claude project for pms", category: "ai_prompts_gpts", velocity_pct: 240, detected_at: new Date(Date.now() - 12 * 3600_000).toISOString(), evidence: ["4 viral threads","Whop new launches","240% MoM"] },
  { keyword: "n8n ai workflow", category: "ai_prompts_gpts", velocity_pct: 180, detected_at: new Date(Date.now() - 24 * 3600_000).toISOString(), evidence: ["PH #1","Google Trends +180%"] },
  { keyword: "ai resume layoff", category: "ai_prompts_gpts", velocity_pct: 210, detected_at: new Date(Date.now() - 36 * 3600_000).toISOString(), evidence: ["Reddit viral","LinkedIn 1.8K","YT 84K/7d"] },
];

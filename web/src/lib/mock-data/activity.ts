import type { ActivityLog } from "@/types/database";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();
const USER_ID = "00000000-0000-0000-0000-000000000001";

export const ACTIVITY_LOG: ActivityLog[] = [
  { id: "aaaaaaaa-0000-0000-0000-000000000001", user_id: USER_ID, action: "idea.created", entity_type: "idea", entity_id: "22222222-0000-0000-0000-000000000018", meta: { title: "LinkedIn Carousel Template Pack", source: "linkedin" }, created_at: hoursAgo(1) },
  { id: "aaaaaaaa-0000-0000-0000-000000000002", user_id: USER_ID, action: "scraper.success", entity_type: "scraper", entity_id: null, meta: { name: "etsy_top_sellers", items: 84, signals: 22, ideas_created: 2 }, created_at: hoursAgo(2) },
  { id: "aaaaaaaa-0000-0000-0000-000000000003", user_id: USER_ID, action: "idea.scored", entity_type: "idea", entity_id: "22222222-0000-0000-0000-000000000001", meta: { composite: 84.2, delta: "+1.8" }, created_at: hoursAgo(3) },
  { id: "aaaaaaaa-0000-0000-0000-000000000004", user_id: USER_ID, action: "brain.learned", entity_type: "pattern", entity_id: "77777777-0000-0000-0000-000000000001", meta: { pattern: "User declines 'general_consumer' audience" }, created_at: hoursAgo(4) },
  { id: "aaaaaaaa-0000-0000-0000-000000000005", user_id: USER_ID, action: "trend.breakout", entity_type: "trend", entity_id: null, meta: { keyword: "no spend year tracker", velocity_pct: 220 }, created_at: hoursAgo(6) },
  { id: "aaaaaaaa-0000-0000-0000-000000000006", user_id: USER_ID, action: "idea.approved", entity_type: "idea", entity_id: "22222222-0000-0000-0000-000000000013", meta: { title: "n8n Workflow Pack" }, created_at: hoursAgo(8) },
  { id: "aaaaaaaa-0000-0000-0000-000000000007", user_id: USER_ID, action: "scraper.success", entity_type: "scraper", entity_id: null, meta: { name: "reddit_pulse", items: 144, signals: 36 }, created_at: hoursAgo(9) },
  { id: "aaaaaaaa-0000-0000-0000-000000000008", user_id: USER_ID, action: "rule.suggested", entity_type: "rule", entity_id: "66666666-0000-0000-0000-000000000021", meta: { rule_text: "Prefer arbitrage_flip..." }, created_at: hoursAgo(10) },
  { id: "aaaaaaaa-0000-0000-0000-000000000009", user_id: USER_ID, action: "idea.starred", entity_type: "idea", entity_id: "22222222-0000-0000-0000-000000000003", meta: { title: "No-Spend Year Tracker" }, created_at: hoursAgo(13) },
  { id: "aaaaaaaa-0000-0000-0000-000000000010", user_id: USER_ID, action: "scraper.error", entity_type: "scraper", entity_id: null, meta: { name: "tiktok_hashtags", error: "Rate limited (HTTP 429)" }, created_at: hoursAgo(14) },
  { id: "aaaaaaaa-0000-0000-0000-000000000011", user_id: USER_ID, action: "idea.deep_dive", entity_type: "idea", entity_id: "22222222-0000-0000-0000-000000000001", meta: { tier: "tier3", cost_usd: 0.042 }, created_at: hoursAgo(16) },
  { id: "aaaaaaaa-0000-0000-0000-000000000012", user_id: USER_ID, action: "arbitrage.matched", entity_type: "arbitrage", entity_id: null, meta: { count: 3, idea: "AI Career Coach" }, created_at: hoursAgo(18) },
  { id: "aaaaaaaa-0000-0000-0000-000000000013", user_id: USER_ID, action: "scraper.success", entity_type: "scraper", entity_id: null, meta: { name: "gumroad_top", items: 60, signals: 14 }, created_at: hoursAgo(20) },
  { id: "aaaaaaaa-0000-0000-0000-000000000014", user_id: USER_ID, action: "idea.declined", entity_type: "idea", entity_id: "22222222-0000-0000-0000-000000000022", meta: { reason: "Violates 'no get-rich-quick' rule" }, created_at: hoursAgo(22) },
  { id: "aaaaaaaa-0000-0000-0000-000000000015", user_id: USER_ID, action: "digest.generated", entity_type: "digest", entity_id: null, meta: { type: "daily", new_ideas: 4, breakouts: 2 }, created_at: daysAgo(1) },
  { id: "aaaaaaaa-0000-0000-0000-000000000016", user_id: USER_ID, action: "idea.moved_to_in_build", entity_type: "idea", entity_id: "22222222-0000-0000-0000-000000000020", meta: { title: "SaaS Runway Calc" }, created_at: daysAgo(1) },
  { id: "aaaaaaaa-0000-0000-0000-000000000017", user_id: USER_ID, action: "competitor.added", entity_type: "competitor", entity_id: "44444444-0000-0000-0000-000000000010", meta: { name: "FounderBriefco" }, created_at: daysAgo(1) },
  { id: "aaaaaaaa-0000-0000-0000-000000000018", user_id: USER_ID, action: "rule.activated", entity_type: "rule", entity_id: "66666666-0000-0000-0000-000000000021", meta: { rule_text: "Prefer arbitrage_flip..." }, created_at: daysAgo(2) },
  { id: "aaaaaaaa-0000-0000-0000-000000000019", user_id: USER_ID, action: "scraper.success", entity_type: "scraper", entity_id: null, meta: { name: "product_hunt_daily", items: 24, signals: 8 }, created_at: daysAgo(2) },
  { id: "aaaaaaaa-0000-0000-0000-000000000020", user_id: USER_ID, action: "trend.breakout", entity_type: "trend", entity_id: null, meta: { keyword: "claude project for pms", velocity_pct: 240 }, created_at: daysAgo(2) },
  { id: "aaaaaaaa-0000-0000-0000-000000000021", user_id: USER_ID, action: "brain.learned", entity_type: "pattern", entity_id: "77777777-0000-0000-0000-000000000003", meta: { pattern: "Stars cluster $14-29 + breakout" }, created_at: daysAgo(3) },
  { id: "aaaaaaaa-0000-0000-0000-000000000022", user_id: USER_ID, action: "idea.archived", entity_type: "idea", entity_id: "22222222-0000-0000-0000-000000000009", meta: { title: "Generic Habit Tracker" }, created_at: daysAgo(3) },
  { id: "aaaaaaaa-0000-0000-0000-000000000023", user_id: USER_ID, action: "scraper.success", entity_type: "scraper", entity_id: null, meta: { name: "google_trends", items: 30, signals: 4 }, created_at: daysAgo(3) },
  { id: "aaaaaaaa-0000-0000-0000-000000000024", user_id: USER_ID, action: "idea.spec_generated", entity_type: "idea", entity_id: "22222222-0000-0000-0000-000000000003", meta: { tier: "tier3", cost_usd: 0.024 }, created_at: daysAgo(4) },
  { id: "aaaaaaaa-0000-0000-0000-000000000025", user_id: USER_ID, action: "scraper.success", entity_type: "scraper", entity_id: null, meta: { name: "youtube_data_api", items: 18, signals: 6 }, created_at: daysAgo(4) },
];

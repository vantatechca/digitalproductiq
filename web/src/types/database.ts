// Database row types — mirrors supabase/migrations/

import type {
  Status, Category, ProductFormat, BuildPath, TrendDirection,
  ComplianceFlag, RuleType, RuleDirection, ArbitrageSourceType,
} from "@/lib/utils/constants";

export type UUID = string;
export type Timestamp = string;

export interface User {
  id: UUID;
  email: string;
  name: string | null;
  role: "owner" | "collaborator" | "viewer";
  preferences: Record<string, unknown>;
  score_weights: {
    trend: number; demand: number; competition: number;
    feasibility: number; revenue: number;
  };
  daily_budget_usd: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Idea {
  id: UUID;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  hypothesis: string | null;

  category: Category;
  sub_niche: string[];
  product_format: ProductFormat;
  delivery_model: string;
  target_audience: string[];
  skill_required: string[];
  build_effort_hours_min: number;
  build_effort_hours_max: number;

  build_path: BuildPath;
  arbitrage_source_url: string | null;
  arbitrage_cost_usd: number | null;
  arbitrage_potential_revenue_usd: number | null;

  composite_score: number;
  trend_score: number;
  demand_score: number;
  competition_score: number;
  feasibility_score: number;
  revenue_potential_score: number;
  confidence_score: number;

  search_volume_monthly: number;
  trend_direction: TrendDirection;
  trend_velocity_pct: number;
  market_size_estimate_usd: number;
  competitor_count: number;
  median_price_usd: number;
  price_floor_usd: number;
  price_ceiling_usd: number;
  estimated_monthly_revenue_low_usd: number;
  estimated_monthly_revenue_high_usd: number;

  status: Status;
  compliance_flag: ComplianceFlag;
  compliance_notes: string | null;
  decline_reason: string | null;

  source_platforms: string[];
  signals_count: number;

  discovered_at: Timestamp;
  last_scored_at: Timestamp | null;
  last_signal_at: Timestamp | null;
  approved_at: Timestamp | null;
  launched_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface IdeaSignal {
  id: UUID;
  idea_id: UUID;
  platform: string;
  signal_type: string;
  external_url: string | null;
  external_id: string | null;
  title: string | null;
  content: string | null;
  author: string | null;
  engagement_score: number | null;
  sentiment: number | null;
  relevance_score: number | null;
  raw_payload: Record<string, unknown> | null;
  collected_at: Timestamp;
}

export interface IdeaTrend {
  id: UUID;
  idea_id: UUID;
  date: string;
  search_volume: number | null;
  mention_count: number | null;
  competitor_count: number | null;
  median_price_usd: number | null;
  composite_score: number | null;
}

export interface IdeaFeedback {
  id: UUID;
  idea_id: UUID;
  user_id: UUID;
  action: string;
  reason: string | null;
  note: string | null;
  created_at: Timestamp;
}

export interface GoldenRule {
  id: UUID;
  user_id: UUID;
  rule_type: RuleType;
  direction: RuleDirection;
  rule_text: string;
  conditions: Record<string, unknown>;
  weight: number;
  source: "manual" | "ai_suggested" | "learned";
  active: boolean;
  applied_count: number;
  approved_at: Timestamp | null;
  created_at: Timestamp;
  ai_confidence?: number;
  ai_reasoning?: string;
}

export interface FeedbackPattern {
  id: UUID;
  pattern_text: string;
  evidence: Record<string, unknown> | null;
  ideas_affected: number | null;
  acknowledged: boolean;
  promoted_to_rule_id: UUID | null;
  detected_at: Timestamp;
}

export interface BrainMemory {
  id: UUID;
  memory_type: string;
  content: string;
  importance: number;
  last_referenced_at: Timestamp | null;
  created_at: Timestamp;
}

export interface ChatThread {
  id: UUID;
  user_id: UUID;
  title: string;
  thread_type: "general" | "idea_dive" | "trend_review" | "strategy" | "rule_tuning";
  context_idea_id: UUID | null;
  pinned: boolean;
  created_at: Timestamp;
  last_message_at: Timestamp;
}

export interface ChatMessage {
  id: UUID;
  thread_id: UUID;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  meta: Record<string, unknown> | null;
  created_at: Timestamp;
}

export interface Marketplace {
  id: UUID;
  slug: string;
  name: string;
  url: string;
  primary_categories: string[];
  takes_pct: number | null;
  is_active: boolean;
  scrape_frequency_minutes: number | null;
  notes: string | null;
}

export interface Competitor {
  id: UUID;
  marketplace_id: UUID;
  name: string;
  shop_url: string | null;
  external_id: string | null;
  primary_category: Category;
  niches: string[];
  total_products: number;
  estimated_monthly_revenue_usd: number;
  estimated_total_sales: number;
  avg_product_price: number;
  avg_rating: number;
  follower_count: number;
  founded_at: string | null;
  is_top_seller: boolean;
  notes: string | null;
  last_scraped_at: Timestamp | null;
  created_at: Timestamp;
}

export interface CompetitorProduct {
  id: UUID;
  competitor_id: UUID;
  marketplace_id: UUID;
  title: string;
  description: string | null;
  price_usd: number;
  format: ProductFormat;
  external_url: string | null;
  external_id: string | null;
  thumbnail_url: string | null;
  rating: number | null;
  review_count: number | null;
  estimated_monthly_sales: number | null;
  estimated_monthly_revenue_usd: number | null;
  tags: string[];
  collected_at: Timestamp;
}

export interface ArbitrageSource {
  id: UUID;
  source_type: ArbitrageSourceType;
  source_platform: string;
  product_title: string;
  product_url: string | null;
  download_url: string | null;
  format: string | null;
  cost_usd: number;
  license_type: string;
  license_terms_url: string | null;
  license_summary: string | null;
  matched_idea_id: UUID | null;
  est_demand_score: number | null;
  est_competition_score: number | null;
  est_arbitrage_potential: number | null;
  notes: string | null;
  collected_at: Timestamp;
}

export interface Source {
  id: UUID;
  name: string;
  source_type: string;
  config: Record<string, unknown>;
  schedule_cron: string;
  is_active: boolean;
  last_run_at: Timestamp | null;
  next_run_at: Timestamp | null;
  consecutive_errors: number;
}

export interface ScraperRun {
  id: UUID;
  source_id: UUID;
  started_at: Timestamp;
  finished_at: Timestamp | null;
  status: "running" | "success" | "partial" | "error" | "blocked";
  items_scraped: number;
  signals_created: number;
  ideas_created: number;
  ideas_updated: number;
  duration_seconds: number | null;
  error_message: string | null;
}

export interface Digest {
  id: UUID;
  user_id: UUID;
  digest_type: string;
  payload: Record<string, unknown>;
  sent_at: Timestamp | null;
  read_at: Timestamp | null;
  created_at: Timestamp;
}

export interface ActivityLog {
  id: UUID;
  user_id: UUID;
  action: string;
  entity_type: string | null;
  entity_id: UUID | null;
  meta: Record<string, unknown> | null;
  created_at: Timestamp;
}

export interface Tag {
  id: UUID;
  user_id: UUID;
  name: string;
  color: string;
}

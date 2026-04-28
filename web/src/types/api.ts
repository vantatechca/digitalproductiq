// API request/response shapes
import type {
  Idea, IdeaSignal, IdeaTrend, GoldenRule, FeedbackPattern,
  ChatMessage, ChatThread, Marketplace, Competitor, CompetitorProduct,
  ArbitrageSource, Source, ScraperRun, ActivityLog,
} from "./database";
import type { Status, Category, BuildPath, ProductFormat } from "@/lib/utils/constants";

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  error?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Ideas
export interface IdeasQuery {
  status?: Status | "all";
  category?: Category | "all";
  product_format?: ProductFormat | "all";
  build_path?: BuildPath | "all";
  sort?: "score" | "newest" | "oldest" | "signals" | "revenue_potential";
  search?: string;
  page?: number;
  limit?: number;
  min_price?: number;
  max_price?: number;
  max_effort?: number;
}

export interface IdeaStats {
  total_ideas: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  by_build_path: Record<string, number>;
  avg_score: number;
  ideas_this_week: number;
  ideas_this_month: number;
  top_categories: { category: string; count: number; avg_score: number }[];
  score_distribution: { bucket: string; count: number }[];
  top_sources: { platform: string; count: number }[];
  hot_category: { category: string; avg_score: number };
  pending_count: number;
  approved_count: number;
  starred_count: number;
}

export interface DeepDivePayload {
  idea_id: string;
  generated_at: string;
  market_analysis: string;
  competitive_deep_dive: string;
  regulatory_tos: string;
  build_plan: string;
  monetization_plan: string;
  marketing_plan: string;
  risks: string[];
  opportunities: string[];
  recommendation: string;
  confidence: number;
  cost_usd: number;
}

export interface ProductSpec {
  idea_id: string;
  generated_at: string;
  spec_markdown: string;
  cost_usd: number;
}

// Brain / Chat
export interface BrainChatRequest {
  message: string;
  thread_id?: string;
  context_idea_id?: string;
}

export interface SSEEventMeta {
  type: "meta";
  id: string;
  thread_id: string;
  sources?: string[];
  confidence?: number;
}

export interface SSEEventToken {
  type: "token";
  text: string;
}

export interface SSEEventDone {
  type: "done";
  message_id: string;
  cost_usd: number;
}

export type SSEEvent = SSEEventMeta | SSEEventToken | SSEEventDone;

// Trends
export interface TrendOverview {
  keywords: { keyword: string; direction: string; velocity_pct: number; sparkline: number[] }[];
  reddit_pulse: { subreddit: string; top_post: string; engagement: number }[];
  youtube_pulse: { channel: string; topic: string; views: number }[];
  etsy_pulse: { search: string; results_count: number; trend: string }[];
  summary: string;
}

export interface BreakoutAlert {
  keyword: string;
  category: Category;
  velocity_pct: number;
  detected_at: string;
  evidence: string[];
}

// Marketplaces
export interface MarketplaceDetail extends Marketplace {
  total_products_tracked: number;
  total_revenue_tracked_usd: number;
  top_sellers: Competitor[];
  trending_products: CompetitorProduct[];
  last_scraped_at: string | null;
}

// Competitors
export interface CompetitorDetail extends Competitor {
  products: CompetitorProduct[];
  pricing_analysis: {
    median: number;
    p25: number;
    p75: number;
    distribution: { bucket: string; count: number }[];
  };
  social_presence: { platform: string; handle: string; followers: number }[];
  recent_activity: { date: string; event: string }[];
}

export interface GapAnalysis {
  competitor_ids: string[];
  gaps: {
    type: "product_format" | "price" | "audience" | "feature";
    title: string;
    description: string;
    opportunity_score: number;
    suggested_action: string;
  }[];
  generated_at: string;
}

// Arbitrage
export interface RepackageSuggestion {
  source_id: string;
  target_marketplace: string;
  new_title: string;
  new_audience: string;
  new_price_usd: number;
  new_format: string;
  marketing_angle: string;
  compliance_check: { ok: boolean; notes: string };
  estimated_monthly_revenue_usd: number;
  generated_at: string;
}

// Rules
export interface RulesResponse {
  data: GoldenRule[];
  meta: {
    total: number;
    by_type: Record<string, number>;
    active_count: number;
  };
}

export interface RuleSuggestion {
  data: { suggestions: GoldenRule[] };
}

// Settings
export interface SettingsPayload {
  user: {
    name: string;
    email: string;
    skills: string[];
    hours_per_week: number;
    target_revenue_usd: number;
    niches_of_interest: string[];
    ethical_lines: string[];
  };
  notifications: {
    breakout_alerts: boolean;
    new_approved: boolean;
    scraper_errors: boolean;
    digest_frequency: "none" | "daily" | "weekly";
    digest_time_local: string;
  };
  ai_models: {
    tier1_model: string;
    tier2_model: string;
    tier3_model: string;
    daily_budget_usd: number;
  };
  score_weights: { trend: number; demand: number; competition: number; feasibility: number; revenue: number };
}

// Re-exports
export type {
  Idea, IdeaSignal, IdeaTrend, GoldenRule, FeedbackPattern,
  ChatMessage, ChatThread, Marketplace, Competitor, CompetitorProduct,
  ArbitrageSource, Source, ScraperRun, ActivityLog,
};

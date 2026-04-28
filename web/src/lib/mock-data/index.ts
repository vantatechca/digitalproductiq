// Single source of truth for all mock data + helper functions

import { IDEAS } from "./ideas";
import { SIGNALS } from "./signals";
import { COMPETITORS, COMPETITOR_PRODUCTS } from "./competitors";
import { MARKETPLACES } from "./marketplaces";
import { TREND_KEYWORDS, PLATFORM_PULSE, BREAKOUTS } from "./trends";
import { RULES, FEEDBACK_PATTERNS } from "./rules";
import { CHAT_THREADS, CHAT_MESSAGES } from "./chat";
import { ACTIVITY_LOG } from "./activity";
import { ARBITRAGE_SOURCES } from "./arbitrage";

import type {
  Idea, IdeaSignal, GoldenRule, FeedbackPattern,
  ChatThread, ChatMessage, Competitor, CompetitorProduct,
  Marketplace, ActivityLog, ArbitrageSource,
} from "@/types/database";
import type { IdeaStats } from "@/types/api";
import type { Status, Category, BuildPath } from "@/lib/utils/constants";

export {
  IDEAS, SIGNALS, COMPETITORS, COMPETITOR_PRODUCTS, MARKETPLACES,
  TREND_KEYWORDS, PLATFORM_PULSE, BREAKOUTS,
  RULES, FEEDBACK_PATTERNS,
  CHAT_THREADS, CHAT_MESSAGES,
  ACTIVITY_LOG,
  ARBITRAGE_SOURCES,
};

// ===== Ideas =====
export function getIdeaById(id: string): Idea | undefined {
  return IDEAS.find(i => i.id === id);
}

export function getIdeasByStatus(status: Status): Idea[] {
  return IDEAS.filter(i => i.status === status);
}

export function getIdeasByCategory(category: Category): Idea[] {
  return IDEAS.filter(i => i.category === category);
}

export function getIdeasByBuildPath(bp: BuildPath): Idea[] {
  return IDEAS.filter(i => i.build_path === bp);
}

export function getTopIdeas(limit = 10): Idea[] {
  return [...IDEAS].sort((a, b) => b.composite_score - a.composite_score).slice(0, limit);
}

// ===== Signals =====
export function getSignalsForIdea(idea_id: string): IdeaSignal[] {
  return SIGNALS.filter(s => s.idea_id === idea_id);
}

// ===== Competitors =====
export function getCompetitorById(id: string): Competitor | undefined {
  return COMPETITORS.find(c => c.id === id);
}

export function getProductsForCompetitor(competitor_id: string): CompetitorProduct[] {
  return COMPETITOR_PRODUCTS.filter(p => p.competitor_id === competitor_id);
}

export function getCompetitorsForMarketplace(marketplace_id: string): Competitor[] {
  return COMPETITORS.filter(c => c.marketplace_id === marketplace_id);
}

// ===== Marketplaces =====
export function getMarketplaceBySlug(slug: string): Marketplace | undefined {
  return MARKETPLACES.find(m => m.slug === slug);
}

export function getMarketplaceById(id: string): Marketplace | undefined {
  return MARKETPLACES.find(m => m.id === id);
}

// ===== Trends =====
export function getTrendData(keyword: string) {
  return TREND_KEYWORDS.find(k => k.keyword === keyword);
}

export function getBreakouts() {
  return BREAKOUTS;
}

// ===== Rules =====
export function getRulesByType(rule_type: string): GoldenRule[] {
  return RULES.filter(r => r.rule_type === rule_type);
}

export function getActiveRules(): GoldenRule[] {
  return RULES.filter(r => r.active);
}

export function getPendingAiRules(): GoldenRule[] {
  return RULES.filter(r => r.source === "ai_suggested" && !r.active);
}

export function getUnacknowledgedPatterns(): FeedbackPattern[] {
  return FEEDBACK_PATTERNS.filter(p => !p.acknowledged);
}

// ===== Chat =====
export function getThreadById(id: string): ChatThread | undefined {
  return CHAT_THREADS.find(t => t.id === id);
}

export function getThreadMessages(thread_id: string): ChatMessage[] {
  return CHAT_MESSAGES.filter(m => m.thread_id === thread_id);
}

// ===== Activity =====
export function getRecentActivity(limit = 10): ActivityLog[] {
  return [...ACTIVITY_LOG].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
}

// ===== Arbitrage =====
export function getArbitrageSourcesForIdea(idea_id: string): ArbitrageSource[] {
  return ARBITRAGE_SOURCES.filter(a => a.matched_idea_id === idea_id);
}

export function getArbitrageBySourceType(source_type: string): ArbitrageSource[] {
  return ARBITRAGE_SOURCES.filter(a => a.source_type === source_type);
}

// ===== Stats / Dashboard =====
export function getDashboardStats(): IdeaStats {
  const total = IDEAS.length;
  const by_status: Record<string, number> = {};
  const by_category: Record<string, number> = {};
  const by_build_path: Record<string, number> = {};

  for (const i of IDEAS) {
    by_status[i.status] = (by_status[i.status] || 0) + 1;
    by_category[i.category] = (by_category[i.category] || 0) + 1;
    by_build_path[i.build_path] = (by_build_path[i.build_path] || 0) + 1;
  }

  const avg_score = IDEAS.reduce((s, i) => s + i.composite_score, 0) / total;

  const week_ago = Date.now() - 7 * 86400_000;
  const month_ago = Date.now() - 30 * 86400_000;
  const ideas_this_week = IDEAS.filter(i => new Date(i.discovered_at).getTime() > week_ago).length;
  const ideas_this_month = IDEAS.filter(i => new Date(i.discovered_at).getTime() > month_ago).length;

  // Top categories by avg score
  const cat_scores: Record<string, { sum: number; count: number }> = {};
  for (const i of IDEAS) {
    const r = cat_scores[i.category] || { sum: 0, count: 0 };
    r.sum += i.composite_score;
    r.count += 1;
    cat_scores[i.category] = r;
  }
  const top_categories = Object.entries(cat_scores)
    .map(([category, { sum, count }]) => ({ category, count, avg_score: sum / count }))
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, 6);

  // Score distribution buckets
  const buckets = ["0-20","20-40","40-60","60-80","80-100"];
  const score_distribution = buckets.map((bucket) => {
    const [lo, hi] = bucket.split("-").map(Number);
    return { bucket, count: IDEAS.filter(i => i.composite_score >= lo && i.composite_score < hi).length };
  });

  // Top sources
  const platform_counts: Record<string, number> = {};
  for (const i of IDEAS) {
    for (const p of i.source_platforms) {
      platform_counts[p] = (platform_counts[p] || 0) + 1;
    }
  }
  const top_sources = Object.entries(platform_counts)
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const hot_category = top_categories[0]
    ? { category: top_categories[0].category, avg_score: top_categories[0].avg_score }
    : { category: "—", avg_score: 0 };

  return {
    total_ideas: total,
    by_status,
    by_category,
    by_build_path,
    avg_score,
    ideas_this_week,
    ideas_this_month,
    top_categories,
    score_distribution,
    top_sources,
    hot_category,
    pending_count: by_status["reviewing"] || 0,
    approved_count: by_status["approved"] || 0,
    starred_count: by_status["starred"] || 0,
  };
}

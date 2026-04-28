"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lightbulb, CheckCircle, Star, Flame, Sparkles, Activity, Brain,
  Zap, TrendingUp, TrendingDown, Minus, RefreshCw,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { toast } from "sonner";
import { CATEGORY_LABELS } from "@/lib/utils/constants";
import { scoreColor } from "@/lib/utils/scoring";
import { formatNumber, formatUSD, timeAgo } from "@/lib/utils/formatters";
import type { IdeaStats, TrendOverview } from "@/types/api";
import type { ActivityLog } from "@/types/database";

export default function DashboardPage() {
  const [stats, setStats] = useState<IdeaStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [trends, setTrends] = useState<TrendOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/ideas/stats").then(r => r.json()),
      fetch("/api/activity?limit=12").then(r => r.json()),
      fetch("/api/trends/overview").then(r => r.json()),
    ]).then(([s, a, t]) => {
      setStats(s.data);
      setActivity(a.data);
      setTrends(t.data);
    }).finally(() => setLoading(false));
  }, []);

  const runScrape = async () => {
    const p = fetch("/api/scrapers/all/run", { method: "POST" }).then(r => r.json());
    toast.promise(p, { loading: "Running full scrape…", success: "Scrape complete", error: "Scrape failed" });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Always-on intelligence across {stats?.total_ideas ?? "—"} ideas, {Object.keys(stats?.by_category ?? {}).length} categories.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runScrape} className="gap-2">
            <RefreshCw className="size-3.5" /> Run Scrape
          </Button>
          <Button asChild size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950">
            <Link href="/brain"><Brain className="size-3.5" /> Ask Brain</Link>
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.04 } },
        }}
      >
        {[
          { icon: <Lightbulb className="size-4" />, label: "Total Ideas", value: stats?.total_ideas as string | number | undefined, accent: "emerald" as const },
          { icon: <Sparkles className="size-4" />, label: "Pending", value: stats?.pending_count, accent: "amber" as const },
          { icon: <CheckCircle className="size-4" />, label: "Approved", value: stats?.approved_count, accent: "emerald" as const },
          { icon: <Star className="size-4" />, label: "Starred", value: stats?.starred_count, accent: "violet" as const },
          {
            icon: <Flame className="size-4" />,
            label: "Hot Category",
            value: stats?.hot_category ? CATEGORY_LABELS[stats.hot_category.category as keyof typeof CATEGORY_LABELS] ?? stats.hot_category.category : "—",
            subValue: stats ? `avg ${stats.hot_category.avg_score.toFixed(1)}` : "",
            accent: "orange" as const,
          },
          { icon: <Zap className="size-4" />, label: "Avg Score", value: stats ? stats.avg_score.toFixed(1) : "—", accent: "cyan" as const },
        ].map((s, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
            }}
          >
            <StatCard {...s} loading={loading} />
          </motion.div>
        ))}
      </motion.div>

      {/* Today's Top Picks */}
      <TopPicks loading={loading} />

      {/* Trend Sparklines */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-400" />
              Top trending across all niches
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/trends">View all →</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(trends?.keywords.slice(0, 4) ?? Array.from({ length: 4 })).map((k, i) => (
              <SparklineCard key={i} k={k as TrendOverview["keywords"][number] | null} loading={loading} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Quick actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <QuickAction href="/ideas?sort=score" icon={<Flame className="size-3.5 text-amber-400" />} label="Show today's best" />
            <QuickAction href="/ideas?status=detected" icon={<Lightbulb className="size-3.5 text-emerald-400" />} label="What's new" />
            <QuickAction href="/trends?filter=breakout" icon={<Sparkles className="size-3.5 text-fuchsia-400" />} label="Breakout alerts" />
            <QuickAction href="/arbitrage" icon={<Brain className="size-3.5 text-cyan-400" />} label="Find arbitrage matches" />
            <QuickAction href="/pipeline" icon={<Activity className="size-3.5 text-violet-400" />} label="Pipeline kanban" />
            <button
              onClick={runScrape}
              className="flex items-center gap-2 w-full text-left text-sm h-9 px-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Zap className="size-3.5 text-emerald-400" /> Run full scrape now
            </button>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Activity className="size-4" /> Recent activity</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            {!loading && activity.slice(0, 8).map(a => (
              <div key={a.id} className="flex items-start gap-2.5 text-xs">
                <ActivityDot action={a.action} />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground/90 truncate">{formatActivity(a)}</p>
                  <p className="text-muted-foreground text-[10px]">{timeAgo(a.created_at)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Brain Activity */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Brain className="size-4 text-cyan-400" /> Brain activity</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs h-6"><Link href="/brain">Open chat →</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <BrainItem label="New pattern detected" value="Stars cluster $14-29 + breakout trends" badge="learned" />
            <BrainItem label="Rule suggested" value="Deprioritize 'general_consumer' audience" badge="84% conf." />
            <BrainItem label="Re-scored ideas" value="14 ideas updated today" badge="auto" />
            <BrainItem label="Cross-niche correlation" value="AI templates rising on Notion + GPT Store" badge="trend" />
            <BrainItem label="Arbitrage match" value="3 PLR sources matched to AI Career Coach" badge="match" />
          </CardContent>
        </Card>
      </div>

      {/* Category Heat */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Category heat — volume × avg score</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {(stats?.top_categories ?? []).map(c => (
              <Link
                key={c.category}
                href={`/ideas?category=${c.category}`}
                className="block p-3 rounded-lg border border-border bg-card hover:border-emerald-500/40 transition-colors"
              >
                <div className={`text-xl font-mono font-semibold ${scoreColor(c.avg_score)}`}>{c.avg_score.toFixed(0)}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 truncate">{CATEGORY_LABELS[c.category as keyof typeof CATEGORY_LABELS] ?? c.category}</div>
                <div className="text-[10px] text-muted-foreground">{c.count} idea{c.count > 1 ? "s" : ""}</div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TopPicks({ loading }: { loading: boolean }) {
  const [picks, setPicks] = useState<{ id: string; title: string; composite_score: number; summary: string; build_path: string; estimated_monthly_revenue_low_usd: number; estimated_monthly_revenue_high_usd: number; build_effort_hours_min: number; build_effort_hours_max: number; trend_direction: string }[]>([]);
  useEffect(() => {
    fetch("/api/ideas?sort=score&limit=3").then(r => r.json()).then(j => setPicks(j.data ?? []));
  }, []);

  return (
    <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-400" /> Today&apos;s top picks for you
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs h-6">
            <Link href="/ideas?sort=score">All ideas →</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading || picks.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            {picks.map((p, i) => (
              <motion.div
                key={p.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
                }}
              >
                <Link href={`/ideas/${p.id}`} className="block group">
                  <div className="rounded-lg border border-border bg-card p-3 hover:border-emerald-500/50 transition-colors h-full">
                    <div className="flex items-start gap-2">
                      <div className={`shrink-0 w-10 h-10 rounded-lg border-2 grid place-items-center font-mono text-sm font-bold ${scoreColor(p.composite_score) === "text-emerald-300" ? "border-emerald-500/40 bg-emerald-500/10" : "border-lime-500/40 bg-lime-500/10"} ${scoreColor(p.composite_score)}`}>
                        {p.composite_score.toFixed(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-emerald-400">#{i + 1}</div>
                        <div className="text-xs font-medium leading-tight line-clamp-2 group-hover:text-emerald-300">{p.title}</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{p.summary}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[9px] text-muted-foreground">
                      <span className="capitalize">{p.build_path.replace(/_/g, " ")}</span>
                      <span>·</span>
                      <span>{p.build_effort_hours_min}-{p.build_effort_hours_max}h</span>
                      <span>·</span>
                      <span className="text-emerald-300">{formatUSD(p.estimated_monthly_revenue_low_usd, { compact: true })}-{formatUSD(p.estimated_monthly_revenue_high_usd, { compact: true })}/mo</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({ icon, label, value, subValue, loading, accent }: { icon: React.ReactNode; label: string; value: string | number | undefined; subValue?: string; loading: boolean; accent: "emerald"|"amber"|"violet"|"orange"|"cyan" }) {
  const accentClass = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    violet: "text-violet-400",
    orange: "text-orange-400",
    cyan: "text-cyan-400",
  }[accent];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className={accentClass}>{icon}</span>
        </div>
        {loading ? <Skeleton className="h-7 w-16 mt-2" /> : (
          <div className="mt-2">
            <div className="text-xl font-semibold tracking-tight">{value ?? "—"}</div>
            {subValue && <div className="text-[10px] text-muted-foreground mt-0.5">{subValue}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SparklineCard({ k, loading }: { k: TrendOverview["keywords"][number] | null; loading: boolean }) {
  if (loading || !k) return <Skeleton className="h-20 w-full" />;
  const dir = k.direction;
  const Icon = dir === "rising" || dir === "breakout" ? TrendingUp : dir === "declining" ? TrendingDown : Minus;
  const color = dir === "breakout" ? "text-fuchsia-400" : dir === "rising" ? "text-emerald-400" : dir === "declining" ? "text-red-400" : "text-zinc-400";
  const stroke = dir === "breakout" ? "#e879f9" : dir === "rising" ? "#34d399" : dir === "declining" ? "#f87171" : "#a1a1aa";
  return (
    <div className="rounded-lg border border-border bg-card/40 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium truncate">{k.keyword}</span>
        <span className={`text-[10px] flex items-center gap-0.5 ${color}`}>
          <Icon className="size-3" /> {k.velocity_pct >= 0 ? "+" : ""}{k.velocity_pct}%
        </span>
      </div>
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={k.sparkline.map((v, i) => ({ i, v }))}>
            <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} dot={false} />
            <RTooltip cursor={false} contentStyle={{ display: "none" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-sm h-9 px-3 rounded-lg border border-border hover:bg-accent transition-colors"
    >
      {icon} {label}
    </Link>
  );
}

function ActivityDot({ action }: { action: string }) {
  const color = action.startsWith("idea.") ? "bg-emerald-400" :
    action.startsWith("scraper.error") ? "bg-red-400" :
    action.startsWith("scraper.") ? "bg-cyan-400" :
    action.startsWith("trend.") ? "bg-fuchsia-400" :
    action.startsWith("brain.") ? "bg-violet-400" :
    action.startsWith("rule.") ? "bg-amber-400" :
    "bg-zinc-400";
  return <span className={`mt-1 size-1.5 rounded-full ${color} shrink-0`} />;
}

function BrainItem({ label, value, badge }: { label: string; value: string; badge: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-violet-500/10 text-violet-300 border border-violet-500/20">{badge}</Badge>
      </div>
      <p className="text-xs text-foreground/90">{value}</p>
    </div>
  );
}

function formatActivity(a: ActivityLog): string {
  const meta = a.meta as Record<string, unknown> | null;
  switch (a.action) {
    case "idea.created":   return `New idea: ${meta?.title ?? "—"}`;
    case "idea.scored":    return `Re-scored to ${meta?.composite}`;
    case "idea.approved":  return `Approved: ${meta?.title ?? "—"}`;
    case "idea.declined":  return `Declined: ${meta?.title ?? "—"}`;
    case "idea.starred":   return `Starred: ${meta?.title ?? "—"}`;
    case "idea.archived":  return `Archived: ${meta?.title ?? "—"}`;
    case "scraper.success": return `Scraper '${meta?.name}' — ${formatNumber(meta?.items as number)} items`;
    case "scraper.error":   return `Scraper '${meta?.name}' error`;
    case "trend.breakout":  return `Breakout: ${meta?.keyword} (+${meta?.velocity_pct}%)`;
    case "brain.learned":   return `Brain learned: ${meta?.pattern}`;
    case "rule.suggested":  return `Rule suggested`;
    case "rule.activated":  return `Rule activated`;
    case "digest.generated":return `Daily digest ready`;
    case "arbitrage.matched": return `Arbitrage matches found (${meta?.count})`;
    case "competitor.added": return `Competitor added: ${meta?.name}`;
    case "idea.deep_dive":  return `Deep dive run (${formatUSD(meta?.cost_usd as number)})`;
    case "idea.spec_generated": return `Spec generated`;
    case "idea.moved_to_in_build": return `→ in_build: ${meta?.title}`;
    default: return a.action;
  }
}

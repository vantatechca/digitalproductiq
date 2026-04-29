"use client";

// Topbar receives activity + budget data as props from the server layout.
// No more client-side useEffect fetches. The bell now shows a number badge
// when there's unread activity, capped at 99+.

import { Bell, Brain, Search, Command, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatUSD, timeAgo } from "@/lib/utils/formatters";
import type { ActivityLog } from "@/types/database";

export type TopbarData = {
  activity: ActivityLog[];
  daily_budget_usd: number;
  daily_spent_usd: number;
};

interface TopbarProps {
  onCommandOpen: () => void;
  onChatToggle: () => void;
  chatOpen: boolean;
  data: TopbarData;
}

export function Topbar({ onCommandOpen, onChatToggle, chatOpen, data }: TopbarProps) {
  const { activity, daily_budget_usd: cap, daily_spent_usd: spent } = data;
  const pct = Math.min(100, (spent / Math.max(cap, 0.01)) * 100);
  const meterColor = pct < 60 ? "bg-emerald-400" : pct < 85 ? "bg-amber-400" : "bg-red-400";

  // Cap the bell badge at 99+ so a runaway activity log doesn't blow out the icon.
  const bellCount = activity.length;
  const bellLabel = bellCount > 99 ? "99+" : String(bellCount);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-6 gap-3">
      <button
        onClick={onCommandOpen}
        className="flex items-center gap-2 h-9 px-3 rounded-lg bg-card hover:bg-accent border border-border text-sm text-muted-foreground transition-colors flex-1 max-w-md"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search ideas, rules, marketplaces…</span>
        <kbd className="ml-auto inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          <Command className="size-2.5" /> K
        </kbd>
      </button>

      <div className="flex-1" />

      {/* Daily AI budget meter */}
      <Tooltip>
        <TooltipTrigger>
          <div className="hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg border border-border bg-card text-xs">
            <Zap className="size-3 text-emerald-400" />
            <span className="font-mono text-muted-foreground">{formatUSD(spent)} / {formatUSD(cap)}</span>
            <span className="w-12 h-1 rounded-full bg-muted/40 overflow-hidden">
              <span className={`block h-full ${meterColor}`} style={{ width: `${pct}%` }} />
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Daily AI spend ({pct.toFixed(0)}% of {formatUSD(cap)} cap)</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger className="relative inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors">
          <Bell className="size-4" />
          {bellCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-semibold leading-none ring-2 ring-background">
              {bellLabel}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96">
          <div className="flex items-center justify-between px-2 py-1.5 text-sm font-semibold">
          <span>Recent Activity</span>
          <Badge variant="secondary" className="text-[10px]">{bellCount}</Badge>
        </div>
          <DropdownMenuSeparator />
          {activity.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">No recent activity</div>
          )}
          {activity.slice(0, 8).map((a) => (
            <DropdownMenuItem key={a.id} className="flex flex-col items-start gap-0.5 py-2.5">
              <span className="text-xs font-medium">{formatActivity(a)}</span>
              <span className="text-[10px] text-muted-foreground">{timeAgo(a.created_at)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger>
          <kbd className="hidden md:inline-flex items-center justify-center size-7 rounded bg-muted/40 border border-border text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">?</kbd>
        </TooltipTrigger>
        <TooltipContent>Press <kbd className="px-1 py-0.5 rounded bg-muted">?</kbd> for keyboard shortcuts</TooltipContent>
      </Tooltip>

      <Button
        variant={chatOpen ? "default" : "outline"}
        size="sm"
        onClick={onChatToggle}
        className="gap-2"
      >
        <Brain className="size-4" />
        Brain
      </Button>

      <button
        type="button"
        onClick={handleLogout}
        title="Sign out"
        className="inline-flex items-center justify-center size-8 rounded-lg bg-muted hover:bg-accent border border-border transition-colors"
      >
        <LogOut className="size-4" />
      </button>
    </header>
  );
}

function formatActivity(a: ActivityLog): string {
  const meta = a.meta as Record<string, unknown> | null;
  switch (a.action) {
    case "idea.created":   return `New idea: ${meta?.title ?? "—"}`;
    case "idea.scored":    return `Re-scored: ${meta?.composite ?? "—"}`;
    case "idea.approved":  return `Approved: ${meta?.title ?? "—"}`;
    case "idea.declined":  return `Declined: ${meta?.title ?? "—"}`;
    case "idea.starred":   return `Starred: ${meta?.title ?? "—"}`;
    case "idea.archived":  return `Archived: ${meta?.title ?? "—"}`;
    case "scraper.success": return `Scraper '${meta?.name}' — ${meta?.items} items`;
    case "scraper.error":   return `Scraper '${meta?.name}' error`;
    case "trend.breakout":  return `Breakout: ${meta?.keyword} (+${meta?.velocity_pct}%)`;
    case "brain.learned":   return `Brain learned: ${meta?.pattern}`;
    case "rule.suggested":  return `Suggested rule`;
    case "rule.activated":  return `Rule activated`;
    case "digest.generated":return `Daily digest ready`;
    case "arbitrage.matched": return `Arbitrage match (${meta?.count})`;
    case "competitor.added": return `Competitor added: ${meta?.name}`;
    case "idea.deep_dive":  return `Deep dive complete`;
    case "idea.spec_generated": return `Spec generated`;
    case "idea.moved_to_in_build": return `→ in_build: ${meta?.title}`;
    default:                return a.action;
  }
}
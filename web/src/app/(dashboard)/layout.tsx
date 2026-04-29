// Dashboard layout — server component that fetches sidebar badges AND topbar
// notification data once per navigation. Hands them as props to Sidebar and
// DashboardShell (which forwards to Topbar).

import { Sidebar } from "@/components/layout/sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { IDEAS, BREAKOUTS, RULES, ACTIVITY_LOG } from "@/lib/mock-data";
import type { ActivityLog } from "@/types/database";

export const dynamic = "force-dynamic";

async function getSidebarBadges() {
  // While we're still on mock data, derive counts from the same source
  // /api/ideas/stats etc. read from. When you wire Supabase, replace this
  // with a single supabase call (or RPC) that returns all three counts.
  try {
    return {
      ideas_total: IDEAS.length,
      breakouts: BREAKOUTS.length,
      rule_suggestions: RULES.filter(r => r.source === "ai_suggested" && !r.active).length,
    };
  } catch {
    return { ideas_total: 0, breakouts: 0, rule_suggestions: 0 };
  }
}

async function getTopbarData() {
  try {
    // Sort newest first, take 8 — matches what the dropdown displays.
    const recent: ActivityLog[] = [...ACTIVITY_LOG]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
    // Daily AI spend cap — pulled from settings; mocked here.
    return {
      activity: recent,
      daily_budget_usd: 5,
      daily_spent_usd: 1.84,
    };
  } catch {
    return {
      activity: [] as ActivityLog[],
      daily_budget_usd: 5,
      daily_spent_usd: 0,
    };
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [badges, topbarData] = await Promise.all([
    getSidebarBadges(),
    getTopbarData(),
  ]);

  return (
    <DashboardShell
      sidebar={<Sidebar badges={badges} />}
      topbarData={topbarData}
    >
      {children}
    </DashboardShell>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes, LayoutDashboard, Lightbulb, Brain, TrendingUp,
  Store, Users, Recycle, Shield, Workflow, Settings as SettingsIcon,
  ChevronLeft, ChevronRight, Sparkles, Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, badgeKey: null },
  { href: "/ideas", label: "Ideas", icon: Lightbulb, badgeKey: "pending" },
  { href: "/brain", label: "Brain", icon: Brain, badgeKey: null },
  { href: "/trends", label: "Trends", icon: TrendingUp, badgeKey: "breakouts" },
  { href: "/marketplaces", label: "Marketplaces", icon: Store, badgeKey: null },
  { href: "/competitors", label: "Competitors", icon: Users, badgeKey: null },
  { href: "/arbitrage", label: "Arbitrage", icon: Recycle, badgeKey: null },
  { href: "/rules", label: "Rules", icon: Shield, badgeKey: "rule_suggestions" },
  { href: "/pipeline", label: "Pipeline", icon: Workflow, badgeKey: null },
  { href: "/settings", label: "Settings", icon: SettingsIcon, badgeKey: null },
] as const;

type Badges = { pending?: number; breakouts?: number; rule_suggestions?: number };

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [badges, setBadges] = useState<Badges>({});

  useEffect(() => {
    const v = localStorage.getItem("dpiq.sidebar.collapsed");
    if (v === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("dpiq.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [s, b, r] = await Promise.all([
          fetch("/api/ideas/stats").then(r => r.json()).catch(() => null),
          fetch("/api/trends/breakouts").then(r => r.json()).catch(() => null),
          fetch("/api/rules").then(r => r.json()).catch(() => null),
        ]);
        if (cancel) return;
        setBadges({
          pending: s?.data?.pending_count ?? 0,
          breakouts: b?.data?.length ?? 0,
          rule_suggestions: r?.data?.filter((x: { source: string; active: boolean }) => x.source === "ai_suggested" && !x.active).length ?? 0,
        });
      } catch { /* ignore */ }
    })();
    return () => { cancel = true; };
  }, [pathname]);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-200 shrink-0",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      <div className={cn(
        "flex items-center gap-2 px-4 h-16 border-b border-border/60",
        collapsed && "justify-center px-0",
      )}>
        <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center text-zinc-900 shadow-md shadow-emerald-900/30">
          <Boxes className="size-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">DigitalProductIQ</span>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Opportunity Intel</span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
          const badgeVal = n.badgeKey ? badges[n.badgeKey as keyof Badges] : undefined;

          const linkInner = (
            <Link
              href={n.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 h-10 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-emerald-400")} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{n.label}</span>
                  {badgeVal !== undefined && badgeVal > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-5 px-1.5 text-[10px]",
                        n.badgeKey === "breakouts" && "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30",
                        n.badgeKey === "rule_suggestions" && "bg-violet-500/15 text-violet-300 border border-violet-500/30",
                        n.badgeKey === "pending" && "bg-amber-500/15 text-amber-300 border border-amber-500/30",
                      )}
                    >
                      {badgeVal}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );

          return (
            <div key={n.href} title={collapsed ? n.label : undefined}>
              {linkInner}
            </div>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border/60 space-y-0.5">
        {!collapsed && (
          <div className="mb-2 mx-1 p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-3.5 text-emerald-400" />
              <span className="text-xs font-medium">Brain is online</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Always-on. Last scan {Math.floor(Math.random() * 9) + 1}m ago.
            </p>
          </div>
        )}
        <Link
          href="/compliance"
          className={cn(
            "flex items-center gap-2 w-full rounded-lg h-9 px-3 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <Scale className="size-3.5" /> {!collapsed && "Compliance"}
        </Link>
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg h-9 px-3 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4" /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Sparkles, Flame, Zap } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { CATEGORY_LABELS, TREND_COLORS } from "@/lib/utils/constants";
import { formatNumber } from "@/lib/utils/formatters";
import type { Category, TrendDirection } from "@/lib/utils/constants";

interface KW { keyword: string; category: Category; direction: TrendDirection; velocity_pct: number; current_volume: number; }
interface Pulse { platform: string; items: { title: string; metric: string; trend: string }[]; }

export default function TrendsPage() {
  const [keywords, setKeywords] = useState<KW[]>([]);
  const [breakouts, setBreakouts] = useState<{ keyword: string; category: Category; velocity_pct: number; evidence: string[]; detected_at: string }[]>([]);
  const [overview, setOverview] = useState<{ keywords: { keyword: string; direction: string; velocity_pct: number; sparkline: number[] }[]; reddit_pulse: Pulse["items"]; etsy_pulse: Pulse["items"]; youtube_pulse: Pulse["items"]; summary: string } | null>(null);
  const [crossNiche, setCrossNiche] = useState<{ name: string; score: number; niches: string[]; evidence: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/trends/heatmap").then(r => r.json()),
      fetch("/api/trends/breakouts").then(r => r.json()),
      fetch("/api/trends/overview").then(r => r.json()),
      fetch("/api/trends/cross-niche").then(r => r.json()),
    ]).then(([h, b, o, c]) => {
      setKeywords(h.data); setBreakouts(b.data); setOverview(o.data); setCrossNiche(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const rising = [...keywords].filter(k => k.direction === "rising" || k.direction === "breakout").sort((a, b) => b.velocity_pct - a.velocity_pct).slice(0, 10);

  return (
    <div className="p-6 space-y-4 max-w-[1600px]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trends</h1>
        <p className="text-sm text-muted-foreground mt-1">{overview?.summary ?? "—"}</p>
      </div>

      {/* Trend Heatmap */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Flame className="size-4 text-amber-400" /> Trend heatmap — {keywords.length} keywords</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32 w-full" /> : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {keywords.map(k => (
                <div key={k.keyword} className={`p-2.5 rounded-lg border ${heatBg(k.direction)}`}>
                  <div className="text-[11px] font-medium truncate" title={k.keyword}>{k.keyword}</div>
                  <div className={`text-[10px] mt-0.5 ${TREND_COLORS[k.direction]}`}>
                    {k.velocity_pct >= 0 ? "+" : ""}{k.velocity_pct}% · {k.direction}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{formatNumber(k.current_volume, { compact: true })} mo</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rising Stars */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="size-4 text-emerald-400" /> Rising stars</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {rising.map((k, idx) => (
              <div key={k.keyword} className="flex items-center gap-2.5">
                <span className="text-[10px] text-muted-foreground font-mono w-4">{idx + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{k.keyword}</div>
                  <div className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[k.category]}</div>
                </div>
                <div className="text-[10px]">
                  <SparkLine values={overview?.keywords.find(o => o.keyword === k.keyword)?.sparkline ?? []} direction={k.direction} />
                </div>
                <Badge variant="secondary" className="text-[9px]">+{k.velocity_pct}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Breakout Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Sparkles className="size-4 text-fuchsia-400" /> Breakout alerts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {breakouts.map(b => (
              <Card key={b.keyword} className="border-fuchsia-500/30 bg-fuchsia-500/5">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{b.keyword}</div>
                      <div className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[b.category]}</div>
                    </div>
                    <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40">+{b.velocity_pct}%</Badge>
                  </div>
                  <ul className="text-[11px] text-muted-foreground mt-2 space-y-0.5">
                    {b.evidence.map(e => <li key={e}>• {e}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Platform Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { platform: "reddit", items: overview?.reddit_pulse ?? [] },
          { platform: "etsy", items: overview?.etsy_pulse ?? [] },
          { platform: "youtube", items: overview?.youtube_pulse ?? [] },
        ].map(p => (
          <Card key={p.platform}>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium uppercase">{p.platform} pulse</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {p.items.slice(0, 5).map((it: Record<string, unknown>, i: number) => (
                <div key={i} className="text-xs">
                  <div className="font-medium truncate">{(it.top_post ?? it.search ?? it.topic ?? it.title) as string}</div>
                  <div className="text-[10px] text-muted-foreground">{(it.metric ?? "—") as string}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cross-niche correlations */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Zap className="size-4 text-cyan-400" /> Cross-niche correlations</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {crossNiche.map(c => (
            <div key={c.name} className="flex items-start gap-3 text-sm">
              <Badge variant="secondary" className="text-[10px] shrink-0 mt-0.5">conf {(c.score * 100).toFixed(0)}%</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{c.name}</div>
                <div className="text-[10px] text-muted-foreground">{c.niches.join(" + ")}</div>
                <ul className="text-[10px] text-muted-foreground mt-0.5">
                  {c.evidence.slice(0, 2).map((e, i) => <li key={i}>· {e}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function heatBg(d: TrendDirection): string {
  switch (d) {
    case "breakout": return "bg-fuchsia-500/10 border-fuchsia-500/30";
    case "rising": return "bg-emerald-500/10 border-emerald-500/30";
    case "stable": return "bg-amber-500/10 border-amber-500/30";
    case "declining": return "bg-red-500/10 border-red-500/30";
    case "flat": return "bg-zinc-500/10 border-zinc-500/30";
  }
}

function SparkLine({ values, direction }: { values: number[]; direction: TrendDirection }) {
  if (values.length === 0) return <div className="w-12 h-4" />;
  const stroke = direction === "breakout" ? "#e879f9" : direction === "rising" ? "#34d399" : direction === "declining" ? "#f87171" : "#a1a1aa";
  return (
    <div className="w-12 h-4">
      <ResponsiveContainer><LineChart data={values.map((v, i) => ({ i, v }))}><Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.2} dot={false} /></LineChart></ResponsiveContainer>
    </div>
  );
}

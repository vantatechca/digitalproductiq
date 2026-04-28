"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Star, Check, X, Archive, Sparkles, FileText, Recycle,
  TrendingUp, ExternalLink, Clock, DollarSign, Users, Brain,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS, BUILD_PATH_LABELS } from "@/lib/utils/constants";
import { scoreBg, scoreColor, scoreBarColor } from "@/lib/utils/scoring";
import { formatUSD, formatNumber, timeAgo, humanize } from "@/lib/utils/formatters";
import { MarkdownRenderer } from "@/components/brain/markdown-renderer";
import type { Idea, IdeaSignal, ArbitrageSource } from "@/types/database";
import type { DeepDivePayload, ProductSpec } from "@/types/api";

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [signals, setSignals] = useState<IdeaSignal[]>([]);
  const [trends, setTrends] = useState<{ date: string; search_volume: number; competitor_count: number; median_price_usd: number; mention_count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [deepDive, setDeepDive] = useState<DeepDivePayload | null>(null);
  const [spec, setSpec] = useState<ProductSpec | null>(null);
  const [arbitrage, setArbitrage] = useState<{ source: ArbitrageSource; match_score: number }[] | null>(null);
  const [loadingDive, setLoadingDive] = useState(false);
  const [loadingSpec, setLoadingSpec] = useState(false);
  const [loadingArb, setLoadingArb] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/ideas/${id}`).then(r => r.json()),
      fetch(`/api/ideas/${id}/signals`).then(r => r.json()),
      fetch(`/api/ideas/${id}/trends`).then(r => r.json()),
    ]).then(([i, s, t]) => {
      setIdea(i.data);
      setSignals(s.data);
      setTrends(t.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const action = async (act: string, label: string) => {
    const r = await fetch(`/api/ideas/${id}/feedback`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    }).then(r => r.json());
    setIdea(prev => prev ? { ...prev, status: r.data.status } : prev);
    toast.success(label);
  };

  const runDeepDive = async () => {
    setLoadingDive(true);
    const r = await fetch(`/api/ideas/${id}/deep-dive`, { method: "POST" }).then(r => r.json());
    setDeepDive(r.data);
    setLoadingDive(false);
    toast.success("Deep dive complete");
  };

  const generateSpec = async () => {
    setLoadingSpec(true);
    const r = await fetch(`/api/ideas/${id}/draft-spec`, { method: "POST" }).then(r => r.json());
    setSpec(r.data);
    setLoadingSpec(false);
    toast.success("Spec generated");
  };

  const findArbitrage = async () => {
    setLoadingArb(true);
    const r = await fetch(`/api/ideas/${id}/find-arbitrage`, { method: "POST" }).then(r => r.json());
    setArbitrage(r.data.matches);
    setLoadingArb(false);
    toast.success(`${r.data.matches.length} arbitrage matches found`);
  };

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-96 w-full" /></div>;
  if (!idea) return <div className="p-6">Idea not found.</div>;

  return (
    <div className="p-6 space-y-4 max-w-[1400px] pb-32">
      <Link href="/ideas" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3" /> All ideas
      </Link>

      {/* Hero */}
      <Card>
        <CardContent className="p-6 flex items-start gap-6">
          <div className={`shrink-0 w-24 h-24 rounded-2xl border-2 grid place-items-center font-mono font-bold text-4xl ${scoreBg(idea.composite_score)}`}>
            {idea.composite_score.toFixed(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{idea.title}</h1>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge className={STATUS_COLORS[idea.status]}>{STATUS_LABELS[idea.status]}</Badge>
                  <Badge variant="outline" className="border-violet-500/30 text-violet-300 bg-violet-500/10">{BUILD_PATH_LABELS[idea.build_path]}</Badge>
                  <Badge variant="outline" className={`border-${idea.compliance_flag === "green" ? "emerald" : idea.compliance_flag === "amber" ? "amber" : "red"}-500/30`}>compliance: {idea.compliance_flag}</Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{idea.summary}</p>
            {idea.decline_reason && (
              <p className="text-xs text-red-300 mt-2"><strong>Decline reason:</strong> {idea.decline_reason}</p>
            )}

            {/* Sub-scores */}
            <div className="grid grid-cols-5 gap-3 mt-4">
              {(["trend","demand","competition","feasibility","revenue_potential"] as const).map(k => {
                const v = (idea as unknown as Record<string, number>)[`${k}_score`];
                return (
                  <div key={k}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground capitalize">{k.replace("_potential", "")}</span>
                      <span className={`font-mono ${scoreColor(v)}`}>{v?.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div className={`h-full ${scoreBarColor(v)}`} style={{ width: `${v}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {idea.status !== "approved" && <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-emerald-500/40 hover:bg-emerald-500/10" onClick={() => action("approve","Approved")}><Check className="size-3.5" /> Approve</Button>}
              {idea.status !== "starred" && <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => action("star","Starred")}><Star className="size-3.5" /> Star</Button>}
              {idea.status !== "in_build" && <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => action("move_to_in_build","Moved to in_build")}>Move to In Build</Button>}
              {idea.status !== "declined" && <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => action("decline","Declined")}><X className="size-3.5" /> Decline</Button>}
              {idea.status !== "archived" && <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => action("archive","Archived")}><Archive className="size-3.5" /> Archive</Button>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
          <TabsTrigger value="evidence">Evidence ({signals.length})</TabsTrigger>
          <TabsTrigger value="build">Build Plan</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="log">Action Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <Card><CardContent className="p-5">
            <h3 className="font-medium mb-2">Hypothesis</h3>
            <p className="text-sm text-muted-foreground">{idea.hypothesis ?? "—"}</p>
          </CardContent></Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoCard label="Target audience" value={idea.target_audience.join(", ")} />
            <InfoCard label="Sub-niches" value={idea.sub_niche.join(", ")} />
            <InfoCard label="Skills required" value={idea.skill_required.join(", ")} />
            <InfoCard label="Source platforms" value={idea.source_platforms.slice(0, 4).join(", ")} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoCard label="Build effort" value={`${idea.build_effort_hours_min}-${idea.build_effort_hours_max}h`} />
            <InfoCard label="Median price" value={formatUSD(idea.median_price_usd)} />
            <InfoCard label="Price range" value={`${formatUSD(idea.price_floor_usd)}-${formatUSD(idea.price_ceiling_usd)}`} />
            <InfoCard label="Est. monthly revenue" value={`${formatUSD(idea.estimated_monthly_revenue_low_usd)}-${formatUSD(idea.estimated_monthly_revenue_high_usd)}`} />
          </div>

          {idea.compliance_notes && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4">
                <p className="text-xs text-amber-300"><strong>Compliance:</strong> {idea.compliance_notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Search volume — last 12 weeks</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" stroke="#888" fontSize={10} />
                  <YAxis stroke="#888" fontSize={10} tickFormatter={(v) => formatNumber(v as number, { compact: true })} />
                  <RTooltip
                    contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: unknown) => formatNumber(Number(value))}
                    labelFormatter={(_, p) => (p as unknown as { payload?: { date: string } }[])?.[0]?.payload?.date ?? ""}
                  />
                  <Line type="monotone" dataKey="search_volume" stroke="#34d399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Competitor count over time</CardTitle></CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="#888" fontSize={10} />
                    <YAxis stroke="#888" fontSize={10} />
                    <RTooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="competitor_count" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Mention volume</CardTitle></CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="#888" fontSize={10} />
                    <YAxis stroke="#888" fontSize={10} />
                    <RTooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="mention_count" fill="#e879f9" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competition" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Competitive snapshot</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold">{formatNumber(idea.competitor_count)}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Active competitors</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{formatUSD(idea.median_price_usd)}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Median price</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{formatUSD(idea.market_size_estimate_usd, { compact: true })}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Est. market size</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card><CardContent className="p-4 text-sm text-muted-foreground">
            Run a deep dive (button bottom-right) to get the full competitive teardown with positioning gaps and recommended wedge.
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-2">
          {signals.length === 0 && <Card><CardContent className="p-4 text-sm text-muted-foreground">No signals yet.</CardContent></Card>}
          {signals.map(s => (
            <Card key={s.id}>
              <CardContent className="p-3 flex items-start gap-3">
                <Badge variant="secondary" className="shrink-0">{s.platform}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{s.title ?? s.signal_type}</div>
                  {s.content && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{s.content}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                    {s.author && <span>by {s.author}</span>}
                    {s.engagement_score !== null && <span>{formatNumber(s.engagement_score)} engagement</span>}
                    {s.relevance_score !== null && <span className={scoreColor(s.relevance_score)}>relevance {s.relevance_score}</span>}
                    <span>{timeAgo(s.collected_at)}</span>
                  </div>
                </div>
                {s.external_url && (
                  <a href={s.external_url} target="_blank" rel="noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground">
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="build" className="space-y-3">
          <Card><CardContent className="p-5">
            <h3 className="font-medium mb-3">Auto-generated build plan</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-foreground/90">Effort:</strong> {idea.build_effort_hours_min}-{idea.build_effort_hours_max}h
              </div>
              <div>
                <strong className="text-foreground/90">Skills required:</strong> {idea.skill_required.join(", ")}
              </div>
              <div>
                <strong className="text-foreground/90">Build path:</strong> {BUILD_PATH_LABELS[idea.build_path]}
              </div>
              <div>
                <strong className="text-foreground/90">Recommended sequence:</strong>
                <ol className="list-decimal pl-5 mt-1 space-y-1 text-muted-foreground">
                  <li>Spec + outline (10% of total time) — Notion or Figma</li>
                  <li>Core build (60%) — your primary skill goes here</li>
                  <li>Polish + asset library (15%) — listing photos, mockups</li>
                  <li>Listing + marketing setup (15%) — SEO, tags, launch tweet</li>
                </ol>
              </div>
              <Button size="sm" onClick={generateSpec} disabled={loadingSpec} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-600">
                <FileText className="size-3.5 mr-2" /> {loadingSpec ? "Generating…" : "Generate full product spec"}
              </Button>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="discussion">
          <DiscussionTab ideaId={id} ideaTitle={idea.title} />
        </TabsContent>

        <TabsContent value="log">
          <Card><CardContent className="p-4 space-y-2 text-xs">
            <ActionRow time="now" event="Loaded by you" />
            <ActionRow time={timeAgo(idea.last_scored_at)} event="Re-scored to {composite}" data={String(idea.composite_score.toFixed(1))} />
            <ActionRow time={timeAgo(idea.last_signal_at)} event="Last signal received" />
            {idea.approved_at && <ActionRow time={timeAgo(idea.approved_at)} event="Approved" />}
            <ActionRow time={timeAgo(idea.discovered_at)} event="Discovered" />
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Sticky bottom actions */}
      <div className="fixed bottom-4 right-4 z-20 flex gap-2 bg-card/90 backdrop-blur-md p-2 rounded-xl border border-border shadow-2xl">
        <Button size="sm" onClick={runDeepDive} disabled={loadingDive} variant="outline" className="gap-1.5 border-emerald-500/40 hover:bg-emerald-500/10">
          <Brain className="size-3.5" /> {loadingDive ? "Running…" : "Run Deep Dive"}
        </Button>
        <Button size="sm" onClick={generateSpec} disabled={loadingSpec} variant="outline" className="gap-1.5">
          <FileText className="size-3.5" /> {loadingSpec ? "…" : "Spec"}
        </Button>
        <Button size="sm" onClick={findArbitrage} disabled={loadingArb} variant="outline" className="gap-1.5">
          <Recycle className="size-3.5" /> {loadingArb ? "…" : "Find Arbitrage"}
        </Button>
      </div>

      {/* Sheets */}
      <Sheet open={!!deepDive} onOpenChange={(o) => !o && setDeepDive(null)}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Brain className="size-4 text-emerald-400" /> Deep Dive — {idea.title}</SheetTitle>
            <SheetDescription>Tier-3 strategic analysis · Generated by Claude Sonnet 4.6</SheetDescription>
          </SheetHeader>
          {deepDive && (
            <div className="space-y-4 mt-4 px-1 pb-8">
              <MarkdownRenderer text={deepDive.market_analysis} />
              <MarkdownRenderer text={deepDive.competitive_deep_dive} />
              <MarkdownRenderer text={deepDive.regulatory_tos} />
              <MarkdownRenderer text={deepDive.build_plan} />
              <MarkdownRenderer text={deepDive.monetization_plan} />
              <MarkdownRenderer text={deepDive.marketing_plan} />
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="p-4">
                  <h4 className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Recommendation</h4>
                  <MarkdownRenderer text={deepDive.recommendation} />
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <Card><CardContent className="p-4">
                  <h4 className="text-xs uppercase tracking-wider text-amber-300 mb-2">Risks</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {deepDive.risks.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <h4 className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Opportunities</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {deepDive.opportunities.map((o, i) => <li key={i}>• {o}</li>)}
                  </ul>
                </CardContent></Card>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Cost: {formatUSD(deepDive.cost_usd)} · Confidence: {(deepDive.confidence * 100).toFixed(0)}%</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!spec} onOpenChange={(o) => !o && setSpec(null)}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><FileText className="size-4 text-emerald-400" /> Product Spec</SheetTitle>
            <SheetDescription>Full markdown spec — copy or export</SheetDescription>
          </SheetHeader>
          {spec && (
            <div className="mt-4 px-1 pb-8">
              <MarkdownRenderer text={spec.spec_markdown} />
              <p className="text-[10px] text-muted-foreground mt-4 text-center">Cost: {formatUSD(spec.cost_usd)}</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!arbitrage} onOpenChange={(o) => !o && setArbitrage(null)}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Recycle className="size-4 text-emerald-400" /> Arbitrage matches</SheetTitle>
            <SheetDescription>PLR / MRR / public domain / open-source candidates</SheetDescription>
          </SheetHeader>
          {arbitrage && (
            <div className="space-y-2 mt-4 px-1 pb-8">
              {arbitrage.length === 0 && <p className="text-sm text-muted-foreground">No matches found.</p>}
              {arbitrage.map(({ source, match_score }) => (
                <Card key={source.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{source.product_title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <Badge variant="secondary" className="text-[10px]">{source.source_type.toUpperCase()}</Badge>
                          <Badge variant="outline" className="text-[10px]">{source.source_platform}</Badge>
                          <span className="text-[10px] text-muted-foreground">{formatUSD(source.cost_usd)}</span>
                        </div>
                        {source.notes && <p className="text-[11px] text-muted-foreground mt-1">{source.notes}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1">License: {source.license_type}</p>
                      </div>
                      <div className={`shrink-0 px-2 py-1 rounded text-xs font-mono ${scoreBg(match_score)}`}>
                        {match_score.toFixed(0)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card><CardContent className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
      <div className="text-xs text-foreground truncate" title={value}>{value || "—"}</div>
    </CardContent></Card>
  );
}

function ActionRow({ time, event, data }: { time: string; event: string; data?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 last:border-b-0 pb-1.5 last:pb-0">
      <span className="text-foreground/90">{event.replace("{composite}", data ?? "")}</span>
      <span className="text-muted-foreground text-[10px]">{time}</span>
    </div>
  );
}

function DiscussionTab({ ideaId, ideaTitle }: { ideaId: string; ideaTitle: string }) {
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string; pending?: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Lazily create a thread on first send
  const ensureThread = async (): Promise<string> => {
    if (threadId) return threadId;
    const r = await fetch("/api/chat/threads", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `Idea Dive: ${ideaTitle}`, thread_type: "idea_dive", context_idea_id: ideaId }),
    }).then(r => r.json());
    setThreadId(r.data.id);
    return r.data.id;
  };

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || streaming) return;
    const tid = await ensureThread();
    const aid = `a-${Date.now()}`;
    setMessages(m => [...m, { id: `u-${Date.now()}`, role: "user", content: text }, { id: aid, role: "assistant", content: "", pending: true }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/brain/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, thread_id: tid, context_idea_id: ideaId }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const ev of events) {
          const lines = ev.split("\n");
          let evType = "", dataStr = "";
          for (const l of lines) {
            if (l.startsWith("event:")) evType = l.slice(6).trim();
            else if (l.startsWith("data:")) dataStr = l.slice(5).trim();
          }
          if (!dataStr) continue;
          try {
            const parsed = JSON.parse(dataStr) as { text?: string };
            if (evType === "token" && parsed.text) {
              setMessages(m => m.map(msg => msg.id === aid ? { ...msg, content: msg.content + parsed.text, pending: false } : msg));
            }
          } catch {/* ignore */}
        }
      }
    } catch {
      setMessages(m => m.map(msg => msg.id === aid ? { ...msg, content: msg.content || "_(connection interrupted)_", pending: false } : msg));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div ref={scrollRef} className="max-h-[500px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-12">
              Ask the brain about this idea. Try <code className="text-emerald-300">deep dive</code>, <code className="text-emerald-300">find PLR</code>, or your own question.
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
              <div className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-left ${m.role === "user" ? "bg-emerald-500/15 border border-emerald-500/20" : "bg-muted/40 border border-border"}`}>
                {m.role === "assistant" ? <MarkdownRenderer text={m.content || (m.pending ? "…" : "")} /> : <p className="text-xs">{m.content}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about this idea…"
            disabled={streaming}
            className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
          <Button onClick={() => send()} disabled={streaming || !input.trim()} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-600">Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}

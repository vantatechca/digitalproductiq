"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from "recharts";
import { Download, FileJson, Save } from "lucide-react";
import { toast } from "sonner";
import type { SettingsPayload } from "@/types/api";

export default function SettingsPage() {
  const [s, setS] = useState<SettingsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrapers, setScrapers] = useState<{ id: string; name: string; status: string; schedule_cron: string; items_last_run: number; consecutive_errors: number; is_active: boolean }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then(r => r.json()),
      fetch("/api/scrapers/status").then(r => r.json()),
    ]).then(([a, b]) => { setS(a.data); setScrapers(b.data); }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!s) return;
    await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    toast.success("Settings saved");
  };

  if (loading || !s) return <div className="p-6"><Skeleton className="h-96" /></div>;

  const cost_data = [
    { day: "Mon", tier1: 0.18, tier2: 0.42, tier3: 1.20 },
    { day: "Tue", tier1: 0.21, tier2: 0.38, tier3: 0.96 },
    { day: "Wed", tier1: 0.18, tier2: 0.51, tier3: 1.42 },
    { day: "Thu", tier1: 0.24, tier2: 0.48, tier3: 1.18 },
    { day: "Fri", tier1: 0.20, tier2: 0.46, tier3: 1.04 },
    { day: "Sat", tier1: 0.10, tier2: 0.22, tier3: 0.42 },
    { day: "Sun", tier1: 0.08, tier2: 0.18, tier3: 0.36 },
  ];

  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your brain, scrapers, models, and notifications.</p>
        </div>
        <Button onClick={save} className="gap-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-600"><Save className="size-3.5" /> Save changes</Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="ai">AI Models</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="usage">API Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-3">
          <Card><CardContent className="p-5 space-y-3">
            <div><Label>Name</Label><Input value={s.user.name} onChange={e => setS({ ...s, user: { ...s.user, name: e.target.value } })} /></div>
            <div><Label>Email</Label><Input value={s.user.email} onChange={e => setS({ ...s, user: { ...s.user, email: e.target.value } })} /></div>
            <div><Label>Skills (comma separated)</Label><Input value={s.user.skills.join(", ")} onChange={e => setS({ ...s, user: { ...s.user, skills: e.target.value.split(/\s*,\s*/) } })} /></div>
            <div><Label>Hours per week</Label><Input type="number" value={s.user.hours_per_week} onChange={e => setS({ ...s, user: { ...s.user, hours_per_week: parseInt(e.target.value || "0", 10) } })} /></div>
            <div><Label>Target monthly revenue (USD)</Label><Input type="number" value={s.user.target_revenue_usd} onChange={e => setS({ ...s, user: { ...s.user, target_revenue_usd: parseInt(e.target.value || "0", 10) } })} /></div>
            <div><Label>Niches of interest</Label><Input value={s.user.niches_of_interest.join(", ")} onChange={e => setS({ ...s, user: { ...s.user, niches_of_interest: e.target.value.split(/\s*,\s*/) } })} /></div>
            <div><Label>Ethical lines (comma separated)</Label><Input value={s.user.ethical_lines.join(", ")} onChange={e => setS({ ...s, user: { ...s.user, ethical_lines: e.target.value.split(/\s*,\s*/) } })} /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Scrapers ({scrapers.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {scrapers.map(sc => (
                  <div key={sc.id} className="flex items-center gap-3 text-xs py-2 px-3 rounded border border-border/40">
                    <span className={`size-2 rounded-full ${sc.status === "success" ? "bg-emerald-400" : sc.status === "error" ? "bg-red-400" : "bg-zinc-400"}`} />
                    <span className="font-medium flex-1">{sc.name}</span>
                    <span className="text-muted-foreground">{sc.schedule_cron}</span>
                    <span className="text-muted-foreground">{sc.items_last_run} items</span>
                    {sc.consecutive_errors > 0 && <Badge variant="destructive" className="text-[9px]">{sc.consecutive_errors} errors</Badge>}
                    <Switch defaultChecked={sc.is_active} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-3">
          <Card><CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tier 1 — Bulk extraction</Label>
              <Select value={s.ai_models.tier1_model} onValueChange={(v) => v && setS({ ...s, ai_models: { ...s.ai_models, tier1_model: v } })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek-v3">DeepSeek V3</SelectItem>
                  <SelectItem value="qwen-2.5">Qwen 2.5</SelectItem>
                  <SelectItem value="kimi">Kimi</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">~$0.0002/1K tokens</p>
            </div>
            <div>
              <Label>Tier 2 — Structured</Label>
              <Select value={s.ai_models.tier2_model} onValueChange={(v) => v && setS({ ...s, ai_models: { ...s.ai_models, tier2_model: v } })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="claude-haiku-4.5">Claude Haiku 4.5</SelectItem></SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">~$0.005/1K tokens</p>
            </div>
            <div>
              <Label>Tier 3 — Strategic</Label>
              <Select value={s.ai_models.tier3_model} onValueChange={(v) => v && setS({ ...s, ai_models: { ...s.ai_models, tier3_model: v } })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-sonnet-4.6">Claude Sonnet 4.6</SelectItem>
                  <SelectItem value="claude-opus-4.7">Claude Opus 4.7</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">~$0.03/1K tokens</p>
            </div>
            <div className="md:col-span-3">
              <Label>Daily budget (USD)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Slider value={[s.ai_models.daily_budget_usd]} onValueChange={(v) => setS({ ...s, ai_models: { ...s.ai_models, daily_budget_usd: Array.isArray(v) ? v[0] : v } })} min={1} max={50} step={1} className="flex-1" />
                <span className="font-mono text-sm w-16 text-right">${s.ai_models.daily_budget_usd.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">When 80% used, downgrade non-chat to Tier 1; at 100%, queue or reject.</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card><CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between"><div><Label>Breakout alerts</Label><p className="text-[10px] text-muted-foreground">Notify when a keyword goes &gt;200%</p></div><Switch checked={s.notifications.breakout_alerts} onCheckedChange={(v) => setS({ ...s, notifications: { ...s.notifications, breakout_alerts: v } })} /></div>
            <div className="flex items-center justify-between"><div><Label>New approved ideas</Label><p className="text-[10px] text-muted-foreground">When auto-scoring approves a new idea</p></div><Switch checked={s.notifications.new_approved} onCheckedChange={(v) => setS({ ...s, notifications: { ...s.notifications, new_approved: v } })} /></div>
            <div className="flex items-center justify-between"><div><Label>Scraper errors</Label><p className="text-[10px] text-muted-foreground">When a scraper fails 3+ times consecutively</p></div><Switch checked={s.notifications.scraper_errors} onCheckedChange={(v) => setS({ ...s, notifications: { ...s.notifications, scraper_errors: v } })} /></div>
            <div><Label>Digest frequency</Label>
              <Select value={s.notifications.digest_frequency} onValueChange={(v) => v && setS({ ...s, notifications: { ...s.notifications, digest_frequency: v as "none" | "daily" | "weekly" } })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Digest delivery time (local)</Label><Input type="time" value={s.notifications.digest_time_local} onChange={e => setS({ ...s, notifications: { ...s.notifications, digest_time_local: e.target.value } })} /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="export">
          <Card><CardContent className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Ideas", path: "/api/export/ideas" },
              { label: "Rules", path: "/api/export/rules" },
              { label: "Competitors", path: "/api/export/competitors" },
              { label: "Arbitrage", path: "/api/export/arbitrage" },
            ].map(e => (
              <div key={e.label} className="space-y-1.5">
                <div className="text-sm font-medium">{e.label}</div>
                <div className="flex gap-1.5">
                  <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5 text-xs">
                    <a href={`${e.path}?format=csv`} download><Download className="size-3" /> CSV</a>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5 text-xs">
                    <a href={`${e.path}?format=json`} download><FileJson className="size-3" /> JSON</a>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Daily AI cost (last 7 days)</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer>
                <BarChart data={cost_data}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="day" stroke="#888" fontSize={10} />
                  <YAxis stroke="#888" fontSize={10} tickFormatter={(v) => `$${v}`} />
                  <RTooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="tier1" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tier2" stackId="a" fill="#22d3ee" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tier3" stackId="a" fill="#e879f9" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

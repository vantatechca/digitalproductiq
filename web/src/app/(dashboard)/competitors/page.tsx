"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ExternalLink, Plus, Target, Users } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, ZAxis } from "recharts";
import { toast } from "sonner";
import { formatNumber, formatUSD } from "@/lib/utils/formatters";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/utils/constants";
import type { Competitor } from "@/types/database";
import type { GapAnalysis } from "@/types/api";

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [loadingGap, setLoadingGap] = useState(false);
  const [marketplaces, setMarketplaces] = useState<{ id: string; name: string }[]>([]);
  const [adding, setAdding] = useState(false);
  const [newComp, setNewComp] = useState({
    name: "", shop_url: "", primary_category: "productivity_systems" as Category,
    marketplace_id: "", total_products: 0, estimated_monthly_revenue_usd: 0,
    avg_product_price: 0, avg_rating: 0, follower_count: 0,
  });

  useEffect(() => {
    fetch("/api/competitors").then(r => r.json()).then(j => setCompetitors(j.data)).finally(() => setLoading(false));
    fetch("/api/marketplaces").then(r => r.json()).then(j => setMarketplaces(j.data));
  }, []);

  const submitNew = async () => {
    if (!newComp.name) { toast.error("Name required"); return; }
    const r = await fetch("/api/competitors", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newComp, niches: [], is_top_seller: false }),
    }).then(r => r.json());
    setCompetitors(prev => [r.data, ...prev]);
    setAdding(false);
    setNewComp({ name: "", shop_url: "", primary_category: "productivity_systems", marketplace_id: "", total_products: 0, estimated_monthly_revenue_usd: 0, avg_product_price: 0, avg_rating: 0, follower_count: 0 });
    toast.success("Competitor added");
  };

  const runGapAnalysis = async () => {
    setLoadingGap(true);
    const r = await fetch("/api/competitors/gap-analysis", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
    }).then(r => r.json());
    setGapAnalysis(r.data);
    setLoadingGap(false);
    toast.success("Gap analysis complete");
  };

  return (
    <div className="p-6 space-y-4 max-w-[1600px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Competitors</h1>
          <p className="text-sm text-muted-foreground mt-1">{competitors.length} competitors tracked</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runGapAnalysis} disabled={loadingGap} size="sm" variant="outline" className="gap-1.5">
            <Target className="size-3.5" /> {loadingGap ? "Analyzing…" : "Gap analysis"}
          </Button>
          <Button onClick={() => setAdding(true)} size="sm" className="gap-1.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-600"><Plus className="size-3.5" /> Add</Button>
        </div>
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Competitor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={newComp.name} onChange={e => setNewComp(c => ({ ...c, name: e.target.value }))} /></div>
            <div><Label>Shop URL</Label><Input value={newComp.shop_url} onChange={e => setNewComp(c => ({ ...c, shop_url: e.target.value }))} placeholder="https://" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Marketplace</Label>
                <Select value={newComp.marketplace_id} onValueChange={(v) => v && setNewComp(c => ({ ...c, marketplace_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pick…" /></SelectTrigger>
                  <SelectContent>
                    {marketplaces.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label>
                <Select value={newComp.primary_category} onValueChange={(v) => v && setNewComp(c => ({ ...c, primary_category: v as Category }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Total products</Label><Input type="number" value={newComp.total_products} onChange={e => setNewComp(c => ({ ...c, total_products: parseInt(e.target.value || "0", 10) }))} /></div>
              <div><Label>Est. monthly revenue</Label><Input type="number" value={newComp.estimated_monthly_revenue_usd} onChange={e => setNewComp(c => ({ ...c, estimated_monthly_revenue_usd: parseInt(e.target.value || "0", 10) }))} /></div>
              <div><Label>Avg price</Label><Input type="number" value={newComp.avg_product_price} onChange={e => setNewComp(c => ({ ...c, avg_product_price: parseFloat(e.target.value || "0") }))} /></div>
              <div><Label>Avg rating</Label><Input type="number" step="0.01" value={newComp.avg_rating} onChange={e => setNewComp(c => ({ ...c, avg_rating: parseFloat(e.target.value || "0") }))} /></div>
              <div className="col-span-2"><Label>Follower count</Label><Input type="number" value={newComp.follower_count} onChange={e => setNewComp(c => ({ ...c, follower_count: parseInt(e.target.value || "0", 10) }))} /></div>
            </div>
            <Button onClick={submitNew} className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-600">Add competitor</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scatter */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Products vs Monthly Revenue (sized by rating)</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.08)" />
              <XAxis type="number" dataKey="total_products" name="Products" stroke="#888" fontSize={10} />
              <YAxis type="number" dataKey="estimated_monthly_revenue_usd" name="Monthly Revenue" stroke="#888" fontSize={10} tickFormatter={(v) => formatUSD(v as number, { compact: true })} />
              <ZAxis type="number" dataKey="avg_rating" range={[40, 200]} />
              <RTooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                formatter={(value: unknown, name) => name === "Monthly Revenue" ? formatUSD(Number(value)) : formatNumber(Number(value))}
              />
              <Scatter data={competitors} fill="#34d399" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {loading && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
        {!loading && competitors.length === 0 && (
          <Card className="col-span-full"><CardContent className="text-center py-12 text-sm text-muted-foreground">
            <Users className="size-6 text-muted-foreground/40 mx-auto mb-2" />
            No competitors yet. Click <strong>Add</strong> to start tracking.
          </CardContent></Card>
        )}
        {!loading && competitors.map(c => (
          <CompetitorCard key={c.id} c={c} marketplaceName={marketplaces.find(m => m.id === c.marketplace_id)?.name ?? "—"} />
        ))}
      </div>

      <Sheet open={!!gapAnalysis} onOpenChange={(o) => !o && setGapAnalysis(null)}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Gap Analysis</SheetTitle>
          </SheetHeader>
          {gapAnalysis && (
            <div className="space-y-3 mt-4 px-1 pb-8">
              {gapAnalysis.gaps.map((g, i) => (
                <Card key={i} className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-[10px] mb-2">{g.type}</Badge>
                        <h4 className="text-sm font-medium">{g.title}</h4>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">opp {g.opportunity_score}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{g.description}</p>
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-300">Suggested action</span>
                      <p className="text-xs mt-0.5">{g.suggested_action}</p>
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

function CompetitorCard({ c, marketplaceName }: { c: Competitor; marketplaceName: string }) {
  const [expanded, setExpanded] = useState(false);
  const [products, setProducts] = useState<{ id: string; title: string; price_usd: number; rating: number | null; estimated_monthly_revenue_usd: number | null }[]>([]);

  const expand = async () => {
    if (!expanded) {
      const r = await fetch(`/api/competitors/${c.id}`).then(r => r.json());
      setProducts(r.data.products?.slice(0, 6) ?? []);
    }
    setExpanded(e => !e);
  };

  return (
    <Card className="hover:border-emerald-500/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium truncate">{c.name}</span>
              {c.is_top_seller && <Star className="size-3 text-amber-400 shrink-0 fill-amber-400" />}
            </div>
            <div className="text-[10px] text-muted-foreground capitalize mt-0.5">{marketplaceName}</div>
          </div>
          {c.shop_url && <a href={c.shop_url} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" /></a>}
        </div>

        <Badge variant="secondary" className="text-[10px] mt-2">{CATEGORY_LABELS[c.primary_category]}</Badge>

        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div><span className="text-[10px] uppercase text-muted-foreground">Products</span><div className="font-medium">{formatNumber(c.total_products)}</div></div>
          <div><span className="text-[10px] uppercase text-muted-foreground">Mo. revenue</span><div className="font-medium">{formatUSD(c.estimated_monthly_revenue_usd, { compact: true })}</div></div>
          <div><span className="text-[10px] uppercase text-muted-foreground">Avg price</span><div className="font-medium">{formatUSD(c.avg_product_price)}</div></div>
          <div><span className="text-[10px] uppercase text-muted-foreground">Rating</span><div className="font-medium">{c.avg_rating.toFixed(2)}</div></div>
        </div>

        <Button onClick={expand} size="sm" variant="outline" className="w-full mt-3 h-7 text-xs">
          {expanded ? "Hide" : "Show top products"}
        </Button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="flex-1 truncate">{p.title}</span>
                <span className="text-muted-foreground">{formatUSD(p.price_usd)}</span>
                <Badge variant="secondary" className="text-[9px]">{formatUSD(p.estimated_monthly_revenue_usd, { compact: true })}/mo</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

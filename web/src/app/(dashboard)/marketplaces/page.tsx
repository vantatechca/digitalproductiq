"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Store, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatNumber, formatUSD } from "@/lib/utils/formatters";
import { CATEGORY_LABELS } from "@/lib/utils/constants";
import type { Marketplace } from "@/types/database";

interface MarketplaceWithStats extends Marketplace {
  total_products_tracked: number;
  total_revenue_tracked_usd: number;
  top_sellers_count: number;
  competitors_count: number;
}

export default function MarketplacesPage() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newMp, setNewMp] = useState({ slug: "", name: "", url: "", primary_categories: "", takes_pct: 0 });

  useEffect(() => {
    fetch("/api/marketplaces").then(r => r.json()).then(j => setMarketplaces(j.data)).finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!newMp.slug || !newMp.name || !newMp.url) { toast.error("Fill slug, name, url"); return; }
    const r = await fetch("/api/marketplaces", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: newMp.slug,
        name: newMp.name,
        url: newMp.url,
        primary_categories: newMp.primary_categories.split(/\s*,\s*/).filter(Boolean),
        takes_pct: Number(newMp.takes_pct) || 0,
        scrape_frequency_minutes: 720,
      }),
    }).then(r => r.json());
    setMarketplaces(prev => [{ ...r.data, total_products_tracked: 0, total_revenue_tracked_usd: 0, top_sellers_count: 0, competitors_count: 0 }, ...prev]);
    setAdding(false);
    setNewMp({ slug: "", name: "", url: "", primary_categories: "", takes_pct: 0 });
    toast.success("Custom marketplace added");
  };

  return (
    <div className="p-6 space-y-4 max-w-[1600px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marketplaces</h1>
          <p className="text-sm text-muted-foreground mt-1">{marketplaces.length} marketplaces tracked across all digital product categories</p>
        </div>
        <Button onClick={() => setAdding(true)} size="sm" variant="outline" className="gap-1"><Plus className="size-3.5" /> Add custom</Button>
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add custom marketplace</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Slug</Label><Input value={newMp.slug} onChange={e => setNewMp(m => ({ ...m, slug: e.target.value }))} placeholder="e.g. shopify_apps" /></div>
            <div><Label>Display name</Label><Input value={newMp.name} onChange={e => setNewMp(m => ({ ...m, name: e.target.value }))} placeholder="Shopify Apps" /></div>
            <div><Label>URL</Label><Input value={newMp.url} onChange={e => setNewMp(m => ({ ...m, url: e.target.value }))} placeholder="https://apps.shopify.com" /></div>
            <div><Label>Primary categories (comma-separated)</Label><Input value={newMp.primary_categories} onChange={e => setNewMp(m => ({ ...m, primary_categories: e.target.value }))} placeholder="software_tools, business_templates" /></div>
            <div><Label>Take rate %</Label><Input type="number" value={newMp.takes_pct} onChange={e => setNewMp(m => ({ ...m, takes_pct: parseFloat(e.target.value || "0") }))} /></div>
            <Button onClick={submit} className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-600">Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {loading && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
        {!loading && marketplaces.map(m => (
          <Link key={m.id} href={`/marketplaces/${m.slug}`} className="block">
          <Card className="hover:border-emerald-500/30 transition-colors h-full">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 grid place-items-center">
                    <Store className="size-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{m.slug}</div>
                  </div>
                </div>
                <a href={m.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-muted-foreground hover:text-foreground">
                  <ExternalLink className="size-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <Stat label="Products" value={formatNumber(m.total_products_tracked)} />
                <Stat label="Revenue" value={formatUSD(m.total_revenue_tracked_usd, { compact: true })} />
                <Stat label="Top sellers" value={m.top_sellers_count.toString()} />
                <Stat label="Tracked" value={`${m.competitors_count} comp`} />
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {m.primary_categories.slice(0, 2).map(c => (
                  <Badge key={c} variant="secondary" className="text-[9px]">{CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c}</Badge>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
                <span>Take {m.takes_pct}%</span>
                <span>·</span>
                <span>Every {m.scrape_frequency_minutes ? `${Math.round((m.scrape_frequency_minutes ?? 0) / 60)}h` : "—"}</span>
                <span>·</span>
                <span>{m.is_active ? <span className="text-emerald-400">● active</span> : <span className="text-zinc-500">○ off</span>}</span>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink, Star, Store, RefreshCw, Users, Package, DollarSign } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { CATEGORY_LABELS } from "@/lib/utils/constants";
import { formatNumber, formatUSD, timeAgo } from "@/lib/utils/formatters";
import type { Competitor, CompetitorProduct, Marketplace } from "@/types/database";

interface MarketplaceDetail extends Marketplace {
  total_products_tracked: number;
  total_revenue_tracked_usd: number;
  top_sellers: Competitor[];
  trending_products: CompetitorProduct[];
  competitors_count: number;
}

export default function MarketplaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<MarketplaceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/marketplaces/${slug}`).then(r => r.json()).then(j => setData(j.data)).finally(() => setLoading(false));
  }, [slug]);

  const triggerScrape = async () => {
    const promise = fetch(`/api/scrapers/${slug}/run`, { method: "POST" }).then(r => r.json());
    toast.promise(promise, { loading: `Triggering ${slug} scrape…`, success: "Scraper queued", error: "Failed" });
  };

  if (loading) return <div className="p-6 space-y-4 max-w-[1400px]"><Skeleton className="h-32 w-full" /><Skeleton className="h-96 w-full" /></div>;
  if (!data) return <div className="p-6">Marketplace not found.</div>;

  // Build a price distribution from trending products
  const buckets = ["0-10","10-30","30-79","79-199","199+"];
  const priceDistribution = buckets.map(b => {
    const [lo, hi] = b.includes("+") ? [199, 99999] : b.split("-").map(Number);
    return { bucket: b, count: data.trending_products.filter(p => p.price_usd >= lo && p.price_usd < hi).length };
  });

  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      <Link href="/marketplaces" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3" /> All marketplaces
      </Link>

      {/* Hero */}
      <Card>
        <CardContent className="p-6 flex items-start gap-5">
          <div className="size-14 rounded-xl bg-emerald-500/15 border border-emerald-500/30 grid place-items-center">
            <Store className="size-6 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
                <a href={data.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-emerald-300 inline-flex items-center gap-1 mt-1">
                  {data.url} <ExternalLink className="size-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <Button onClick={triggerScrape} size="sm" variant="outline" className="gap-1.5"><RefreshCw className="size-3.5" /> Run scrape</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              <Stat icon={<Package className="size-3.5" />} label="Products tracked" value={formatNumber(data.total_products_tracked)} />
              <Stat icon={<DollarSign className="size-3.5" />} label="Revenue tracked" value={formatUSD(data.total_revenue_tracked_usd, { compact: true })} />
              <Stat icon={<Users className="size-3.5" />} label="Competitors" value={String(data.competitors_count)} />
              <Stat icon={<Star className="size-3.5" />} label="Top sellers" value={String(data.top_sellers.length)} />
              <Stat icon={<RefreshCw className="size-3.5" />} label="Take rate" value={`${data.takes_pct ?? 0}%`} />
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {data.primary_categories.map(c => (
                <Badge key={c} variant="secondary" className="text-[10px]">{CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c}</Badge>
              ))}
            </div>

            {data.notes && <p className="text-xs text-muted-foreground mt-3 italic">{data.notes}</p>}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="top_sellers">
        <TabsList>
          <TabsTrigger value="top_sellers">Top Sellers ({data.top_sellers.length})</TabsTrigger>
          <TabsTrigger value="trending">Trending Products ({data.trending_products.length})</TabsTrigger>
          <TabsTrigger value="distribution">Price Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="top_sellers" className="space-y-2">
          {data.top_sellers.length === 0 && <Card><CardContent className="p-6 text-sm text-muted-foreground text-center">No top sellers tracked yet.</CardContent></Card>}
          {data.top_sellers.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <Star className="size-4 text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[c.primary_category]} · {formatNumber(c.follower_count)} followers</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-medium">{formatUSD(c.estimated_monthly_revenue_usd, { compact: true })}/mo</div>
                  <div className="text-[10px] text-muted-foreground">{formatNumber(c.total_products)} products · {c.avg_rating.toFixed(2)}★</div>
                </div>
                {c.shop_url && (
                  <a href={c.shop_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground shrink-0">
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trending" className="space-y-2">
          {data.trending_products.length === 0 && <Card><CardContent className="p-6 text-sm text-muted-foreground text-center">No trending products tracked yet.</CardContent></Card>}
          {data.trending_products.slice(0, 12).map(p => (
            <Card key={p.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground mt-0.5">
                    <span>{formatUSD(p.price_usd)}</span>
                    {p.rating !== null && <span>{p.rating.toFixed(2)}★ ({formatNumber(p.review_count)})</span>}
                    {p.estimated_monthly_revenue_usd !== null && <span className="text-emerald-400">{formatUSD(p.estimated_monthly_revenue_usd, { compact: true })}/mo</span>}
                    {p.estimated_monthly_sales !== null && <span>{formatNumber(p.estimated_monthly_sales)} sales/mo</span>}
                    <span>{timeAgo(p.collected_at)}</span>
                  </div>
                </div>
                {p.external_url && (
                  <a href={p.external_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground shrink-0">
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Price distribution across tracked products</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer>
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="bucket" stroke="#888" fontSize={10} />
                  <YAxis stroke="#888" fontSize={10} />
                  <RTooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#34d399" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">{icon} {label}</span>
      <span className="text-sm font-medium mt-0.5">{value}</span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ExternalLink, Recycle, Package } from "lucide-react";
import { toast } from "sonner";
import { ARBITRAGE_TYPE_LABELS, type ArbitrageSourceType } from "@/lib/utils/constants";
import { formatUSD } from "@/lib/utils/formatters";
import { scoreBg, scoreColor } from "@/lib/utils/scoring";
import type { ArbitrageSource } from "@/types/database";
import type { RepackageSuggestion } from "@/types/api";

const TABS: (ArbitrageSourceType | "all")[] = ["all","plr","mrr","white_label","cc0","public_domain","royalty_free","open_source"];

export default function ArbitragePage() {
  const [sources, setSources] = useState<ArbitrageSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ArbitrageSourceType | "all">("all");
  const [repackage, setRepackage] = useState<RepackageSuggestion | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab !== "all") params.set("source_type", tab);
    fetch(`/api/arbitrage/sources?${params}`).then(r => r.json()).then(j => setSources(j.data)).finally(() => setLoading(false));
  }, [tab]);

  const suggestRepackage = async (source_id: string) => {
    const r = await fetch("/api/arbitrage/repackage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_id, target_marketplace: "etsy" }),
    }).then(r => r.json());
    setRepackage(r.data);
    toast.success("Repackage suggestion ready");
  };

  return (
    <div className="p-6 space-y-4 max-w-[1600px]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reseller / Arbitrage Finder</h1>
        <p className="text-sm text-muted-foreground mt-1">PLR, MRR, white-label, CC0, public domain, open source — sources you can repackage and sell.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ArbitrageSourceType | "all")}>
        <TabsList className="flex-wrap h-auto">
          {TABS.map(t => (
            <TabsTrigger key={t} value={t} className="text-xs capitalize">
              {t === "all" ? "All" : ARBITRAGE_TYPE_LABELS[t]?.split(" ")[0] ?? t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
            {!loading && sources.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3"><CardContent className="text-center py-12 text-sm text-muted-foreground">
                <Recycle className="size-6 text-muted-foreground/40 mx-auto mb-2" />
                No sources match this filter. Try a different license type.
              </CardContent></Card>
            )}
            {!loading && sources.map(s => (
              <Card key={s.id} className="hover:border-emerald-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-2">{s.product_title}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Badge variant="secondary" className="text-[9px]">{s.source_type.toUpperCase()}</Badge>
                        <Badge variant="outline" className="text-[9px]">{s.source_platform}</Badge>
                      </div>
                    </div>
                    {s.est_arbitrage_potential !== null && (
                      <div className={`shrink-0 px-2 py-1 rounded text-xs font-mono border ${scoreBg(s.est_arbitrage_potential)}`}>
                        {s.est_arbitrage_potential}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Cost</span>
                      <div className="font-medium">{formatUSD(s.cost_usd)}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Format</span>
                      <div className="font-medium">{s.format ?? "—"}</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">License: {s.license_summary}</p>

                  {s.notes && <p className="text-[11px] text-amber-300 mt-1">{s.notes}</p>}

                  <div className="flex gap-1.5 mt-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1" onClick={() => suggestRepackage(s.id)}>
                      <Package className="size-3" /> Repackage
                    </Button>
                    {s.product_url && (
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
                        <a href={s.product_url} target="_blank" rel="noreferrer"><ExternalLink className="size-3" /> Source</a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={!!repackage} onOpenChange={(o) => !o && setRepackage(null)}>
        <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Recycle className="size-4 text-emerald-400" /> Repackage Suggestion</SheetTitle>
          </SheetHeader>
          {repackage && (
            <div className="space-y-4 mt-4 px-1 pb-8">
              <Card><CardContent className="p-4 space-y-2">
                <div><span className="text-[10px] uppercase text-muted-foreground tracking-wider">New title</span><p className="text-sm font-medium">{repackage.new_title}</p></div>
                <div><span className="text-[10px] uppercase text-muted-foreground tracking-wider">New audience</span><p className="text-xs">{repackage.new_audience}</p></div>
                <div><span className="text-[10px] uppercase text-muted-foreground tracking-wider">New price</span><p className="text-sm font-medium text-emerald-300">{formatUSD(repackage.new_price_usd)}</p></div>
                <div><span className="text-[10px] uppercase text-muted-foreground tracking-wider">Target marketplace</span><p className="text-xs capitalize">{repackage.target_marketplace}</p></div>
              </CardContent></Card>

              <Card><CardContent className="p-4">
                <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Marketing angle</span>
                <p className="text-xs mt-1">{repackage.marketing_angle}</p>
              </CardContent></Card>

              <Card className={repackage.compliance_check.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}>
                <CardContent className="p-4">
                  <span className="text-[10px] uppercase tracking-wider">Compliance: {repackage.compliance_check.ok ? "✓ OK" : "⚠ Review"}</span>
                  <p className="text-xs mt-1">{repackage.compliance_check.notes}</p>
                </CardContent>
              </Card>

              <Card><CardContent className="p-4">
                <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Estimated monthly revenue</span>
                <p className="text-xl font-semibold text-emerald-300 mt-1">{formatUSD(repackage.estimated_monthly_revenue_usd)}</p>
              </CardContent></Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

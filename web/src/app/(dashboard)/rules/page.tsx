"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Plus, Trash2, Check, X, Shield, Brain } from "lucide-react";
import { toast } from "sonner";
import { RULE_TYPES, RULE_DIRECTIONS } from "@/lib/utils/constants";
import type { GoldenRule } from "@/types/database";

const TABS = [
  { value: "all", label: "All" },
  { value: "must_have", label: "Must Have" },
  { value: "must_avoid", label: "Must Avoid" },
  { value: "prefer", label: "Prefer" },
  { value: "deprioritize", label: "Deprioritize" },
  { value: "ai_suggested", label: "AI Suggested" },
];

export default function RulesPage() {
  const [rules, setRules] = useState<GoldenRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState({ rule_type: "category", direction: "prefer", rule_text: "", weight: 1.0 });

  useEffect(() => {
    fetch("/api/rules").then(r => r.json()).then(j => setRules(j.data)).finally(() => setLoading(false));
  }, []);

  const filtered = rules.filter(r => {
    if (tab === "all") return true;
    if (tab === "ai_suggested") return r.source === "ai_suggested";
    return r.direction === tab;
  });

  const toggleActive = async (id: string, active: boolean) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active } : r));
    await fetch(`/api/rules/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    toast.success(active ? "Rule activated" : "Rule deactivated");
  };

  const updateWeight = async (id: string, weight: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, weight } : r));
    await fetch(`/api/rules/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight }),
    });
  };

  const removeRule = async (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    await fetch(`/api/rules/${id}`, { method: "DELETE" });
    toast.success("Rule deleted");
  };

  const approveAi = async (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: true, source: "manual" as const } : r));
    await fetch(`/api/rules/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true, source: "manual" }),
    });
    toast.success("AI rule approved & activated");
  };

  const suggestMore = async () => {
    const r = await fetch("/api/rules/suggest", { method: "POST" }).then(r => r.json());
    toast.success(`${r.data.suggestions.length} new rule suggestions ready`);
  };

  const createRule = async () => {
    const r = await fetch("/api/rules", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newRule, conditions: {}, active: true }),
    }).then(r => r.json());
    setRules(prev => [r.data, ...prev]);
    setAdding(false);
    setNewRule({ rule_type: "category", direction: "prefer", rule_text: "", weight: 1.0 });
    toast.success("Rule created");
  };

  return (
    <div className="p-6 space-y-4 max-w-[1600px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Golden Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">{rules.length} rules · {rules.filter(r => r.active).length} active</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={suggestMore} size="sm" variant="outline" className="gap-1.5"><Sparkles className="size-3.5" /> Suggest more</Button>
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[0.8rem] font-medium bg-emerald-500 text-zinc-950 hover:bg-emerald-600 transition-colors"><Plus className="size-3.5" /> Add rule</DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Rule</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><label className="text-xs">Type</label>
                  <Select value={newRule.rule_type} onValueChange={(v) => v && setNewRule(r => ({ ...r, rule_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RULE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><label className="text-xs">Direction</label>
                  <Select value={newRule.direction} onValueChange={(v) => v && setNewRule(r => ({ ...r, direction: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RULE_DIRECTIONS.map(d => <SelectItem key={d} value={d}>{d.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><label className="text-xs">Rule text</label>
                  <Textarea value={newRule.rule_text} onChange={e => setNewRule(r => ({ ...r, rule_text: e.target.value }))} placeholder="Prefer ideas with…" rows={2} />
                </div>
                <Button onClick={createRule} className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-600">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          {TABS.map(t => <TabsTrigger key={t.value} value={t.value} className="text-xs">{t.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-2">
          {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          {!loading && filtered.length === 0 && (
            <Card><CardContent className="text-center py-12 text-sm text-muted-foreground">
              <Shield className="size-6 text-muted-foreground/40 mx-auto mb-2" />
              No rules in this filter.
              {tab === "ai_suggested" && (
                <p className="text-[11px] mt-1">Click <strong>Suggest more</strong> above to generate AI-suggested rules from your decision history.</p>
              )}
            </CardContent></Card>
          )}
          {!loading && filtered.map(r => {
            const isAi = r.source === "ai_suggested" && !r.active;
            return (
              <Card key={r.id} className={isAi ? "border-dashed border-violet-500/50 bg-violet-500/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className={`size-4 mt-0.5 ${r.direction === "must_have" ? "text-emerald-400" : r.direction === "must_avoid" ? "text-red-400" : r.direction === "prefer" ? "text-cyan-400" : "text-amber-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{r.rule_text}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <Badge variant="secondary" className="text-[10px]">{r.rule_type}</Badge>
                            <Badge variant="outline" className="text-[10px]">{r.direction.replace("_", " ")}</Badge>
                            {isAi && <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/40 text-[10px] gap-1"><Sparkles className="size-2.5" /> AI Suggested</Badge>}
                            <span className="text-[10px] text-muted-foreground">applied {r.applied_count}×</span>
                          </div>
                          {isAi && r.ai_reasoning && (
                            <div className="mt-2 p-2 rounded bg-violet-500/10 border border-violet-500/30 flex items-start gap-2">
                              <Brain className="size-3 text-violet-400 mt-0.5 shrink-0" />
                              <p className="text-[11px] text-violet-200">{r.ai_reasoning}</p>
                              {r.ai_confidence && <Badge className="bg-violet-500/30 text-violet-200 text-[9px]">{(r.ai_confidence * 100).toFixed(0)}%</Badge>}
                            </div>
                          )}
                        </div>

                        {isAi ? (
                          <div className="flex gap-1.5 shrink-0">
                            <Button size="sm" onClick={() => approveAi(r.id)} className="h-7 text-xs gap-1 bg-emerald-500 text-zinc-950 hover:bg-emerald-600">
                              <Check className="size-3" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => removeRule(r.id)} className="h-7 text-xs gap-1">
                              <X className="size-3" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>Weight</span>
                              <Slider value={[r.weight]} onValueChange={(v) => updateWeight(r.id, Array.isArray(v) ? v[0] : v)} min={0} max={2} step={0.1} className="w-20" />
                              <span className="font-mono w-6 text-right">{r.weight.toFixed(1)}</span>
                            </div>
                            <Switch checked={r.active} onCheckedChange={(v) => toggleActive(r.id, v)} />
                            <Button size="icon" variant="ghost" onClick={() => removeRule(r.id)} className="size-7"><Trash2 className="size-3.5" /></Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

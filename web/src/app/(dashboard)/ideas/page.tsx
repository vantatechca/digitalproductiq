"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Star, Check, X, Archive, MessageCircle, FileText, TrendingUp,
  TrendingDown, Minus, Sparkles, Clock, Users, DollarSign, CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  STATUSES, STATUS_LABELS, STATUS_COLORS, CATEGORIES, CATEGORY_LABELS,
  PRODUCT_FORMATS, BUILD_PATHS, BUILD_PATH_LABELS, TREND_COLORS,
  type Status,
} from "@/lib/utils/constants";
import { scoreBg, scoreBarColor, scoreColor } from "@/lib/utils/scoring";
import { formatUSD, formatNumber, timeAgo, humanize } from "@/lib/utils/formatters";
import type { Idea } from "@/types/database";

const SORT_OPTIONS = [
  { value: "score", label: "Composite score" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "signals", label: "Signal volume" },
  { value: "revenue_potential", label: "Revenue potential" },
];

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [productFormat, setProductFormat] = useState<string>("all");
  const [buildPath, setBuildPath] = useState<string>("all");
  const [sort, setSort] = useState("score");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ total: number; total_pages: number } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tags").then(r => r.json()).then(j => setTags(j.data ?? []));
  }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === ideas.length) setSelected(new Set());
    else setSelected(new Set(ideas.map(i => i.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const bulkAction = async (action: string, label: string) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const promise = fetch("/api/ideas/bulk-feedback", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea_ids: ids, action }),
    }).then(r => r.json());
    toast.promise(promise, {
      loading: `Applying "${label}" to ${ids.length}…`,
      success: `${ids.length} ${label.toLowerCase()}`,
      error: "Bulk action failed",
    });
    await promise;
    const status_map: Record<string, string> = {
      approve: "approved", decline: "declined", star: "starred", archive: "archived",
    };
    if (status_map[action]) {
      setIdeas(prev => prev.map(i => ids.includes(i.id) ? { ...i, status: status_map[action] as Status } : i));
    }
    clearSelection();
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      status, category, product_format: productFormat, build_path: buildPath, sort,
      search: debouncedSearch, page: String(page), limit: "20",
    });
    fetch(`/api/ideas?${params}`)
      .then(r => r.json())
      .then(j => { setIdeas(j.data); setMeta(j.meta); })
      .finally(() => setLoading(false));
  }, [status, category, productFormat, buildPath, sort, debouncedSearch, page]);

  const statusCounts = useMemo(() => {
    const out: Record<string, number> = { all: 0 };
    return out;
  }, []);

  const updateStatus = async (id: string, action: string, label: string) => {
    const opt = await fetch(`/api/ideas/${id}/feedback`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).then(r => r.json());
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: opt.data.status } : i));
    toast.success(`${label} ✓`);
  };

  return (
    <div className="p-6 space-y-4 max-w-[1600px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ideas</h1>
          <p className="text-sm text-muted-foreground mt-1">{meta?.total ?? "—"} opportunities across all niches</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/api/export/ideas?format=csv" download>Export CSV</Link>
        </Button>
      </div>

      {/* Bulk action bar — appears when selection > 0 */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 backdrop-blur-md">
          <CheckSquare className="size-4 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-200">{selected.size} selected</span>
          <span className="flex-1" />
          <Button size="sm" variant="outline" onClick={() => bulkAction("approve", "Approved")} className="h-7 text-xs gap-1 border-emerald-500/40"><Check className="size-3" /> Approve</Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction("star", "Starred")} className="h-7 text-xs gap-1"><Star className="size-3" /> Star</Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction("decline", "Declined")} className="h-7 text-xs gap-1"><X className="size-3" /> Decline</Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction("archive", "Archived")} className="h-7 text-xs gap-1"><Archive className="size-3" /> Archive</Button>
          <Button size="sm" variant="ghost" onClick={clearSelection} className="h-7 text-xs">Clear</Button>
        </div>
      )}

      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5">
        <StatusPill active={status === "all"} onClick={() => setStatus("all")} label="All" count={statusCounts.all} />
        {STATUSES.map(s => (
          <StatusPill key={s} active={status === s} onClick={() => setStatus(s)} label={STATUS_LABELS[s]} count={statusCounts[s]} />
        ))}
      </div>

      {/* Tag chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase text-muted-foreground tracking-wider mr-1">Tags</span>
          {tags.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTag(activeTag === t.id ? null : t.id)}
              className="text-[11px] h-6 px-2 rounded-full border transition-colors"
              style={{
                borderColor: activeTag === t.id ? t.color : `${t.color}55`,
                background: activeTag === t.id ? `${t.color}22` : "transparent",
                color: activeTag === t.id ? t.color : `${t.color}cc`,
              }}
            >
              {t.name}
            </button>
          ))}
          {activeTag && (
            <button onClick={() => setActiveTag(null)} className="text-[10px] text-muted-foreground hover:text-foreground ml-1">
              clear
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-3 grid grid-cols-1 md:grid-cols-5 gap-2">
          <Input placeholder="Search ideas, niches…" value={search} onChange={e => setSearch(e.target.value)} className="md:col-span-1" />
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={productFormat} onValueChange={(v) => v && setProductFormat(v)}>
            <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All formats</SelectItem>
              {PRODUCT_FORMATS.map(f => <SelectItem key={f} value={f}>{humanize(f)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={buildPath} onValueChange={(v) => v && setBuildPath(v)}>
            <SelectTrigger><SelectValue placeholder="Build path" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All build paths</SelectItem>
              {BUILD_PATHS.map(b => <SelectItem key={b} value={b}>{BUILD_PATH_LABELS[b]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => v && setSort(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Select all bar */}
      {!loading && ideas.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <Checkbox
            checked={selected.size > 0 && selected.size === ideas.length}
            onCheckedChange={toggleSelectAll}
          />
          <span>Select all on this page ({ideas.length})</span>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
        {!loading && ideas.length === 0 && (
          <Card><CardContent className="text-center py-16 text-sm text-muted-foreground">
            <Sparkles className="size-6 text-muted-foreground/40 mx-auto mb-2" />
            No ideas match these filters. Try widening the search or clearing a filter.
          </CardContent></Card>
        )}
        {!loading && ideas.map(i => (
          <IdeaCard
            key={i.id}
            idea={i}
            onAction={updateStatus}
            selected={selected.has(i.id)}
            onToggleSelect={() => toggleSelect(i.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">Page {page} of {meta.total_pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === meta.total_pages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs h-7 px-3 rounded-full border transition-colors ${active ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" : "border-border text-muted-foreground hover:bg-accent"}`}
    >
      {label}{count !== undefined && count > 0 && <span className="ml-1.5 opacity-60">{count}</span>}
    </button>
  );
}

function IdeaCard({ idea, onAction, selected, onToggleSelect }: { idea: Idea; onAction: (id: string, action: string, label: string) => void; selected: boolean; onToggleSelect: () => void }) {
  const dir = idea.trend_direction;
  const TrendIcon = dir === "rising" || dir === "breakout" ? TrendingUp : dir === "declining" ? TrendingDown : Minus;
  return (
    <Card className={`hover:border-emerald-500/30 transition-colors ${selected ? "border-emerald-500/40 bg-emerald-500/5" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Selection checkbox */}
          <div className="pt-2 shrink-0">
            <Checkbox checked={selected} onCheckedChange={onToggleSelect} />
          </div>

          {/* Score badge */}
          <Link href={`/ideas/${idea.id}`} className={`shrink-0 w-16 h-16 rounded-xl border-2 grid place-items-center font-mono font-bold text-2xl ${scoreBg(idea.composite_score)} hover:scale-105 transition-transform`}>
            {idea.composite_score.toFixed(0)}
          </Link>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3">
              <Link href={`/ideas/${idea.id}`} className="font-medium text-foreground hover:text-emerald-300 transition-colors">
                {idea.title}
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <Badge className={STATUS_COLORS[idea.status]}>{STATUS_LABELS[idea.status]}</Badge>
                {idea.compliance_flag !== "green" && <span className={`size-2 rounded-full ${idea.compliance_flag === "red" ? "bg-red-400" : "bg-amber-400"}`} title={`Compliance: ${idea.compliance_flag}`} />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{idea.summary}</p>

            {/* Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Chip>{CATEGORY_LABELS[idea.category]}</Chip>
              <Chip>{humanize(idea.product_format)}</Chip>
              <Chip variant="violet">{BUILD_PATH_LABELS[idea.build_path]}</Chip>
              {idea.target_audience.slice(0, 2).map(a => <Chip key={a} variant="muted">{humanize(a)}</Chip>)}
            </div>

            {/* Metrics row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-muted-foreground">
              <span className={`flex items-center gap-1 ${TREND_COLORS[idea.trend_direction]}`}>
                <TrendIcon className="size-3" /> {humanize(idea.trend_direction)} {idea.trend_velocity_pct >= 0 ? "+" : ""}{idea.trend_velocity_pct}%
              </span>
              <span className="flex items-center gap-1"><Sparkles className="size-3" /> {idea.signals_count} signals</span>
              <span className="flex items-center gap-1"><Users className="size-3" /> {formatNumber(idea.competitor_count)} comp</span>
              <span className="flex items-center gap-1"><DollarSign className="size-3" /> {formatUSD(idea.median_price_usd)} med</span>
              <span className="flex items-center gap-1"><Clock className="size-3" /> {idea.build_effort_hours_min}-{idea.build_effort_hours_max}h</span>
              <span>est {formatUSD(idea.estimated_monthly_revenue_low_usd, { compact: true })}-{formatUSD(idea.estimated_monthly_revenue_high_usd, { compact: true })}/mo</span>
              <span className="ml-auto">{timeAgo(idea.discovered_at)}</span>
            </div>

            {/* Sub-score bars */}
            <div className="grid grid-cols-5 gap-2 mt-3">
              <ScoreBar label="Trend" v={idea.trend_score} />
              <ScoreBar label="Demand" v={idea.demand_score} />
              <ScoreBar label="Comp" v={idea.competition_score} />
              <ScoreBar label="Feas" v={idea.feasibility_score} />
              <ScoreBar label="Rev" v={idea.revenue_potential_score} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 mt-3">
              {idea.status !== "approved" && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-500/40 hover:bg-emerald-500/10" onClick={() => onAction(idea.id, "approve", "Approved")}>
                  <Check className="size-3" /> Approve
                </Button>
              )}
              {idea.status !== "declined" && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction(idea.id, "decline", "Declined")}>
                  <X className="size-3" /> Decline
                </Button>
              )}
              {idea.status !== "starred" && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction(idea.id, "star", "Starred")}>
                  <Star className="size-3" /> Star
                </Button>
              )}
              {idea.status !== "archived" && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction(idea.id, "archive", "Archived")}>
                  <Archive className="size-3" /> Archive
                </Button>
              )}
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs gap-1 ml-auto">
                <Link href={`/ideas/${idea.id}#chat`}><MessageCircle className="size-3" /> Chat</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs gap-1">
                <Link href={`/ideas/${idea.id}#build`}><FileText className="size-3" /> Build plan</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Chip({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "violet" | "muted" }) {
  const cls = variant === "violet" ? "bg-violet-500/10 text-violet-300 border-violet-500/30"
    : variant === "muted" ? "bg-muted/40 text-muted-foreground border-border"
    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cls}`}>{children}</span>;
}

function ScoreBar({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
        <span>{label}</span>
        <span className={scoreColor(v)}>{v.toFixed(0)}</span>
      </div>
      <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
        <div className={`h-full rounded-full ${scoreBarColor(v)}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

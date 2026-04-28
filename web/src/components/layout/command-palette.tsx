"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, Lightbulb, Brain, TrendingUp, Store,
  Users, Recycle, Shield, Workflow, Settings as SettingsIcon,
  Zap, Flame, Sparkles, Activity, Scale,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect as useEff, useState } from "react";
import type { Idea } from "@/types/database";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void; }) {
  const router = useRouter();
  const [recent, setRecent] = useState<Idea[]>([]);

  useEff(() => {
    if (!open) return;
    fetch("/api/ideas?sort=score&limit=5").then(r => r.json()).then(j => setRecent(j.data ?? [])).catch(() => {});
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  const action = async (label: string, fn: () => Promise<void> | void) => {
    onOpenChange(false);
    try {
      await fn();
    } catch {
      toast.error(`Failed: ${label}`);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or type a command…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}><LayoutDashboard className="size-4 mr-2" /> Dashboard</CommandItem>
          <CommandItem onSelect={() => go("/ideas")}><Lightbulb className="size-4 mr-2" /> Ideas</CommandItem>
          <CommandItem onSelect={() => go("/brain")}><Brain className="size-4 mr-2" /> Brain</CommandItem>
          <CommandItem onSelect={() => go("/trends")}><TrendingUp className="size-4 mr-2" /> Trends</CommandItem>
          <CommandItem onSelect={() => go("/marketplaces")}><Store className="size-4 mr-2" /> Marketplaces</CommandItem>
          <CommandItem onSelect={() => go("/competitors")}><Users className="size-4 mr-2" /> Competitors</CommandItem>
          <CommandItem onSelect={() => go("/arbitrage")}><Recycle className="size-4 mr-2" /> Arbitrage</CommandItem>
          <CommandItem onSelect={() => go("/rules")}><Shield className="size-4 mr-2" /> Rules</CommandItem>
          <CommandItem onSelect={() => go("/pipeline")}><Workflow className="size-4 mr-2" /> Pipeline</CommandItem>
          <CommandItem onSelect={() => go("/settings")}><SettingsIcon className="size-4 mr-2" /> Settings</CommandItem>
          <CommandItem onSelect={() => go("/compliance")}><Scale className="size-4 mr-2" /> Compliance</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => action("Run Full Scrape", async () => {
            const promise = fetch("/api/scrapers/all/run", { method: "POST" }).then(r => r.json());
            toast.promise(promise, { loading: "Running full scrape…", success: "Scrape complete", error: "Scrape failed" });
          })}>
            <Zap className="size-4 mr-2 text-emerald-400" /> Run Full Scrape
          </CommandItem>
          <CommandItem onSelect={() => action("Show Today's Best", () => router.push("/ideas?sort=score"))}>
            <Flame className="size-4 mr-2 text-amber-400" /> Show Today's Best
          </CommandItem>
          <CommandItem onSelect={() => action("Breakout Alerts", () => router.push("/trends?filter=breakout"))}>
            <Sparkles className="size-4 mr-2 text-fuchsia-400" /> Breakout Alerts
          </CommandItem>
          <CommandItem onSelect={() => action("Open Brain", () => router.push("/brain"))}>
            <Brain className="size-4 mr-2 text-cyan-400" /> Ask the Brain
          </CommandItem>
          <CommandItem onSelect={() => action("View Activity", () => router.push("/?tab=activity"))}>
            <Activity className="size-4 mr-2" /> View Activity
          </CommandItem>
        </CommandGroup>
        {recent.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Ideas">
              {recent.map((i) => (
                <CommandItem key={i.id} onSelect={() => go(`/ideas/${i.id}`)}>
                  <Lightbulb className="size-4 mr-2" />
                  <span className="truncate">{i.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{i.composite_score.toFixed(0)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

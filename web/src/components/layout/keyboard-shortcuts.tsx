"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

const SHORTCUTS = [
  { keys: ["?"], desc: "Show keyboard shortcuts (this dialog)" },
  { keys: ["⌘", "K"], desc: "Open command palette" },
  { keys: ["⌘", "/"], desc: "Toggle Brain panel" },
  { keys: ["G", "D"], desc: "Go to Dashboard" },
  { keys: ["G", "I"], desc: "Go to Ideas" },
  { keys: ["G", "B"], desc: "Go to Brain" },
  { keys: ["G", "T"], desc: "Go to Trends" },
  { keys: ["G", "P"], desc: "Go to Pipeline" },
  { keys: ["G", "R"], desc: "Go to Rules" },
  { keys: ["Esc"], desc: "Close any open panel/dialog" },
  { keys: ["A"], desc: "Approve focused idea (in Ideas list)" },
  { keys: ["S"], desc: "Star focused idea" },
  { keys: ["X"], desc: "Decline focused idea" },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const [chord, setChord] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if (e.key === "?" && (e.shiftKey || e.metaKey)) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (chord === "g") {
        if (e.key === "d") window.location.href = "/";
        else if (e.key === "i") window.location.href = "/ideas";
        else if (e.key === "b") window.location.href = "/brain";
        else if (e.key === "t") window.location.href = "/trends";
        else if (e.key === "p") window.location.href = "/pipeline";
        else if (e.key === "r") window.location.href = "/rules";
        else if (e.key === "s") window.location.href = "/settings";
        else if (e.key === "m") window.location.href = "/marketplaces";
        else if (e.key === "c") window.location.href = "/competitors";
        else if (e.key === "a") window.location.href = "/arbitrage";
        setChord(null);
        return;
      }
      if (e.key === "g") {
        setChord("g");
        setTimeout(() => setChord(null), 1200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chord]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Keyboard className="size-4 text-emerald-400" /> Keyboard shortcuts</DialogTitle>
          <DialogDescription>Move around without leaving your keyboard.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 mt-2">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-b-0">
              <span className="text-muted-foreground">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, ki) => (
                  <kbd key={ki} className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded bg-muted border border-border text-[10px] font-mono">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, Send, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/brain/markdown-renderer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

const QUICK = [
  { cmd: "/suggest", label: "Top picks for me" },
  { cmd: "/trending", label: "What's hot" },
  { cmd: "/build-this-weekend", label: "Weekend build" },
];

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "assistant", content: "Hi — I'm your **digital product opportunity brain**. Ask me anything: `/suggest`, `/trending`, `/build-this-weekend`, or just chat." },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || streaming) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    const aMsgId = `a-${Date.now()}`;
    setMessages(m => [...m, userMsg, { id: aMsgId, role: "assistant", content: "", pending: true }]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/brain/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });
      if (!res.body) throw new Error("No body");

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
          let evType = "";
          let dataStr = "";
          for (const l of lines) {
            if (l.startsWith("event:")) evType = l.slice(6).trim();
            else if (l.startsWith("data:")) dataStr = l.slice(5).trim();
          }
          if (!dataStr) continue;
          try {
            const parsed = JSON.parse(dataStr) as { text?: string };
            if (evType === "token" && parsed.text) {
              setMessages(m => m.map(msg => msg.id === aMsgId
                ? { ...msg, content: msg.content + parsed.text, pending: false }
                : msg));
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch {
      setMessages(m => m.map(msg => msg.id === aMsgId
        ? { ...msg, content: msg.content || "_(connection interrupted)_", pending: false }
        : msg));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <div
      className={cn(
        "border-l border-border bg-card transition-all duration-200 flex flex-col shrink-0 overflow-hidden",
        open ? "w-[340px]" : "w-0",
      )}
    >
      {open && (
        <>
          <div className="h-16 border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center text-zinc-900">
                <Brain className="size-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium">Brain</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1"><Sparkles className="size-2.5" /> always on</div>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}><X className="size-4" /></Button>
          </div>

          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="p-4 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-50"
                      : "bg-muted/40 border border-border text-foreground",
                  )}>
                    {m.role === "assistant" ? <MarkdownRenderer text={m.content || (m.pending ? "…" : "")} /> : <p>{m.content}</p>}
                  </div>
                </div>
              ))}
              {streaming && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" /> streaming…
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-3 space-y-2">
            <div className="flex gap-1.5 flex-wrap">
              {QUICK.map(q => (
                <button
                  key={q.cmd}
                  onClick={() => send(q.cmd)}
                  disabled={streaming}
                  className="text-[10px] px-2 py-1 rounded-md bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
                >
                  {q.cmd}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask the brain…"
                disabled={streaming}
                className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
              <Button size="icon" onClick={() => send()} disabled={streaming || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

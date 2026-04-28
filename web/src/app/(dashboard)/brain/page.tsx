"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, Plus, Loader2, Sparkles, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/brain/markdown-renderer";
import { timeAgo } from "@/lib/utils/formatters";
import type { ChatThread, ChatMessage } from "@/types/database";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

const QUICK_COMMANDS = [
  { cmd: "/suggest", label: "Top picks" },
  { cmd: "/trending", label: "Trending now" },
  { cmd: "/strategy", label: "Strategy" },
  { cmd: "/stats", label: "My stats" },
  { cmd: "/rules", label: "Tune rules" },
  { cmd: "/build-this-weekend", label: "Weekend build" },
  { cmd: "/find-plr", label: "Find PLR" },
  { cmd: "/skill-match", label: "Skill match" },
];

export default function BrainPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat/threads").then(r => r.json()).then(j => {
      setThreads(j.data);
      if (j.data[0]) setActiveThread(j.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeThread) return;
    fetch(`/api/chat/threads/${activeThread}/messages`).then(r => r.json()).then(j => {
      setMessages((j.data as ChatMessage[]).map(m => ({ id: m.id, role: m.role as "user"|"assistant", content: m.content })));
    });
  }, [activeThread]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    const uid = `u-${Date.now()}`;
    const aid = `a-${Date.now()}`;
    setMessages(m => [...m, { id: uid, role: "user", content: msg }, { id: aid, role: "assistant", content: "", pending: true }]);
    setInput("");
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/brain/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, thread_id: activeThread }),
        signal: controller.signal,
      });
      if (!res.body) throw new Error();
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
          let evType = "", dataStr = "";
          for (const l of lines) {
            if (l.startsWith("event:")) evType = l.slice(6).trim();
            else if (l.startsWith("data:")) dataStr = l.slice(5).trim();
          }
          if (!dataStr) continue;
          try {
            const parsed = JSON.parse(dataStr) as { text?: string };
            if (evType === "token" && parsed.text) {
              setMessages(m => m.map(msg => msg.id === aid ? { ...msg, content: msg.content + parsed.text, pending: false } : msg));
            }
          } catch {/* ignore */}
        }
      }
    } catch {
      setMessages(m => m.map(msg => msg.id === aid ? { ...msg, content: msg.content || "_(connection interrupted)_", pending: false } : msg));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const newThread = async () => {
    const r = await fetch("/api/chat/threads", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New conversation" }),
    }).then(r => r.json());
    setThreads(t => [r.data, ...t]);
    setActiveThread(r.data.id);
    setMessages([]);
    toast.success("New thread");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Threads sidebar */}
      <aside className="w-72 border-r border-border bg-card/40 flex flex-col">
        <div className="p-3 border-b border-border">
          <Button onClick={newThread} className="w-full gap-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-600">
            <Plus className="size-4" /> New conversation
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {threads.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveThread(t.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg transition-colors",
                  t.id === activeThread ? "bg-accent" : "hover:bg-accent/50",
                )}
              >
                <div className="flex items-start gap-2">
                  {t.pinned && <Pin className="size-3 text-amber-400 mt-1 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{t.title}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className="capitalize">{t.thread_type.replace("_", " ")}</span>
                      <span>·</span>
                      <span>{timeAgo(t.last_message_at)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center text-zinc-900">
              <Brain className="size-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium">{threads.find(t => t.id === activeThread)?.title ?? "Brain"}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1"><Sparkles className="size-2.5" /> Claude Sonnet 4.6 · always on</div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="max-w-3xl mx-auto p-6 space-y-5">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-12">
                Start a conversation. Try a slash command below or just type.
              </div>
            )}
            {messages.map(m => (
              <Card key={m.id} className={cn(m.role === "user" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-card")}>
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{m.role === "user" ? "You" : "Brain"}</div>
                  {m.role === "assistant"
                    ? <MarkdownRenderer text={m.content || (m.pending ? "…" : "")} />
                    : <p className="text-sm">{m.content}</p>}
                </div>
              </Card>
            ))}
            {streaming && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" /> streaming…</div>}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-3 bg-background/80 backdrop-blur">
          <div className="max-w-3xl mx-auto space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_COMMANDS.map(q => (
                <button
                  key={q.cmd}
                  onClick={() => send(q.cmd)}
                  disabled={streaming}
                  className="text-[10px] px-2 py-1 rounded-md bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40 border border-border"
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
                placeholder="Ask the brain anything…"
                disabled={streaming}
                className="flex-1 h-10 px-3 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
              <Button onClick={() => send()} disabled={streaming || !input.trim()} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-600">
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

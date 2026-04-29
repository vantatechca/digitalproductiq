"use client";

// Client shell extracted from the old `(dashboard)/layout.tsx`. Holds the
// pieces of the layout that genuinely need client state (chat panel toggle,
// command palette open/close). Sidebar and topbar data are passed in from
// the server layout so they can be rendered with fresh data.

import { useState, type ReactNode } from "react";
import { Topbar, type TopbarData } from "@/components/layout/topbar";
import { ChatPanel } from "@/components/layout/chat-panel";
import { CommandPalette } from "@/components/layout/command-palette";
import { Onboarding } from "@/components/layout/onboarding";
import { KeyboardShortcutsDialog } from "@/components/layout/keyboard-shortcuts";

export function DashboardShell({
  sidebar,
  topbarData,
  children,
}: {
  sidebar: ReactNode;
  topbarData: TopbarData;
  children: ReactNode;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebar}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onCommandOpen={() => setPaletteOpen(true)}
          onChatToggle={() => setChatOpen(o => !o)}
          chatOpen={chatOpen}
          data={topbarData}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <Onboarding />
      <KeyboardShortcutsDialog />
    </div>
  );
}
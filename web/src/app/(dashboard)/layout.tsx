"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ChatPanel } from "@/components/layout/chat-panel";
import { CommandPalette } from "@/components/layout/command-palette";
import { Onboarding } from "@/components/layout/onboarding";
import { KeyboardShortcutsDialog } from "@/components/layout/keyboard-shortcuts";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onCommandOpen={() => setPaletteOpen(true)}
          onChatToggle={() => setChatOpen(o => !o)}
          chatOpen={chatOpen}
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

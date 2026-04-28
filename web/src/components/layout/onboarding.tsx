"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Lightbulb, Brain, TrendingUp, Recycle, Shield, Workflow, ChevronRight, Boxes, Sparkles,
} from "lucide-react";

const KEY = "dpiq.onboarded.v1";

const STEPS = [
  {
    icon: Boxes,
    title: "Welcome to DigitalProductIQ",
    body: "Your always-on intelligence brain that finds digital product opportunities — across every major marketplace, 24/7.",
  },
  {
    icon: Lightbulb,
    title: "Ideas, scored and ranked",
    body: "30+ opportunities scored on Trend, Demand, Competition, Feasibility, and Revenue. Approve, decline, star, or move them through your pipeline.",
  },
  {
    icon: TrendingUp,
    title: "Real-time trend signals",
    body: "Breakouts when keywords spike >200% MoM. Cross-niche correlations. Per-platform pulse.",
  },
  {
    icon: Recycle,
    title: "Reseller arbitrage finder",
    body: "PLR, MRR, white-label, CC0, public-domain sources you can repackage. License terms shown for every match.",
  },
  {
    icon: Brain,
    title: "Conversational brain",
    body: "Chat with the AI like a co-founder: /suggest, /trending, /build-this-weekend, /find-plr. Streams in real-time.",
  },
  {
    icon: Shield,
    title: "Personalized via golden rules",
    body: "Your preferences (price ranges, build effort, ethical lines) shape every recommendation. The brain also LEARNS from your decisions.",
  },
  {
    icon: Workflow,
    title: "Pipeline kanban",
    body: "Drag ideas through Detected → Reviewing → Approved → Incubating → In Build → Launched.",
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(KEY);
    if (!seen) setOpen(true);
  }, []);

  const finish = () => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
    setStep(0);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  const Step = STEPS[step];
  const Icon = Step.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">{Step.title}</DialogTitle>
          <DialogDescription className="sr-only">{Step.body}</DialogDescription>
        </DialogHeader>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center text-zinc-900">
            <Icon className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{Step.title}</h2>
            <p className="text-sm text-muted-foreground mt-1.5">{Step.body}</p>
          </div>
        </motion.div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-emerald-400" : "w-1.5 bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={finish}>Skip</Button>
            <Button onClick={next} size="sm" className="gap-1 bg-emerald-500 text-zinc-950 hover:bg-emerald-600">
              {step === STEPS.length - 1 ? <>Get started <Sparkles className="size-3.5" /></> : <>Next <ChevronRight className="size-3.5" /></>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

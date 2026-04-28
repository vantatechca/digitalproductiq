export function scoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "text-zinc-500";
  if (score >= 80) return "text-emerald-300";
  if (score >= 65) return "text-lime-300";
  if (score >= 50) return "text-amber-300";
  if (score >= 35) return "text-orange-300";
  return "text-red-300";
}

export function scoreBg(score: number | null | undefined): string {
  if (score === null || score === undefined) return "bg-zinc-500/10 border-zinc-500/30";
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/40 text-emerald-300";
  if (score >= 65) return "bg-lime-500/10 border-lime-500/40 text-lime-300";
  if (score >= 50) return "bg-amber-500/10 border-amber-500/40 text-amber-300";
  if (score >= 35) return "bg-orange-500/10 border-orange-500/40 text-orange-300";
  return "bg-red-500/10 border-red-500/40 text-red-300";
}

export function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 65) return "bg-lime-400";
  if (score >= 50) return "bg-amber-400";
  if (score >= 35) return "bg-orange-400";
  return "bg-red-400";
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Outstanding";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Promising";
  if (score >= 45) return "Mediocre";
  return "Weak";
}

export function compositeFromParts(
  trend: number, demand: number, competition: number,
  feasibility: number, revenue: number,
  weights = { trend: 0.20, demand: 0.25, competition: 0.20, feasibility: 0.15, revenue: 0.20 },
): number {
  return (
    trend * weights.trend +
    demand * weights.demand +
    competition * weights.competition +
    feasibility * weights.feasibility +
    revenue * weights.revenue
  );
}

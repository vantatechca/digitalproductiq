import { getTopIdeas, getIdeaById, BREAKOUTS, getDashboardStats, getActiveRules, ARBITRAGE_SOURCES } from "@/lib/mock-data";
import { CATEGORY_LABELS } from "@/lib/utils/constants";

// SSE streaming for brain chat. Routes user messages → mock contextual responses.
export async function POST(req: Request) {
  const body = await req.json() as { message: string; thread_id?: string; context_idea_id?: string };
  const message = (body.message ?? "").trim();
  const lowered = message.toLowerCase();

  const text = pickResponse(lowered, body.context_idea_id);
  const messageId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const threadId = body.thread_id ?? `t_${Date.now()}`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

      send("meta", { type: "meta", id: messageId, thread_id: threadId, sources: ["mock-router"], confidence: 0.78 });

      // Tokenize on whitespace + punctuation, preserve formatting
      const tokens = text.match(/(\s+|[^\s]+)/g) ?? [];
      for (const tok of tokens) {
        send("token", { type: "token", text: tok });
        const isWhitespace = /^\s+$/.test(tok);
        await sleep(isWhitespace ? 6 + Math.random() * 8 : 12 + Math.random() * 18);
      }

      send("done", { type: "done", message_id: messageId, cost_usd: 0.018 });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function pickResponse(msg: string, contextIdeaId?: string): string {
  // Slash commands
  if (msg.startsWith("/suggest")) return suggestResponse();
  if (msg.startsWith("/trending")) return trendingResponse();
  if (msg.startsWith("/strategy")) return strategyResponse();
  if (msg.startsWith("/stats")) return statsResponse();
  if (msg.startsWith("/rules")) return rulesResponse();
  if (msg.startsWith("/build-this-weekend") || msg.includes("weekend")) return weekendResponse();
  if (msg.startsWith("/find-plr") || msg.includes("plr") || msg.includes("arbitrage")) return plrResponse();
  if (msg.startsWith("/skill-match") || msg.includes("skill")) return skillResponse();

  // Context-aware
  if (contextIdeaId) {
    const idea = getIdeaById(contextIdeaId);
    if (idea) return ideaResponse(idea.title);
  }

  // Topic keywords
  if (msg.includes("notion")) return topicNotion();
  if (msg.includes("etsy")) return topicEtsy();
  if (msg.includes("ai") || msg.includes("gpt") || msg.includes("claude")) return topicAi();
  if (msg.includes("finance") || msg.includes("budget") || msg.includes("money")) return topicFinance();
  if (msg.includes("course")) return topicCourses();
  if (msg.includes("crochet") || msg.includes("craft")) return topicCrafts();

  // Default
  return defaultResponse(msg);
}

function suggestResponse(): string {
  const top = getTopIdeas(5);
  return `## Top 5 picks for you right now\n\nBased on your golden rules (prefer $19-79, <20h builds, productivity + AI cats, indie founder audience), here's what's in your top tier:\n\n${top.map((i, idx) => `**${idx + 1}. ${i.title}** — composite **${i.composite_score.toFixed(1)}**\n_${i.summary}_\n→ Build: ${i.build_path}, ${i.build_effort_hours_min}-${i.build_effort_hours_max}h, est $${i.estimated_monthly_revenue_low_usd}-${i.estimated_monthly_revenue_high_usd}/mo`).join("\n\n")}\n\nWant me to deep-dive any of these?`;
}

function trendingResponse(): string {
  return `## What's trending RIGHT NOW\n\n### Breakout (>200% velocity)\n${BREAKOUTS.map(b => `- **${b.keyword}** (${CATEGORY_LABELS[b.category]}) — +${b.velocity_pct}%`).join("\n")}\n\n### Rising (>20% velocity)\n- AI app figma kit (+31%)\n- AI resume layoff (+38%)\n- Open source AI newsletter (+32%)\n- Tech to climate pivot (+36%)\n\n### Why this matters for you\nThree of these (n8n workflow, Senior PM Claude Project, AI resume) match your top 2 categories. Strike now — breakout windows close in ~6 weeks.`;
}

function strategyResponse(): string {
  return `## Multi-niche portfolio strategy\n\nYou have **15h/week** and a target of **$5K/mo**. Here's my recommendation:\n\n### Core thesis\nDon't pick one niche. Build a **3-leg portfolio** where each leg compounds:\n\n1. **Aesthetic-led printables** (Etsy) — high volume, $14-29 ASP\n2. **Notion + AI templates** (Gumroad + Whop) — mid volume, $39-79 ASP, recurring potential\n3. **One arbitrage flip** (PLR/public domain) — minimal upkeep, $0-50 build cost\n\n### Why this beats focusing\n- Failure is uncorrelated across legs\n- Audiences cross-pollinate (Etsy → Gumroad)\n- One winner pays for the other two's exploration cost\n\n### Sequencing\n- **Months 1-2**: Ship leg 1 (printable), ship leg 3 (arbitrage)\n- **Month 3**: Reinforce winners with adjacent SKUs\n- **Months 4-6**: Add leg 2 (Notion/AI) once you have audience seeds`;
}

function statsResponse(): string {
  const s = getDashboardStats();
  return `## Your pipeline\n\n- **${s.total_ideas} total ideas**\n- **${s.pending_count}** awaiting review\n- **${s.approved_count}** approved\n- **${s.starred_count}** starred\n- Average composite: **${s.avg_score.toFixed(1)}**\n- New this week: ${s.ideas_this_week}\n- New this month: ${s.ideas_this_month}\n\n### Hot categories (by avg score)\n${s.top_categories.slice(0, 4).map(c => `- ${CATEGORY_LABELS[c.category as keyof typeof CATEGORY_LABELS] ?? c.category}: ${c.avg_score.toFixed(1)} (${c.count} ideas)`).join("\n")}\n\n### Top discovery sources\n${s.top_sources.slice(0, 5).map(p => `- ${p.platform}: ${p.count} ideas`).join("\n")}`;
}

function rulesResponse(): string {
  const active = getActiveRules();
  return `## Your golden rules\n\n**${active.length} active rules** governing scoring + filtering.\n\n### Highest-impact rules (by applied count)\n${active.sort((a, b) => b.applied_count - a.applied_count).slice(0, 5).map(r => `- **${r.rule_text}** (${r.direction}, applied ${r.applied_count}×)`).join("\n")}\n\n### My suggestions\nI've detected **5 candidate rules** based on your last 18 decisions. Visit /rules to review them — top suggestion is "Deprioritize 'general_consumer' audience" at 84% confidence.`;
}

function weekendResponse(): string {
  return `## What to build this weekend (≤2 days, ≥$1K/mo potential)\n\n### My pick: **No-Spend Year Wall Tracker**\nWhy this beats the alternatives:\n- **Highest velocity right now**: TikTok #NoSpendYear at 480M views, +220% MoM\n- **Lowest effort**: 4-8 hours, you have all the skills\n- **Etsy doesn't reward latecomers**: ship before saturation\n- **Aesthetic gap is wide**: top-ranking listing is generic\n\n### Build sequence (Saturday + Sunday)\n**Saturday (4h)**\n- 9-11am: Figma 18×24 + 11×17 designs (3 colorways)\n- 12-2pm: Companion workbook (24 pages)\n\n**Sunday (4h)**\n- 9-11am: Listing photos (6 mockups)\n- 12-1pm: Etsy listing + tags + SEO description\n- 2-3pm: TikTok promo clip + Pinterest pin\n- 4pm: Publish + share to /r/Frugal\n\n### Expected\n$200-1500 first 30 days. $400-2400/mo at steady state. Ship the v1, iterate based on first 10 reviews.`;
}

function plrResponse(): string {
  const top = ARBITRAGE_SOURCES.filter(a => a.est_arbitrage_potential && a.est_arbitrage_potential >= 60).slice(0, 6);
  return `## PLR / Arbitrage matches\n\nI scanned **${ARBITRAGE_SOURCES.length} sources** across IDPLR, Master Resell Co, Pixabay, Project Gutenberg, GitHub, Envato Elements.\n\n### Top 6 by arbitrage potential\n\n${top.map(a => `**${a.product_title}** — $${a.cost_usd} (${a.source_type.toUpperCase()})\n- License: ${a.license_type}\n- Potential: ${a.est_arbitrage_potential}/100\n- ${a.notes ?? "Verify license terms before reselling"}`).join("\n\n")}\n\n### Watch out for\n- IDPLR + Master Resell typically require ≥30% rewrite\n- Public domain ≠ trademark-free (check brand names)\n- Royalty-free audio CANNOT be resold raw, only embedded in derivative products`;
}

function skillResponse(): string {
  return `## Ideas matched to your skills\n\nYour declared skills: **copywriting, notion, figma, javascript**.\n\n### Best matches in your pipeline\n\n1. **Notion 'Second Brain' for Solo Founders** — uses notion + copywriting (composite 79.8)\n2. **Senior PM Claude Project** — uses copywriting (composite 78.6)\n3. **AI Career Coach GPT Pack** — uses copywriting (composite 84.2)\n4. **Figma AI App Onboarding Kit** — uses figma (composite 78.4)\n5. **Browser Token Counter** — uses javascript (composite 74.8)\n\n### Skills you should add\n- **Premium Etsy SEO** would unlock 4 more high-score ideas\n- **Audio editing** would unlock the meditation pack route\n- **Light React/Next.js** would unlock 3 micro-SaaS ideas in your pipeline`;
}

function topicNotion(): string {
  return `## Notion opportunities\n\nThe Notion template market is **mature but not saturated** at the right altitude:\n\n### What's hot\n- **Solo-founder OS** (not team-of-10 — most existing templates target teams)\n- **AI-powered workspaces** (Notion AI integrations as templates)\n- **Industry-specific** (consulting, coaching, e-commerce ops)\n\n### What's saturated\n- Generic habit trackers ($4-9, thousands of competitors)\n- Personal CRMs without a clear wedge\n- "Second brain" without a fresh angle (Thomas Frank dominates)\n\n### Your best Notion play\n**Notion 'Second Brain' for Solo Founders** in your approved pipeline — composite 79.8, $49-69 price target, 16-30h build.`;
}

function topicEtsy(): string {
  return `## Etsy opportunities\n\nEtsy digital downloads is THE volume play for printables.\n\n### What's working in 2026\n- **No-spend year tracker** (breakout — +220% MoM)\n- **Wedding welcome bag printables** (maximalist aesthetic)\n- **Stoicism printables** (sustained +22% MoM)\n- **K-2 Singapore Math worksheets** (homeschool surge)\n\n### Tactical advice\n- Aesthetic > content — most top-rankers have weak design\n- Bundle 4-8 printables for $14-22 (vs $5 single)\n- First 6 photos win — invest 1h per photo minimum\n- Tags matter: 13 tags, mix exact + adjacent\n\n### Your Etsy roadmap\n3 ideas in your pipeline target Etsy: No-Spend Year, Stoicism, Wedding Welcome Bag. Ship No-Spend Year first (highest velocity).`;
}

function topicAi(): string {
  return `## AI / GPT / Claude product opportunities\n\nThis category has the **most breakout signals** right now.\n\n### Top opportunities\n1. **n8n AI workflow packs** — breakout +180%, only 4 active competitors\n2. **Claude Project for PMs** — breakout +240%, only 3 competitors\n3. **AI Career Coach GPT Pack** — composite 84.2, your highest-scored idea\n4. **GPT bundles for vertical roles** — sales, real estate, customer success\n\n### Pricing intelligence\n- Single GPT: $9-19\n- Bundle of 5-12: $29-79 (the sweet spot)\n- Curated + community access: $99-149/mo\n\n### Distribution\nWhop > Gumroad > standalone GPT Store. Whop's 3% take + community angle is unbeatable for AI products.`;
}

function topicFinance(): string {
  return `## Finance / money product opportunities\n\nFinance is **high intent but compliance-heavy**.\n\n### Active opportunities in your pipeline\n- **SaaS Cash Runway Calculator** (composite 75.0) — currently in build\n- **Real Estate Cash-on-Cash Calc** (composite 70.0) — needs strict disclaimers\n- **No-Spend Year Tracker** (composite 81.4, breakout)\n\n### Compliance must-haves\n- "Not financial advice" disclaimer on every page\n- No specific stock/crypto recommendations\n- For tax tools: "Consult a tax professional"\n- For real estate: "Past performance ≠ future results"\n\n### Pricing\n- Calculators / sheets: $19-79\n- Workbooks: $14-39\n- Cohort courses: $199-999\n- Memberships: $19-79/mo`;
}

function topicCourses(): string {
  return `## Course opportunities\n\n**My take**: Self-paced video courses are a brutal market. Cohorts and asynchronous community-led learning win.\n\n### What's working\n- **Live cohort courses** ($299-999) for technical skills (cold email for devs, AI for PMs)\n- **Mini-courses** ($49-99) bundled with a Notion template + community\n- **Drip courses** delivered via newsletter + Whop community\n\n### Your best play\n**'Cold Email for Indie Devs' cohort** in your pipeline (composite 72.6). Higher build effort (40-80h) but $3-18K/mo potential per cohort.\n\n### What to AVOID\n- Generic Skillshare-style passive courses (saturated, low pay)\n- Long pre-recorded courses without a community wrapper\n- Trying to compete with Maven on pure prestige`;
}

function topicCrafts(): string {
  return `## Crafts / patterns opportunities\n\nBig market, but **competition is intense and trends shift fast**.\n\n### What's hot\n- Modern crochet (TikTok-driven, away from granny-square aesthetic)\n- Procreate brushes (lo-fi botanical +340% YoY)\n- SVG cut files for Cricut\n- Sewing patterns (size-inclusive XS-3X)\n\n### Your best play\n**Procreate brush pack: lo-fi botanical** (composite 71.2) — 12-24h build, $19-29 ASP, rising trend.\n\n### Pitfalls\n- Pattern-writing is technically demanding — bad patterns = refunds\n- Patterns get pirated heavily on Telegram/Discord\n- Niches age fast (Y2K, dark academia, cottagecore each cycle ~24 months)`;
}

function ideaResponse(title: string): string {
  return `## About "${title}"\n\nI can deep-dive this one for you. What angle do you want?\n\n- **Market analysis** — TAM, demand drivers, who's buying\n- **Competitive landscape** — top competitors, pricing, gaps\n- **Build plan** — phases, time estimates, deliverables\n- **Marketing plan** — distribution, content engine, launch sequence\n- **Risks & opportunities** — what could go wrong / right\n- **Recommendation** — ship it, investigate, or hold\n\nOr just say "**deep dive**" and I'll do all of the above.`;
}

function defaultResponse(msg: string): string {
  return `I hear you on "${msg.slice(0, 80)}".\n\nI can help with:\n\n- **/suggest** — top picks for you right now\n- **/trending** — what's hot across all niches\n- **/build-this-weekend** — fastest path to revenue\n- **/find-plr** — arbitrage / reseller opportunities\n- **/strategy** — multi-niche portfolio thinking\n- **/stats** — your pipeline overview\n- **/rules** — review or tune your golden rules\n- **/skill-match** — ideas matched to your skills\n\nOr ask about a category: notion, etsy, AI, finance, courses, crafts.`;
}

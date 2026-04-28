import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Scale, Database, Eye, Bot } from "lucide-react";

const PLATFORM_RULES = [
  { platform: "Etsy", rules: "Public listing data only. No PII. Respect rate limits. Etsy ToS allows aggregated trend research; do NOT use for spammy listing duplication.", flag: "amber" },
  { platform: "Gumroad", rules: "Public Discover pages only. Respect robots.txt. Do not impersonate creators.", flag: "green" },
  { platform: "Whop", rules: "Public marketplace pages only. Community membership data is sensitive — never collect.", flag: "amber" },
  { platform: "Notion Marketplace", rules: "Public template metadata only. Do not republish template internals.", flag: "green" },
  { platform: "Amazon KDP", rules: "Amazon is hostile to scraping. Use the Product Advertising API where possible. Public best-seller lists OK; product detail pages high-risk.", flag: "red" },
  { platform: "Reddit", rules: "Use the official PRAW client with proper user_agent. Respect API rate limits (100 req/min). Read-only.", flag: "green" },
  { platform: "TikTok", rules: "TikTok actively blocks scrapers. Use Research API where eligible. Hashtag volume only.", flag: "red" },
  { platform: "YouTube", rules: "Use the official Data API v3 with quota management.", flag: "green" },
  { platform: "Pinterest", rules: "Trends.pinterest.com is public. Pin scraping requires Pinterest API or careful handling.", flag: "amber" },
  { platform: "GitHub", rules: "Public API with token. MIT/Apache/CC0 repos can be repackaged with attribution.", flag: "green" },
  { platform: "Project Gutenberg", rules: "US public-domain books. EU/Australia rules differ — verify per-region before reselling.", flag: "amber" },
  { platform: "IDPLR / PLR Database", rules: "PLR licenses typically require ≥30% rewrite. Never resell as PLR. Always retain license_terms_url.", flag: "amber" },
];

const LICENSE_TYPES = [
  { type: "PLR (Private Label Rights)", what: "Buy + rewrite + resell. Most allow editing your name as author.", restrictions: "Typically requires ≥30% rewrite. Cannot resell PLR rights themselves." },
  { type: "MRR (Master Resell Rights)", what: "Buy + resell + grant resell rights to your buyers.", restrictions: "Cannot edit content (usually). Must preserve resell-rights chain." },
  { type: "White Label", what: "Rebrand and sell as your own. Often a subscription model.", restrictions: "Cannot transfer the white-label license itself." },
  { type: "CC0 (Creative Commons Zero)", what: "Public domain dedication. Use for any purpose, including commercial resale.", restrictions: "None. Attribution preferred but not required." },
  { type: "Public Domain", what: "Out of copyright (US: pre-1929 typically).", restrictions: "Verify per-region. Trademarks survive copyright (e.g., 'Daily Stoic' brand)." },
  { type: "Royalty Free", what: "Pay once, use without per-use royalties.", restrictions: "Cannot resell raw assets. Can embed in derivative products." },
  { type: "Open Source (MIT/Apache/GPL)", what: "Free to use, modify, redistribute.", restrictions: "Attribution required. GPL is copyleft (derivatives must also be GPL)." },
];

export default function CompliancePage() {
  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compliance & Disclaimers</h1>
        <p className="text-sm text-muted-foreground mt-1">How DigitalProductIQ collects data, and what you should know before reselling licensed content.</p>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Database className="size-4 text-emerald-400" /> What we collect</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>DigitalProductIQ collects <strong className="text-foreground">public</strong> data from listed marketplaces — search queries, public listing metadata, public engagement signals (upvotes, view counts, hashtag volumes).</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We do <strong>not</strong> collect PII (names, emails, addresses) from buyers.</li>
            <li>We do <strong>not</strong> impersonate users on any platform.</li>
            <li>We respect each platform&apos;s robots.txt and rate limits.</li>
            <li>Aggregated trend data only — no per-customer or per-creator surveillance.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bot className="size-4 text-cyan-400" /> AI usage</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>The brain uses a 3-tier AI router (DeepSeek/Qwen → Claude Haiku → Claude Sonnet) with a daily USD budget cap.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tier 1 (cheap): bulk extraction, classification, simple scoring</li>
            <li>Tier 2 (mid): structured scoring, JSON validation</li>
            <li>Tier 3 (premium): brain chat, deep dives, golden-rule generation</li>
            <li>When 80% of daily budget is used, non-chat calls auto-downgrade to Tier 1.</li>
            <li>At 100%, requests are queued or rejected.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="size-4 text-amber-400" /> Per-marketplace ToS</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {PLATFORM_RULES.map(p => (
            <div key={p.platform} className="flex items-start gap-3 text-xs p-2 rounded border border-border/40">
              <Badge className={`shrink-0 ${p.flag === "green" ? "bg-emerald-500/15 text-emerald-300" : p.flag === "amber" ? "bg-amber-500/15 text-amber-300" : "bg-red-500/15 text-red-300"}`}>
                {p.flag.toUpperCase()}
              </Badge>
              <div>
                <div className="font-medium">{p.platform}</div>
                <p className="text-muted-foreground mt-0.5">{p.rules}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Scale className="size-4 text-violet-400" /> License types you&apos;ll encounter</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {LICENSE_TYPES.map(l => (
            <div key={l.type} className="text-xs p-2 rounded border border-border/40">
              <div className="font-medium">{l.type}</div>
              <p className="text-muted-foreground mt-1"><strong className="text-foreground">What:</strong> {l.what}</p>
              <p className="text-muted-foreground mt-0.5"><strong className="text-foreground">Restrictions:</strong> {l.restrictions}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="size-4 text-fuchsia-400" /> Your responsibilities as a reseller</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>Always read the source license terms before reselling</li>
            <li>Disclose AI-generated or PLR-derived content if required by your destination marketplace</li>
            <li>Do not impersonate the original author</li>
            <li>For finance, health, or legal content: include &quot;not professional advice&quot; disclaimers</li>
            <li>For child-targeted content: comply with COPPA / GDPR-K</li>
            <li>Tax: digital products may trigger VAT/GST in EU/UK/AU — use a Merchant of Record (Lemon Squeezy / Paddle) when in doubt</li>
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center mt-6">DigitalProductIQ is research tooling, not legal counsel. When in doubt, consult a lawyer.</p>
    </div>
  );
}

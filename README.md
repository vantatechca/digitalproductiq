# DigitalProductIQ

> Always-on, AI-powered, multi-marketplace intelligence brain that tells you — every morning — exactly what digital product to build, license, or flip this week.

## Status

**Phase 1 — Scaffolding** ✓ Built. Working scaffold with:

- Next.js 16.2 + TypeScript + Tailwind v4 + shadcn/ui (dark theme, emerald + cyan + violet accents)
- 11 pages, 30+ API routes (all wired to a single mock-data layer)
- SSE streaming brain chat (`/api/brain/chat`)
- Drag-and-drop kanban (`/pipeline`)
- Cmd+K command palette
- Activity dropdown, sidebar with badges, collapse persisted
- 11 SQL migrations (Supabase + pgvector)
- Python workers: BaseScraper + 21 scrapers + 7 pipeline modules + AI router + Celery + FastAPI + Dockerfile

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16.2, TypeScript, Tailwind v4, shadcn/ui (Base UI), recharts, framer-motion, @hello-pangea/dnd, cmdk, sonner, zustand, zod |
| Workers | Python 3.11, FastAPI, Celery + Redis, Playwright, BeautifulSoup, PRAW, pytrends |
| AI | 3-tier router: Tier-1 OpenRouter (DeepSeek/Qwen) → Tier-2 Claude Haiku 4.5 → Tier-3 Claude Sonnet 4.6 |
| Database | Supabase (Postgres + pgvector + auth + realtime) |

## Running

### 1. Frontend

```bash
cd web
pnpm install
pnpm dev          # http://localhost:3000
pnpm next build   # Production build (currently passes clean)
```

### 2. Workers (after env)

```bash
cd workers
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium

# FastAPI
uvicorn src.api.main:app --reload --port 8000

# Celery worker (in another terminal)
celery -A src.tasks.celery_app worker --loglevel=info

# Celery Beat (scheduler, in another terminal)
celery -A src.tasks.celery_app beat --loglevel=info
```

### 3. Database

```bash
# Apply migrations in order to your Supabase project (or local Postgres + pgvector)
psql $DATABASE_URL -f supabase/migrations/001_extensions.sql
psql $DATABASE_URL -f supabase/migrations/002_users.sql
# ... through 011_seed.sql
```

## What's where

```
digitalproductiq/
├── web/                          Next.js 16 frontend
│   ├── src/
│   │   ├── app/(dashboard)/      Dashboard, Ideas, Brain, Trends, Marketplaces, Competitors, Arbitrage, Rules, Pipeline, Settings
│   │   ├── app/(auth)/           Login, Register
│   │   ├── app/api/              30+ API routes (currently serving mock data)
│   │   ├── components/           Sidebar, Topbar, ChatPanel, CommandPalette, MarkdownRenderer
│   │   ├── lib/mock-data/        Single source of truth for mock ideas, signals, competitors, arbitrage, rules, chat, activity
│   │   ├── lib/utils/            constants.ts (categories, formats, statuses), formatters.ts, scoring.ts
│   │   ├── lib/supabase/         client.ts + server.ts (wired for phase 4)
│   │   └── types/                database.ts + api.ts
│   └── proxy.ts                  (Next.js 16 replaces middleware.ts → proxy.ts)
├── workers/                      Python workers
│   └── src/
│       ├── scrapers/             base.py + 21 scrapers (etsy, gumroad, whop, ..., reddit, github, gutenberg, idplr, …)
│       ├── pipeline/             relevance, extraction, embedding, dedup, enrichment, scoring, crosscheck
│       ├── ai/                   router (3-tier, daily budget cap), prompts
│       ├── tasks/                celery_app.py (Beat schedule)
│       └── api/                  main.py (FastAPI: /health, /scrape/{name}, /scrapers, /status, /history)
└── supabase/migrations/          011 SQL files (extensions → users → ideas → signals/trends/feedback → brain → chat → marketplaces/competitors → arbitrage → scrapers/runs → misc → seed)
```

## Acceptance criteria — current state

- ✓ `pnpm next build` passes with zero errors
- ✓ All 11 pages render
- ✓ All 30+ API routes return correct shapes (verified via curl + dev server)
- ✓ SSE streaming works for `/api/brain/chat`
- ✓ Kanban drag-and-drop works
- ✓ Cmd+K command palette works
- ✓ All exports return CSV/JSON
- ✓ Python worker skeleton with 21 scrapers + pipeline + Celery + Dockerfile
- ✓ Next.js 16 patterns used (Promise params, proxy.ts, Response.json)
- ✓ Dark theme consistent
- ✓ 30 mock ideas across 25+ categories, 80 signals, 12 competitors, 40+ products, 30 arbitrage sources

## Next phases

- Phase 2 — Real interactivity & polish (real-time subscriptions, optimistic updates)
- Phase 3 — Wire actual scrapers + pipeline + AI router to live data
- Phase 4 — Supabase + Auth + realtime
- Phase 5 — Production deploy (Vercel + Railway/Render + Upstash Redis)

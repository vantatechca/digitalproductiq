-- Ideas — the core opportunity table (horizontal across all digital product niches)
create table if not exists ideas (
  id uuid primary key default uuid_generate_v4(),

  -- Identity
  title text not null,
  slug text unique,
  summary text not null,
  description text,
  hypothesis text,

  -- Categorization (HORIZONTAL, all niches)
  category text not null,
  sub_niche text[],
  product_format text not null,
  delivery_model text not null,
  target_audience text[],
  skill_required text[],
  build_effort_hours_min int,
  build_effort_hours_max int,

  -- Build vs Buy vs Flip recommendation
  build_path text check (build_path in (
    'build_from_scratch',
    'license_plr_mrr',
    'white_label',
    'arbitrage_flip',
    'curate_collection',
    'collab_creator'
  )),
  arbitrage_source_url text,
  arbitrage_cost_usd numeric,
  arbitrage_potential_revenue_usd numeric,

  -- Scoring (0-100 each, plus composite)
  composite_score numeric(5,2),
  trend_score numeric(5,2),
  demand_score numeric(5,2),
  competition_score numeric(5,2),
  feasibility_score numeric(5,2),
  revenue_potential_score numeric(5,2),
  confidence_score numeric(3,2),

  -- Market data
  search_volume_monthly int,
  trend_direction text check (trend_direction in (
    'breakout','rising','stable','declining','flat'
  )),
  trend_velocity_pct numeric,
  market_size_estimate_usd bigint,
  competitor_count int,
  median_price_usd numeric,
  price_floor_usd numeric,
  price_ceiling_usd numeric,
  estimated_monthly_revenue_low_usd int,
  estimated_monthly_revenue_high_usd int,

  -- Status & workflow
  status text default 'detected' check (status in (
    'detected','reviewing','approved','declined','starred',
    'incubating','in_build','launched','archived'
  )),
  compliance_flag text default 'green' check (compliance_flag in ('green','amber','red')),
  compliance_notes text,
  decline_reason text,

  -- Source attribution
  source_platforms text[],
  signals_count int default 0,

  -- Embedding for dedup & semantic search
  embedding vector(1536),

  -- Timestamps
  discovered_at timestamptz default now(),
  last_scored_at timestamptz,
  last_signal_at timestamptz,
  approved_at timestamptz,
  launched_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ideas_status on ideas(status);
create index if not exists idx_ideas_category on ideas(category);
create index if not exists idx_ideas_composite_score on ideas(composite_score desc);
create index if not exists idx_ideas_build_path on ideas(build_path);
create index if not exists idx_ideas_trend_direction on ideas(trend_direction);
create index if not exists idx_ideas_discovered_at on ideas(discovered_at desc);
create index if not exists idx_ideas_embedding on ideas
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

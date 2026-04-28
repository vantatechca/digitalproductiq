-- Signals, Trends, Feedback
create table if not exists idea_signals (
  id uuid primary key default uuid_generate_v4(),
  idea_id uuid references ideas(id) on delete cascade,
  platform text not null,
  signal_type text not null,
  external_url text,
  external_id text,
  title text,
  content text,
  author text,
  engagement_score int,
  sentiment numeric,
  relevance_score int,
  raw_payload jsonb,
  collected_at timestamptz default now()
);

create index if not exists idx_idea_signals_idea_id on idea_signals(idea_id);
create index if not exists idx_idea_signals_platform on idea_signals(platform);
create index if not exists idx_idea_signals_collected_at on idea_signals(collected_at desc);

create table if not exists idea_trends (
  id uuid primary key default uuid_generate_v4(),
  idea_id uuid references ideas(id) on delete cascade,
  date date not null,
  search_volume int,
  mention_count int,
  competitor_count int,
  median_price_usd numeric,
  composite_score numeric(5,2),
  unique(idea_id, date)
);

create index if not exists idx_idea_trends_idea_date on idea_trends(idea_id, date);

create table if not exists idea_feedback (
  id uuid primary key default uuid_generate_v4(),
  idea_id uuid references ideas(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  action text not null,
  reason text,
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_idea_feedback_idea_id on idea_feedback(idea_id);
create index if not exists idx_idea_feedback_user_id on idea_feedback(user_id);

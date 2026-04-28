-- Sources & Scraper runs
create table if not exists sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  source_type text not null,
  config jsonb not null,
  schedule_cron text not null,
  is_active boolean default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  consecutive_errors int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_sources_is_active on sources(is_active);
create index if not exists idx_sources_next_run_at on sources(next_run_at);

create table if not exists scraper_runs (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references sources(id),
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text default 'running' check (status in ('running','success','partial','error','blocked')),
  items_scraped int default 0,
  signals_created int default 0,
  ideas_created int default 0,
  ideas_updated int default 0,
  duration_seconds int,
  error_message text,
  raw_log text
);

create index if not exists idx_scraper_runs_source_id on scraper_runs(source_id);
create index if not exists idx_scraper_runs_started_at on scraper_runs(started_at desc);
create index if not exists idx_scraper_runs_status on scraper_runs(status);

-- Arbitrage / Reseller / PLR / White-label / CC0 sources
create table if not exists arbitrage_sources (
  id uuid primary key default uuid_generate_v4(),
  source_type text not null check (source_type in (
    'plr','mrr','white_label','cc0','public_domain','royalty_free','open_source'
  )),
  source_platform text not null,
  product_title text not null,
  product_url text,
  download_url text,
  format text,
  cost_usd numeric default 0,
  license_type text not null,
  license_terms_url text,
  license_summary text,
  matched_idea_id uuid references ideas(id),
  est_demand_score int,
  est_competition_score int,
  est_arbitrage_potential int,
  notes text,
  collected_at timestamptz default now()
);

create index if not exists idx_arbitrage_sources_source_type on arbitrage_sources(source_type);
create index if not exists idx_arbitrage_sources_matched_idea_id on arbitrage_sources(matched_idea_id);
create index if not exists idx_arbitrage_sources_arbitrage_potential on arbitrage_sources(est_arbitrage_potential desc);

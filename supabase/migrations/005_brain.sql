-- Brain memory & golden rules
create table if not exists golden_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  rule_type text not null,
  direction text not null,
  rule_text text not null,
  conditions jsonb not null,
  weight numeric default 1.0,
  source text default 'manual' check (source in ('manual','ai_suggested','learned')),
  active boolean default true,
  applied_count int default 0,
  approved_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_golden_rules_user_id on golden_rules(user_id);
create index if not exists idx_golden_rules_active on golden_rules(active);
create index if not exists idx_golden_rules_source on golden_rules(source);

create table if not exists feedback_patterns (
  id uuid primary key default uuid_generate_v4(),
  pattern_text text not null,
  evidence jsonb,
  ideas_affected int,
  acknowledged boolean default false,
  promoted_to_rule_id uuid references golden_rules(id),
  detected_at timestamptz default now()
);

create index if not exists idx_feedback_patterns_acknowledged on feedback_patterns(acknowledged);

create table if not exists brain_memory (
  id uuid primary key default uuid_generate_v4(),
  memory_type text not null,
  content text not null,
  embedding vector(1536),
  importance int default 5,
  last_referenced_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_brain_memory_embedding on brain_memory
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_brain_memory_importance on brain_memory(importance desc);

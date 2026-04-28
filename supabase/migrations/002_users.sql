-- Users
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  role text default 'owner' check (role in ('owner', 'collaborator', 'viewer')),
  preferences jsonb default '{}'::jsonb,
  score_weights jsonb default '{
    "trend": 0.20, "demand": 0.25, "competition": 0.20,
    "feasibility": 0.15, "revenue": 0.20
  }'::jsonb,
  daily_budget_usd numeric default 5.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_email on users(email);

-- Digests, Activity log, Tags
create table if not exists digests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  digest_type text not null,
  payload jsonb not null,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_digests_user_id on digests(user_id);
create index if not exists idx_digests_sent_at on digests(sent_at desc);

create table if not exists activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_activity_log_user_id on activity_log(user_id);
create index if not exists idx_activity_log_created_at on activity_log(created_at desc);
create index if not exists idx_activity_log_entity on activity_log(entity_type, entity_id);

create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  name text not null,
  color text default '#10b981',
  created_at timestamptz default now()
);

create table if not exists idea_tags (
  idea_id uuid references ideas(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (idea_id, tag_id)
);

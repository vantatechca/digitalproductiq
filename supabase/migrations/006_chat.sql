-- Chat threads & messages
create table if not exists chat_threads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  thread_type text default 'general' check (thread_type in (
    'general','idea_dive','trend_review','strategy','rule_tuning'
  )),
  context_idea_id uuid references ideas(id),
  pinned boolean default false,
  created_at timestamptz default now(),
  last_message_at timestamptz default now()
);

create index if not exists idx_chat_threads_user_id on chat_threads(user_id);
create index if not exists idx_chat_threads_last_message_at on chat_threads(last_message_at desc);

create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid references chat_threads(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  content text not null,
  meta jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_chat_messages_thread_id on chat_messages(thread_id);
create index if not exists idx_chat_messages_created_at on chat_messages(created_at desc);

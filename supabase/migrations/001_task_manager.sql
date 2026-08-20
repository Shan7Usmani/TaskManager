-- TaskManager tables for Supabase
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- task_lists table
create table if not exists public.task_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id uuid not null references public.task_lists(id) on delete cascade,
  title text not null,
  notes text,
  repeat text not null default 'once',
  start_time text,
  end_time text,
  alarm boolean not null default false,
  ringtone text,
  completed boolean not null default false,
  completed_at bigint,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- Indexes
create index if not exists idx_task_lists_user on public.task_lists(user_id);
create index if not exists idx_tasks_user on public.tasks(user_id);
create index if not exists idx_tasks_list on public.tasks(list_id);

-- RLS
alter table public.task_lists enable row level security;
alter table public.tasks enable row level security;

-- task_lists policies
create policy "Users can view own lists"
  on public.task_lists for select
  using (auth.uid() = user_id);

create policy "Users can insert own lists"
  on public.task_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lists"
  on public.task_lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own lists"
  on public.task_lists for delete
  using (auth.uid() = user_id);

-- tasks policies
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

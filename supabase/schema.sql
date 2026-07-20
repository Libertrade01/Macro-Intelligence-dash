-- Briefing Studio database (separate Supabase project — NOT Trade Desk)

-- Finished briefings (AI reports, podcast summaries)
create table if not exists briefings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  type text not null default 'ai_briefing',
  title text not null,
  date date not null,
  status text not null default 'draft',
  primary_signal text,
  source_count integer,
  sources text[] default '{}',
  top_story text,
  content_markdown text not null,
  job_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists briefings_date_idx on briefings (date desc);
create index if not exists briefings_type_idx on briefings (type);
create index if not exists briefings_status_idx on briefings (status);

-- Hermes / worker job queue (backend creates, worker completes)
create table if not exists briefing_jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  status text not null default 'pending',
  payload jsonb not null default '{}',
  result_briefing_id uuid references briefings(id) on delete set null,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists briefing_jobs_status_idx on briefing_jobs (status, created_at desc);

-- User-configured sources (podcasts, feeds, X lists) — multi-tenant later
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  config jsonb not null default '{}',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table briefings enable row level security;
alter table briefing_jobs enable row level security;
alter table sources enable row level security;

drop policy if exists "Public read ready briefings" on briefings;
create policy "Public read ready briefings"
  on briefings for select
  using (status in ('ready', 'published'));

-- Jobs and sources: service role only for now (ingest API uses service role)
-- Add user-scoped RLS when auth lands

create or replace function update_briefings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists briefings_updated_at on briefings;
create trigger briefings_updated_at
  before update on briefings
  for each row execute function update_briefings_updated_at();

create or replace function update_sources_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists sources_updated_at on sources;
create trigger sources_updated_at
  before update on sources
  for each row execute function update_sources_updated_at();

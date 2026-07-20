-- Run in Supabase SQL editor if briefings already exists without read_at
alter table briefings
  add column if not exists read_at timestamptz;

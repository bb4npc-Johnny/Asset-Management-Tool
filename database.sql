-- Run this file inside Supabase:
-- Supabase Dashboard > SQL Editor > New Query

create extension if not exists "pgcrypto";

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),

  asset_id text not null,
  device_name text not null,
  device_type text not null,
  assigned_to text,
  department text,
  status text not null default 'Available',
  condition text not null default 'Good',
  return_date date,
  notes text,

  created_by uuid references auth.users(id) on delete set null,
  created_by_email text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_by_email text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_assets_updated_at on public.assets;

create trigger set_assets_updated_at
before update on public.assets
for each row
execute function public.set_updated_at();

alter table public.assets enable row level security;

-- Simple team-wide policy:
-- every logged-in user can view, create, edit, and delete assets.
-- Good for a small internal team.
drop policy if exists "Logged in users can read assets" on public.assets;
drop policy if exists "Logged in users can insert assets" on public.assets;
drop policy if exists "Logged in users can update assets" on public.assets;
drop policy if exists "Logged in users can delete assets" on public.assets;

create policy "Logged in users can read assets"
on public.assets
for select
to authenticated
using (true);

create policy "Logged in users can insert assets"
on public.assets
for insert
to authenticated
with check (true);

create policy "Logged in users can update assets"
on public.assets
for update
to authenticated
using (true)
with check (true);

create policy "Logged in users can delete assets"
on public.assets
for delete
to authenticated
using (true);

-- Required for Supabase Realtime:
alter publication supabase_realtime add table public.assets;

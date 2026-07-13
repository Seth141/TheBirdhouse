-- Birdhouse schema: species catalog + observations from the inference service.
-- Apply via Supabase SQL editor or: supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  scientific_name text,
  first_seen_at timestamptz,
  total_sightings int not null default 0,
  created_at timestamptz not null default now(),
  constraint species_common_name_unique unique (common_name)
);

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  species_id uuid references public.species(id) on delete set null,
  detected_label text not null,
  confidence numeric not null,
  image_url text not null,
  bbox jsonb,
  verified boolean not null default false,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists observations_observed_at_desc_idx
  on public.observations (observed_at desc);

create index if not exists observations_species_id_idx
  on public.observations (species_id);

-- Public read; writes only via service role (bypasses RLS).
alter table public.species enable row level security;
alter table public.observations enable row level security;

drop policy if exists "Public read species" on public.species;
create policy "Public read species"
  on public.species for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read observations" on public.observations;
create policy "Public read observations"
  on public.observations for select
  to anon, authenticated
  using (true);

-- Realtime for live dashboard updates (idempotent)
do $$
begin
  alter publication supabase_realtime add table public.observations;
exception
  when duplicate_object then null;
end $$;

-- Storage bucket for cropped bird images (public read)
insert into storage.buckets (id, name, public)
values ('bird-images', 'bird-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read bird images" on storage.objects;
create policy "Public read bird images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'bird-images');

drop policy if exists "Service role upload bird images" on storage.objects;
create policy "Service role upload bird images"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'bird-images');

drop policy if exists "Service role update bird images" on storage.objects;
create policy "Service role update bird images"
  on storage.objects for update
  to service_role
  using (bucket_id = 'bird-images');

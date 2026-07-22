-- Keep full observation history while retaining images for only the six
-- newest accepted species identifications.

alter table public.observations
  alter column image_url drop not null;

alter table public.observations
  add column if not exists image_path text;

alter table public.observations
  add column if not exists is_recognized boolean not null default false;

update public.observations
set image_path = split_part(image_url, '/bird-images/', 2)
where image_url is not null
  and image_path is null
  and image_url like '%/bird-images/%';

update public.observations
set is_recognized = true
where image_url is not null
  and lower(detected_label) not in ('bird', 'unknown bird');

create table if not exists public.bird_image_cleanup_queue (
  storage_path text primary key,
  queued_at timestamptz not null default now()
);

alter table public.bird_image_cleanup_queue enable row level security;

with ranked as (
  select
    id,
    image_path,
    row_number() over (order by observed_at desc, id desc) as queue_position
  from public.observations
  where is_recognized
    and image_url is not null
    and image_path is not null
)
insert into public.bird_image_cleanup_queue (storage_path)
select image_path
from ranked
where queue_position > 6
on conflict (storage_path) do nothing;

update public.observations as observation
set image_url = null,
    image_path = null
where observation.id in (
  select id
  from (
    select
      id,
      row_number() over (order by observed_at desc, id desc) as queue_position
    from public.observations
    where is_recognized
      and image_url is not null
      and image_path is not null
  ) ranked
  where ranked.queue_position > 6
);

create or replace function public.enqueue_bird_observation(
  p_species_id uuid,
  p_detected_label text,
  p_confidence numeric,
  p_image_url text,
  p_image_path text,
  p_bbox jsonb,
  p_observed_at timestamptz default now(),
  p_limit integer default 6
)
returns table(observation_id uuid, evicted_image_paths text[])
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_observation_id uuid;
  v_evicted_paths text[];
begin
  if p_image_url is null or p_image_path is null then
    raise exception 'Accepted bird observations require image_url and image_path';
  end if;

  -- Serialize queue mutations so simultaneous workers cannot exceed the cap.
  perform pg_advisory_xact_lock(2026072005);

  insert into public.observations (
    species_id,
    detected_label,
    confidence,
    image_url,
    image_path,
    is_recognized,
    bbox,
    observed_at
  )
  values (
    p_species_id,
    p_detected_label,
    p_confidence,
    p_image_url,
    p_image_path,
    true,
    p_bbox,
    p_observed_at
  )
  returning id into v_observation_id;

  with ranked as (
    select
      id,
      image_path,
      row_number() over (order by observed_at desc, id desc) as queue_position
    from public.observations
    where is_recognized
      and image_url is not null
      and image_path is not null
  ),
  evicted as (
    select id, image_path
    from ranked
    where queue_position > greatest(p_limit, 1)
  )
  select coalesce(array_agg(image_path), '{}'::text[])
  into v_evicted_paths
  from evicted;

  insert into public.bird_image_cleanup_queue (storage_path)
  select unnest(v_evicted_paths)
  on conflict (storage_path) do nothing;

  update public.observations as observation
  set image_url = null,
      image_path = null
  where observation.id in (
    select id
    from (
      select
        id,
        row_number() over (order by observed_at desc, id desc) as queue_position
      from public.observations
      where is_recognized
        and image_url is not null
        and image_path is not null
    ) ranked
    where ranked.queue_position > greatest(p_limit, 1)
  );

  return query select v_observation_id, v_evicted_paths;
end;
$$;

revoke all on function public.enqueue_bird_observation(
  uuid, text, numeric, text, text, jsonb, timestamptz, integer
) from public, anon, authenticated;
grant execute on function public.enqueue_bird_observation(
  uuid, text, numeric, text, text, jsonb, timestamptz, integer
) to service_role;

drop policy if exists "Service role delete bird images" on storage.objects;
create policy "Service role delete bird images"
  on storage.objects for delete
  to service_role
  using (bucket_id = 'bird-images');

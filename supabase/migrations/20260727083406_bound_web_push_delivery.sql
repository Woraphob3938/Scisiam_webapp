begin;

create or replace function public.upsert_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth_key text,
  p_user_agent text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_user_id uuid;
  normalized_endpoint text := btrim(coalesce(p_endpoint, ''));
  normalized_p256dh text := btrim(coalesce(p_p256dh, ''));
  normalized_auth_key text := btrim(coalesce(p_auth_key, ''));
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if normalized_endpoint !~* '^https://[^/[:space:][:cntrl:]]+(/|$)'
    or char_length(normalized_endpoint) > 2048
    or normalized_endpoint ~ '[[:space:][:cntrl:]]'
    or normalized_p256dh !~ '^[A-Za-z0-9_-]+={0,2}$'
    or char_length(normalized_p256dh) not between 86 and 90
    or normalized_auth_key !~ '^[A-Za-z0-9_-]+={0,2}$'
    or char_length(normalized_auth_key) not between 20 and 26
    or char_length(coalesce(p_user_agent, '')) > 500 then
    raise exception 'Invalid push subscription' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'push-subscriptions:' || v_user_id::text,
      0
    )
  );

  select subscriptions.user_id
  into v_existing_user_id
  from public.push_subscriptions as subscriptions
  where subscriptions.endpoint = normalized_endpoint;

  if v_existing_user_id is not null and v_existing_user_id <> v_user_id then
    raise exception 'Push endpoint belongs to another user'
      using errcode = '42501';
  end if;

  if v_existing_user_id is null then
    delete from public.push_subscriptions as subscriptions
    where subscriptions.id in (
      select existing.id
      from public.push_subscriptions as existing
      where existing.user_id = v_user_id
      order by existing.updated_at desc, existing.created_at desc
      offset 4
    );
  end if;

  insert into public.push_subscriptions (
    user_id,
    endpoint,
    p256dh,
    auth_key,
    user_agent
  )
  values (
    v_user_id,
    normalized_endpoint,
    normalized_p256dh,
    normalized_auth_key,
    nullif(btrim(coalesce(p_user_agent, '')), '')
  )
  on conflict (endpoint) do update
  set
    p256dh = excluded.p256dh,
    auth_key = excluded.auth_key,
    user_agent = excluded.user_agent,
    updated_at = now()
  where public.push_subscriptions.user_id = v_user_id;

  return true;
end;
$$;

revoke all on function public.upsert_push_subscription(text, text, text, text)
  from public, anon;
grant execute on function public.upsert_push_subscription(text, text, text, text)
  to authenticated;

create table public.assignment_push_deliveries (
  assignment_id uuid primary key
    references public.classroom_assignments(id) on delete cascade,
  requested_by uuid not null
    references auth.users(id) on delete cascade,
  status text not null
    check (status in ('queued', 'completed', 'failed')),
  attempt_count integer not null default 1
    check (attempt_count between 1 and 3),
  sent_count integer not null default 0
    check (sent_count between 0 and 1000),
  error_code text null
    check (error_code is null or char_length(error_code) <= 80),
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);

alter table public.assignment_push_deliveries enable row level security;

revoke all on table public.assignment_push_deliveries
  from public, anon, authenticated;
grant all on table public.assignment_push_deliveries
  to service_role;

commit;

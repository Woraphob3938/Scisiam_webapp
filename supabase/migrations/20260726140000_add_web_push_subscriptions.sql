create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

revoke all on table public.push_subscriptions from public, anon, authenticated;

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
  normalized_endpoint text := btrim(coalesce(p_endpoint, ''));
  normalized_p256dh text := btrim(coalesce(p_p256dh, ''));
  normalized_auth_key text := btrim(coalesce(p_auth_key, ''));
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if normalized_endpoint !~* '^https://'
     or char_length(normalized_endpoint) > 2048
     or char_length(normalized_p256dh) not between 20 and 512
     or char_length(normalized_auth_key) not between 8 and 256
     or char_length(coalesce(p_user_agent, '')) > 500 then
    raise exception 'Invalid push subscription' using errcode = '22023';
  end if;

  insert into public.push_subscriptions (
    user_id,
    endpoint,
    p256dh,
    auth_key,
    user_agent
  ) values (
    auth.uid(),
    normalized_endpoint,
    normalized_p256dh,
    normalized_auth_key,
    nullif(btrim(coalesce(p_user_agent, '')), '')
  )
  on conflict (endpoint) do update
  set
    user_id = auth.uid(),
    p256dh = excluded.p256dh,
    auth_key = excluded.auth_key,
    user_agent = excluded.user_agent,
    updated_at = now();

  return true;
end;
$$;

create or replace function public.delete_push_subscription(p_endpoint text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  delete from public.push_subscriptions
  where user_id = auth.uid()
    and endpoint = btrim(coalesce(p_endpoint, ''));

  return found;
end;
$$;

revoke all on function public.upsert_push_subscription(text, text, text, text)
  from public, anon;
revoke all on function public.delete_push_subscription(text)
  from public, anon;

grant execute on function public.upsert_push_subscription(text, text, text, text)
  to authenticated;
grant execute on function public.delete_push_subscription(text)
  to authenticated;

create schema if not exists private;

drop policy if exists "ai_rate_limits_no_direct_access" on public.ai_rate_limits;

create policy "ai_rate_limits_no_direct_access"
on public.ai_rate_limits
for all
to anon, authenticated
using (false)
with check (false);

create or replace function private.check_ai_rate_limit_internal(
  p_client_key text,
  p_window_seconds integer default 60,
  p_max_requests integer default 12
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_window interval := make_interval(secs => greatest(coalesce(p_window_seconds, 60), 1));
  v_limit integer := greatest(coalesce(p_max_requests, 12), 1);
  v_count integer;
  v_reset_at timestamptz;
begin
  if p_client_key is null or length(trim(p_client_key)) < 16 then
    return jsonb_build_object('ok', false, 'allowed', false, 'reason', 'invalid_client_key');
  end if;

  insert into public.ai_rate_limits (client_key, window_start, request_count, updated_at)
  values (p_client_key, v_now, 1, v_now)
  on conflict (client_key) do update set
    window_start = case
      when public.ai_rate_limits.window_start <= v_now - v_window then v_now
      else public.ai_rate_limits.window_start
    end,
    request_count = case
      when public.ai_rate_limits.window_start <= v_now - v_window then 1
      else public.ai_rate_limits.request_count + 1
    end,
    updated_at = v_now
  returning request_count, window_start + v_window
  into v_count, v_reset_at;

  return jsonb_build_object(
    'ok', true,
    'allowed', v_count <= v_limit,
    'count', v_count,
    'limit', v_limit,
    'reset_at', v_reset_at
  );
end;
$$;

revoke all on function private.check_ai_rate_limit_internal(text, integer, integer) from public;
grant execute on function private.check_ai_rate_limit_internal(text, integer, integer) to anon, authenticated;

create or replace function public.check_ai_rate_limit(
  p_client_key text,
  p_window_seconds integer default 60,
  p_max_requests integer default 12
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.check_ai_rate_limit_internal(p_client_key, p_window_seconds, p_max_requests);
$$;

revoke all on function public.check_ai_rate_limit(text, integer, integer) from public;
grant execute on function public.check_ai_rate_limit(text, integer, integer) to anon, authenticated;

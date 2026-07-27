begin;

revoke all on function public.check_ai_rate_limit(text, integer, integer)
  from public, anon, authenticated;
revoke all on function private.check_ai_rate_limit_internal(text, integer, integer)
  from public, anon, authenticated;

drop function if exists public.consume_ai_rate_limit(uuid);

create function public.consume_ai_rate_limit(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_window interval := interval '60 seconds';
  v_limit integer := 12;
  v_key text := 'user:' || p_user_id::text;
  v_count integer;
  v_reset_at timestamptz;
begin
  if p_user_id is null then
    raise exception 'User id is required' using errcode = '22023';
  end if;

  delete from public.ai_rate_limits
  where ctid in (
    select limits.ctid
    from public.ai_rate_limits as limits
    where limits.updated_at < v_now - interval '1 day'
    limit 1000
  );

  insert into public.ai_rate_limits (
    client_key,
    window_start,
    request_count,
    updated_at
  )
  values (v_key, v_now, 1, v_now)
  on conflict (client_key) do update
  set
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

revoke all on function public.consume_ai_rate_limit(uuid)
  from public, anon, authenticated;
grant execute on function public.consume_ai_rate_limit(uuid)
  to service_role;

commit;

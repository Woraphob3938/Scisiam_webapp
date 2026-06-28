begin;

-- Keep the legacy columns for historical compatibility, but make all new
-- experiment runs and progress updates score-free.
create or replace function private.save_experiment_run_internal(
  p_lab_id text,
  p_title text default null,
  p_variables jsonb default '{}'::jsonb,
  p_live_values jsonb default '{}'::jsonb,
  p_graph_points jsonb default '[]'::jsonb,
  p_table_rows jsonb default '[]'::jsonb,
  p_prediction jsonb default null,
  p_reflection text default null,
  p_summary jsonb default '{}'::jsonb,
  p_score numeric default null,
  p_duration_seconds integer default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_run_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not exists (select 1 from public.labs where id = p_lab_id and is_active) then
    raise exception 'Unknown or inactive lab: %', p_lab_id using errcode = '22023';
  end if;

  insert into public.experiment_runs (
    user_id, lab_id, status, title, variables, live_values, graph_points,
    table_rows, prediction, reflection, summary, score, points_awarded,
    duration_seconds, submitted_at
  ) values (
    v_user_id, p_lab_id, 'submitted'::public.scisiam_submission_status,
    nullif(p_title, ''), coalesce(p_variables, '{}'::jsonb),
    coalesce(p_live_values, '{}'::jsonb), coalesce(p_graph_points, '[]'::jsonb),
    coalesce(p_table_rows, '[]'::jsonb), p_prediction, nullif(p_reflection, ''),
    coalesce(p_summary, '{}'::jsonb), null, 0, p_duration_seconds, now()
  ) returning id into v_run_id;

  insert into public.lab_progress (
    user_id, lab_id, status, progress_percent, attempts_count, best_score,
    last_score, points_awarded, last_run_id, last_activity_at, completed_at
  ) values (
    v_user_id, p_lab_id, 'completed'::public.scisiam_progress_status, 100, 1,
    null, null, 0, v_run_id, now(), now()
  )
  on conflict (user_id, lab_id) do update set
    status = 'completed'::public.scisiam_progress_status,
    progress_percent = 100,
    attempts_count = public.lab_progress.attempts_count + 1,
    last_run_id = excluded.last_run_id,
    last_activity_at = now(),
    completed_at = coalesce(public.lab_progress.completed_at, now()),
    updated_at = now();

  update public.profiles
  set last_active_at = now(), updated_at = now()
  where id = v_user_id;

  return v_run_id;
end;
$$;

revoke all on function private.save_experiment_run_internal(
  text, text, jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, numeric, integer
) from public, anon, authenticated;
grant execute on function private.save_experiment_run_internal(
  text, text, jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, numeric, integer
) to authenticated;

-- Mission claims remain authoritative and idempotent, but no longer mutate
-- profile points, level, or XP.
create or replace function private.claim_mission_reward_internal(
  p_mission_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_mission public.mission_definitions%rowtype;
  v_existing_claimed_at timestamptz;
  v_progress_count integer;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'reason', 'signed_out');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_mission_id, 0)
  );

  select *
  into v_mission
  from public.mission_definitions
  where id = p_mission_id
    and is_active = true;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'mission_not_found');
  end if;

  insert into public.profiles (id, role, total_points)
  values (v_user_id, 'student'::public.scisiam_user_role, 0)
  on conflict (id) do nothing;

  v_progress_count := private.calculate_mission_progress(
    v_user_id,
    v_mission.id,
    v_mission.mission_type
  );

  if v_progress_count < v_mission.target_count then
    return jsonb_build_object(
      'ok', false,
      'reason', 'not_completed',
      'target_count', v_mission.target_count,
      'progress_count', v_progress_count
    );
  end if;

  select progress.claimed_at
  into v_existing_claimed_at
  from public.user_mission_progress as progress
  where progress.user_id = v_user_id
    and progress.mission_id = p_mission_id
  for update;

  if v_existing_claimed_at is not null then
    return jsonb_build_object(
      'ok', true,
      'claimed', false,
      'already_claimed', true,
      'mission_id', p_mission_id
    );
  end if;

  insert into public.user_mission_progress (
    user_id,
    mission_id,
    progress_count,
    completed_at,
    claimed_at
  ) values (
    v_user_id,
    p_mission_id,
    v_progress_count,
    now(),
    now()
  )
  on conflict (user_id, mission_id) do update set
    progress_count = greatest(
      public.user_mission_progress.progress_count,
      excluded.progress_count
    ),
    completed_at = coalesce(
      public.user_mission_progress.completed_at,
      excluded.completed_at
    ),
    claimed_at = excluded.claimed_at,
    updated_at = now();

  update public.profiles
  set last_active_at = now(), updated_at = now()
  where id = v_user_id;

  return jsonb_build_object(
    'ok', true,
    'claimed', true,
    'already_claimed', false,
    'mission_id', p_mission_id
  );
end;
$$;

revoke all on function private.claim_mission_reward_internal(text)
  from public, anon, authenticated;
grant execute on function private.claim_mission_reward_internal(text)
  to authenticated;

update public.mission_definitions
set points_reward = 0,
    updated_at = now();

update public.mission_definitions
set is_active = false,
    updated_at = now()
where mission_type = 'points_total';

update public.achievement_definitions
set points_reward = 0,
    updated_at = now();

commit;

create or replace function public.save_experiment_run(
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
  v_already_completed boolean := false;
  v_points integer := 25;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not exists (select 1 from public.labs where id = p_lab_id and is_active) then
    raise exception 'Unknown or inactive lab: %', p_lab_id using errcode = '22023';
  end if;

  if p_score is not null and (p_score < 0 or p_score > 100) then
    raise exception 'Score must be between 0 and 100' using errcode = '22023';
  end if;

  select exists (
    select 1
    from public.lab_progress
    where user_id = v_user_id
      and lab_id = p_lab_id
      and status = 'completed'::public.scisiam_progress_status
  ) into v_already_completed;

  insert into public.experiment_runs (
    user_id, lab_id, status, title, variables, live_values, graph_points,
    table_rows, prediction, reflection, summary, score, points_awarded,
    duration_seconds, submitted_at
  ) values (
    v_user_id, p_lab_id, 'submitted'::public.scisiam_submission_status,
    nullif(p_title, ''), coalesce(p_variables, '{}'::jsonb),
    coalesce(p_live_values, '{}'::jsonb), coalesce(p_graph_points, '[]'::jsonb),
    coalesce(p_table_rows, '[]'::jsonb), p_prediction, nullif(p_reflection, ''),
    coalesce(p_summary, '{}'::jsonb), p_score,
    case when v_already_completed then 0 else v_points end,
    p_duration_seconds, now()
  ) returning id into v_run_id;

  insert into public.lab_progress (
    user_id, lab_id, status, progress_percent, attempts_count, best_score,
    last_score, points_awarded, last_run_id, last_activity_at, completed_at
  ) values (
    v_user_id, p_lab_id, 'completed'::public.scisiam_progress_status, 100, 1,
    p_score, p_score, case when v_already_completed then 0 else v_points end,
    v_run_id, now(), now()
  )
  on conflict (user_id, lab_id) do update set
    status = 'completed'::public.scisiam_progress_status,
    progress_percent = 100,
    attempts_count = public.lab_progress.attempts_count + 1,
    best_score = greatest(public.lab_progress.best_score, excluded.last_score),
    last_score = excluded.last_score,
    points_awarded = public.lab_progress.points_awarded
      + case when v_already_completed then 0 else v_points end,
    last_run_id = excluded.last_run_id,
    last_activity_at = now(),
    completed_at = coalesce(public.lab_progress.completed_at, now()),
    updated_at = now();

  if not v_already_completed then
    update public.profiles
    set
      total_points = total_points + v_points,
      xp = xp + v_points,
      current_level = greatest(1, ((xp + v_points) / 100) + 1),
      last_active_at = now(),
      updated_at = now()
    where id = v_user_id;
  else
    update public.profiles
    set last_active_at = now(), updated_at = now()
    where id = v_user_id;
  end if;

  return v_run_id;
end;
$$;

revoke all on function public.save_experiment_run(
  text, text, jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, numeric, integer
) from public;
grant execute on function public.save_experiment_run(
  text, text, jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, numeric, integer
) to authenticated;

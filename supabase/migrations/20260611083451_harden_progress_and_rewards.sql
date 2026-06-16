begin;

-- New accounts must never receive an authorization role from user-editable
-- auth metadata. Teacher/admin promotion is an administrative operation.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, display_name, email, total_points)
  values (
    new.id,
    'student'::public.scisiam_user_role,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'นักเรียน'
    ),
    new.email,
    0
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

alter table public.profiles
  alter column total_points set default 0;

-- The browser may read its own rows through RLS, but authoritative score,
-- progress, achievement, and role changes must go through reviewed RPCs.
revoke insert, update, delete, truncate, references, trigger
  on table public.profiles from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.experiment_runs from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.lab_progress from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.user_achievements from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.user_mission_progress from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.experiment_runs to authenticated;
grant select on table public.lab_progress to authenticated;
grant select on table public.user_achievements to authenticated;
grant select on table public.user_mission_progress to authenticated;

drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own editable profile fields" on public.profiles;

drop policy if exists "Users can insert own experiment runs" on public.experiment_runs;
drop policy if exists "Users can update own experiment runs" on public.experiment_runs;
drop policy if exists "Users can delete own experiment runs" on public.experiment_runs;

drop policy if exists "Users can insert own lab progress" on public.lab_progress;
drop policy if exists "Users can update own lab progress" on public.lab_progress;
drop policy if exists "Users can delete own lab progress" on public.lab_progress;

drop policy if exists "Users can insert own achievements" on public.user_achievements;
drop policy if exists "Users can delete own achievements" on public.user_achievements;

drop policy if exists "Users can insert own mission progress" on public.user_mission_progress;
drop policy if exists "Users can update own mission progress" on public.user_mission_progress;
drop policy if exists "Users can delete own mission progress" on public.user_mission_progress;

-- Remove the old API that accepted a client-supplied progress count.
revoke all on function public.claim_mission_reward(text, integer)
  from public, anon, authenticated;
drop function if exists public.claim_mission_reward(text, integer);
drop function if exists private.claim_mission_reward_internal(text, integer);

create or replace function private.calculate_mission_progress(
  p_user_id uuid,
  p_mission_id text,
  p_mission_type text
)
returns integer
language plpgsql
stable
set search_path = ''
as $$
declare
  v_category public.scisiam_lab_category;
  v_lab_id text;
  v_progress integer := 0;
begin
  if p_mission_type = 'daily_login' then
    return 1;
  end if;

  if p_mission_type = 'completed_labs' then
    select count(distinct progress.lab_id)::integer
    into v_progress
    from public.lab_progress as progress
    where progress.user_id = p_user_id
      and progress.status = 'completed'::public.scisiam_progress_status;

    return coalesce(v_progress, 0);
  end if;

  if p_mission_type = 'category_completed' then
    v_category := case p_mission_id
      when 'physics_starter' then 'Physics'::public.scisiam_lab_category
      when 'chemistry_starter' then 'Chemistry'::public.scisiam_lab_category
      when 'biology_starter' then 'Biology'::public.scisiam_lab_category
      else null
    end;

    if v_category is null then
      return 0;
    end if;

    select count(distinct progress.lab_id)::integer
    into v_progress
    from public.lab_progress as progress
    join public.labs as lab on lab.id = progress.lab_id
    where progress.user_id = p_user_id
      and progress.status = 'completed'::public.scisiam_progress_status
      and lab.category = v_category;

    return coalesce(v_progress, 0);
  end if;

  if p_mission_type = 'lab_completed' then
    v_lab_id := case p_mission_id
      when 'quest-ohms' then 'ohms-law'
      when 'quest-cooling' then 'newtons-cooling'
      when 'quest-equilibrium' then 'le-chateliers-principle'
      when 'quest-hesss' then 'hesss-law'
      else null
    end;

    if v_lab_id is null then
      return 0;
    end if;

    select count(*)::integer
    into v_progress
    from public.lab_progress as progress
    where progress.user_id = p_user_id
      and progress.lab_id = v_lab_id
      and progress.status = 'completed'::public.scisiam_progress_status;

    return least(coalesce(v_progress, 0), 1);
  end if;

  if p_mission_type = 'points_total' then
    select coalesce(profile.total_points, 0)
    into v_progress
    from public.profiles as profile
    where profile.id = p_user_id;

    return coalesce(v_progress, 0);
  end if;

  return 0;
end;
$$;

revoke all on function private.calculate_mission_progress(uuid, text, text)
  from public, anon, authenticated;

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
  v_total_points integer;
  v_current_level integer;
  v_xp integer;
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
    select profile.total_points, profile.current_level, profile.xp
    into v_total_points, v_current_level, v_xp
    from public.profiles as profile
    where profile.id = v_user_id;

    return jsonb_build_object(
      'ok', true,
      'claimed', false,
      'already_claimed', true,
      'mission_id', p_mission_id,
      'points_awarded', 0,
      'progress_count', v_progress_count,
      'total_points', coalesce(v_total_points, 0),
      'current_level', coalesce(v_current_level, 1),
      'xp', coalesce(v_xp, 0)
    );
  end if;

  insert into public.user_mission_progress (
    user_id,
    mission_id,
    progress_count,
    completed_at,
    claimed_at
  )
  values (
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
  set
    total_points = total_points + v_mission.points_reward,
    xp = xp + v_mission.points_reward,
    current_level = (
      floor((total_points + v_mission.points_reward)::numeric / 200) + 1
    )::integer,
    last_active_at = now(),
    updated_at = now()
  where id = v_user_id
  returning total_points, current_level, xp
  into v_total_points, v_current_level, v_xp;

  return jsonb_build_object(
    'ok', true,
    'claimed', true,
    'already_claimed', false,
    'mission_id', p_mission_id,
    'points_awarded', v_mission.points_reward,
    'progress_count', v_progress_count,
    'total_points', coalesce(v_total_points, 0),
    'current_level', coalesce(v_current_level, 1),
    'xp', coalesce(v_xp, 0)
  );
end;
$$;

revoke all on function private.claim_mission_reward_internal(text)
  from public, anon, authenticated;

create or replace function public.claim_mission_reward(
  p_mission_id text
)
returns jsonb
language sql
set search_path = ''
as $$
  select private.claim_mission_reward_internal(p_mission_id);
$$;

revoke all on function public.claim_mission_reward(text)
  from public, anon;
grant execute on function public.claim_mission_reward(text)
  to authenticated;

commit;

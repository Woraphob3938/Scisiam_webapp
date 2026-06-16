create schema if not exists private;

insert into public.mission_definitions
  (id, title, description, mission_type, target_count, points_reward, is_active, sort_order)
values
  ('daily-login', 'เข้าศึกษาประจําวัน (Daily Log-in)', 'เข้าสู่ระบบการเรียนรู้และสำรวจห้องปฏิบัติการจำลองของ SciSiam', 'daily_login', 1, 10, true, 10),
  ('daily-science-1', 'ผู้ใฝ่รู้ห้องปฏิบัติการ (Science Explorer)', 'ทำการจำลองแล็บสำเร็จและบันทึกผลอย่างน้อย 1 ห้อง', 'completed_labs', 1, 25, true, 20),
  ('daily-science-3', 'ยอดนักวิจัยขั้นสูง (Expert Inquirer)', 'ทำวิจัยเชิงปฏิบัติการและบันทึกผลสำเร็จครบ 3 ห้อง', 'completed_labs', 3, 50, true, 30),
  ('quest-ohms', 'เควสต์: วิศวกรไฟฟ้ากระแสตรง', 'ทำจำลองห้องปฏิบัติการวงจรกระแสตรงกฎของโอห์มสำเร็จ', 'lab_completed', 1, 30, true, 40),
  ('quest-cooling', 'เควสต์: ผู้ควบคุมความร้อนนิวตัน', 'ทำจำลองห้องปฏิบัติการกฎการเย็นตัวของนิวตันสำเร็จ', 'lab_completed', 1, 30, true, 50),
  ('quest-equilibrium', 'เควสต์: ปรมาจารย์สมดุลเคมี', 'ทำจำลองห้องปฏิบัติการการรบกวนสมดุลเคมีสำเร็จ', 'lab_completed', 1, 30, true, 60),
  ('quest-hesss', 'เควสต์: ยอดนักคำนวณแคลอรี', 'ทำจำลองห้องปฏิบัติการ Hess''s Law & Calorimetry สำเร็จ', 'lab_completed', 1, 30, true, 70),
  ('ach-first-lab', 'จุดเริ่มต้นของนักวิทยาศาสตร์', 'ปลดล็อกจากการทำห้องปฏิบัติการใดๆ ในระบบสำเร็จเป็นครั้งแรก', 'completed_labs', 1, 20, true, 80),
  ('ach-five-labs', 'ผู้เชี่ยวชาญการวิจัยเสมือนจริง', 'ฝึกฝนทักษะการทดลองในห้องปฏิบัติการจำลองครบ 5 การทดลอง', 'completed_labs', 5, 50, true, 90),
  ('ach-point-collector', 'ยอดนักสะสมรางวัลเหรียญตรา', 'เก็บสะสมคะแนนวิจัยรวมให้ถึง 300 คะแนน', 'points_total', 300, 40, true, 100)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  mission_type = excluded.mission_type,
  target_count = excluded.target_count,
  points_reward = excluded.points_reward,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

create table if not exists public.ai_rate_limits (
  client_key text primary key,
  window_start timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.ai_rate_limits is
  'Durable coarse rate-limit counters for server-side AI tutor requests. client_key should be a server-generated hash, not raw IP.';

alter table public.ai_rate_limits enable row level security;

revoke all on table public.ai_rate_limits from anon, authenticated;

create index if not exists ai_rate_limits_updated_idx
  on public.ai_rate_limits (updated_at desc);

create or replace function private.claim_mission_reward_internal(
  p_mission_id text,
  p_progress_count integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_mission public.mission_definitions%rowtype;
  v_existing_claimed_at timestamptz;
  v_progress_count integer;
  v_total_points integer;
  v_current_level integer;
  v_xp integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return jsonb_build_object('ok', false, 'reason', 'signed_out');
  end if;

  select *
  into v_mission
  from public.mission_definitions
  where id = p_mission_id
    and is_active = true;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'mission_not_found');
  end if;

  v_progress_count := greatest(coalesce(p_progress_count, 0), 0);

  if v_progress_count < v_mission.target_count then
    return jsonb_build_object(
      'ok', false,
      'reason', 'not_completed',
      'target_count', v_mission.target_count,
      'progress_count', v_progress_count
    );
  end if;

  insert into public.profiles (id)
  values (v_user_id)
  on conflict (id) do nothing;

  select claimed_at
  into v_existing_claimed_at
  from public.user_mission_progress
  where user_id = v_user_id
    and mission_id = p_mission_id
  for update;

  if v_existing_claimed_at is not null then
    select total_points, current_level, xp
    into v_total_points, v_current_level, v_xp
    from public.profiles
    where id = v_user_id;

    return jsonb_build_object(
      'ok', true,
      'claimed', false,
      'already_claimed', true,
      'mission_id', p_mission_id,
      'points_awarded', 0,
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
    progress_count = greatest(public.user_mission_progress.progress_count, excluded.progress_count),
    completed_at = coalesce(public.user_mission_progress.completed_at, excluded.completed_at),
    claimed_at = excluded.claimed_at,
    updated_at = now();

  update public.profiles
  set
    total_points = total_points + v_mission.points_reward,
    xp = xp + v_mission.points_reward,
    current_level = (floor((total_points + v_mission.points_reward)::numeric / 200) + 1)::integer,
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
    'total_points', coalesce(v_total_points, 0),
    'current_level', coalesce(v_current_level, 1),
    'xp', coalesce(v_xp, 0)
  );
end;
$$;

revoke all on function private.claim_mission_reward_internal(text, integer) from public;
grant execute on function private.claim_mission_reward_internal(text, integer) to authenticated;

create or replace function public.claim_mission_reward(
  p_mission_id text,
  p_progress_count integer default 0
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.claim_mission_reward_internal(p_mission_id, p_progress_count);
$$;

revoke all on function public.claim_mission_reward(text, integer) from public;
grant execute on function public.claim_mission_reward(text, integer) to authenticated;

create or replace function public.check_ai_rate_limit(
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

revoke all on function public.check_ai_rate_limit(text, integer, integer) from public;
grant execute on function public.check_ai_rate_limit(text, integer, integer) to anon, authenticated;

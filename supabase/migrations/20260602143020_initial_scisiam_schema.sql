-- SciSiam baseline schema. Later migrations in this directory harden
-- authoritative progress writes and server-side reward calculation.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'scisiam_user_role') then
    create type public.scisiam_user_role as enum ('student', 'teacher', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'scisiam_lab_category') then
    create type public.scisiam_lab_category as enum ('Physics', 'Chemistry', 'Biology');
  end if;
  if not exists (select 1 from pg_type where typname = 'scisiam_lab_status') then
    create type public.scisiam_lab_status as enum ('draft', 'ready', 'sandbox', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'scisiam_progress_status') then
    create type public.scisiam_progress_status as enum ('not_started', 'in_progress', 'completed');
  end if;
  if not exists (select 1 from pg_type where typname = 'scisiam_ai_message_role') then
    create type public.scisiam_ai_message_role as enum ('user', 'assistant', 'system');
  end if;
  if not exists (select 1 from pg_type where typname = 'scisiam_submission_status') then
    create type public.scisiam_submission_status as enum ('draft', 'submitted', 'reviewed', 'returned');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.scisiam_user_role not null default 'student',
  display_name text not null default 'นักเรียน',
  email text,
  avatar_url text,
  school_name text,
  grade_level text,
  classroom_label text,
  preferred_language text not null default 'th'
    check (preferred_language in ('th', 'en')),
  total_points integer not null default 145 check (total_points >= 0),
  current_level integer not null default 1 check (current_level >= 1),
  xp integer not null default 0 check (xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  onboarding_completed boolean not null default false,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, display_name, email)
  values (
    new.id,
    case
      when new.raw_user_meta_data ->> 'role' in ('student', 'teacher')
        then (new.raw_user_meta_data ->> 'role')::public.scisiam_user_role
      else 'student'::public.scisiam_user_role
    end,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'นักเรียน'
    ),
    new.email
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

drop trigger if exists on_auth_user_created_create_scisiam_profile on auth.users;
create trigger on_auth_user_created_create_scisiam_profile
after insert on auth.users
for each row execute function private.handle_new_user();

create table public.labs (
  id text primary key,
  title text not null,
  category public.scisiam_lab_category not null,
  description text not null,
  status public.scisiam_lab_status not null default 'ready',
  order_index integer not null default 0,
  is_active boolean not null default true,
  simulation_path text generated always as ('/labs/' || id || '/simulation') stored,
  detail_path text generated always as ('/labs/' || id) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger labs_set_updated_at
before update on public.labs
for each row execute function public.set_updated_at();

create index labs_category_order_idx on public.labs (category, order_index);
create index labs_active_idx on public.labs (is_active) where is_active;

insert into public.labs (id, title, category, description, order_index, status) values
  ('newtons-cooling', 'Newton''s law of cooling', 'Physics', 'Newton cooling laboratory', 1, 'sandbox'),
  ('ohms-law', 'Ohm''s Law & DC Circuits', 'Physics', 'Ohm law laboratory', 2, 'ready'),
  ('hookes-law', 'Hooke''s Law of Elasticity', 'Physics', 'Hooke law laboratory', 3, 'ready'),
  ('snells-law', 'Snell''s Law of Refraction', 'Physics', 'Snell law laboratory', 4, 'ready'),
  ('ideal-gas-law', 'Ideal Gas Law Simulation', 'Physics', 'Ideal gas laboratory', 5, 'ready'),
  ('newtons-second-law', 'Newton''s Second Law of Motion', 'Physics', 'Newton second law laboratory', 6, 'ready'),
  ('momentum-conservation', 'Conservation of Linear Momentum', 'Physics', 'Momentum laboratory', 7, 'ready'),
  ('faradays-law', 'Faraday''s Electromagnetic Induction', 'Physics', 'Faraday law laboratory', 8, 'ready'),
  ('bernoullis-principle', 'Bernoulli''s Principle & Fluid Dynamics', 'Physics', 'Bernoulli laboratory', 9, 'ready'),
  ('photoelectric-effect', 'Einstein''s Photoelectric Effect', 'Physics', 'Photoelectric laboratory', 10, 'ready'),
  ('keplers-laws', 'Kepler''s Third Law of Planetary Motion', 'Physics', 'Kepler law laboratory', 11, 'ready'),
  ('stefan-boltzmann', 'Stefan-Boltzmann Law of Blackbody Radiation', 'Physics', 'Blackbody laboratory', 12, 'ready'),
  ('acid-base-titration', 'Acid-Base Titration Lab', 'Chemistry', 'Titration laboratory', 13, 'ready'),
  ('boyles-law', 'Boyle''s Gas Law Lab', 'Chemistry', 'Boyle law laboratory', 14, 'ready'),
  ('charles-law', 'Charles''s Temperature-Volume Lab', 'Chemistry', 'Charles law laboratory', 15, 'ready'),
  ('le-chateliers-principle', 'Chemical Equilibrium Shift', 'Chemistry', 'Equilibrium laboratory', 16, 'ready'),
  ('beer-lambert-law', 'Spectrophotometry & Concentration', 'Chemistry', 'Spectrophotometry laboratory', 17, 'ready'),
  ('hesss-law', 'Hess''s Law & Calorimetry', 'Chemistry', 'Calorimetry laboratory', 18, 'ready'),
  ('galvanic-cell', 'Galvanic Cells & Voltage', 'Chemistry', 'Galvanic cell laboratory', 19, 'ready'),
  ('chemical-kinetics', 'Chemical Reaction Rates', 'Chemistry', 'Reaction rate laboratory', 20, 'ready'),
  ('solubility-product', 'Solubility Product Constant', 'Chemistry', 'Solubility laboratory', 21, 'ready'),
  ('avogadros-law', 'Avogadro''s Molar Volume', 'Chemistry', 'Molar volume laboratory', 22, 'ready'),
  ('electrolysis-lab', 'Electrolysis & Metal Plating', 'Chemistry', 'Electrolysis laboratory', 23, 'ready'),
  ('colligative-properties', 'Colligative Properties Lab', 'Chemistry', 'Colligative properties laboratory', 24, 'ready'),
  ('photosynthesis-rate', 'Photosynthesis Rate Chamber', 'Biology', 'Photosynthesis laboratory', 25, 'ready'),
  ('mendels-inheritance', 'Mendelian Genetics Lab', 'Biology', 'Genetics laboratory', 26, 'ready'),
  ('mitosis-division', 'Mitosis & Cell Cycle', 'Biology', 'Mitosis laboratory', 27, 'ready'),
  ('cell-osmosis', 'Osmosis & Plasmolysis', 'Biology', 'Osmosis laboratory', 28, 'ready'),
  ('enzyme-kinetics', 'Enzyme Catalysis Lab', 'Biology', 'Enzyme laboratory', 29, 'ready'),
  ('dna-extraction', 'DNA Extraction Chamber', 'Biology', 'DNA extraction laboratory', 30, 'ready'),
  ('cellular-respiration', 'Cellular Respiration Lab', 'Biology', 'Respiration laboratory', 31, 'ready'),
  ('plant-transpiration', 'Plant Transpiration Potometer', 'Biology', 'Transpiration laboratory', 32, 'ready'),
  ('natural-selection', 'Natural Selection Simulator', 'Biology', 'Natural selection laboratory', 33, 'ready'),
  ('blood-typing', 'Blood Typing & Agglutination', 'Biology', 'Blood typing laboratory', 34, 'ready'),
  ('food-chain', 'Food Chain & Ecology', 'Biology', 'Ecology laboratory', 35, 'ready'),
  ('heart-rate', 'Cardiovascular System Lab', 'Biology', 'Cardiovascular laboratory', 36, 'ready')
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  description = excluded.description,
  order_index = excluded.order_index,
  status = excluded.status,
  updated_at = now();

create table public.experiment_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lab_id text not null references public.labs(id) on delete restrict,
  status public.scisiam_submission_status not null default 'draft',
  title text,
  variables jsonb not null default '{}'::jsonb,
  live_values jsonb not null default '{}'::jsonb,
  graph_points jsonb not null default '[]'::jsonb,
  table_rows jsonb not null default '[]'::jsonb,
  prediction jsonb,
  reflection text,
  summary jsonb not null default '{}'::jsonb,
  score numeric(5,2) check (score is null or score between 0 and 100),
  points_awarded integer not null default 0 check (points_awarded >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger experiment_runs_set_updated_at
before update on public.experiment_runs
for each row execute function public.set_updated_at();

create index experiment_runs_user_created_idx
  on public.experiment_runs (user_id, created_at desc);
create index experiment_runs_lab_created_idx
  on public.experiment_runs (lab_id, created_at desc);
create index experiment_runs_user_lab_idx
  on public.experiment_runs (user_id, lab_id, created_at desc);

create table public.lab_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lab_id text not null references public.labs(id) on delete restrict,
  status public.scisiam_progress_status not null default 'not_started',
  progress_percent numeric(5,2) not null default 0
    check (progress_percent between 0 and 100),
  attempts_count integer not null default 0 check (attempts_count >= 0),
  best_score numeric(5,2) check (best_score is null or best_score between 0 and 100),
  last_score numeric(5,2) check (last_score is null or last_score between 0 and 100),
  points_awarded integer not null default 0 check (points_awarded >= 0),
  last_run_id uuid references public.experiment_runs(id) on delete set null,
  last_activity_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lab_id)
);

create trigger lab_progress_set_updated_at
before update on public.lab_progress
for each row execute function public.set_updated_at();

create index lab_progress_user_status_idx
  on public.lab_progress (user_id, status);
create index lab_progress_lab_status_idx
  on public.lab_progress (lab_id, status);

create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  code text not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  school_name text,
  grade_level text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code)
);

create trigger classrooms_set_updated_at
before update on public.classrooms
for each row execute function public.set_updated_at();

create table public.classroom_members (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role public.scisiam_user_role not null default 'student',
  joined_at timestamptz not null default now(),
  unique (classroom_id, user_id)
);

create index classroom_members_classroom_idx
  on public.classroom_members (classroom_id);
create index classroom_members_user_idx
  on public.classroom_members (user_id);

create or replace function private.is_class_teacher(target_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.classrooms
    where id = target_classroom_id and teacher_id = (select auth.uid())
  );
$$;

create or replace function private.is_class_member(target_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.classroom_members
    where classroom_id = target_classroom_id and user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_class_teacher(uuid) from public;
revoke all on function private.is_class_member(uuid) from public;
grant execute on function private.is_class_teacher(uuid) to authenticated;
grant execute on function private.is_class_member(uuid) to authenticated;

create table public.mission_definitions (
  id text primary key,
  title text not null,
  description text not null,
  mission_type text not null,
  target_count integer not null default 1 check (target_count > 0),
  points_reward integer not null default 0 check (points_reward >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger mission_definitions_set_updated_at
before update on public.mission_definitions
for each row execute function public.set_updated_at();

insert into public.mission_definitions
  (id, title, description, mission_type, target_count, points_reward, sort_order)
values
  ('first_lab', 'เริ่มทดลองครั้งแรก', 'บันทึกผลการทดลองครั้งแรก', 'completed_labs', 1, 25, 1),
  ('three_labs', 'นักสำรวจแล็บ', 'ทำแล็บสำเร็จอย่างน้อย 3 ห้อง', 'completed_labs', 3, 50, 2),
  ('five_labs', 'เส้นทางนักวิทยาศาสตร์', 'ทำแล็บสำเร็จอย่างน้อย 5 ห้อง', 'completed_labs', 5, 75, 3),
  ('physics_starter', 'Physics Starter', 'ทำแล็บฟิสิกส์สำเร็จ 1 ห้อง', 'category_completed', 1, 25, 4),
  ('chemistry_starter', 'Chemistry Starter', 'ทำแล็บเคมีสำเร็จ 1 ห้อง', 'category_completed', 1, 25, 5),
  ('biology_starter', 'Biology Starter', 'ทำแล็บชีววิทยาสำเร็จ 1 ห้อง', 'category_completed', 1, 25, 6)
on conflict (id) do nothing;

create table public.user_mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id text not null references public.mission_definitions(id) on delete cascade,
  progress_count integer not null default 0 check (progress_count >= 0),
  completed_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mission_id)
);

create trigger user_mission_progress_set_updated_at
before update on public.user_mission_progress
for each row execute function public.set_updated_at();

create table public.achievement_definitions (
  id text primary key,
  title text not null,
  description text not null,
  icon_name text not null default 'award',
  category public.scisiam_lab_category,
  points_reward integer not null default 0 check (points_reward >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger achievement_definitions_set_updated_at
before update on public.achievement_definitions
for each row execute function public.set_updated_at();

insert into public.achievement_definitions
  (id, title, description, icon_name, category, points_reward, sort_order)
values
  ('cooling_observer', 'Cooling Observer', 'บันทึกผล Newton cooling', 'thermometer', 'Physics', 25, 1),
  ('circuit_builder', 'Circuit Builder', 'บันทึกผล Ohm law', 'zap', 'Physics', 25, 2),
  ('titration_analyst', 'Titration Analyst', 'บันทึกผล titration', 'flask-conical', 'Chemistry', 25, 3),
  ('biology_observer', 'Biology Observer', 'บันทึกผลแล็บชีววิทยา', 'leaf', 'Biology', 25, 4)
on conflict (id) do nothing;

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievement_definitions(id) on delete cascade,
  lab_id text references public.labs(id) on delete set null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id, lab_id)
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lab_id text references public.labs(id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ai_conversations_set_updated_at
before update on public.ai_conversations
for each row execute function public.set_updated_at();

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lab_id text references public.labs(id) on delete set null,
  role public.scisiam_ai_message_role not null,
  content text not null check (char_length(content) <= 8000),
  provider text,
  model text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  created_at timestamptz not null default now()
);

create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  lab_id text references public.labs(id) on delete set null,
  provider text not null default 'gemini',
  model text,
  request_chars integer not null default 0 check (request_chars >= 0),
  response_chars integer not null default 0 check (response_chars >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  success boolean not null default true,
  error_code text,
  created_at timestamptz not null default now()
);

create table public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  lab_id text references public.labs(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.user_lab_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lab_id text not null references public.labs(id) on delete cascade,
  content text not null check (char_length(content) <= 12000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_lab_notes_set_updated_at
before update on public.user_lab_notes
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.labs enable row level security;
alter table public.experiment_runs enable row level security;
alter table public.lab_progress enable row level security;
alter table public.classrooms enable row level security;
alter table public.classroom_members enable row level security;
alter table public.mission_definitions enable row level security;
alter table public.user_mission_progress enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.user_achievements enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_usage_events enable row level security;
alter table public.app_events enable row level security;
alter table public.user_lab_notes enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.labs, public.mission_definitions,
  public.achievement_definitions to anon, authenticated;
grant select, insert on public.profiles to authenticated;
grant update (
  display_name, avatar_url, school_name, grade_level, classroom_label,
  preferred_language, onboarding_completed, last_active_at, updated_at
) on public.profiles to authenticated;
grant select, insert, update, delete on public.experiment_runs to authenticated;
grant select, insert, update, delete on public.lab_progress to authenticated;
grant select, insert, update, delete on public.classrooms to authenticated;
grant select, insert, update, delete on public.classroom_members to authenticated;
grant select, insert, update, delete on public.user_mission_progress to authenticated;
grant select, insert, update, delete on public.user_achievements to authenticated;
grant select, insert, update, delete on public.ai_conversations to authenticated;
grant select, insert, update, delete on public.ai_messages to authenticated;
grant select, insert on public.ai_usage_events to authenticated;
grant select, insert on public.app_events to authenticated;
grant select, insert, update, delete on public.user_lab_notes to authenticated;

create policy "Read active lab catalog" on public.labs
for select to anon, authenticated using (is_active);
create policy "Read active mission definitions" on public.mission_definitions
for select to anon, authenticated using (is_active);
create policy "Read active achievement definitions" on public.achievement_definitions
for select to anon, authenticated using (is_active);

create policy "Users can read own profile" on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy "Users can insert own profile" on public.profiles
for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update own editable profile fields" on public.profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can read own experiment runs" on public.experiment_runs
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own experiment runs" on public.experiment_runs
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own experiment runs" on public.experiment_runs
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users can delete own experiment runs" on public.experiment_runs
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read own lab progress" on public.lab_progress
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own lab progress" on public.lab_progress
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own lab progress" on public.lab_progress
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users can delete own lab progress" on public.lab_progress
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Teachers and members can read classrooms" on public.classrooms
for select to authenticated
using (teacher_id = (select auth.uid()) or private.is_class_member(id));
create policy "Teachers can create own classrooms" on public.classrooms
for insert to authenticated with check (teacher_id = (select auth.uid()));
create policy "Teachers can update own classrooms" on public.classrooms
for update to authenticated using (teacher_id = (select auth.uid()))
with check (teacher_id = (select auth.uid()));
create policy "Teachers can delete own classrooms" on public.classrooms
for delete to authenticated using (teacher_id = (select auth.uid()));

create policy "Members and teachers can read memberships" on public.classroom_members
for select to authenticated
using (user_id = (select auth.uid()) or private.is_class_teacher(classroom_id));
create policy "Users can join or teachers can add members" on public.classroom_members
for insert to authenticated
with check (user_id = (select auth.uid()) or private.is_class_teacher(classroom_id));
create policy "Members and teachers can update memberships" on public.classroom_members
for update to authenticated
using (user_id = (select auth.uid()) or private.is_class_teacher(classroom_id))
with check (user_id = (select auth.uid()) or private.is_class_teacher(classroom_id));
create policy "Members and teachers can delete memberships" on public.classroom_members
for delete to authenticated
using (user_id = (select auth.uid()) or private.is_class_teacher(classroom_id));

create policy "Users can read own mission progress" on public.user_mission_progress
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own mission progress" on public.user_mission_progress
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own mission progress" on public.user_mission_progress
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users can delete own mission progress" on public.user_mission_progress
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read own achievements" on public.user_achievements
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own achievements" on public.user_achievements
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can delete own achievements" on public.user_achievements
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read own AI conversations" on public.ai_conversations
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own AI conversations" on public.ai_conversations
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own AI conversations" on public.ai_conversations
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users can delete own AI conversations" on public.ai_conversations
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read own AI messages" on public.ai_messages
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own AI messages" on public.ai_messages
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can delete own AI messages" on public.ai_messages
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read own AI usage events" on public.ai_usage_events
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own AI usage events" on public.ai_usage_events
for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users can read own app events" on public.app_events
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own app events" on public.app_events
for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users can read own lab notes" on public.user_lab_notes
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own lab notes" on public.user_lab_notes
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own lab notes" on public.user_lab_notes
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users can delete own lab notes" on public.user_lab_notes
for delete to authenticated using ((select auth.uid()) = user_id);

begin;

create extension if not exists pgcrypto;

drop policy if exists "Teachers and members can read classrooms" on public.classrooms;
drop policy if exists "Teachers can create own classrooms" on public.classrooms;
drop policy if exists "Teachers can update own classrooms" on public.classrooms;
drop policy if exists "Teachers can delete own classrooms" on public.classrooms;
drop policy if exists "Members and teachers can read memberships" on public.classroom_members;
drop policy if exists "Members and teachers can update memberships" on public.classroom_members;
drop policy if exists "Members and teachers can delete memberships" on public.classroom_members;

do $$
begin
  execute 'drop policy if exists "Users can join or teachers can add ' ||
    'members" on public.classroom_members';
end;
$$;

alter table public.classrooms rename column teacher_id to creator_id;
alter table public.classrooms add column description text;
alter table public.classrooms add constraint classrooms_name_length
  check (char_length(btrim(name)) between 1 and 80);
alter table public.classrooms add constraint classrooms_description_length
  check (description is null or char_length(description) <= 500);
alter table public.classrooms add constraint classrooms_grade_level_allowed
  check (grade_level in ('ประถม', 'มัธยมต้น', 'มัธยมปลาย', 'อุดมศึกษา'));
alter table public.classrooms alter column grade_level set not null;

create table private.classroom_join_codes (
  classroom_id uuid primary key references public.classrooms(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z2-9]{5,8}$'),
  created_at timestamptz not null default now()
);

insert into private.classroom_join_codes (classroom_id, code)
select id, upper(translate(code, '01', 'GH')) from public.classrooms
on conflict (classroom_id) do nothing;

alter table public.classrooms drop constraint if exists classrooms_code_key;
alter table public.classrooms drop column code;

create table public.classroom_labs (
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  lab_id text not null check (lab_id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  position smallint not null check (position between 0 and 23),
  created_at timestamptz not null default now(),
  primary key (classroom_id, lab_id),
  unique (classroom_id, position)
);

create index classroom_labs_classroom_position_idx
  on public.classroom_labs (classroom_id, position);

alter table public.classroom_labs enable row level security;

insert into public.classroom_members (classroom_id, user_id, member_role)
select classrooms.id, classrooms.creator_id, profiles.role
from public.classrooms
join public.profiles on profiles.id = classrooms.creator_id
on conflict (classroom_id, user_id) do nothing;

create or replace function private.is_class_creator(target_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.classrooms
    where id = target_classroom_id and creator_id = (select auth.uid())
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

revoke all on function private.is_class_creator(uuid) from public, anon;
revoke all on function private.is_class_member(uuid) from public, anon;
grant execute on function private.is_class_creator(uuid) to authenticated;
grant execute on function private.is_class_member(uuid) to authenticated;
drop function if exists private.is_class_teacher(uuid);

create policy "Members can read classrooms" on public.classrooms
for select to authenticated using (private.is_class_member(id));

create policy "Members can read classroom labs" on public.classroom_labs
for select to authenticated using (private.is_class_member(classroom_id));

create policy "Members can read memberships" on public.classroom_members
for select to authenticated using (private.is_class_member(classroom_id));

revoke insert, update, delete on public.classrooms from authenticated;
revoke insert, update, delete on public.classroom_members from authenticated;
revoke insert, update, delete on public.classroom_labs from authenticated;
grant select on public.classrooms, public.classroom_members, public.classroom_labs to authenticated;

create or replace function private.generate_classroom_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  loop
    v_code := pg_catalog.upper(
      pg_catalog.substr(
        pg_catalog.translate(
          pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''),
          '01',
          'GH'
        ),
        1,
        8
      )
    );

    exit when not exists (
      select 1 from private.classroom_join_codes where code = v_code
    );
  end loop;

  return v_code;
end;
$$;

revoke all on function private.generate_classroom_code() from public, anon, authenticated;

create or replace function public.create_classroom(
  p_name text,
  p_grade_level text,
  p_description text,
  p_lab_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_role public.scisiam_user_role;
  v_name text := pg_catalog.btrim(pg_catalog.coalesce(p_name, ''));
  v_description text := pg_catalog.nullif(pg_catalog.btrim(pg_catalog.coalesce(p_description, '')), '');
  v_room_id uuid;
  v_code text;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select role into v_role from public.profiles where id = v_user_id;
  if v_role is null then
    raise exception 'Profile required' using errcode = '42501';
  end if;

  if pg_catalog.char_length(v_name) not between 1 and 80 then
    raise exception 'Classroom name must contain 1-80 characters' using errcode = '22023';
  end if;
  if p_grade_level not in ('ประถม', 'มัธยมต้น', 'มัธยมปลาย', 'อุดมศึกษา') then
    raise exception 'Invalid grade level' using errcode = '22023';
  end if;
  if v_description is not null and pg_catalog.char_length(v_description) > 500 then
    raise exception 'Description exceeds 500 characters' using errcode = '22023';
  end if;
  if p_lab_ids is null or pg_catalog.cardinality(p_lab_ids) not between 1 and 24 then
    raise exception 'Choose 1-24 labs' using errcode = '22023';
  end if;
  if exists (
    select 1 from pg_catalog.unnest(p_lab_ids) as selected(lab_id)
    where selected.lab_id !~ '^[a-z0-9][a-z0-9-]{0,99}$'
  ) then
    raise exception 'Invalid lab id' using errcode = '22023';
  end if;
  if pg_catalog.cardinality(p_lab_ids) <> (
    select pg_catalog.count(distinct selected.lab_id)
    from pg_catalog.unnest(p_lab_ids) as selected(lab_id)
  ) then
    raise exception 'Duplicate lab ids are not allowed' using errcode = '22023';
  end if;

  insert into public.classrooms (creator_id, name, grade_level, description)
  values (v_user_id, v_name, p_grade_level, v_description)
  returning id into v_room_id;

  v_code := private.generate_classroom_code();
  insert into private.classroom_join_codes (classroom_id, code)
  values (v_room_id, v_code);

  insert into public.classroom_members (classroom_id, user_id, member_role)
  values (v_room_id, v_user_id, v_role);

  insert into public.classroom_labs (classroom_id, lab_id, position)
  select v_room_id, selected.lab_id, (selected.ordinality - 1)::smallint
  from pg_catalog.unnest(p_lab_ids) with ordinality as selected(lab_id, ordinality);

  return pg_catalog.jsonb_build_object('classroom_id', v_room_id, 'code', v_code);
end;
$$;

create or replace function public.join_classroom(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_role public.scisiam_user_role;
  v_code text := pg_catalog.upper(
    pg_catalog.regexp_replace(pg_catalog.coalesce(p_code, ''), '\s', '', 'g')
  );
  v_room_id uuid;
  v_rows integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_code !~ '^[A-Z2-9]{5,8}$' then
    raise exception 'Invalid classroom code' using errcode = '22023';
  end if;

  select classrooms.id into v_room_id
  from private.classroom_join_codes
  join public.classrooms on classrooms.id = classroom_join_codes.classroom_id
  where classroom_join_codes.code = v_code and classrooms.is_active
  limit 1;

  if v_room_id is null then
    raise exception 'Classroom not found' using errcode = 'P0002';
  end if;

  select role into v_role from public.profiles where id = v_user_id;
  if v_role is null then
    raise exception 'Profile required' using errcode = '42501';
  end if;

  insert into public.classroom_members (classroom_id, user_id, member_role)
  values (v_room_id, v_user_id, v_role)
  on conflict (classroom_id, user_id) do nothing;
  get diagnostics v_rows = row_count;

  return pg_catalog.jsonb_build_object(
    'classroom_id', v_room_id,
    'joined', v_rows = 1
  );
end;
$$;

create or replace function public.get_classroom_join_code(p_classroom_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select classroom_join_codes.code
  from private.classroom_join_codes
  join public.classrooms on classrooms.id = classroom_join_codes.classroom_id
  where classrooms.id = p_classroom_id
    and classrooms.creator_id = (select auth.uid());
$$;

create or replace function public.get_classroom_members(p_classroom_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  role public.scisiam_user_role,
  is_creator boolean,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_class_member(p_classroom_id) then
    raise exception 'Classroom not found or access denied' using errcode = '42501';
  end if;

  return query
  select
    members.user_id,
    profiles.display_name,
    profiles.avatar_url,
    profiles.role,
    classrooms.creator_id = members.user_id,
    members.joined_at
  from public.classroom_members as members
  join public.profiles as profiles on profiles.id = members.user_id
  join public.classrooms as classrooms on classrooms.id = members.classroom_id
  where members.classroom_id = p_classroom_id
  order by (classrooms.creator_id = members.user_id) desc, members.joined_at asc;
end;
$$;

revoke execute on function public.create_classroom(text, text, text, text[]) from public, anon;
grant execute on function public.create_classroom(text, text, text, text[]) to authenticated;
revoke execute on function public.join_classroom(text) from public, anon;
grant execute on function public.join_classroom(text) to authenticated;
revoke execute on function public.get_classroom_join_code(uuid) from public, anon;
grant execute on function public.get_classroom_join_code(uuid) to authenticated;
revoke execute on function public.get_classroom_members(uuid) from public, anon;
grant execute on function public.get_classroom_members(uuid) to authenticated;

commit;

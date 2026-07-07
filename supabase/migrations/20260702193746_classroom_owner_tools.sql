begin;

create table public.classroom_assignments (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text null check (description is null or char_length(description) <= 1000),
  due_at timestamptz null,
  created_at timestamptz not null default now()
);

create index classroom_assignments_classroom_created_idx
  on public.classroom_assignments (classroom_id, created_at desc);

alter table public.classroom_assignments enable row level security;

create policy "Members can read classroom assignments"
  on public.classroom_assignments
  for select
  to authenticated
  using (private.is_class_member(classroom_id));

grant select on public.classroom_assignments to authenticated;
revoke insert, update, delete on public.classroom_assignments from authenticated;

create or replace function public.get_classroom_creator_names(p_classroom_ids uuid[])
returns table (
  classroom_id uuid,
  display_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select classrooms.id, profiles.display_name
  from public.classrooms as classrooms
  join public.profiles as profiles on profiles.id = classrooms.creator_id
  where classrooms.id = any(coalesce(p_classroom_ids, array[]::uuid[]))
    and classrooms.is_active
    and private.is_class_member(classrooms.id);
$$;

create or replace function public.rename_classroom(
  p_classroom_id uuid,
  p_name text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_name text := btrim(coalesce(p_name, ''));
begin
  if not private.is_class_creator(p_classroom_id) then
    raise exception 'Classroom owner access required' using errcode = '42501';
  end if;

  if char_length(normalized_name) not between 1 and 80 then
    raise exception 'Classroom name must contain 1-80 characters' using errcode = '22023';
  end if;

  update public.classrooms
  set name = normalized_name,
      updated_at = now()
  where id = p_classroom_id
    and is_active;

  if not found then
    raise exception 'Classroom not found' using errcode = 'P0002';
  end if;

  return normalized_name;
end;
$$;

create or replace function public.disband_classroom(p_classroom_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_class_creator(p_classroom_id) then
    raise exception 'Classroom owner access required' using errcode = '42501';
  end if;

  update public.classrooms
  set is_active = false,
      updated_at = now()
  where id = p_classroom_id
    and is_active;

  if not found then
    raise exception 'Classroom not found' using errcode = 'P0002';
  end if;

  delete from private.classroom_join_codes
  where classroom_id = p_classroom_id;

  return true;
end;
$$;

create or replace function public.remove_classroom_member(
  p_classroom_id uuid,
  target_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_class_creator(p_classroom_id) then
    raise exception 'Classroom owner access required' using errcode = '42501';
  end if;

  delete from public.classroom_members as members
  using public.classrooms as classrooms
  where members.classroom_id = classrooms.id
    and classrooms.id = p_classroom_id
    and members.user_id = target_user_id
    and target_user_id <> classrooms.creator_id;

  return found;
end;
$$;

create or replace function public.create_classroom_assignment(
  p_classroom_id uuid,
  p_title text,
  p_description text default null,
  p_due_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_title text := btrim(coalesce(p_title, ''));
  normalized_description text := nullif(btrim(coalesce(p_description, '')), '');
  assignment_id uuid;
begin
  if not private.is_class_creator(p_classroom_id) then
    raise exception 'Classroom owner access required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.classrooms
    where id = p_classroom_id
      and is_active
  ) then
    raise exception 'Classroom not found' using errcode = 'P0002';
  end if;

  if char_length(normalized_title) not between 1 and 120 then
    raise exception 'Assignment title must contain 1-120 characters' using errcode = '22023';
  end if;

  if char_length(coalesce(normalized_description, '')) > 1000 then
    raise exception 'Assignment description is too long' using errcode = '22023';
  end if;

  insert into public.classroom_assignments (
    classroom_id,
    created_by,
    title,
    description,
    due_at
  ) values (
    p_classroom_id,
    auth.uid(),
    normalized_title,
    normalized_description,
    p_due_at
  )
  returning id into assignment_id;

  return assignment_id;
end;
$$;

revoke execute on function public.get_classroom_creator_names(uuid[]) from public, anon;
revoke execute on function public.rename_classroom(uuid, text) from public, anon;
revoke execute on function public.disband_classroom(uuid) from public, anon;
revoke execute on function public.remove_classroom_member(uuid, uuid) from public, anon;
revoke execute on function public.create_classroom_assignment(uuid, text, text, timestamptz) from public, anon;

grant execute on function public.get_classroom_creator_names(uuid[]) to authenticated;
grant execute on function public.rename_classroom(uuid, text) to authenticated;
grant execute on function public.disband_classroom(uuid) to authenticated;
grant execute on function public.remove_classroom_member(uuid, uuid) to authenticated;
grant execute on function public.create_classroom_assignment(uuid, text, text, timestamptz) to authenticated;

commit;

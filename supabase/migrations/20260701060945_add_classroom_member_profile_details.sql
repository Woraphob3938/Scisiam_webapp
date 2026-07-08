begin;

drop function if exists public.get_classroom_members(uuid);

create function public.get_classroom_members(p_classroom_id uuid)
returns table (
  user_id uuid,
  display_name text,
  email text,
  avatar_url text,
  avatar_updated_at timestamptz,
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
    profiles.email,
    profiles.avatar_url,
    profiles.updated_at,
    members.member_role,
    classrooms.creator_id = members.user_id,
    members.joined_at
  from public.classroom_members as members
  join public.profiles as profiles on profiles.id = members.user_id
  join public.classrooms as classrooms on classrooms.id = members.classroom_id
  where members.classroom_id = p_classroom_id
  order by (classrooms.creator_id = members.user_id) desc, members.joined_at asc;
end;
$$;

revoke execute on function public.get_classroom_members(uuid) from public, anon;
grant execute on function public.get_classroom_members(uuid) to authenticated;

commit;

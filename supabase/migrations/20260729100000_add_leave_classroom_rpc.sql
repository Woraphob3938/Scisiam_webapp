begin;

create or replace function public.leave_classroom(p_classroom_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_creator_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select classrooms.creator_id
  into v_creator_id
  from public.classrooms as classrooms
  where classrooms.id = p_classroom_id
    and classrooms.is_active;

  if v_creator_id is null then
    raise exception 'Classroom not found' using errcode = 'P0002';
  end if;

  if v_creator_id = v_user_id then
    raise exception 'Classroom owners cannot leave their own classroom' using errcode = '42501';
  end if;

  delete from public.classroom_notifications as notifications
  where notifications.classroom_id = p_classroom_id
    and notifications.recipient_id = v_user_id;

  delete from public.classroom_members as members
  where members.classroom_id = p_classroom_id
    and members.user_id = v_user_id;

  return found;
end;
$$;

revoke all on function public.leave_classroom(uuid) from public, anon;
grant execute on function public.leave_classroom(uuid) to authenticated;

commit;

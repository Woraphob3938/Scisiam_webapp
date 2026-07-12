begin;

create or replace function public.add_classroom_lab(
  p_classroom_id uuid,
  p_lab_id text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_lab_id text := btrim(coalesce(p_lab_id, ''));
  next_position smallint;
begin
  if auth.uid() is null or not private.is_class_creator(p_classroom_id) then
    raise exception 'Classroom owner access required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.classrooms
    where id = p_classroom_id and is_active
  ) then
    raise exception 'Classroom not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.labs
    where id = normalized_lab_id and is_active
  ) then
    raise exception 'Unknown or inactive lab' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.classroom_labs
    where classroom_id = p_classroom_id and lab_id = normalized_lab_id
  ) then
    raise exception 'Lab already exists in this classroom' using errcode = '22023';
  end if;

  select (coalesce(max(position), -1) + 1)::smallint
  into next_position
  from public.classroom_labs
  where classroom_id = p_classroom_id;

  if next_position > 23 then
    raise exception 'A classroom can contain at most 24 labs' using errcode = '22023';
  end if;

  insert into public.classroom_labs (classroom_id, lab_id, position)
  values (p_classroom_id, normalized_lab_id, next_position);

  return normalized_lab_id;
end;
$$;

revoke all on function public.add_classroom_lab(uuid, text) from public, anon;
grant execute on function public.add_classroom_lab(uuid, text) to authenticated;

commit;

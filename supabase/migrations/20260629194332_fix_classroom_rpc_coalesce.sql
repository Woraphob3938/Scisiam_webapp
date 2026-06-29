begin;

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
  v_name text := pg_catalog.btrim(coalesce(p_name, ''));
  v_description text := nullif(pg_catalog.btrim(coalesce(p_description, '')), '');
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
    pg_catalog.regexp_replace(coalesce(p_code, ''), '\s', '', 'g')
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

revoke execute on function public.create_classroom(text, text, text, text[]) from public, anon;
grant execute on function public.create_classroom(text, text, text, text[]) to authenticated;
revoke execute on function public.join_classroom(text) from public, anon;
grant execute on function public.join_classroom(text) to authenticated;

commit;

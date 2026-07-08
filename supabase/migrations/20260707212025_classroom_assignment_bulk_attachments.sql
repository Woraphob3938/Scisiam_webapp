begin;

update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = null
where id = 'classroom-files';

alter table public.classroom_assignments
  add column link_urls jsonb not null default '[]'::jsonb check (jsonb_typeof(link_urls) = 'array'),
  add column attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  add column deleted_at timestamptz null;

alter table public.classroom_assignment_submissions
  add column link_urls jsonb not null default '[]'::jsonb check (jsonb_typeof(link_urls) = 'array'),
  add column attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array');

update public.classroom_assignments
set link_urls = case when link_url is null then '[]'::jsonb else jsonb_build_array(link_url) end,
    attachments = case
      when attachment_path is null or attachment_name is null then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object(
        'path', attachment_path,
        'name', attachment_name,
        'mimeType', attachment_mime_type,
        'size', attachment_size
      ))
    end;

update public.classroom_assignment_submissions
set link_urls = case when link_url is null then '[]'::jsonb else jsonb_build_array(link_url) end,
    attachments = case
      when attachment_path is null or attachment_name is null then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object(
        'path', attachment_path,
        'name', attachment_name,
        'mimeType', attachment_mime_type,
        'size', attachment_size
      ))
    end;

create index classroom_assignments_active_classroom_created_idx
  on public.classroom_assignments (classroom_id, created_at desc)
  where deleted_at is null;

drop policy if exists "Members can read classroom assignments" on public.classroom_assignments;
create policy "Members can read active classroom assignments"
  on public.classroom_assignments
  for select
  to authenticated
  using (deleted_at is null and private.is_class_member(classroom_id));

drop function if exists public.create_classroom_assignment(uuid, text, text, timestamptz, text, text, text, text, integer);

create or replace function public.create_classroom_assignment(
  p_classroom_id uuid,
  p_title text,
  p_description text default null,
  p_due_at timestamptz default null,
  p_link_urls jsonb default '[]'::jsonb,
  p_attachments jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_title text := btrim(coalesce(p_title, ''));
  normalized_description text := nullif(btrim(coalesce(p_description, '')), '');
  normalized_links jsonb := coalesce(p_link_urls, '[]'::jsonb);
  normalized_attachments jsonb := coalesce(p_attachments, '[]'::jsonb);
  first_link text := normalized_links ->> 0;
  first_attachment jsonb := normalized_attachments -> 0;
  assignment_id uuid;
begin
  if not private.is_class_creator(p_classroom_id) then
    raise exception 'Classroom owner access required' using errcode = '42501';
  end if;

  if not exists (select 1 from public.classrooms where id = p_classroom_id and is_active) then
    raise exception 'Classroom not found' using errcode = 'P0002';
  end if;

  if char_length(normalized_title) not between 1 and 120 then
    raise exception 'Assignment title must contain 1-120 characters' using errcode = '22023';
  end if;

  if char_length(coalesce(normalized_description, '')) > 1000 then
    raise exception 'Assignment description is too long' using errcode = '22023';
  end if;

  if jsonb_typeof(normalized_links) <> 'array' or jsonb_array_length(normalized_links) > 10 then
    raise exception 'Assignment links must be an array with at most 10 items' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(normalized_links) as link(value)
    where char_length(link.value) > 500 or link.value !~* '^https?://'
  ) then
    raise exception 'Assignment links must start with http:// or https://' using errcode = '22023';
  end if;

  if jsonb_typeof(normalized_attachments) <> 'array' or jsonb_array_length(normalized_attachments) > 10 then
    raise exception 'Assignment attachments must be an array with at most 10 items' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(normalized_attachments) as attachment(value)
    where coalesce(attachment.value ->> 'path', '') = ''
       or coalesce(attachment.value ->> 'name', '') = ''
       or char_length(attachment.value ->> 'path') > 1024
       or char_length(attachment.value ->> 'name') > 180
       or char_length(coalesce(attachment.value ->> 'mimeType', '')) > 120
       or coalesce((attachment.value ->> 'size')::integer, 0) not between 0 and 10485760
  ) then
    raise exception 'Assignment attachment metadata is invalid' using errcode = '22023';
  end if;

  insert into public.classroom_assignments (
    classroom_id,
    created_by,
    title,
    description,
    due_at,
    link_url,
    attachment_path,
    attachment_name,
    attachment_mime_type,
    attachment_size,
    link_urls,
    attachments
  ) values (
    p_classroom_id,
    auth.uid(),
    normalized_title,
    normalized_description,
    p_due_at,
    first_link,
    first_attachment ->> 'path',
    first_attachment ->> 'name',
    first_attachment ->> 'mimeType',
    nullif(first_attachment ->> 'size', '')::integer,
    normalized_links,
    normalized_attachments
  )
  returning id into assignment_id;

  insert into public.classroom_notifications (
    classroom_id,
    recipient_id,
    actor_id,
    assignment_id,
    title,
    message
  )
  select
    p_classroom_id,
    members.user_id,
    auth.uid(),
    assignment_id,
    'งานใหม่จากคุณครู',
    'คุณครูได้อัปโหลดงาน "' || normalized_title || '" แล้ว'
  from public.classroom_members as members
  where members.classroom_id = p_classroom_id
    and members.user_id <> auth.uid();

  return assignment_id;
end;
$$;

drop function if exists public.submit_classroom_assignment(uuid, text, text, text, text, text, integer);

create or replace function public.submit_classroom_assignment(
  p_assignment_id uuid,
  p_note text default null,
  p_link_urls jsonb default '[]'::jsonb,
  p_attachments jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_classroom_id uuid;
  v_creator_id uuid;
  v_title text;
  normalized_note text := nullif(btrim(coalesce(p_note, '')), '');
  normalized_links jsonb := coalesce(p_link_urls, '[]'::jsonb);
  normalized_attachments jsonb := coalesce(p_attachments, '[]'::jsonb);
  first_link text := normalized_links ->> 0;
  first_attachment jsonb := normalized_attachments -> 0;
  submission_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select assignments.classroom_id, classrooms.creator_id, assignments.title
  into v_classroom_id, v_creator_id, v_title
  from public.classroom_assignments as assignments
  join public.classrooms as classrooms on classrooms.id = assignments.classroom_id
  where assignments.id = p_assignment_id
    and assignments.deleted_at is null
    and classrooms.is_active;

  if v_classroom_id is null then
    raise exception 'Assignment not found' using errcode = 'P0002';
  end if;

  if not private.is_class_member(v_classroom_id) or private.is_class_creator(v_classroom_id) then
    raise exception 'Student classroom access required' using errcode = '42501';
  end if;

  if char_length(coalesce(normalized_note, '')) > 1000 then
    raise exception 'Submission note is too long' using errcode = '22023';
  end if;

  if jsonb_typeof(normalized_links) <> 'array' or jsonb_array_length(normalized_links) > 10 then
    raise exception 'Submission links must be an array with at most 10 items' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(normalized_links) as link(value)
    where char_length(link.value) > 500 or link.value !~* '^https?://'
  ) then
    raise exception 'Submission links must start with http:// or https://' using errcode = '22023';
  end if;

  if jsonb_typeof(normalized_attachments) <> 'array' or jsonb_array_length(normalized_attachments) > 10 then
    raise exception 'Submission attachments must be an array with at most 10 items' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(normalized_attachments) as attachment(value)
    where coalesce(attachment.value ->> 'path', '') = ''
       or coalesce(attachment.value ->> 'name', '') = ''
       or char_length(attachment.value ->> 'path') > 1024
       or char_length(attachment.value ->> 'name') > 180
       or char_length(coalesce(attachment.value ->> 'mimeType', '')) > 120
       or coalesce((attachment.value ->> 'size')::integer, 0) not between 0 and 10485760
  ) then
    raise exception 'Submission attachment metadata is invalid' using errcode = '22023';
  end if;

  if normalized_note is null and jsonb_array_length(normalized_links) = 0 and jsonb_array_length(normalized_attachments) = 0 then
    raise exception 'Submission requires a note, link, or file' using errcode = '22023';
  end if;

  insert into public.classroom_assignment_submissions (
    assignment_id,
    classroom_id,
    student_id,
    note,
    link_url,
    attachment_path,
    attachment_name,
    attachment_mime_type,
    attachment_size,
    link_urls,
    attachments
  ) values (
    p_assignment_id,
    v_classroom_id,
    v_user_id,
    normalized_note,
    first_link,
    first_attachment ->> 'path',
    first_attachment ->> 'name',
    first_attachment ->> 'mimeType',
    nullif(first_attachment ->> 'size', '')::integer,
    normalized_links,
    normalized_attachments
  )
  on conflict (assignment_id, student_id) do update
  set note = excluded.note,
      link_url = excluded.link_url,
      attachment_path = excluded.attachment_path,
      attachment_name = excluded.attachment_name,
      attachment_mime_type = excluded.attachment_mime_type,
      attachment_size = excluded.attachment_size,
      link_urls = excluded.link_urls,
      attachments = excluded.attachments,
      submitted_at = now(),
      updated_at = now()
  returning id into submission_id;

  insert into public.classroom_notifications (
    classroom_id,
    recipient_id,
    actor_id,
    assignment_id,
    title,
    message
  ) values (
    v_classroom_id,
    v_creator_id,
    v_user_id,
    p_assignment_id,
    'มีนักเรียนส่งงานแล้ว',
    'มีนักเรียนส่งงาน "' || v_title || '" แล้ว'
  );

  return submission_id;
end;
$$;

create or replace function public.delete_classroom_assignment(p_assignment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_classroom_id uuid;
  v_title text;
begin
  select classroom_id, title
  into v_classroom_id, v_title
  from public.classroom_assignments
  where id = p_assignment_id
    and deleted_at is null;

  if v_classroom_id is null then
    raise exception 'Assignment not found' using errcode = 'P0002';
  end if;

  if not private.is_class_creator(v_classroom_id) then
    raise exception 'Classroom owner access required' using errcode = '42501';
  end if;

  update public.classroom_assignments
  set deleted_at = now()
  where id = p_assignment_id
    and deleted_at is null;

  insert into public.classroom_notifications (
    classroom_id,
    recipient_id,
    actor_id,
    assignment_id,
    title,
    message
  )
  select
    v_classroom_id,
    members.user_id,
    auth.uid(),
    null,
    'คุณครูลบงานแล้ว',
    'คุณครูลบงาน "' || v_title || '" ออกจากชั้นเรียนแล้ว'
  from public.classroom_members as members
  where members.classroom_id = v_classroom_id
    and members.user_id <> auth.uid();

  return true;
end;
$$;

create or replace function public.mark_classroom_notifications_read(p_classroom_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_count integer := 0;
begin
  if auth.uid() is null or not private.is_class_member(p_classroom_id) then
    raise exception 'Classroom access required' using errcode = '42501';
  end if;

  update public.classroom_notifications
  set read_at = now()
  where classroom_id = p_classroom_id
    and recipient_id = auth.uid()
    and read_at is null;

  get diagnostics changed_count = row_count;
  return changed_count;
end;
$$;

revoke execute on function public.create_classroom_assignment(uuid, text, text, timestamptz, jsonb, jsonb) from public, anon;
revoke execute on function public.submit_classroom_assignment(uuid, text, jsonb, jsonb) from public, anon;
revoke execute on function public.delete_classroom_assignment(uuid) from public, anon;
revoke execute on function public.mark_classroom_notifications_read(uuid) from public, anon;
grant execute on function public.create_classroom_assignment(uuid, text, text, timestamptz, jsonb, jsonb) to authenticated;
grant execute on function public.submit_classroom_assignment(uuid, text, jsonb, jsonb) to authenticated;
grant execute on function public.delete_classroom_assignment(uuid) to authenticated;
grant execute on function public.mark_classroom_notifications_read(uuid) to authenticated;

commit;

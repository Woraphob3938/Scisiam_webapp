begin;

insert into storage.buckets (id, name, public, file_size_limit)
values ('classroom-files', 'classroom-files', false, 10485760)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760;

alter table public.classroom_assignments
  add column link_url text null check (link_url is null or (char_length(link_url) <= 500 and link_url ~* '^https?://')),
  add column attachment_path text null check (attachment_path is null or char_length(attachment_path) <= 1024),
  add column attachment_name text null check (attachment_name is null or char_length(attachment_name) <= 180),
  add column attachment_mime_type text null check (attachment_mime_type is null or char_length(attachment_mime_type) <= 120),
  add column attachment_size integer null check (attachment_size is null or attachment_size between 0 and 10485760);

create table public.classroom_assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.classroom_assignments(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  note text null check (note is null or char_length(note) <= 1000),
  link_url text null check (link_url is null or (char_length(link_url) <= 500 and link_url ~* '^https?://')),
  attachment_path text null check (attachment_path is null or char_length(attachment_path) <= 1024),
  attachment_name text null check (attachment_name is null or char_length(attachment_name) <= 180),
  attachment_mime_type text null check (attachment_mime_type is null or char_length(attachment_mime_type) <= 120),
  attachment_size integer null check (attachment_size is null or attachment_size between 0 and 10485760),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index classroom_assignment_submissions_classroom_idx
  on public.classroom_assignment_submissions (classroom_id, submitted_at desc);

create index classroom_assignment_submissions_assignment_idx
  on public.classroom_assignment_submissions (assignment_id, submitted_at desc);

alter table public.classroom_assignment_submissions enable row level security;

create policy "Teachers and owners can read assignment submissions"
  on public.classroom_assignment_submissions
  for select
  to authenticated
  using (private.is_class_creator(classroom_id) or student_id = (select auth.uid()));

grant select on public.classroom_assignment_submissions to authenticated;
revoke insert, update, delete on public.classroom_assignment_submissions from authenticated;

create table public.classroom_notifications (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  assignment_id uuid null references public.classroom_assignments(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  message text not null check (char_length(btrim(message)) between 1 and 500),
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create index classroom_notifications_recipient_created_idx
  on public.classroom_notifications (recipient_id, created_at desc);

create index classroom_notifications_classroom_recipient_idx
  on public.classroom_notifications (classroom_id, recipient_id, created_at desc);

alter table public.classroom_notifications enable row level security;

create policy "Users can read own classroom notifications"
  on public.classroom_notifications
  for select
  to authenticated
  using (recipient_id = (select auth.uid()));

grant select on public.classroom_notifications to authenticated;
revoke insert, update, delete on public.classroom_notifications from authenticated;

create or replace function private.classroom_file_classroom_id(object_name text)
returns uuid
language plpgsql
immutable
security definer
set search_path = ''
as $$
declare
  parts text[] := storage.foldername(object_name);
begin
  if coalesce(parts[1], '') <> 'classrooms' then
    return null;
  end if;

  if coalesce(parts[2], '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return null;
  end if;

  return parts[2]::uuid;
end;
$$;

create or replace function private.classroom_file_owner_id(object_name text)
returns uuid
language plpgsql
immutable
security definer
set search_path = ''
as $$
declare
  parts text[] := storage.foldername(object_name);
begin
  if coalesce(parts[3], '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return null;
  end if;

  return parts[3]::uuid;
end;
$$;

revoke all on function private.classroom_file_classroom_id(text) from public, anon;
revoke all on function private.classroom_file_owner_id(text) from public, anon;
grant execute on function private.classroom_file_classroom_id(text) to authenticated;
grant execute on function private.classroom_file_owner_id(text) to authenticated;

drop policy if exists "Classroom members can read classroom files" on storage.objects;
drop policy if exists "Classroom members can upload own classroom files" on storage.objects;

create policy "Classroom members can read classroom files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'classroom-files'
    and private.is_class_member(private.classroom_file_classroom_id(name))
  );

create policy "Classroom members can upload own classroom files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'classroom-files'
    and private.is_class_member(private.classroom_file_classroom_id(name))
    and private.classroom_file_owner_id(name) = (select auth.uid())
  );

drop function if exists public.create_classroom_assignment(uuid, text, text, timestamptz);

create or replace function public.create_classroom_assignment(
  p_classroom_id uuid,
  p_title text,
  p_description text default null,
  p_due_at timestamptz default null,
  p_link_url text default null,
  p_attachment_path text default null,
  p_attachment_name text default null,
  p_attachment_mime_type text default null,
  p_attachment_size integer default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_title text := btrim(coalesce(p_title, ''));
  normalized_description text := nullif(btrim(coalesce(p_description, '')), '');
  normalized_link_url text := nullif(btrim(coalesce(p_link_url, '')), '');
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

  if normalized_link_url is not null and (char_length(normalized_link_url) > 500 or normalized_link_url !~* '^https?://') then
    raise exception 'Assignment link must start with http:// or https://' using errcode = '22023';
  end if;

  if p_attachment_size is not null and (p_attachment_size < 0 or p_attachment_size > 10485760) then
    raise exception 'Attachment is too large' using errcode = '22023';
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
    attachment_size
  ) values (
    p_classroom_id,
    auth.uid(),
    normalized_title,
    normalized_description,
    p_due_at,
    normalized_link_url,
    nullif(btrim(coalesce(p_attachment_path, '')), ''),
    nullif(btrim(coalesce(p_attachment_name, '')), ''),
    nullif(btrim(coalesce(p_attachment_mime_type, '')), ''),
    p_attachment_size
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

create or replace function public.submit_classroom_assignment(
  p_assignment_id uuid,
  p_note text default null,
  p_link_url text default null,
  p_attachment_path text default null,
  p_attachment_name text default null,
  p_attachment_mime_type text default null,
  p_attachment_size integer default null
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
  normalized_link_url text := nullif(btrim(coalesce(p_link_url, '')), '');
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

  if normalized_link_url is not null and (char_length(normalized_link_url) > 500 or normalized_link_url !~* '^https?://') then
    raise exception 'Submission link must start with http:// or https://' using errcode = '22023';
  end if;

  if p_attachment_size is not null and (p_attachment_size < 0 or p_attachment_size > 10485760) then
    raise exception 'Attachment is too large' using errcode = '22023';
  end if;

  if normalized_note is null and normalized_link_url is null and nullif(btrim(coalesce(p_attachment_path, '')), '') is null then
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
    attachment_size
  ) values (
    p_assignment_id,
    v_classroom_id,
    v_user_id,
    normalized_note,
    normalized_link_url,
    nullif(btrim(coalesce(p_attachment_path, '')), ''),
    nullif(btrim(coalesce(p_attachment_name, '')), ''),
    nullif(btrim(coalesce(p_attachment_mime_type, '')), ''),
    p_attachment_size
  )
  on conflict (assignment_id, student_id) do update
  set note = excluded.note,
      link_url = excluded.link_url,
      attachment_path = excluded.attachment_path,
      attachment_name = excluded.attachment_name,
      attachment_mime_type = excluded.attachment_mime_type,
      attachment_size = excluded.attachment_size,
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

revoke execute on function public.create_classroom_assignment(uuid, text, text, timestamptz, text, text, text, text, integer) from public, anon;
revoke execute on function public.submit_classroom_assignment(uuid, text, text, text, text, text, integer) from public, anon;
grant execute on function public.create_classroom_assignment(uuid, text, text, timestamptz, text, text, text, text, integer) to authenticated;
grant execute on function public.submit_classroom_assignment(uuid, text, text, text, text, text, integer) to authenticated;

commit;

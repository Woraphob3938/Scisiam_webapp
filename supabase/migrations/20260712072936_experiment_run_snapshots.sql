begin;

alter table public.experiment_runs
  add column snapshot_path text null
  check (
    snapshot_path is null
    or (
      char_length(snapshot_path) between 1 and 512
      and snapshot_path !~ '(^/|\.\.)'
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('experiment-snapshots', 'experiment-snapshots', false, 3145728, array['image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = 3145728,
  allowed_mime_types = array['image/webp'];

create or replace function private.can_read_experiment_snapshot(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (storage.foldername(p_object_name))[1] = (select auth.uid())::text
    or exists (
      select 1
      from public.classroom_assignment_submissions as submissions
      join public.experiment_runs as runs
        on runs.id = submissions.experiment_run_id
       and runs.snapshot_path = p_object_name
      where private.is_class_creator(submissions.classroom_id)
    );
$$;

revoke all on function private.can_read_experiment_snapshot(text) from public, anon;
grant execute on function private.can_read_experiment_snapshot(text) to authenticated;

drop policy if exists "Experiment owners can upload snapshots" on storage.objects;
drop policy if exists "Experiment owners and classroom owners can read snapshots" on storage.objects;
drop policy if exists "Experiment owners can delete snapshots" on storage.objects;

create policy "Experiment owners can upload snapshots"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'experiment-snapshots'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Experiment owners and classroom owners can read snapshots"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'experiment-snapshots'
    and private.can_read_experiment_snapshot(name)
  );

create policy "Experiment owners can delete snapshots"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'experiment-snapshots'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create or replace function public.attach_experiment_run_snapshot(
  p_run_id uuid,
  p_snapshot_path text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if split_part(p_snapshot_path, '/', 1) <> auth.uid()::text
    or p_snapshot_path !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$' then
    raise exception 'Invalid experiment snapshot path' using errcode = '22023';
  end if;

  update public.experiment_runs as runs
  set snapshot_path = p_snapshot_path,
      updated_at = now()
  where runs.id = p_run_id
    and runs.user_id = (select auth.uid());

  if not found then
    raise exception 'Experiment run not found' using errcode = 'P0002';
  end if;

  return true;
end;
$$;

create or replace function public.submit_classroom_assignment(
  p_assignment_id uuid,
  p_note text default null,
  p_link_urls jsonb default '[]'::jsonb,
  p_attachments jsonb default '[]'::jsonb,
  p_experiment_run_id uuid default null
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
  v_lab_id text;
  v_existing_graded_at timestamptz;
  v_run_is_valid boolean := false;
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

  select assignments.classroom_id, classrooms.creator_id, assignments.title, assignments.lab_id
  into v_classroom_id, v_creator_id, v_title, v_lab_id
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

  select submissions.graded_at
  into v_existing_graded_at
  from public.classroom_assignment_submissions as submissions
  where submissions.assignment_id = p_assignment_id
    and submissions.student_id = v_user_id;

  if v_existing_graded_at is not null then
    raise exception 'Graded submissions cannot be changed' using errcode = '42501';
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

  if v_lab_id is not null then
    if p_experiment_run_id is null then
      raise exception 'Lab submissions require an experiment run' using errcode = '22023';
    end if;

    if char_length(coalesce(normalized_note, '')) not between 5 and 1000 then
      raise exception 'Lab conclusion must contain 5-1000 characters' using errcode = '22023';
    end if;

    select exists (
      select 1
      from public.experiment_runs as runs
      where runs.id = p_experiment_run_id
        and runs.user_id = v_user_id
        and runs.lab_id = v_lab_id
    ) into v_run_is_valid;

    if not v_run_is_valid then
      raise exception 'Experiment run does not match this assignment' using errcode = '42501';
    end if;
  else
    if p_experiment_run_id is not null then
      raise exception 'General assignments cannot reference experiment runs' using errcode = '22023';
    end if;

    if normalized_note is null and jsonb_array_length(normalized_links) = 0 and jsonb_array_length(normalized_attachments) = 0 then
      raise exception 'Submission requires a note, link, or file' using errcode = '22023';
    end if;
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
    attachments,
    experiment_run_id
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
    normalized_attachments,
    p_experiment_run_id
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
      experiment_run_id = excluded.experiment_run_id,
      submitted_at = now(),
      updated_at = now()
  where public.classroom_assignment_submissions.graded_at is null
  returning id into submission_id;

  if submission_id is null then
    raise exception 'Graded submissions cannot be changed' using errcode = '42501';
  end if;

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

create or replace function public.get_classroom_submission_experiment_run(
  p_submission_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_classroom_id uuid;
  v_run jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select submissions.classroom_id,
         jsonb_build_object(
           'id', runs.id,
           'lab_id', runs.lab_id,
           'title', runs.title,
           'variables', runs.variables,
           'live_values', runs.live_values,
           'graph_points', runs.graph_points,
           'table_rows', runs.table_rows,
           'summary', runs.summary,
           'snapshot_path', runs.snapshot_path,
           'created_at', runs.created_at
         )
  into v_classroom_id, v_run
  from public.classroom_assignment_submissions as submissions
  join public.experiment_runs as runs on runs.id = submissions.experiment_run_id
  where submissions.id = p_submission_id;

  if v_classroom_id is null then
    raise exception 'Submission experiment run not found' using errcode = 'P0002';
  end if;

  if not private.is_class_creator(v_classroom_id) then
    raise exception 'Classroom owner access required' using errcode = '42501';
  end if;

  return v_run;
end;
$$;

revoke all on function public.attach_experiment_run_snapshot(uuid, text) from public, anon;
grant execute on function public.attach_experiment_run_snapshot(uuid, text) to authenticated;

revoke all on function public.submit_classroom_assignment(uuid, text, jsonb, jsonb, uuid) from public, anon;
grant execute on function public.submit_classroom_assignment(uuid, text, jsonb, jsonb, uuid) to authenticated;

revoke all on function public.get_classroom_submission_experiment_run(uuid) from public, anon;
grant execute on function public.get_classroom_submission_experiment_run(uuid) to authenticated;

commit;

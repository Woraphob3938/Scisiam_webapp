begin;

alter table public.classroom_assignments
  add column lab_id text null,
  add column max_score smallint null,
  add constraint classroom_assignments_lab_score_pair_check
    check (
      (lab_id is null and max_score is null)
      or (lab_id is not null and max_score between 1 and 100)
    ),
  add constraint classroom_assignments_classroom_lab_fkey
    foreign key (classroom_id, lab_id)
    references public.classroom_labs (classroom_id, lab_id)
    on delete restrict;

alter table public.classroom_assignment_submissions
  add column experiment_run_id uuid null references public.experiment_runs(id) on delete restrict,
  add column score numeric(6,2) null check (score is null or score >= 0),
  add column graded_by uuid null references public.profiles(id) on delete restrict,
  add column graded_at timestamptz null,
  add constraint classroom_submissions_grade_tuple_check
    check (
      (score is null and graded_by is null and graded_at is null)
      or (score is not null and graded_by is not null and graded_at is not null)
    );

create index classroom_assignments_lab_id_idx
  on public.classroom_assignments (lab_id)
  where lab_id is not null;

create index classroom_submissions_experiment_run_id_idx
  on public.classroom_assignment_submissions (experiment_run_id)
  where experiment_run_id is not null;

create index classroom_submissions_graded_by_idx
  on public.classroom_assignment_submissions (graded_by)
  where graded_by is not null;

drop function if exists public.create_classroom_assignment(uuid, text, text, timestamptz, jsonb, jsonb);

create or replace function public.create_classroom_assignment(
  p_classroom_id uuid,
  p_title text,
  p_description text default null,
  p_due_at timestamptz default null,
  p_link_urls jsonb default '[]'::jsonb,
  p_attachments jsonb default '[]'::jsonb,
  p_lab_id text default null,
  p_max_score smallint default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_title text := btrim(coalesce(p_title, ''));
  normalized_description text := nullif(btrim(coalesce(p_description, '')), '');
  normalized_lab_id text := nullif(btrim(coalesce(p_lab_id, '')), '');
  normalized_links jsonb := coalesce(p_link_urls, '[]'::jsonb);
  normalized_attachments jsonb := coalesce(p_attachments, '[]'::jsonb);
  first_link text := normalized_links ->> 0;
  first_attachment jsonb := normalized_attachments -> 0;
  assignment_id uuid;
begin
  if auth.uid() is null or not private.is_class_creator(p_classroom_id) then
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

  if (normalized_lab_id is null) <> (p_max_score is null) then
    raise exception 'Lab assignments require both a lab and maximum score' using errcode = '22023';
  end if;

  if p_max_score is not null and p_max_score not between 1 and 100 then
    raise exception 'Maximum score must be between 1 and 100' using errcode = '22023';
  end if;

  if normalized_lab_id is not null and not exists (
    select 1
    from public.classroom_labs
    where classroom_id = p_classroom_id and lab_id = normalized_lab_id
  ) then
    raise exception 'Assigned lab is not available in this classroom' using errcode = '22023';
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
    attachments,
    lab_id,
    max_score
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
    normalized_attachments,
    normalized_lab_id,
    p_max_score
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

drop function if exists public.submit_classroom_assignment(uuid, text, jsonb, jsonb);

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

    if char_length(coalesce(normalized_note, '')) not between 20 and 1000 then
      raise exception 'Lab conclusion must contain 20-1000 characters' using errcode = '22023';
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

create or replace function public.grade_classroom_assignment_submission(
  p_submission_id uuid,
  p_score numeric
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_classroom_id uuid;
  v_max_score numeric;
  v_lab_id text;
  v_score numeric := p_score;
  v_submission_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select submissions.classroom_id, assignments.max_score, assignments.lab_id
  into v_classroom_id, v_max_score, v_lab_id
  from public.classroom_assignment_submissions as submissions
  join public.classroom_assignments as assignments on assignments.id = submissions.assignment_id
  where submissions.id = p_submission_id
    and assignments.deleted_at is null;

  if v_classroom_id is null then
    raise exception 'Submission not found' using errcode = 'P0002';
  end if;

  if not private.is_class_creator(v_classroom_id) then
    raise exception 'Classroom owner access required' using errcode = '42501';
  end if;

  if v_lab_id is null or v_max_score is null then
    raise exception 'Only lab assignments can be graded' using errcode = '22023';
  end if;

  if v_score is null or v_score < 0 or v_score > v_max_score then
    raise exception 'Score is outside the assignment range' using errcode = '22023';
  end if;

  update public.classroom_assignment_submissions
  set score = v_score,
      graded_by = v_user_id,
      graded_at = now(),
      updated_at = now()
  where id = p_submission_id
    and graded_at is null
  returning id into v_submission_id;

  if v_submission_id is null then
    raise exception 'Submission is already graded' using errcode = '22023';
  end if;

  return v_submission_id;
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

revoke all on function public.create_classroom_assignment(uuid, text, text, timestamptz, jsonb, jsonb, text, smallint) from public, anon;
grant execute on function public.create_classroom_assignment(uuid, text, text, timestamptz, jsonb, jsonb, text, smallint) to authenticated;

revoke all on function public.submit_classroom_assignment(uuid, text, jsonb, jsonb, uuid) from public, anon;
grant execute on function public.submit_classroom_assignment(uuid, text, jsonb, jsonb, uuid) to authenticated;

revoke all on function public.grade_classroom_assignment_submission(uuid, numeric) from public, anon;
grant execute on function public.grade_classroom_assignment_submission(uuid, numeric) to authenticated;

revoke all on function public.get_classroom_submission_experiment_run(uuid) from public, anon;
grant execute on function public.get_classroom_submission_experiment_run(uuid) to authenticated;

commit;

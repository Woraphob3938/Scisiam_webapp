begin;

-- Keep classroom uploads useful for common schoolwork without allowing arbitrary
-- binaries to be used as a private file host.
update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
where id = 'classroom-files';

create or replace function private.is_active_classroom_assignment_file(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.classroom_assignments as assignments
    where assignments.classroom_id = private.classroom_file_classroom_id(p_object_name)
      and assignments.deleted_at is null
      and (
        assignments.attachment_path = p_object_name
        or assignments.attachments @> jsonb_build_array(jsonb_build_object('path', p_object_name))
      )
  );
$$;

create or replace function private.classroom_file_is_referenced(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.is_active_classroom_assignment_file(p_object_name)
    or exists (
      select 1
      from public.classroom_assignment_submissions as submissions
      where submissions.attachment_path = p_object_name
        or submissions.attachments @> jsonb_build_array(jsonb_build_object('path', p_object_name))
    );
$$;

create or replace function private.can_read_classroom_file(p_object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_classroom_id uuid := private.classroom_file_classroom_id(p_object_name);
begin
  if v_user_id is null or v_classroom_id is null or not private.is_class_member(v_classroom_id) then
    return false;
  end if;

  return private.is_class_creator(v_classroom_id)
    or private.classroom_file_owner_id(p_object_name) = v_user_id
    or private.is_active_classroom_assignment_file(p_object_name);
end;
$$;

create or replace function private.can_upload_classroom_file(p_object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_classroom_id uuid := private.classroom_file_classroom_id(p_object_name);
begin
  if v_user_id is null
    or v_classroom_id is null
    or private.classroom_file_owner_id(p_object_name) <> v_user_id
    or not private.is_class_member(v_classroom_id) then
    return false;
  end if;

  -- A submission can stage up to ten files before its RPC stores the references.
  -- Unlinked objects beyond that are rejected even when Storage is called directly.
  return (
    select count(*)
    from storage.objects as objects
    where objects.bucket_id = 'classroom-files'
      and private.classroom_file_classroom_id(objects.name) = v_classroom_id
      and private.classroom_file_owner_id(objects.name) = v_user_id
      and not private.classroom_file_is_referenced(objects.name)
  ) < 10;
end;
$$;

create or replace function private.can_delete_classroom_file(p_object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_classroom_id uuid := private.classroom_file_classroom_id(p_object_name);
begin
  return v_user_id is not null
    and v_classroom_id is not null
    and private.classroom_file_owner_id(p_object_name) = v_user_id
    and private.is_class_member(v_classroom_id)
    and not private.classroom_file_is_referenced(p_object_name);
end;
$$;

revoke all on function private.is_active_classroom_assignment_file(text) from public, anon;
revoke all on function private.classroom_file_is_referenced(text) from public, anon;
revoke all on function private.can_read_classroom_file(text) from public, anon;
revoke all on function private.can_upload_classroom_file(text) from public, anon;
revoke all on function private.can_delete_classroom_file(text) from public, anon;
grant execute on function private.is_active_classroom_assignment_file(text) to authenticated;
grant execute on function private.classroom_file_is_referenced(text) to authenticated;
grant execute on function private.can_read_classroom_file(text) to authenticated;
grant execute on function private.can_upload_classroom_file(text) to authenticated;
grant execute on function private.can_delete_classroom_file(text) to authenticated;

drop policy if exists "Classroom members can read classroom files" on storage.objects;
drop policy if exists "Classroom members can upload own classroom files" on storage.objects;
drop policy if exists "Classroom owners can delete unreferenced files" on storage.objects;

create policy "Classroom readers can access permitted files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'classroom-files'
    and private.can_read_classroom_file(name)
  );

create policy "Classroom members can stage bounded own files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'classroom-files'
    and private.can_upload_classroom_file(name)
  );

create policy "Classroom owners can delete unreferenced files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'classroom-files'
    and private.can_delete_classroom_file(name)
  );

commit;

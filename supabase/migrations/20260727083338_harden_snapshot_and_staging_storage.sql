begin;

create or replace function private.can_upload_experiment_snapshot(
  p_object_name text
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_run_id uuid;
  v_orphan_count bigint;
begin
  if v_user_id is null then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'experiment-snapshots:' || v_user_id::text,
      0
    )
  );

  if p_object_name !~ (
    '^' || v_user_id::text || '/[0-9a-f-]{36}\.webp$'
  ) then
    return false;
  end if;

  begin
    v_run_id :=
      split_part(split_part(p_object_name, '/', 2), '.', 1)::uuid;
  exception
    when invalid_text_representation then
      return false;
  end;

  if not exists (
    select 1
    from public.experiment_runs as runs
    where runs.id = v_run_id
      and runs.user_id = v_user_id
      and runs.snapshot_path is null
  ) then
    return false;
  end if;

  select count(*)
  into v_orphan_count
  from storage.objects as objects
  where objects.bucket_id = 'experiment-snapshots'
    and (storage.foldername(objects.name))[1] = v_user_id::text
    and not exists (
      select 1
      from public.experiment_runs as runs
      where runs.snapshot_path = objects.name
    );

  return v_orphan_count < 5;
end;
$$;

create or replace function private.can_delete_experiment_snapshot(
  p_object_name text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and (storage.foldername(p_object_name))[1] = auth.uid()::text
    and not exists (
      select 1
      from public.experiment_runs as runs
      where runs.snapshot_path = p_object_name
    );
$$;

revoke all on function private.can_upload_experiment_snapshot(text)
  from public, anon;
revoke all on function private.can_delete_experiment_snapshot(text)
  from public, anon;
grant execute on function private.can_upload_experiment_snapshot(text)
  to authenticated;
grant execute on function private.can_delete_experiment_snapshot(text)
  to authenticated;

drop policy if exists "Experiment owners can upload snapshots"
  on storage.objects;
drop policy if exists "Experiment owners can delete snapshots"
  on storage.objects;

create policy "Experiment owners can upload snapshots"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'experiment-snapshots'
    and private.can_upload_experiment_snapshot(name)
  );

create policy "Experiment owners can delete snapshots"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'experiment-snapshots'
    and private.can_delete_experiment_snapshot(name)
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
    or p_snapshot_path !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$'
    or split_part(split_part(p_snapshot_path, '/', 2), '.', 1)
      <> p_run_id::text then
    raise exception 'Invalid experiment snapshot path'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from storage.objects as objects
    where objects.bucket_id = 'experiment-snapshots'
      and objects.name = p_snapshot_path
  ) then
    raise exception 'Experiment snapshot not found' using errcode = 'P0002';
  end if;

  update public.experiment_runs as runs
  set snapshot_path = p_snapshot_path,
      updated_at = now()
  where runs.id = p_run_id
    and runs.user_id = auth.uid()
    and (
      runs.snapshot_path is null
      or runs.snapshot_path = p_snapshot_path
    );

  if not found then
    raise exception 'Experiment run already has a snapshot'
      using errcode = '42501';
  end if;

  return true;
end;
$$;

revoke all on function public.attach_experiment_run_snapshot(uuid, text)
  from public, anon;
grant execute on function public.attach_experiment_run_snapshot(uuid, text)
  to authenticated;

create or replace function public.list_own_orphan_experiment_snapshots()
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select objects.name
  from storage.objects as objects
  where auth.uid() is not null
    and objects.bucket_id = 'experiment-snapshots'
    and (storage.foldername(objects.name))[1] = auth.uid()::text
    and objects.created_at < now() - interval '1 hour'
    and not exists (
      select 1
      from public.experiment_runs as runs
      where runs.snapshot_path = objects.name
    )
  order by objects.created_at asc
  limit 5;
$$;

revoke all on function public.list_own_orphan_experiment_snapshots()
  from public, anon;
grant execute on function public.list_own_orphan_experiment_snapshots()
  to authenticated;

create or replace function private.can_upload_classroom_file(
  p_object_name text
)
returns boolean
language plpgsql
volatile
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

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'classroom-files:' || v_classroom_id::text || ':' || v_user_id::text,
      0
    )
  );

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

revoke all on function private.can_upload_classroom_file(text)
  from public, anon;
grant execute on function private.can_upload_classroom_file(text)
  to authenticated;

commit;

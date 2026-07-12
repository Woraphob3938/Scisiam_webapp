begin;

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
    or split_part(split_part(p_snapshot_path, '/', 2), '.', 1) <> p_run_id::text then
    raise exception 'Invalid experiment snapshot path' using errcode = '22023';
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
    and runs.user_id = (select auth.uid());

  if not found then
    raise exception 'Experiment run not found' using errcode = 'P0002';
  end if;

  return true;
end;
$$;

revoke all on function public.attach_experiment_run_snapshot(uuid, text) from public, anon;
grant execute on function public.attach_experiment_run_snapshot(uuid, text) to authenticated;

commit;

begin;

drop policy if exists "Users can delete own profile avatar" on storage.objects;

create policy "Users can delete own profile avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create or replace function private.remove_own_profile_avatar_internal()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.profiles
  set avatar_url = null,
      updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'display_name', v_profile.display_name,
    'avatar_url', v_profile.avatar_url
  );
end;
$$;

revoke all on function private.remove_own_profile_avatar_internal()
  from public, anon, authenticated;
grant execute on function private.remove_own_profile_avatar_internal()
  to authenticated;

create or replace function public.remove_own_profile_avatar()
returns jsonb
language sql
set search_path = ''
as $$
  select private.remove_own_profile_avatar_internal();
$$;

revoke all on function public.remove_own_profile_avatar()
  from public, anon;
grant execute on function public.remove_own_profile_avatar()
  to authenticated;

commit;

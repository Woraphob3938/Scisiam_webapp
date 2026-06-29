begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own profile avatar objects" on storage.objects;
drop policy if exists "Users can upload own profile avatar" on storage.objects;
drop policy if exists "Users can update own profile avatar" on storage.objects;

create policy "Users can read own profile avatar objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can upload own profile avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can update own profile avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create or replace function private.update_own_profile_internal(
  p_display_name text default null,
  p_avatar_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text := nullif(btrim(p_display_name), '');
  v_avatar_url text := nullif(btrim(p_avatar_url), '');
  v_profile public.profiles%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_display_name is not null and v_display_name is null then
    raise exception 'Display name is required' using errcode = '22023';
  end if;

  if char_length(v_display_name) > 80 then
    raise exception 'Display name is too long' using errcode = '22023';
  end if;

  if v_avatar_url is not null
    and v_avatar_url <> v_user_id::text || '/avatar' then
    raise exception 'Invalid avatar path' using errcode = '22023';
  end if;

  update public.profiles
  set display_name = coalesce(v_display_name, display_name),
      avatar_url = coalesce(v_avatar_url, avatar_url),
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

revoke all on function private.update_own_profile_internal(text, text)
  from public, anon, authenticated;
grant execute on function private.update_own_profile_internal(text, text)
  to authenticated;

create or replace function public.update_own_profile(
  p_display_name text default null,
  p_avatar_url text default null
)
returns jsonb
language sql
set search_path = ''
as $$
  select private.update_own_profile_internal(p_display_name, p_avatar_url);
$$;

revoke all on function public.update_own_profile(text, text)
  from public, anon;
grant execute on function public.update_own_profile(text, text)
  to authenticated;

commit;

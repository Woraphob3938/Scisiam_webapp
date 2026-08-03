begin;

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
    and v_avatar_url <> v_user_id::text || '/avatar'
    and (
      position(v_user_id::text || '/avatar-' in v_avatar_url) <> 1
      or v_avatar_url !~ (
        '^' || v_user_id::text || '/avatar-[0-9]{13}-[a-z0-9]{8}\.(jpg|png|webp)$'
      )
    ) then
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
    'avatar_url', v_profile.avatar_url,
    'updated_at', v_profile.updated_at
  );
end;
$$;

revoke all on function private.update_own_profile_internal(text, text)
  from public, anon, authenticated;
grant execute on function private.update_own_profile_internal(text, text)
  to authenticated;

commit;

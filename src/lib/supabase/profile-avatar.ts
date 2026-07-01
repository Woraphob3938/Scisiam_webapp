import { createClient, isSupabaseConfigured } from "./client";

export const DEFAULT_PROFILE_AVATAR = "/student_avatar_3d.png";

export function getProfileAvatarSrc(avatarPath: string | null | undefined, version?: string | number | null) {
  if (!avatarPath) return DEFAULT_PROFILE_AVATAR;
  if (avatarPath.startsWith("data:") || avatarPath.startsWith("http")) return avatarPath;
  if (!isSupabaseConfigured()) return DEFAULT_PROFILE_AVATAR;

  const { data } = createClient().storage.from("profile-avatars").getPublicUrl(avatarPath);
  return version ? `${data.publicUrl}?v=${encodeURIComponent(version)}` : data.publicUrl;
}

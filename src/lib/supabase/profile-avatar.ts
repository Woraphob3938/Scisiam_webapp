import { createClient, isSupabaseConfigured } from "./client";

export const DEFAULT_PROFILE_AVATAR = "/student_avatar_3d.png";

const PROFILE_AVATAR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function createProfileAvatarPath(userId: string, mimeType: string) {
  const extension = PROFILE_AVATAR_EXTENSIONS[mimeType];
  if (!extension) throw new Error("Unsupported profile avatar type");

  const revision = Date.now();
  const randomValue = new Uint32Array(1);
  const hasSecureRandom = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function";
  const rawNonce = hasSecureRandom
    ? crypto.getRandomValues(randomValue)[0].toString(36)
    : Math.random().toString(36).slice(2);
  const nonce = rawNonce.padStart(8, "0").slice(-8);

  return `${userId}/avatar-${revision}-${nonce}.${extension}`;
}

export function getProfileAvatarSrc(avatarPath: string | null | undefined, version?: string | number | null) {
  if (!avatarPath) return DEFAULT_PROFILE_AVATAR;
  if (avatarPath.startsWith("data:") || avatarPath.startsWith("http")) return avatarPath;
  if (!isSupabaseConfigured()) return DEFAULT_PROFILE_AVATAR;

  const { data } = createClient().storage.from("profile-avatars").getPublicUrl(avatarPath);
  return version ? `${data.publicUrl}?v=${encodeURIComponent(version)}` : data.publicUrl;
}

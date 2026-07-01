import type { ScisiamUserRole } from "./database.types";

export const SCISIAM_AUTH_EVENT = "scisiam-auth-update";
export const SCISIAM_REMEMBER_ME_KEY = "scisiam_remember_login";
export const SCISIAM_REMEMBER_EMAIL_KEY = "scisiam_remember_email";

type CacheAuthInput = {
  email?: string | null;
  role?: ScisiamUserRole | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export function cacheSciSiamAuth(
  input: CacheAuthInput,
  options: { emit?: boolean } = {}
) {
  if (typeof window === "undefined") return;

  localStorage.setItem("scisiam_logged_in", "true");
  localStorage.setItem("scisiam_user_role", input.role || "student");
  localStorage.setItem("scisiam_user_name", input.displayName || "นักเรียน");

  if (input.email) {
    localStorage.setItem("scisiam_user_email", input.email);
  }

  if ("avatarUrl" in input) {
    if (input.avatarUrl) {
      localStorage.setItem("scisiam_user_avatar", input.avatarUrl);
    } else {
      localStorage.removeItem("scisiam_user_avatar");
    }
  }

  if (options.emit ?? true) {
    window.dispatchEvent(new Event(SCISIAM_AUTH_EVENT));
  }
}

export function clearSciSiamAuthCache(options: { emit?: boolean } = {}) {
  if (typeof window === "undefined") return;

  localStorage.removeItem("scisiam_logged_in");
  localStorage.removeItem("scisiam_user_role");
  localStorage.removeItem("scisiam_user_name");
  localStorage.removeItem("scisiam_user_email");
  localStorage.removeItem("scisiam_user_avatar");
  localStorage.removeItem("scisiam_demo_mode");
  if (options.emit ?? true) {
    window.dispatchEvent(new Event(SCISIAM_AUTH_EVENT));
  }
}

export function getRememberedLogin() {
  if (typeof window === "undefined") {
    return { rememberMe: false, email: "" };
  }

  const rememberMe = localStorage.getItem(SCISIAM_REMEMBER_ME_KEY) === "true";
  return {
    rememberMe,
    email: rememberMe ? localStorage.getItem(SCISIAM_REMEMBER_EMAIL_KEY) || "" : "",
  };
}

export function cacheRememberedLogin(email: string, rememberMe: boolean) {
  if (typeof window === "undefined") return;

  if (rememberMe) {
    localStorage.setItem(SCISIAM_REMEMBER_ME_KEY, "true");
    localStorage.setItem(SCISIAM_REMEMBER_EMAIL_KEY, email);
    return;
  }

  localStorage.removeItem(SCISIAM_REMEMBER_ME_KEY);
  localStorage.removeItem(SCISIAM_REMEMBER_EMAIL_KEY);
}

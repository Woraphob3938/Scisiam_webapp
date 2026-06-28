import type { ScisiamUserRole } from "./database.types";

export const SCISIAM_AUTH_EVENT = "scisiam-auth-update";

type CacheAuthInput = {
  email?: string | null;
  role?: ScisiamUserRole | null;
  displayName?: string | null;
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
  localStorage.removeItem("scisiam_demo_mode");
  if (options.emit ?? true) {
    window.dispatchEvent(new Event(SCISIAM_AUTH_EVENT));
  }
}

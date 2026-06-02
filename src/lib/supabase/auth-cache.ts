import type { ScisiamUserRole } from "./database.types";

export const SCISIAM_AUTH_EVENT = "scisiam-auth-update";
export const SCISIAM_POINTS_EVENT = "points-updated";

type CacheAuthInput = {
  email?: string | null;
  role?: ScisiamUserRole | null;
  displayName?: string | null;
  totalPoints?: number | null;
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

  if (typeof input.totalPoints === "number") {
    localStorage.setItem("scisiam_points", String(input.totalPoints));
  }

  if (options.emit ?? true) {
    window.dispatchEvent(new Event(SCISIAM_AUTH_EVENT));
    window.dispatchEvent(new Event(SCISIAM_POINTS_EVENT));
  }
}

export function clearSciSiamAuthCache(options: { emit?: boolean } = {}) {
  if (typeof window === "undefined") return;

  localStorage.removeItem("scisiam_logged_in");
  localStorage.removeItem("scisiam_user_role");
  localStorage.removeItem("scisiam_user_name");
  localStorage.removeItem("scisiam_user_email");
  if (options.emit ?? true) {
    window.dispatchEvent(new Event(SCISIAM_AUTH_EVENT));
    window.dispatchEvent(new Event(SCISIAM_POINTS_EVENT));
  }
}

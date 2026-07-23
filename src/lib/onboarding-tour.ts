import type { ScisiamUserRole } from "@/lib/supabase/database.types";

export const TUTORIAL_REPLAY_KEY = "scisiam-tutorial-replay";
export const TUTORIAL_REPLAY_EVENT = "scisiam:start-tutorial";

export function getTutorialStartPath(role: ScisiamUserRole) {
  return role === "teacher" ? "/dashboard" : "/labs";
}

export function requestTutorialReplay() {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(TUTORIAL_REPLAY_KEY, "requested");
  window.dispatchEvent(new Event(TUTORIAL_REPLAY_EVENT));
}

export function consumeTutorialReplay() {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(TUTORIAL_REPLAY_KEY) !== "requested") return false;

  sessionStorage.removeItem(TUTORIAL_REPLAY_KEY);
  return true;
}

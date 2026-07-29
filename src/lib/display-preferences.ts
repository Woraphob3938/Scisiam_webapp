export const DISPLAY_PREFERENCE_KEYS = {
  textSize: "scisiam_display_text_size",
  reduceMotion: "scisiam_display_reduce_motion",
  colorBlind: "scisiam_display_color_blind",
} as const;

export type ScisiamTextSize = "normal" | "large";

export type DisplayPreferences = {
  textSize: ScisiamTextSize;
  reduceMotion: boolean;
  colorBlind: boolean;
};

const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  textSize: "normal",
  reduceMotion: false,
  colorBlind: false,
};

function readBoolean(value: string | null, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function getSystemReduceMotionPreference() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function readDisplayPreferences(): DisplayPreferences {
  if (typeof window === "undefined") return DEFAULT_DISPLAY_PREFERENCES;

  try {
    const storedTextSize = window.localStorage.getItem(DISPLAY_PREFERENCE_KEYS.textSize);
    const storedReduceMotion = window.localStorage.getItem(
      DISPLAY_PREFERENCE_KEYS.reduceMotion
    );
    return {
      textSize: storedTextSize === "large" ? "large" : "normal",
      reduceMotion: readBoolean(
        storedReduceMotion,
        getSystemReduceMotionPreference()
      ),
      colorBlind: readBoolean(
        window.localStorage.getItem(DISPLAY_PREFERENCE_KEYS.colorBlind),
        false
      ),
    };
  } catch {
    return {
      ...DEFAULT_DISPLAY_PREFERENCES,
      reduceMotion: getSystemReduceMotionPreference(),
    };
  }
}

export function applyDisplayPreferences(
  preferences: DisplayPreferences = readDisplayPreferences()
) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.scisiamTextSize = preferences.textSize;
  root.dataset.scisiamReduceMotion = String(preferences.reduceMotion);
  root.dataset.scisiamColorblind = String(preferences.colorBlind);
}

export function persistDisplayPreferences(preferences: DisplayPreferences) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(DISPLAY_PREFERENCE_KEYS.textSize, preferences.textSize);
    window.localStorage.setItem(
      DISPLAY_PREFERENCE_KEYS.reduceMotion,
      String(preferences.reduceMotion)
    );
    window.localStorage.setItem(
      DISPLAY_PREFERENCE_KEYS.colorBlind,
      String(preferences.colorBlind)
    );
  } catch {
    // Storage may be unavailable in private/restricted browsers; keep the live page usable.
  } finally {
    applyDisplayPreferences(preferences);
  }
}

export function isDisplayPreferenceKey(key: string | null) {
  return key === null || Object.values(DISPLAY_PREFERENCE_KEYS).includes(
    key as (typeof DISPLAY_PREFERENCE_KEYS)[keyof typeof DISPLAY_PREFERENCE_KEYS]
  );
}

export const DISPLAY_PREFERENCES_BOOTSTRAP_SCRIPT = `
(() => {
  try {
    const root = document.documentElement;
    const storage = window.localStorage;
    const textSize = storage.getItem("${DISPLAY_PREFERENCE_KEYS.textSize}");
    const storedReduceMotion = storage.getItem("${DISPLAY_PREFERENCE_KEYS.reduceMotion}");
    const systemReduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.dataset.scisiamTextSize = textSize === "large" ? "large" : "normal";
    root.dataset.scisiamReduceMotion =
      storedReduceMotion === null
        ? String(systemReduceMotion)
        : storedReduceMotion === "true" ? "true" : "false";
    root.dataset.scisiamColorblind =
      storage.getItem("${DISPLAY_PREFERENCE_KEYS.colorBlind}") === "true" ? "true" : "false";
  } catch {}
})();
`;

import {
  getTutorialDefinition,
  isTutorialId,
  type TutorialId,
} from "@/lib/tutorials/catalog";

export const TUTORIAL_REPLAY_KEY = "scisiam-tutorial-replay";
export const TUTORIAL_REPLAY_EVENT = "scisiam:start-tutorial";
const TUTORIAL_SESSION_PREFIX = "scisiam-tutorial-session";

export type TutorialSessionState = {
  phase: "steps";
  stepIndex: number;
  completedStepIds: string[];
};

export function getTutorialStartPath(tutorialId: TutorialId) {
  return getTutorialDefinition(tutorialId).startPath;
}

export function requestTutorialReplay(tutorialId: TutorialId) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(TUTORIAL_REPLAY_KEY, tutorialId);
  } catch {
    return;
  }

  window.dispatchEvent(new Event(TUTORIAL_REPLAY_EVENT));
}

export function peekTutorialReplay(): TutorialId | null {
  if (typeof window === "undefined") return null;

  try {
    const value = sessionStorage.getItem(TUTORIAL_REPLAY_KEY);
    if (!value || !isTutorialId(value)) {
      sessionStorage.removeItem(TUTORIAL_REPLAY_KEY);
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

export function consumeTutorialReplay(tutorialId: TutorialId) {
  if (peekTutorialReplay() !== tutorialId) return false;

  try {
    sessionStorage.removeItem(TUTORIAL_REPLAY_KEY);
  } catch {
    return false;
  }

  return true;
}

function getTutorialSessionKey(userId: string, tutorialId: TutorialId) {
  return `${TUTORIAL_SESSION_PREFIX}:${userId}:${tutorialId}`;
}

export function readTutorialSession(
  userId: string,
  tutorialId: TutorialId,
): TutorialSessionState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(getTutorialSessionKey(userId, tutorialId));
    if (!raw) return null;

    const value = JSON.parse(raw) as Partial<TutorialSessionState>;
    if (
      value.phase !== "steps" ||
      !Number.isInteger(value.stepIndex) ||
      !Array.isArray(value.completedStepIds)
    ) {
      return null;
    }

    return {
      phase: "steps",
      stepIndex: Math.max(0, Number(value.stepIndex)),
      completedStepIds: value.completedStepIds.filter(
        (stepId): stepId is string => typeof stepId === "string",
      ),
    };
  } catch {
    return null;
  }
}

export function writeTutorialSession(
  userId: string,
  tutorialId: TutorialId,
  state: TutorialSessionState,
) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(
      getTutorialSessionKey(userId, tutorialId),
      JSON.stringify(state),
    );
  } catch {
    // Session restoration is optional and must not block the tutorial.
  }
}

export function clearTutorialSession(userId: string, tutorialId: TutorialId) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(getTutorialSessionKey(userId, tutorialId));
  } catch {
    // Closing the tutorial must still succeed when storage is unavailable.
  }
}

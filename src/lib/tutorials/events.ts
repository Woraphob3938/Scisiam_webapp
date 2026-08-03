import type {
  TutorialActionId,
  TutorialId,
  TutorialStep,
} from "@/lib/tutorials/catalog";

export const TUTORIAL_ACTION_EVENT = "scisiam:tutorial-action";

export type TutorialActionDetail = {
  tutorialId: TutorialId;
  actionId: TutorialActionId;
  labId?: string;
};

export function reportTutorialAction(detail: TutorialActionDetail) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<TutorialActionDetail>(TUTORIAL_ACTION_EVENT, { detail }),
  );
}

export function matchesTutorialAction(
  detail: TutorialActionDetail,
  tutorialId: TutorialId,
  step: TutorialStep,
) {
  if (step.kind !== "action") return false;
  return (
    detail.tutorialId === tutorialId &&
    detail.actionId === step.actionId &&
    (step.labId === undefined || detail.labId === step.labId)
  );
}

/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronLeft,
  LoaderCircle,
  RefreshCw,
  SkipForward,
  MousePointerClick,
} from "lucide-react";
import { usePathname } from "next/navigation";

import {
  clearTutorialSession,
  consumeTutorialReplay,
  peekTutorialReplay,
  readTutorialSession,
  TUTORIAL_REPLAY_EVENT,
  writeTutorialSession,
} from "@/lib/onboarding-tour";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ScisiamUserRole } from "@/lib/supabase/database.types";
import {
  flushPendingTutorialProgress,
  loadTutorialStatus,
  persistTutorialStatus,
  type TutorialTerminalStatus,
} from "@/lib/supabase/tutorial-progress";
import {
  getAutoTutorialId,
  getTutorialDefinition,
  type TutorialId,
  type TutorialStep,
} from "@/lib/tutorials/catalog";
import {
  matchesTutorialAction,
  TUTORIAL_ACTION_EVENT,
  type TutorialActionDetail,
} from "@/lib/tutorials/events";

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type PanelPosition = Pick<CSSProperties, "top" | "left" | "maxHeight">;
type TourPhase = "invite" | "steps";
type TargetLookupState = "idle" | "locating" | "found" | "missing";

const TOUR_PANEL_MARGIN = 16;
const TOUR_TARGET_GAP = 14;
const TARGET_LOOKUP_TIMEOUT_MS = 1_600;
const TARGET_LOOKUP_INTERVAL_MS = 80;
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getTourPanelPosition(
  targetRect: TargetRect | null,
  panelWidth: number,
  panelHeight: number,
): PanelPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const safeWidth = Math.min(panelWidth, viewportWidth - TOUR_PANEL_MARGIN * 2);
  const safeHeight = Math.min(panelHeight, viewportHeight - TOUR_PANEL_MARGIN * 2);
  const centeredLeft = Math.max(
    TOUR_PANEL_MARGIN,
    Math.min(
      viewportWidth - safeWidth - TOUR_PANEL_MARGIN,
      (viewportWidth - safeWidth) / 2,
    ),
  );

  if (!targetRect) {
    return {
      top: viewportHeight - safeHeight - TOUR_PANEL_MARGIN,
      left: centeredLeft,
      maxHeight: viewportHeight - TOUR_PANEL_MARGIN * 2,
    };
  }

  const targetBottom = targetRect.top + targetRect.height;
  const spaceAbove = targetRect.top - TOUR_TARGET_GAP - TOUR_PANEL_MARGIN;
  const spaceBelow =
    viewportHeight - targetBottom - TOUR_TARGET_GAP - TOUR_PANEL_MARGIN;
  const spaceLeft = targetRect.left - TOUR_TARGET_GAP - TOUR_PANEL_MARGIN;
  const spaceRight =
    viewportWidth -
    (targetRect.left + targetRect.width) -
    TOUR_TARGET_GAP -
    TOUR_PANEL_MARGIN;

  if (spaceBelow >= safeHeight) {
    return {
      top: targetBottom + TOUR_TARGET_GAP,
      left: centeredLeft,
      maxHeight: spaceBelow,
    };
  }

  if (spaceAbove >= safeHeight) {
    return {
      top: TOUR_PANEL_MARGIN,
      left: centeredLeft,
      maxHeight: spaceAbove,
    };
  }

  if (viewportWidth >= 768 && spaceRight >= safeWidth) {
    return {
      top: Math.max(
        TOUR_PANEL_MARGIN,
        Math.min(
          viewportHeight - safeHeight - TOUR_PANEL_MARGIN,
          targetRect.top + targetRect.height / 2 - safeHeight / 2,
        ),
      ),
      left: targetRect.left + targetRect.width + TOUR_TARGET_GAP,
      maxHeight: viewportHeight - TOUR_PANEL_MARGIN * 2,
    };
  }

  if (viewportWidth >= 768 && spaceLeft >= safeWidth) {
    return {
      top: Math.max(
        TOUR_PANEL_MARGIN,
        Math.min(
          viewportHeight - safeHeight - TOUR_PANEL_MARGIN,
          targetRect.top + targetRect.height / 2 - safeHeight / 2,
        ),
      ),
      left: targetRect.left - safeWidth - TOUR_TARGET_GAP,
      maxHeight: viewportHeight - TOUR_PANEL_MARGIN * 2,
    };
  }

  const useTopEdge = spaceAbove >= spaceBelow;
  return {
    top: useTopEdge ? TOUR_PANEL_MARGIN : targetBottom + TOUR_TARGET_GAP,
    left: centeredLeft,
    maxHeight: Math.max(96, useTopEdge ? spaceAbove : spaceBelow),
  };
}

function getVisibleTarget(selector: string) {
  return (
    [...document.querySelectorAll<HTMLElement>(selector)].find((target) => {
      const rect = target.getBoundingClientRect();
      const style = window.getComputedStyle(target);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    }) ?? null
  );
}

function getTargetRect(target: HTMLElement | null): TargetRect | null {
  if (!target) return null;

  const rect = target.getBoundingClientRect();
  const left = Math.max(8, rect.left - 8);
  const right = Math.min(window.innerWidth - 8, rect.right + 8);
  const top = Math.max(8, rect.top - 8);
  const bottom = Math.min(window.innerHeight - 8, rect.bottom + 8);
  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function getFocusableElements(root: HTMLElement | null) {
  if (!root) return [];

  const elements: HTMLElement[] = [];
  if (root.matches(FOCUSABLE_SELECTOR)) elements.push(root);
  elements.push(...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return elements.filter((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden";
  });
}

function TutorialScrim({ targetRect }: { targetRect: TargetRect | null }) {
  const blockerClass = "pointer-events-auto fixed bg-slate-950/55";

  if (!targetRect) {
    return (
      <div
        data-tutorial-scrim
        aria-hidden="true"
        className={`${blockerClass} inset-0`}
      />
    );
  }

  const targetBottom = targetRect.top + targetRect.height;
  const targetRight = targetRect.left + targetRect.width;

  return (
    <>
      <div
        data-tutorial-scrim
        aria-hidden="true"
        className={blockerClass}
        style={{ inset: `0 0 auto 0`, height: targetRect.top }}
      />
      <div
        data-tutorial-scrim
        aria-hidden="true"
        className={blockerClass}
        style={{ inset: `${targetBottom}px 0 0 0` }}
      />
      <div
        data-tutorial-scrim
        aria-hidden="true"
        className={blockerClass}
        style={{
          top: targetRect.top,
          left: 0,
          width: targetRect.left,
          height: targetRect.height,
        }}
      />
      <div
        data-tutorial-scrim
        aria-hidden="true"
        className={blockerClass}
        style={{
          top: targetRect.top,
          right: 0,
          left: targetRight,
          height: targetRect.height,
        }}
      />
    </>
  );
}

export default function FirstLoginTour({ role }: { role: ScisiamUserRole }) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const openSequenceRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<TourPhase>("invite");
  const [activeTutorialId, setActiveTutorialId] = useState<TutorialId | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isReplay, setIsReplay] = useState(false);
  const [priorStatus, setPriorStatus] = useState<TutorialTerminalStatus | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [locatedStepId, setLocatedStepId] = useState<string | null>(null);
  const [targetLookupState, setTargetLookupState] =
    useState<TargetLookupState>("idle");
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({
    top: 16,
    left: 16,
    maxHeight: "calc(100vh - 2rem)",
  });

  const definition = activeTutorialId
    ? getTutorialDefinition(activeTutorialId)
    : null;
  const routeTutorialId = getAutoTutorialId(pathname, role);
  const isTourVisible = isOpen && activeTutorialId === routeTutorialId;
  const steps = definition?.steps ?? [];
  const step: TutorialStep | null = steps[stepIndex] ?? null;
  const isActionStep = step !== null && step.kind === "action";
  const stepSatisfied = !isActionStep || completedStepIds.includes(step.id);

  useEffect(() => {
    let cancelled = false;

    const openTutorialForRoute = async (eventTriggered = false) => {
      const tutorialId = routeTutorialId;
      if (!tutorialId) return;

      const sequence = ++openSequenceRef.current;
      const replayRequested = peekTutorialReplay() === tutorialId;
      if (eventTriggered && !replayRequested) return;

      let resolvedUserId: string | null = null;
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          resolvedUserId = user?.id ?? null;
        } catch {
          resolvedUserId = null;
        }
      }

      if (!resolvedUserId && !replayRequested) return;

      let savedStatus: TutorialTerminalStatus | null = null;
      if (resolvedUserId) {
        await flushPendingTutorialProgress(resolvedUserId);
        savedStatus = await loadTutorialStatus(resolvedUserId, tutorialId);
      }

      if (
        cancelled ||
        sequence !== openSequenceRef.current ||
        (!replayRequested && savedStatus !== null)
      ) {
        return;
      }

      if (replayRequested && !consumeTutorialReplay(tutorialId)) return;

      const session =
        resolvedUserId && !replayRequested
          ? readTutorialSession(resolvedUserId, tutorialId)
          : null;

      if (resolvedUserId && replayRequested) {
        clearTutorialSession(resolvedUserId, tutorialId);
      }

      setActiveTutorialId(tutorialId);
      setUserId(resolvedUserId);
      setIsReplay(replayRequested);
      setPriorStatus(savedStatus);
      setPhase(session ? "steps" : "invite");
      setStepIndex(
        session
          ? Math.min(session.stepIndex, getTutorialDefinition(tutorialId).steps.length - 1)
          : 0,
      );
      setCompletedStepIds(session?.completedStepIds ?? []);
      setLookupAttempt(0);
      setIsOpen(true);
    };

    activeTargetRef.current = null;
    void openTutorialForRoute();

    const handleReplay = () => void openTutorialForRoute(true);
    window.addEventListener(TUTORIAL_REPLAY_EVENT, handleReplay);

    return () => {
      cancelled = true;
      openSequenceRef.current += 1;
      window.removeEventListener(TUTORIAL_REPLAY_EVENT, handleReplay);
    };
  }, [routeTutorialId]);

  useEffect(() => {
    if (!isTourVisible || phase !== "steps" || !activeTutorialId || !userId) return;

    writeTutorialSession(userId, activeTutorialId, {
      phase: "steps",
      stepIndex,
      completedStepIds,
    });
  }, [activeTutorialId, completedStepIds, isTourVisible, phase, stepIndex, userId]);

  useEffect(() => {
    if (!isTourVisible || phase !== "steps" || !step) {
      activeTargetRef.current = null;
      return;
    }

    let lookupTimer = 0;
    let settleTimer = 0;
    let stopped = false;
    let startedAt = 0;

    const updateTarget = () => {
      const target = getVisibleTarget(step.selector);
      activeTargetRef.current = target;
      setTargetRect(getTargetRect(target));
    };

    const locateTarget = () => {
      if (stopped) return;

      const target = getVisibleTarget(step.selector);
      if (target) {
        activeTargetRef.current = target;
        setTargetLookupState("found");

        const reduceMotion =
          document.documentElement.dataset.scisiamReduceMotion === "true";
        const rect = target.getBoundingClientRect();
        const needsScroll =
          rect.top < 84 || rect.bottom > window.innerHeight - 210;

        if (needsScroll && window.getComputedStyle(target).position !== "fixed") {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "center",
            inline: "nearest",
          });
        }

        updateTarget();
        settleTimer = window.setTimeout(
          updateTarget,
          reduceMotion ? 0 : 320,
        );
        return;
      }

      if (window.performance.now() - startedAt >= TARGET_LOOKUP_TIMEOUT_MS) {
        activeTargetRef.current = null;
        setTargetRect(null);
        setTargetLookupState("missing");
        return;
      }

      lookupTimer = window.setTimeout(
        locateTarget,
        TARGET_LOOKUP_INTERVAL_MS,
      );
    };

    lookupTimer = window.setTimeout(() => {
      startedAt = window.performance.now();
      setLocatedStepId(step.id);
      setTargetLookupState("locating");
      setTargetRect(null);
      locateTarget();
    }, 0);
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);

    return () => {
      stopped = true;
      window.clearTimeout(lookupTimer);
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
      activeTargetRef.current = null;
    };
  }, [isTourVisible, lookupAttempt, phase, step]);

  useEffect(() => {
    if (
      !isTourVisible ||
      phase !== "steps" ||
      !activeTutorialId ||
      !step ||
      step.kind !== "action"
    ) {
      return;
    }

    const handleTutorialAction = (event: Event) => {
      const detail = (event as CustomEvent<TutorialActionDetail>).detail;
      if (!detail || !matchesTutorialAction(detail, activeTutorialId, step)) return;

      setCompletedStepIds((current) =>
        current.includes(step.id) ? current : [...current, step.id],
      );
    };

    window.addEventListener(TUTORIAL_ACTION_EVENT, handleTutorialAction);
    return () =>
      window.removeEventListener(TUTORIAL_ACTION_EVENT, handleTutorialAction);
  }, [activeTutorialId, isTourVisible, phase, step]);

  useEffect(() => {
    const root = document.documentElement;

    if (isTourVisible) {
      root.dataset.scisiamTourOpen = "true";
      root.dataset.mobileChrome = "visible";
    } else {
      delete root.dataset.scisiamTourOpen;
    }

    return () => {
      delete root.dataset.scisiamTourOpen;
    };
  }, [isTourVisible]);

  useLayoutEffect(() => {
    if (!isTourVisible || !panelRef.current) return;

    const panel = panelRef.current;
    const updatePanelPosition = () => {
      const panelRect = panel.getBoundingClientRect();
      const activeRect =
        phase === "steps" && targetLookupState === "found" ? targetRect : null;
      setPanelPosition(
        getTourPanelPosition(activeRect, panelRect.width, panel.scrollHeight),
      );
    };

    updatePanelPosition();
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updatePanelPosition);
    resizeObserver?.observe(panel);
    window.addEventListener("resize", updatePanelPosition);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updatePanelPosition);
    };
  }, [isTourVisible, phase, stepIndex, targetLookupState, targetRect]);

  const closeTutorial = useCallback(
    (status: TutorialTerminalStatus) => {
      const tutorialId = activeTutorialId;
      const currentUserId = userId;

      setIsOpen(false);
      setActiveTutorialId(null);
      setTargetRect(null);
      activeTargetRef.current = null;

      if (!tutorialId || !currentUserId) return;
      clearTutorialSession(currentUserId, tutorialId);

      if (status === "skipped" && isReplay && priorStatus === "completed") {
        return;
      }

      void persistTutorialStatus(currentUserId, tutorialId, status);
    },
    [activeTutorialId, isReplay, priorStatus, userId],
  );

  useEffect(() => {
    if (!isTourVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTutorial("skipped");
        return;
      }

      const isTabKey = event.key === "Tab";
      if (!isTabKey) return;

      const focusable = [
        ...getFocusableElements(activeTargetRef.current),
        ...getFocusableElements(panelRef.current),
      ].filter((element, index, all) => all.indexOf(element) === index);
      if (focusable.length === 0) return;

      const currentIndex = focusable.indexOf(
        document.activeElement as HTMLElement,
      );
      const direction = event.shiftKey ? -1 : 1;
      const nextIndex =
        currentIndex === -1
          ? event.shiftKey
            ? focusable.length - 1
            : 0
          : (currentIndex + direction + focusable.length) % focusable.length;

      event.preventDefault();
      focusable[nextIndex]?.focus();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [closeTutorial, isTourVisible]);

  useEffect(() => {
    if (!isTourVisible) return;

    const focusTimer = window.setTimeout(() => {
      const shouldFocusPanel =
        phase === "invite" ||
        step?.kind === "info" ||
        stepSatisfied ||
        targetLookupState === "missing";

      if (shouldFocusPanel) {
        panelRef.current?.focus();
        return;
      }

      getFocusableElements(activeTargetRef.current)[0]?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [isTourVisible, phase, step, stepSatisfied, targetLookupState]);

  const startSteps = () => {
    setPhase("steps");
    setStepIndex(0);
    setLookupAttempt((current) => current + 1);
  };

  const goNext = () => {
    if (!step || !stepSatisfied) return;
    if (stepIndex === steps.length - 1) {
      closeTutorial("completed");
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const skipMissingStep = () => {
    if (stepIndex === steps.length - 1) {
      closeTutorial("completed");
      return;
    }
    setStepIndex((current) => current + 1);
  };

  if (!isTourVisible || !definition || typeof document === "undefined") return null;

  const showTarget =
    phase === "steps" &&
    locatedStepId === step?.id &&
    targetLookupState === "found" &&
    targetRect;
  const arrowBelowTarget = showTarget
    ? showTarget.top + showTarget.height < window.innerHeight * 0.62
    : true;
  const arrowLeft = showTarget
    ? Math.min(
        window.innerWidth - 42,
        Math.max(12, showTarget.left + showTarget.width / 2 - 14),
      )
    : 0;
  const arrowTop = showTarget
    ? arrowBelowTarget
      ? Math.min(
          window.innerHeight - 52,
          showTarget.top + showTarget.height + 8,
        )
      : Math.max(8, showTarget.top - 35)
    : 0;
  const TargetArrow = arrowBelowTarget ? ArrowUp : ArrowDown;
  const title = phase === "invite" ? definition.introTitle : step?.title;
  const description =
    phase === "invite" ? definition.introDescription : step?.description;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <TutorialScrim targetRect={showTarget || null} />

      {showTarget ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-[110] rounded-2xl border-2 border-blue-400 shadow-[0_0_0_4px_rgba(255,255,255,0.86)]"
            style={showTarget}
          />
          <TargetArrow
            aria-hidden="true"
            className="pointer-events-none fixed z-[110] size-7 text-blue-400"
            style={{ left: arrowLeft, top: arrowTop }}
          />
        </>
      ) : null}

      <section
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-description"
        tabIndex={-1}
        className="pointer-events-auto fixed z-[120] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl shadow-slate-950/25 outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
        style={panelPosition}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MousePointerClick className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold leading-[1.5] text-blue-700">
              {definition.contextLabel}
            </p>
            <div aria-live="polite" aria-atomic="true">
              <h2
                id="tutorial-title"
                className="mt-1 text-xl font-extrabold leading-[1.45] text-slate-950"
              >
                {title}
              </h2>
              <p
                id="tutorial-description"
                className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600"
              >
                {description}
              </p>
              {phase === "steps" && step?.tip ? (
                <p className="mt-2 text-xs font-semibold leading-relaxed text-blue-700">
                  เคล็ดลับ: {step.tip}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {phase === "invite" ? (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => closeTutorial("skipped")}
              className="min-h-11 whitespace-nowrap rounded-xl px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
            >
              ไว้ทีหลัง
            </button>
            <button
              type="button"
              onClick={startSteps}
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
            >
              เริ่มดูคู่มือ
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <div
              className="mt-4 flex items-center gap-1"
              aria-label={`ขั้นตอน ${stepIndex + 1} จาก ${steps.length}`}
            >
              {steps.map((tourStep, index) => (
                <span
                  key={tourStep.id}
                  aria-hidden="true"
                  className={`h-1.5 flex-1 rounded-full transition-colors motion-reduce:transition-none ${
                    index <= stepIndex ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {targetLookupState === "locating" ? (
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold leading-relaxed text-slate-600">
                <LoaderCircle
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                กำลังหาจุดที่จะแนะนำ
              </p>
            ) : null}

            {targetLookupState === "missing" ? (
              <div className="mt-4">
                <p className="text-sm font-semibold leading-relaxed text-slate-700">
                  ยังไม่พบจุดนี้บนหน้าจอ ลองค้นหาอีกครั้ง หรือข้ามเฉพาะขั้นนี้ได้
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLookupAttempt((current) => current + 1)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                  >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    ลองค้นหาอีกครั้ง
                  </button>
                  <button
                    type="button"
                    onClick={skipMissingStep}
                    className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                  >
                    <SkipForward className="size-4" aria-hidden="true" />
                    ข้ามขั้นตอนนี้
                  </button>
                </div>
              </div>
            ) : null}

            {isActionStep && targetLookupState === "found" ? (
              <p
                className={`mt-4 text-sm font-bold leading-relaxed ${
                  stepSatisfied ? "text-emerald-700" : "text-blue-700"
                }`}
                role="status"
              >
                {stepSatisfied
                  ? "ทำสำเร็จแล้ว ไปขั้นถัดไปได้เลย"
                  : "ลองทำที่จุดที่ไฮไลต์ แล้วปุ่มถัดไปจะปรากฏ"}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => closeTutorial("skipped")}
                className="min-h-11 whitespace-nowrap rounded-xl px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
              >
                ข้ามคู่มือ
              </button>
              <div className="flex items-center gap-2">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex min-h-11 items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    ย้อนกลับ
                  </button>
                ) : null}
                {targetLookupState !== "missing" && stepSatisfied ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
                  >
                    {stepIndex === steps.length - 1 ? "เสร็จสิ้น" : "ถัดไป"}
                    {stepIndex === steps.length - 1 ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : null}
                  </button>
                ) : null}
              </div>
            </div>
          </>
        )}
      </section>
    </div>,
    document.body,
  );
}

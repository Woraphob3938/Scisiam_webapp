"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUp, Check, ChevronLeft, Sparkles } from "lucide-react";

import { usePathname } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  consumeTutorialReplay,
  getTutorialStartPath,
  TUTORIAL_REPLAY_EVENT,
} from "@/lib/onboarding-tour";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ScisiamUserRole } from "@/lib/supabase/database.types";

type TourStep = {
  selector?: string;
  title: string;
  description: string;
  tip?: string;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type PanelPosition = Pick<CSSProperties, "top" | "left" | "maxHeight">;

const TOUR_PANEL_MARGIN = 16;
const TOUR_TARGET_GAP = 14;

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

const studentSteps: TourStep[] = [
  {
    title: "ยินดีต้อนรับสู่ Scisiam",
    description:
      "น้องไออุ่นจะพาดูส่วนสำคัญแบบสั้น ๆ ตั้งแต่เลือกแล็บ ไปจนถึงเข้าชั้นเรียนและขอความช่วยเหลือค่ะ",
    tip: "ใช้เวลาประมาณ 1 นาที และกลับมาเปิดดูซ้ำได้จาก “ตั้งค่าบัญชี” ค่ะ",
  },
  {
    selector: '[data-tour="lab-search"]',
    title: "ค้นหาแล็บที่อยากทดลอง",
    description:
      "พิมพ์ชื่อภาษาไทย ภาษาอังกฤษ หรือคำสำคัญ เช่น “แรง” หรือ “เซลล์” ระบบจะช่วยหาแล็บที่เกี่ยวข้องให้ค่ะ",
  },
  {
    selector: '[data-tour="lab-filters"]',
    title: "กรองตามวิชาและระดับชั้น",
    description:
      "เลือกหมวดความรู้พื้นฐาน ฟิสิกส์ เคมี ชีววิทยา หรือคณิตศาสตร์ แล้วเลือกระดับชั้นให้ตรงกับบทเรียนได้ค่ะ",
  },
  {
    selector: '[data-tour="lab-enter"]',
    title: "เริ่มการทดลอง",
    description:
      "กด “ทดลอง” เพื่อเปิดการจำลอง จากนั้นปรับตัวแปร กดเริ่ม สังเกตค่าที่เปลี่ยน และบันทึกผลเก็บไว้ได้ค่ะ",
    tip: "ถ้าคุณครูมอบหมายแล็บผ่านชั้นเรียน ปุ่มส่งงานจะปรากฏในหน้าการทดลองค่ะ",
  },
  {
    selector: '[data-tour="classrooms-nav"]',
    title: "เข้าร่วมชั้นเรียน",
    description:
      "เปิดเมนูชั้นเรียน แล้วใช้รหัสเชิญจากคุณครูเพื่อดูแล็บ งานที่มอบหมาย กำหนดส่ง และคะแนนของคุณค่ะ",
  },
  {
    selector: '[data-tour="notifications"]',
    title: "ไม่พลาดงานใหม่",
    description:
      "กระดิ่งจะแจ้งเมื่อคุณครูเพิ่มงานหรือมีความเคลื่อนไหวในชั้นเรียน กดรายการแจ้งเตือนเพื่อไปยังงานนั้นได้ทันทีค่ะ",
  },
  {
    selector: '[data-tour="ai-tutor"]',
    title: "ถาม AI ไออุ่นได้ทุกเมื่อ",
    description:
      "ถ้าติดตรงไหน กดน้องไออุ่นเพื่อถามเรื่องทฤษฎี ขั้นตอน หรือขอคำใบ้ในการสรุปผลทดลองได้ค่ะ",
    tip: "ไออุ่นอาจตอบผิดได้ ควรตรวจคำตอบกับบทเรียนหรือคุณครูอีกครั้งนะคะ",
  },
  {
    selector: '[data-tour="profile-menu"]',
    title: "จัดการบัญชีและเปิดคู่มือซ้ำ",
    description:
      "เมนูโปรไฟล์ใช้แก้ไขข้อมูล เปลี่ยนรหัสผ่าน ปรับการแสดงผล และเปิด Tutorial นี้ซ้ำได้ค่ะ",
  },
];

const teacherSteps: TourStep[] = [
  {
    title: "ยินดีต้อนรับคุณครูสู่ Scisiam",
    description:
      "น้องไออุ่นจะพาดูจุดสำคัญสำหรับสร้างชั้นเรียน มอบหมายแล็บ และติดตามการส่งงานของนักเรียนค่ะ",
    tip: "Tutorial นี้ใช้เวลาประมาณ 1 นาที และเปิดดูซ้ำจาก “ตั้งค่าบัญชี” ได้เสมอค่ะ",
  },
  {
    selector: '[data-tour="teacher-dashboard"]',
    title: "เริ่มจากภาพรวมการส่งงาน",
    description:
      "แดชบอร์ดสรุปจำนวนนักเรียน งานที่มอบหมาย อัตราการส่ง และเปรียบเทียบแต่ละห้อง เพื่อให้เห็นสิ่งที่ควรติดตามก่อนค่ะ",
  },
  {
    selector: '[data-tour="teacher-classrooms"]',
    title: "ไปจัดการชั้นเรียน",
    description:
      "กดปุ่มนี้เพื่อสร้างห้อง เลือกระดับชั้น เพิ่มแล็บ และรับรหัสเชิญสำหรับส่งให้นักเรียนค่ะ",
  },
  {
    selector: '[data-tour="classrooms-nav"]',
    title: "กลับเข้าชั้นเรียนได้จากเมนูหลัก",
    description:
      "เมนูชั้นเรียนรวมทุกห้องที่คุณครูดูแล ภายในห้องสามารถเพิ่มงาน ตรวจผลทดลอง อ่านสรุป และให้คะแนนได้ค่ะ",
  },
  {
    selector: '[data-tour="labs-nav"]',
    title: "สำรวจคลังห้องแล็บ",
    description:
      "เปิดคลังแล็บเพื่อทดลองเนื้อหาก่อนมอบหมาย และเลือกหัวข้อที่เหมาะกับระดับของนักเรียนค่ะ",
  },
  {
    selector: '[data-tour="notifications"]',
    title: "ติดตามการส่งงาน",
    description:
      "กระดิ่งจะแจ้งเมื่อมีนักเรียนส่งงาน กดรายการเพื่อเปิดชั้นเรียนและตรวจงานนั้นต่อได้เลยค่ะ",
  },
  {
    selector: '[data-tour="ai-tutor"]',
    title: "ให้ไออุ่นช่วยเตรียมคำอธิบาย",
    description:
      "ใช้ AI ไออุ่นช่วยอธิบายหลักการ ตั้งคำถามนำ หรือหาแนวทางสอนเพิ่มเติมได้ โดยควรตรวจความถูกต้องก่อนนำไปใช้ค่ะ",
  },
  {
    selector: '[data-tour="profile-menu"]',
    title: "ตั้งค่าบัญชีและเปิด Tutorial ซ้ำ",
    description:
      "เมนูนี้ใช้แก้ไขโปรไฟล์ ปรับการแสดงผล เปลี่ยนรหัสผ่าน เปิดคู่มือฉบับเต็ม หรือเริ่ม Tutorial ใหม่ค่ะ",
  },
];

function getVisibleTarget(selector?: string) {
  if (!selector) return null;

  return [...document.querySelectorAll<HTMLElement>(selector)].find((target) => {
    const rect = target.getBoundingClientRect();
    const style = window.getComputedStyle(target);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  }) ?? null;
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

export default function FirstLoginTour({ role }: { role: ScisiamUserRole }) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({
    top: 16,
    left: 16,
    maxHeight: "calc(100vh - 2rem)",
  });

  const isTeacherTour = role === "teacher";
  const isSupportedRoute = pathname === getTutorialStartPath(role);
  const steps = isTeacherTour ? teacherSteps : studentSteps;
  const step = steps[stepIndex] ?? steps[0];

  useEffect(() => {
    const openReplay = () => {
      if (!isSupportedRoute || !consumeTutorialReplay()) return;
      setStepIndex(0);
      setIsOpen(true);
    };

    openReplay();
    window.addEventListener(TUTORIAL_REPLAY_EVENT, openReplay);
    return () => window.removeEventListener(TUTORIAL_REPLAY_EVENT, openReplay);
  }, [isSupportedRoute]);

  useEffect(() => {
    if (!isSupportedRoute || !isSupabaseConfigured()) return;

    let cancelled = false;

    const loadOnboarding = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || sessionStorage.getItem(`scisiam-onboarding-${user.id}`) === "done") return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (!cancelled && profile?.onboarding_completed === false) {
          setStepIndex(0);
          setIsOpen(true);
        }
      } catch {
        // A guide must never block access when the network is temporarily unavailable.
      }
    };

    void loadOnboarding();

    return () => {
      cancelled = true;
    };
  }, [isSupportedRoute]);

  useEffect(() => {
    if (!isOpen) return;

    const target = getVisibleTarget(step.selector);
    const reduceMotion =
      document.documentElement.dataset.scisiamReduceMotion === "true";
    const initialRect = target?.getBoundingClientRect();
    const needsScroll =
      initialRect &&
      (initialRect.top < 84 || initialRect.bottom > window.innerHeight - 210);

    if (target && needsScroll && window.getComputedStyle(target).position !== "fixed") {
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });
    }

    const updateTarget = () => setTargetRect(getTargetRect(getVisibleTarget(step.selector)));
    const updateTimer = window.setTimeout(updateTarget, reduceMotion ? 0 : 320);
    updateTarget();
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);

    return () => {
      window.clearTimeout(updateTimer);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [isOpen, step.selector]);

  useEffect(() => {
    const root = document.documentElement;

    if (isOpen) {
      root.dataset.scisiamTourOpen = "true";
      root.dataset.mobileChrome = "visible";
    } else {
      delete root.dataset.scisiamTourOpen;
    }

    return () => {
      delete root.dataset.scisiamTourOpen;
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;
    const updatePanelPosition = () => {
      const panelRect = panel.getBoundingClientRect();
      setPanelPosition(
        getTourPanelPosition(targetRect, panelRect.width, panel.scrollHeight),
      );
    };

    updatePanelPosition();
    const resizeObserver = new ResizeObserver(updatePanelPosition);
    resizeObserver.observe(panel);
    window.addEventListener("resize", updatePanelPosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePanelPosition);
    };
  }, [isOpen, stepIndex, targetRect]);

  const finishTour = async () => {
    setIsOpen(false);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        sessionStorage.setItem(`scisiam-onboarding-${user.id}`, "done");
        await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
      }
    } catch {
      // The next successful login can show the guide again if the completion state was not saved.
    }
  };

  const goNext = () => {
    if (stepIndex === steps.length - 1) {
      void finishTour();
      return;
    }

    setStepIndex((currentStep) => currentStep + 1);
  };

  const goBack = () => {
    setStepIndex((currentStep) => Math.max(0, currentStep - 1));
  };

  if (!isSupportedRoute) return null;

  const arrowBelowTarget = targetRect
    ? targetRect.top + targetRect.height < window.innerHeight * 0.62
    : true;
  const arrowLeft = targetRect
    ? Math.min(window.innerWidth - 42, Math.max(12, targetRect.left + targetRect.width / 2 - 14))
    : 0;
  const arrowTop = targetRect
    ? arrowBelowTarget
      ? Math.min(window.innerHeight - 52, targetRect.top + targetRect.height + 8)
      : Math.max(8, targetRect.top - 35)
    : 0;
  const TargetArrow = arrowBelowTarget ? ArrowUp : ArrowDown;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) void finishTour();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="!fixed !inset-0 !z-50 !block !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 !rounded-none !border-0 !bg-transparent !p-0 !shadow-none"
      >
        {targetRect ? (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none fixed z-[60] rounded-2xl border-2 border-blue-500 shadow-[0_0_0_4px_rgba(255,255,255,0.8)] transition-all duration-300 motion-reduce:transition-none"
              style={targetRect}
            />
            <TargetArrow
              aria-hidden="true"
              className="pointer-events-none fixed z-[60] size-7 animate-bounce text-blue-600 motion-reduce:animate-none"
              style={{ left: arrowLeft, top: arrowTop }}
            />
          </>
        ) : null}

        <section
          ref={panelRef}
          className="fixed z-[70] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-2xl border border-blue-100 bg-white p-5 shadow-2xl shadow-slate-900/20 transition-[top,left] duration-200 motion-reduce:transition-none"
          style={panelPosition}
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-[1.45] text-blue-600">
                {isTeacherTour ? "คู่มือสำหรับคุณครู" : "คู่มือสำหรับนักเรียน"}
              </p>
              <div aria-live="polite" aria-atomic="true">
                <DialogTitle className="mt-1 text-xl font-extrabold leading-[1.45] text-slate-950">
                  {step.title}
                </DialogTitle>
                <DialogDescription className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
                  {step.description}
                </DialogDescription>
                {step.tip ? (
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-blue-700">
                    เคล็ดลับ: {step.tip}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1" aria-label={`ขั้นตอน ${stepIndex + 1} จาก ${steps.length}`}>
            {steps.map((tourStep, index) => (
              <span
                key={tourStep.title}
                aria-hidden="true"
                className={`h-1.5 flex-1 rounded-full transition-colors motion-reduce:transition-none ${
                  index <= stepIndex ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => void finishTour()}
              className="min-h-11 rounded-xl px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
            >
              ข้ามคู่มือ
            </button>
            <div className="flex items-center gap-2">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  ย้อนกลับ
                </button>
              ) : null}
              <button
                type="button"
                onClick={goNext}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
              >
                {stepIndex === steps.length - 1 ? "เริ่มใช้ Scisiam" : "ถัดไป"}
                {stepIndex === steps.length - 1 ? <Check className="size-4" aria-hidden="true" /> : null}
              </button>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

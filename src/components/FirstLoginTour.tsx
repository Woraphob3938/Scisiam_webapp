"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Check, Sparkles } from "lucide-react";

import { usePathname } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ScisiamUserRole } from "@/lib/supabase/database.types";

type TourStep = {
  selector: string;
  title: string;
  description: string;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const studentSteps: TourStep[] = [
  {
    selector: '[data-tour="lab-search"]',
    title: "ค้นหาห้องแล็บ",
    description: "พิมพ์ชื่อเรื่อง หรือเลือกหมวดและระดับชั้นเพื่อค้นหาการทดลองที่ต้องการค่ะ",
  },
  {
    selector: '[data-tour="lab-enter"]',
    title: "เริ่มการทดลอง",
    description: "กด “เข้าห้อง” เพื่อเปิดพื้นที่จำลอง แล้วปรับค่า สังเกตผล และบันทึกการทดลองได้เลยค่ะ",
  },
  {
    selector: 'a[href="/classrooms"]',
    title: "เรียนร่วมกับชั้นเรียน",
    description: "เข้าร่วมชั้นเรียนด้วยรหัสจากคุณครู แล้วส่งผลการทดลองและดูคะแนนของคุณได้ที่นี่ค่ะ",
  },
];

const teacherSteps: TourStep[] = [
  {
    selector: '[data-tour="teacher-dashboard"]',
    title: "ดูภาพรวมชั้นเรียน",
    description: "แดชบอร์ดช่วยให้คุณครูเห็นการส่งงานของแต่ละห้องและงานที่ต้องตรวจได้ทันทีค่ะ",
  },
  {
    selector: 'a[href="/classrooms"]',
    title: "จัดการชั้นเรียน",
    description: "สร้างชั้นเรียน เลือกแล็บ และเชิญนักเรียนเข้าห้องได้จากเมนูนี้ค่ะ",
  },
  {
    selector: 'a[href="/labs"]',
    title: "เลือกแล็บให้ชั้นเรียน",
    description: "ดูแล็บทั้งหมดเพื่อเลือกหัวข้อทดลองที่เหมาะกับชั้นเรียนของคุณครูค่ะ",
  },
];

function getTargetRect(selector: string): TargetRect | null {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return null;

  const rect = target.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
    return null;
  }

  return {
    top: Math.max(8, rect.top - 8),
    left: Math.max(8, rect.left - 8),
    width: Math.min(window.innerWidth - 16, rect.width + 16),
    height: Math.min(window.innerHeight - 16, rect.height + 16),
  };
}

export default function FirstLoginTour({ role }: { role: ScisiamUserRole }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const isSupportedRoute = pathname === "/labs" || (role === "teacher" && pathname === "/dashboard");
  const steps = role === "teacher" && pathname === "/dashboard" ? teacherSteps : studentSteps;
  const step = steps[stepIndex] ?? steps[0];

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

    const updateTarget = () => setTargetRect(getTargetRect(step.selector));
    updateTarget();
    window.addEventListener("resize", updateTarget);

    return () => window.removeEventListener("resize", updateTarget);
  }, [isOpen, step.selector]);

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

  if (!isSupportedRoute) return null;

  const arrowLeft = targetRect
    ? Math.min(window.innerWidth - 42, Math.max(12, targetRect.left + targetRect.width / 2 - 14))
    : 0;
  const arrowTop = targetRect
    ? Math.min(window.innerHeight - 52, targetRect.top + targetRect.height + 8)
    : 0;

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
            <ArrowDown
              aria-hidden="true"
              className="pointer-events-none fixed z-[60] size-7 animate-bounce text-blue-600 motion-reduce:animate-none"
              style={{ left: arrowLeft, top: arrowTop }}
            />
          </>
        ) : null}

        <section className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-md rounded-2xl border border-blue-100 bg-white p-5 shadow-2xl shadow-slate-900/20 sm:bottom-8">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">เริ่มต้นใช้งาน Scisiam</p>
              <DialogTitle className="mt-1 text-xl font-extrabold leading-[1.45] text-slate-950">
                {step.title}
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
                {step.description}
              </DialogDescription>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500">
              {stepIndex + 1} / {steps.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void finishTour()}
                className="min-h-10 rounded-xl px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
              >
                ข้ามคู่มือ
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
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

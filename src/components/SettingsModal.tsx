"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Accessibility,
  Bot,
  BookOpen,
  Check,
  FileText,
  KeyRound,
  MousePointerClick,
  Palette,
  Type,
  Wand2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getTutorialStartPath,
  requestTutorialReplay,
} from "@/lib/onboarding-tour";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  persistDisplayPreferences,
  readDisplayPreferences,
  type ScisiamTextSize,
} from "@/lib/display-preferences";

export const scisiam_SETTINGS_EVENT = "scisiam_settings_updated";

const AI_STYLE_KEY = "scisiam_ai_tutor_style";
const AI_DETAIL_KEY = "scisiam_ai_answer_detail";

type AiStyle = "simple" | "hint" | "guided";
type AiDetail = "short" | "normal" | "detailed";

const aiStyles: Array<{
  id: AiStyle;
  title: string;
  description: string;
}> = [
  {
    id: "simple",
    title: "อธิบายง่าย",
    description: "สรุปเป็นภาษานักเรียน เข้าใจเร็ว",
  },
  {
    id: "hint",
    title: "ช่วยใบ้ก่อน",
    description: "ให้แนวคิดและคำถามนำก่อนเฉลย",
  },
  {
    id: "guided",
    title: "ถามนำเป็นขั้น",
    description: "พาไล่เหตุผล เหมาะกับการทบทวน",
  },
];

const aiDetails: Array<{
  id: AiDetail;
  title: string;
}> = [
  { id: "short", title: "สั้น" },
  { id: "normal", title: "พอดี" },
  { id: "detailed", title: "ละเอียด" },
];

function getStoredValue<T extends string>(key: string, fallback: T, allowed: readonly T[]) {
  if (typeof window === "undefined") return fallback;
  const value = localStorage.getItem(key);
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function getScisiamAiSettings() {
  return {
    aiStyle: getStoredValue<AiStyle>(AI_STYLE_KEY, "simple", ["simple", "hint", "guided"]),
    aiDetail: getStoredValue<AiDetail>(AI_DETAIL_KEY, "normal", ["short", "normal", "detailed"]),
  };
}

function persistSettings(input: {
  aiStyle: AiStyle;
  aiDetail: AiDetail;
  textSize: ScisiamTextSize;
  reduceMotion: boolean;
  colorBlind: boolean;
}) {
  localStorage.setItem(AI_STYLE_KEY, input.aiStyle);
  localStorage.setItem(AI_DETAIL_KEY, input.aiDetail);
  persistDisplayPreferences({
    textSize: input.textSize,
    reduceMotion: input.reduceMotion,
    colorBlind: input.colorBlind,
  });
  window.dispatchEvent(new CustomEvent(scisiam_SETTINGS_EVENT));
}

export default function SettingsModal({
  isOpen,
  onClose,
  onOpenSoftwareDisclaimer,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenSoftwareDisclaimer: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();
  const [aiStyle, setAiStyle] = useState<AiStyle>(() =>
    getStoredValue<AiStyle>(AI_STYLE_KEY, "simple", ["simple", "hint", "guided"])
  );
  const [aiDetail, setAiDetail] = useState<AiDetail>(() =>
    getStoredValue<AiDetail>(AI_DETAIL_KEY, "normal", ["short", "normal", "detailed"])
  );
  const [textSize, setTextSize] = useState<ScisiamTextSize>(
    () => readDisplayPreferences().textSize
  );
  const [reduceMotion, setReduceMotion] = useState(
    () => readDisplayPreferences().reduceMotion
  );
  const [colorBlind, setColorBlind] = useState(
    () => readDisplayPreferences().colorBlind
  );
  const [passwordResetBusy, setPasswordResetBusy] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState("");
  const [passwordResetError, setPasswordResetError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    persistSettings({ aiStyle, aiDetail, textSize, reduceMotion, colorBlind });
  }, [aiStyle, aiDetail, textSize, reduceMotion, colorBlind]);

  const selectedAiStyle = useMemo(
    () => aiStyles.find((item) => item.id === aiStyle) || aiStyles[0],
    [aiStyle]
  );

  const handleReplayTutorial = () => {
    const startPath = getTutorialStartPath(role);
    requestTutorialReplay();
    onClose();

    if (pathname !== startPath) {
      router.push(startPath);
    }
  };

  const sendPasswordResetEmail = async () => {
    setPasswordResetMessage("");
    setPasswordResetError(false);

    if (!isSupabaseConfigured()) {
      setPasswordResetMessage("ยังไม่ได้ตั้งค่า Supabase สำหรับส่งอีเมลเปลี่ยนรหัสผ่าน");
      setPasswordResetError(true);
      return;
    }

    setPasswordResetBusy(true);
    try {
      const supabase = createClient();
      const { data, error: userError } = await supabase.auth.getUser();
      const email = data.user?.email;

      if (userError || !email) {
        throw new Error("Missing current user email");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/verify`,
      });

      if (error) throw error;
      setPasswordResetMessage("ส่งลิงก์เปลี่ยนรหัสผ่านแล้ว กรุณาตรวจสอบอีเมลของคุณ");
    } catch {
      setPasswordResetMessage("ส่งลิงก์เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setPasswordResetError(true);
    } finally {
      setPasswordResetBusy(false);
    }
  };

  const portalTarget = typeof document === "undefined" ? null : document.body;
  if (!isOpen || !portalTarget) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] grid place-items-center bg-slate-950/35 px-4 py-5 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scisiam-settings-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        data-testid="scisiam-settings-modal"
        className="relative flex max-h-[min(820px,calc(100vh-32px))] w-full max-w-[800px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="scisiam-settings-title"
              className="flex items-center gap-2 text-xl font-extrabold leading-[1.35] tracking-normal text-slate-950 sm:text-2xl"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <Accessibility className="h-5 w-5" aria-hidden="true" />
              </span>
              ตั้งค่าให้เหมาะกับคุณ
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
              ปรับการเข้าถึง รูปแบบคำตอบของไออุ่น และการดูแลบัญชีได้ในที่เดียว
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
            aria-label="ปิดหน้าต่างการตั้งค่า"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 overflow-y-auto bg-slate-50/50 px-5 py-5 sm:px-6">
          <section className="order-2 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold leading-[1.45] text-slate-950">
                  AI ไออุ่น
                </h3>
                <p className="text-sm font-semibold leading-relaxed text-slate-500">
                  ตอนนี้ใช้โหมด {selectedAiStyle.title} และตอบแบบ {aiDetails.find((item) => item.id === aiDetail)?.title}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {aiStyles.map((item) => {
                const isSelected = item.id === aiStyle;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-setting-option={`ai-style-${item.id}`}
                    onClick={() => setAiStyle(item.id)}
                    aria-pressed={isSelected}
                    className={`min-h-[108px] rounded-2xl border p-3 text-left transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
                      isSelected
                        ? "border-blue-300 bg-white text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold leading-[1.45]">
                        {item.title}
                      </span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-sm font-extrabold leading-[1.45] text-slate-900">
                ความละเอียดคำตอบ
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {aiDetails.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-setting-option={`ai-detail-${item.id}`}
                    onClick={() => setAiDetail(item.id)}
                    aria-pressed={item.id === aiDetail}
                    className={`min-h-10 rounded-xl border px-3 text-sm font-extrabold leading-[1.45] transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
                      item.id === aiDetail
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="order-1 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
                <Accessibility className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold leading-[1.45] text-slate-950">
                  การเข้าถึงและการแสดงผล
                </h3>
                <p className="text-sm font-semibold leading-relaxed text-slate-500">
                  การตั้งค่านี้มีผลกับทุกหน้าของ Scisiam บนเบราว์เซอร์นี้
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:col-span-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-slate-600">
                    <Type className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold leading-[1.45] text-slate-900">
                      ขนาดตัวอักษร
                    </p>
                    <p className="text-xs font-semibold leading-relaxed text-slate-500">
                      เพิ่มขนาดเล็กน้อยเพื่ออ่านข้อความไทยได้สบายขึ้น
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:w-48">
                  {(["normal", "large"] as ScisiamTextSize[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      data-setting-option={`text-size-${item}`}
                      onClick={() => setTextSize(item)}
                      aria-pressed={textSize === item}
                      className={`min-h-10 rounded-xl border px-3 text-sm font-extrabold leading-[1.45] transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
                        textSize === item
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item === "normal" ? "ปกติ" : "ใหญ่"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-[108px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3">
                <span className="flex min-w-0 items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                    <Wand2 className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                  <span className="block text-sm font-extrabold leading-[1.45] text-slate-900">
                    ลดแอนิเมชัน
                  </span>
                  <span className="block text-xs font-semibold leading-relaxed text-slate-500">
                    ลดการเคลื่อนไหวของปุ่ม การ์ด และองค์ประกอบที่วนซ้ำ
                  </span>
                  </span>
                </span>
                <SwitchButton
                  checked={reduceMotion}
                  onChange={setReduceMotion}
                  label="ลดแอนิเมชัน"
                />
              </div>

              <div
                className={`scisiam-colorblind-panel flex min-h-[108px] items-center justify-between gap-4 rounded-2xl border bg-white p-3 transition-all ${
                  colorBlind
                    ? "border-slate-500 bg-[repeating-linear-gradient(135deg,#eff6ff_0_8px,#ffffff_8px_16px)] shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200">
                    <Palette className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold leading-[1.45] text-slate-900">
                      ตาบอดสี
                    </span>
                    <span className="scisiam-colorblind-readable block text-xs font-semibold leading-relaxed text-slate-500">
                      เพิ่มลวดลายและคอนทราสต์ให้ป้าย หมวดวิชา และแถบสี เพื่อไม่ต้องแยกข้อมูลด้วยสีอย่างเดียว
                    </span>
                    <span className="mt-2 grid grid-cols-4 gap-1.5" aria-hidden="true">
                      <span className="scisiam-colorblind-pattern-blue h-2.5 rounded-full bg-blue-50" />
                      <span className="scisiam-colorblind-pattern-emerald h-2.5 rounded-full bg-emerald-50" />
                      <span className="scisiam-colorblind-pattern-violet h-2.5 rounded-full bg-violet-50" />
                      <span className="scisiam-colorblind-pattern-rose h-2.5 rounded-full bg-rose-50" />
                    </span>
                  </span>
                </span>
                <SwitchButton
                  checked={colorBlind}
                  onChange={setColorBlind}
                  label="เปิดโหมดช่วยสำหรับผู้ตาบอดสี"
                />
              </div>
            </div>
          </section>

          <section className="order-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold leading-[1.45] text-slate-950">
                    คู่มือการใช้งาน
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-slate-500">
                    อ่านคู่มือแบบเต็ม หรือให้ไออุ่นพาชี้ส่วนสำคัญบนหน้าจอทีละขั้น
                  </p>
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
                <Link
                  href="/guide"
                  onClick={onClose}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                >
                  เปิดคู่มือ
                </Link>
                <button
                  type="button"
                  onClick={handleReplayTutorial}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                >
                  <MousePointerClick className="h-4 w-4" aria-hidden="true" />
                  เริ่ม Tutorial แบบโต้ตอบอีกครั้ง
                </button>
              </div>
            </div>
          </section>

          <section className="order-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold leading-[1.45] text-slate-950">
                    บัญชี
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-slate-500">
                    ส่งลิงก์ไปยังอีเมลบัญชีนี้เพื่อยืนยันและตั้งรหัสผ่านใหม่
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void sendPasswordResetEmail()}
                disabled={passwordResetBusy}
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold leading-[1.45] text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
              >
                {passwordResetBusy ? "กำลังส่ง..." : "เปลี่ยนรหัสผ่าน"}
              </button>
            </div>
            {passwordResetMessage ? (
              <p className={`mt-3 text-xs font-bold leading-relaxed ${passwordResetError ? "text-rose-600" : "text-emerald-600"}`} role="status">
                {passwordResetMessage}
              </p>
            ) : null}
          </section>

          <section className="order-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold leading-[1.45] text-slate-950">
                    ข้อตกลงการใช้ซอฟต์แวร์ NSC 2026
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-slate-600">
                    เปิดอ่านข้อความประกาศของโครงการและข้อมูลคณะผู้พัฒนา
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={onOpenSoftwareDisclaimer}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-blue-600 bg-white px-4 text-sm font-extrabold text-blue-800 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                เปิดอ่าน
              </button>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs font-semibold leading-relaxed text-slate-500">
            บันทึกอัตโนมัติในเครื่องนี้ สามารถเปลี่ยนได้ทุกเวลา
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-extrabold leading-[1.45] text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
          >
            เสร็จแล้ว
          </button>
        </div>
      </div>
    </div>,
    portalTarget
  );
}

function SwitchButton({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      className={`relative h-8 w-14 shrink-0 rounded-full border-2 p-0.5 transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
        checked ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-slate-200"
      }`}
    >
      <span
        className={`grid h-6 w-6 place-items-center rounded-full bg-white text-[10px] font-black shadow-sm transition-transform ${
          checked ? "translate-x-6 text-blue-700" : "translate-x-0 text-slate-500"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </span>
    </button>
  );
}

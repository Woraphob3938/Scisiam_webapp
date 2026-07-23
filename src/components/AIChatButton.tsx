"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FlaskConical,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { getScisiamAiSettings } from "@/components/SettingsModal";
import { labsById } from "@/data/labs";
import { useAuth } from "@/context/AuthContext";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function getLabIdFromPath(pathname: string | null) {
  if (!pathname) return "";
  const match = pathname.match(/^\/labs\/([^/]+)/);
  return match?.[1] || "";
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AIChatButton() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "สวัสดีค่ะ ไออุ่นคือเพื่อนคู่คิดของ Scisiam จะถามเรื่องแล็บ การเรียน หรือคุยเรื่องทั่วไปก็ได้ค่ะ",
    },
  ]);

  useEffect(() => {
    const handleOpenAi = () => setIsOpen(true);

    window.addEventListener("scisiam-ai-open", handleOpenAi);
    return () => window.removeEventListener("scisiam-ai-open", handleOpenAi);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const currentLab = useMemo(() => {
    const labId = getLabIdFromPath(pathname);
    return labId ? labsById[labId] : null;
  }, [pathname]);

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const question = input.trim();
    if (!question || isSending) return;

    const nextUserMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: question,
    };
    const nextMessages = [...messages, nextUserMessage];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const aiSettings = getScisiamAiSettings();
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labId: currentLab?.id || "",
          aiStyle: aiSettings.aiStyle,
          aiDetail: aiSettings.aiDetail,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        answer?: string;
        error?: string;
      } | null;

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content:
            data?.answer ||
            data?.error ||
            "ยังตอบไม่ได้ในตอนนี้ ลองถามใหม่อีกครั้งค่ะ",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content:
            "เชื่อมต่อ AI ไออุ่นไม่สำเร็จ กรุณาตรวจสอบ API route หรือการตั้งค่า GEMINI_API_KEY ฝั่ง server",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isLoggedIn || isAuthPage) {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(6.75rem+env(safe-area-inset-bottom))] right-4 z-50 flex flex-col items-end gap-3 select-none sm:right-6 lg:bottom-6">
      {isOpen && (
        <div
          id="ai-tutor-dialog"
          role="dialog"
          aria-labelledby="ai-tutor-title"
          className="w-[min(380px,calc(100vw-32px))] h-[min(560px,calc(100vh-100px))] flex flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white text-left shadow-2xl shadow-slate-300/40 animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-blue-100">
                    <Image src="/ai-oon-logo.png" alt="" fill sizes="36px" className="object-contain p-0.5" />
                  </span>
                    <div className="min-w-0">
                      <p
                        id="ai-tutor-title"
                        className="text-base font-extrabold leading-[1.45] text-slate-900"
                      >
                      AI ไออุ่น
                      </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  requestAnimationFrame(() => triggerRef.current?.focus());
                }}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 cursor-pointer"
                aria-label="ปิดหน้าต่าง AI ไออุ่น"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
            aria-busy={isSending}
          >
            {currentLab && (
              <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-[11px] font-semibold leading-relaxed text-slate-600">
                  กำลังตอบโดยอิงบริบทห้องแล็บ {currentLab.title}
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs font-semibold leading-relaxed break-words ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  กำลังคิดคำตอบ
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
                rows={1}
                aria-label="พิมพ์คำถามถึง AI ไออุ่น"
                placeholder="ถามเรื่องแล็บ การเรียน หรือคุยกับไออุ่น..."
                className="max-h-24 min-h-8 flex-1 resize-none bg-transparent text-xs font-semibold leading-relaxed text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
                aria-label="ส่งคำถามถึง AI ไออุ่น"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-400">
              AI อาจผิดพลาดได้ ควรตรวจคำตอบกับบทเรียนหรือผู้สอนเมื่อใช้สรุปผลทดลอง
            </p>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        ref={triggerRef}
        data-tour="ai-tutor"
        type="button"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            setIsOpen(true);
          }
        }}
        className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer sm:h-14 sm:w-14 ${
          isOpen ? "border-blue-600 bg-blue-600 text-white" : "border-blue-100 bg-white"
        }`}
        aria-label="เปิด AI ไออุ่น"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="ai-tutor-dialog"
      >
        {isOpen ? (
          <X className="h-5.5 w-5.5 sm:h-6.5 sm:w-6.5" />
        ) : (
          <Image
            src="/ai-oon-avatar.png"
            alt=""
            fill
            sizes="56px"
            loading="eager"
            className="object-cover"
          />
        )}
      </button>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  FlaskConical,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { labsById } from "@/data/labs";
import { SCISIAM_AUTH_EVENT } from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

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
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Conditionally hide AI Chat Button based on login status and page route
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoggedIn(localStorage.getItem("scisiam_logged_in") === "true");
        return;
      }

      const {
        data: { user },
      } = await createClient().auth.getUser();
      setIsLoggedIn(Boolean(user));
    };

    void checkLogin();
    const supabase = isSupabaseConfigured() ? createClient() : null;
    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      void checkLogin();
    }).data.subscription;
    const handleAuthUpdated = () => void checkLogin();

    window.addEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
    window.addEventListener("storage", handleAuthUpdated);
    return () => {
      window.removeEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
      window.removeEventListener("storage", handleAuthUpdated);
      authSubscription?.unsubscribe();
    };
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "สวัสดีครับ ผมคือ AI ไออุ่น ถามเรื่องแนวคิด สูตร วิธีทดลอง หรือการอ่านกราฟของห้องแล็บนี้ได้เลย",
    },
  ]);

  useEffect(() => {
    const handleOpenAi = () => setIsOpen(true);

    window.addEventListener("scisiam-ai-open", handleOpenAi);
    return () => window.removeEventListener("scisiam-ai-open", handleOpenAi);
  }, []);

  const currentLab = useMemo(() => {
    const labId = getLabIdFromPath(pathname);
    return labId ? labsById[labId] : null;
  }, [pathname]);

  const visibleTitle = currentLab?.title || "ผู้ช่วยวิทยาศาสตร์";

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
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labId: currentLab?.id || "",
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
            "ยังตอบไม่ได้ในตอนนี้ ลองถามใหม่อีกครั้งครับ",
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
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 z-50 flex flex-col items-end gap-3 select-none sm:right-6 lg:bottom-6">
      {isOpen && (
        <div className="w-[min(380px,calc(100vw-32px))] h-[min(560px,calc(100vh-100px))] flex flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white text-left shadow-2xl shadow-slate-300/40 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold leading-[1.5] text-slate-900">
                      AI ไออุ่น
                      </p>
                    <p className="truncate text-[11px] font-semibold leading-relaxed text-slate-500">
                      {visibleTitle}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 cursor-pointer"
                aria-label="ปิดหน้าต่าง AI ไออุ่น"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
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
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
                rows={1}
                placeholder="ถามเรื่องสูตร กราฟ หรือขั้นตอนทดลอง..."
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
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:bg-blue-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer sm:h-14 sm:w-14"
        aria-label="เปิด AI ไออุ่น"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5.5 w-5.5 sm:h-6.5 sm:w-6.5" /> : <Bot className="h-5.5 w-5.5 sm:h-6.5 sm:w-6.5" />}
        {!isOpen && (
          <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          </span>
        )}
      </button>
    </div>
  );
}

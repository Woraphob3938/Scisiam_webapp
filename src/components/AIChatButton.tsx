"use client";

import React, { useMemo, useState } from "react";
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "สวัสดีครับ ผมคือ SciSiam AI Tutor ถามเรื่องแนวคิด สูตร วิธีทดลอง หรือการอ่านกราฟของห้องแล็บนี้ได้เลย",
    },
  ]);

  const currentLab = useMemo(() => {
    const labId = getLabIdFromPath(pathname);
    return labId ? labsById[labId] : null;
  }, [pathname]);

  const visibleTitle = currentLab?.title || "Science Tutor";

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
            "เชื่อมต่อ AI Tutor ไม่สำเร็จ กรุณาตรวจสอบ API route หรือการตั้งค่า OPENAI_API_KEY",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-label="เปิด SciSiam AI Tutor"
        aria-expanded={isOpen}
      >
        <Bot className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white" />
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-20 z-50 flex h-[min(620px,calc(100vh-96px))] w-auto flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl shadow-slate-200/70 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(360px,calc(100vw-32px))]">
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold leading-[1.5] text-slate-900">
                      SciSiam AI Tutor
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
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                aria-label="ปิดหน้าต่าง AI Tutor"
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="ส่งคำถามถึง AI Tutor"
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
    </div>
  );
}

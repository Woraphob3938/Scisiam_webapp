import { NextRequest, NextResponse } from "next/server";
import { labsById } from "@/data/labs";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 900;

function sanitizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== "object") return false;
      const candidate = message as Partial<ChatMessage>;
      return (
        (candidate.role === "user" || candidate.role === "assistant") &&
        typeof candidate.content === "string" &&
        candidate.content.trim().length > 0
      );
    })
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_CHARS),
    }));
}

function extractOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  // 1. Standard OpenAI Chat Completion choices
  const choices = (payload as { choices?: unknown }).choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const firstChoice = choices[0] as { message?: { content?: unknown } };
    if (typeof firstChoice?.message?.content === "string") {
      return firstChoice.message.content.trim();
    }
  }

  // 2. Custom/Alternative response fallback
  const outputText = (payload as { output_text?: unknown }).output_text;
  if (typeof outputText === "string") return outputText.trim();

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) return [];

      return content
        .map((part) => {
          if (!part || typeof part !== "object") return "";
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        })
        .filter(Boolean);
    })
    .join("\n")
    .trim();
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return NextResponse.json({
      error:
        "ยังไม่ได้ตั้งค่า OPENAI_API_KEY ใน .env.local กรุณาเพิ่ม key ใหม่ที่ rotate แล้วและ restart dev server",
      needsConfiguration: true,
    });
  }

  const body = await request.json().catch(() => null);
  const messages = sanitizeMessages(body && typeof body === "object" ? (body as { messages?: unknown }).messages : null);
  const labId =
    body && typeof body === "object" && typeof (body as { labId?: unknown }).labId === "string"
      ? (body as { labId: string }).labId
      : "";
  const lab = labsById[labId] || null;

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "กรุณาพิมพ์คำถามก่อนส่งข้อความ" },
      { status: 400 }
    );
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!latestUserMessage) {
    return NextResponse.json(
      { error: "กรุณาพิมพ์คำถามก่อนส่งข้อความ" },
      { status: 400 }
    );
  }

  const labContext = lab
    ? `ห้องแล็บปัจจุบัน: ${lab.title}\nหมวด: ${lab.category}\nคำอธิบาย: ${lab.description}`
    : "ผู้ใช้ยังไม่ได้อยู่ในหน้าห้องแล็บเฉพาะ ให้ตอบเป็นผู้ช่วยวิทยาศาสตร์ทั่วไปของ SciSiam";

  const transcript = messages
    .map((message) => `${message.role === "user" ? "นักเรียน" : "AI"}: ${message.content}`)
    .join("\n");

  const instructions = [
    "คุณคือ SciSiam AI Tutor ผู้ช่วยสอนวิทยาศาสตร์สำหรับนักเรียนไทยในเว็บ virtual lab",
    "ตอบเป็นภาษาไทย กระชับ อธิบายเป็นขั้นตอน และผูกคำตอบกับบริบทห้องแล็บเมื่อเกี่ยวข้อง",
    "ถ้าถามคำนวณ ให้แสดงสูตร ตัวแปร หน่วย และวิธีคิดสั้น ๆ",
    "ถ้าคำถามไม่เกี่ยวกับวิทยาศาสตร์ ให้ชวนกลับมาที่การทดลองหรือแนวคิดวิทยาศาสตร์อย่างสุภาพ",
    "อย่าอ้างว่ามีข้อมูลการทดลองจริงนอกจากสิ่งที่ผู้ใช้หรือบริบทห้องแล็บให้มา",
    labContext,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: instructions },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 700,
    }),
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message =
      data && typeof data === "object"
        ? (data as { error?: { message?: string } }).error?.message
        : null;

    return NextResponse.json(
      {
        error:
          message ||
          "เรียก OpenAI API ไม่สำเร็จ กรุณาตรวจสอบ key, model, billing และ quota",
      },
      { status: response.status }
    );
  }

  const answer = extractOutputText(data);

  return NextResponse.json({
    answer:
      answer ||
      "ตอนนี้ AI ยังไม่สามารถสร้างคำตอบได้ ลองถามใหม่โดยระบุหัวข้อหรือค่าการทดลองให้ชัดขึ้นอีกนิดครับ",
    model,
  });
}

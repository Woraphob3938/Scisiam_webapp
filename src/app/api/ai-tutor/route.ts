import { NextRequest, NextResponse } from "next/server";
import { labsById } from "@/data/labs";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_MODEL = "gemini-2.5-flash";
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

function extractGeminiText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return "";

  const content = (candidates[0] as { content?: unknown }).content;
  if (!content || typeof content !== "object") return "";

  const parts = (content as { parts?: unknown }).parts;
  if (!Array.isArray(parts) || parts.length === 0) return "";

  const text = (parts[0] as { text?: unknown }).text;
  return typeof text === "string" ? text.trim() : "";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return NextResponse.json({
      error:
        "ยังไม่ได้ตั้งค่า GEMINI_API_KEY ใน .env.local กรุณาเพิ่ม key และ restart dev server",
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

  const instructions = [
    "คุณคือ SciSiam AI Tutor ผู้ช่วยสอนวิทยาศาสตร์สำหรับนักเรียนไทยในเว็บ virtual lab",
    "ตอบเป็นภาษาไทย กระชับ อธิบายเป็นขั้นตอน และผูกคำตอบกับบริบทห้องแล็บเมื่อเกี่ยวข้อง",
    "ถ้าถามคำนวณ ให้แสดงสูตร ตัวแปร หน่วย และวิธีคิดสั้น ๆ",
    "ถ้าคำถามไม่เกี่ยวกับวิทยาศาสตร์ ให้ชวนกลับมาที่การทดลองหรือแนวคิดวิทยาศาสตร์อย่างสุภาพ",
    "อย่าอ้างว่ามีข้อมูลการทดลองจริงนอกจากสิ่งที่ผู้ใช้หรือบริบทห้องแล็บให้มา",
    labContext,
  ].join("\n");

  // Map messages to Gemini contents structure
  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: instructions }],
      },
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const errorObject = data && typeof data === "object" ? (data as { error?: { message?: string } }).error : null;
    const errorMessage = errorObject?.message || "เรียก Gemini API ไม่สำเร็จ";

    return NextResponse.json(
      {
        error: `${errorMessage} (กรุณาตรวจสอบ API key หรือโควตาการใช้งาน)`,
      },
      { status: response.status }
    );
  }

  const answer = extractGeminiText(data);

  return NextResponse.json({
    answer:
      answer ||
      "ตอนนี้ AI ยังไม่สามารถสร้างคำตอบได้ ลองถามใหม่โดยระบุหัวข้อหรือค่าการทดลองให้ชัดขึ้นอีกนิดครับ",
    model,
  });
}

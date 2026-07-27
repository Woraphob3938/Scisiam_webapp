import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { labsById } from "@/data/labs";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createClient as createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AiStyle = "simple" | "hint" | "guided";
type AiDetail = "short" | "normal" | "detailed";

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 900;
const MAX_REQUEST_BYTES = 16_384;
const REQUEST_TIMEOUT_MS = 15_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const MAX_MEMORY_RATE_LIMIT_ENTRIES = 5_000;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type UsageContext = {
  supabase: SupabaseServerClient | null;
  userId: string | null;
};
type RateLimitRpcResult = {
  ok?: boolean;
  allowed?: boolean;
  resetAt?: string;
  requestCount?: number;
  maxRequests?: number;
};

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

function sanitizeAiStyle(value: unknown): AiStyle {
  return value === "hint" || value === "guided" || value === "simple" ? value : "simple";
}

function sanitizeAiDetail(value: unknown): AiDetail {
  return value === "short" || value === "detailed" || value === "normal" ? value : "normal";
}

function getAiInstruction(style: AiStyle, detail: AiDetail) {
  const styleInstruction: Record<AiStyle, string> = {
    simple:
      "รูปแบบคำตอบ: อธิบายง่าย ใช้ภาษานักเรียน ตัวอย่างใกล้ตัว และหลีกเลี่ยงศัพท์ยากถ้าไม่จำเป็น",
    hint:
      "รูปแบบคำตอบ: ช่วยใบ้ก่อน เริ่มด้วยแนวคิดหรือคำถามนำ แล้วค่อยสรุปคำตอบเพื่อไม่เฉลยเร็วเกินไป",
    guided:
      "รูปแบบคำตอบ: ถามนำเป็นขั้น แบ่งเหตุผลเป็นลำดับสั้น ๆ และชวนผู้เรียนตรวจคำตอบของตนเอง",
  };

  const detailInstruction: Record<AiDetail, string> = {
    short: "ความละเอียด: ตอบสั้น กระชับ ไม่เกิน 4-5 บรรทัด เว้นแต่ผู้ใช้ขอวิธีทำ",
    normal: "ความละเอียด: ตอบพอดี มีหัวข้อหรือขั้นตอนเท่าที่จำเป็น",
    detailed:
      "ความละเอียด: ตอบละเอียดขึ้น แสดงเหตุผล สูตร หน่วย และข้อควรระวังเมื่อเกี่ยวข้อง",
  };

  return `${styleInstruction[style]}\n${detailInstruction[detail]}`;
}

function getMaxOutputTokens(detail: AiDetail) {
  if (detail === "short") return 520;
  if (detail === "detailed") return 1400;
  return 1000;
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

function getClientId(request: NextRequest): string {
  const forwardedFor =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

function getRateLimitKey(request: NextRequest, context: UsageContext): string {
  const rawClient = context.userId ? `user:${context.userId}` : `ip:${getClientId(request)}`;

  return createHash("sha256").update(rawClient).digest("hex");
}

async function readRequestBodyWithinLimit(request: NextRequest): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function pruneMemoryRateLimitStore(now: number) {
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  if (rateLimitStore.size <= MAX_MEMORY_RATE_LIMIT_ENTRIES) return;

  const oldestEntries = [...rateLimitStore.entries()]
    .sort(([, left], [, right]) => left.resetAt - right.resetAt)
    .slice(0, rateLimitStore.size - MAX_MEMORY_RATE_LIMIT_ENTRIES);

  oldestEntries.forEach(([key]) => rateLimitStore.delete(key));
}

function isMemoryRateLimited(clientId: string): boolean {
  const now = Date.now();
  pruneMemoryRateLimitStore(now);
  const current = rateLimitStore.get(clientId);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return true;

  current.count += 1;
  return false;
}

async function isRateLimited(clientKey: string, context: UsageContext): Promise<boolean> {
  if (context.userId) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.rpc("consume_ai_rate_limit", {
        p_user_id: context.userId,
      });
      const result = data as RateLimitRpcResult | null;

      if (!error && result?.ok === true) {
        return result.allowed === false;
      }
    } catch {
      // Fall through to in-memory protection when Supabase is unavailable.
    }
  }

  return isMemoryRateLimited(clientKey);
}

async function createUsageContext(): Promise<UsageContext> {
  if (!isSupabaseConfigured()) {
    return { supabase: null, userId: null };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return {
      supabase,
      userId: user?.id || null,
    };
  } catch {
    return { supabase: null, userId: null };
  }
}

async function logAiUsage(
  context: UsageContext,
  input: {
    labId: string | null;
    model: string;
    requestChars: number;
    responseChars?: number;
    latencyMs: number;
    success: boolean;
    errorCode?: string;
  }
) {
  if (!context.supabase || !context.userId) return;

  try {
    await context.supabase
      .from("ai_usage_events")
      .insert({
        user_id: context.userId,
        lab_id: input.labId,
        provider: "gemini",
        model: input.model,
        request_chars: input.requestChars,
        response_chars: input.responseChars || 0,
        latency_ms: input.latencyMs,
        success: input.success,
        error_code: input.errorCode || null,
      })
      .throwOnError();
  } catch {
    // AI responses should not fail just because analytics logging is unavailable.
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const contentLength = Number(request.headers.get("content-length") || "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: "ข้อความยาวเกินขนาดที่ระบบรองรับ กรุณาลดประวัติแชตแล้วลองใหม่" },
      { status: 413 }
    );
  }

  const usageContext = await createUsageContext();

  if (isSupabaseConfigured() && !usageContext.userId) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบ Scisiam ก่อนใช้งาน AI ไออุ่น" },
      { status: 401 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "AI ไออุ่นยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
        needsConfiguration: true,
      },
      { status: 503 }
    );
  }

  if (await isRateLimited(getRateLimitKey(request, usageContext), usageContext)) {
    return NextResponse.json(
      {
        error:
          "ส่งคำถามถี่เกินไป กรุณารอสักครู่แล้วลองถาม AI ไออุ่นใหม่อีกครั้งค่ะ",
      },
      { status: 429 }
    );
  }

  const requestBody = await readRequestBodyWithinLimit(request).catch(() => "");
  if (requestBody === null) {
    return NextResponse.json(
      { error: "ข้อความยาวเกินขนาดที่ระบบรองรับ กรุณาลดประวัติแชตแล้วลองใหม่" },
      { status: 413 },
    );
  }

  const body = (() => {
    try {
      return JSON.parse(requestBody) as unknown;
    } catch {
      return null;
    }
  })();
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "รูปแบบคำขอไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const messages = sanitizeMessages(body && typeof body === "object" ? (body as { messages?: unknown }).messages : null);
  const labId =
    body && typeof body === "object" && typeof (body as { labId?: unknown }).labId === "string"
      ? (body as { labId: string }).labId.trim().slice(0, 80)
      : "";
  const aiStyle = sanitizeAiStyle(
    body && typeof body === "object" ? (body as { aiStyle?: unknown }).aiStyle : null
  );
  const aiDetail = sanitizeAiDetail(
    body && typeof body === "object" ? (body as { aiDetail?: unknown }).aiDetail : null
  );
  const lab = labsById[labId] || null;
  if (labId && !lab) {
    return NextResponse.json(
      { error: "ไม่พบห้องแล็บที่ระบุ" },
      { status: 400 }
    );
  }

  const requestChars = messages.reduce((total, message) => total + message.content.length, 0);
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
    : "ผู้ใช้ยังไม่ได้อยู่ในหน้าห้องแล็บเฉพาะ ให้ตอบเป็นผู้ช่วยวิทยาศาสตร์ทั่วไปของ Scisiam";

  const instructions = [
    "คุณคือ AI ไออุ่น เพื่อนคู่คิดและผู้ช่วยการเรียนรู้ของนักเรียนไทยในเว็บ Scisiam",
    "มีบุคลิกอบอุ่น เป็นกันเอง สุภาพ ใจเย็น และชวนให้ผู้ใช้กล้าคิดกล้าถาม ตอบเป็นภาษาไทยธรรมชาติ",
    "ไออุ่นเป็นผู้หญิง ให้แทนตัวเองว่าไออุ่นหรือหนูเมื่อเหมาะสม และใช้คำลงท้ายสุภาพแบบผู้หญิง เช่น ค่ะ/คะ เสมอ",
    "เมื่อคำถามเกี่ยวข้องกับวิทยาศาสตร์หรือห้องแล็บ ให้อธิบายกระชับเป็นขั้นตอนและผูกกับบริบทที่ได้รับ",
    "ถ้าถามคำนวณ ให้แสดงสูตร ตัวแปร หน่วย และวิธีคิดสั้น ๆ",
    "สามารถคุยเรื่องทั่วไปนอกวิทยาศาสตร์ได้อย่างเป็นธรรมชาติ ไม่ต้องฝืนโยงทุกคำถามกลับมาที่ห้องแล็บ",
    "ถ้าเป็นเรื่องที่อาจมีความเสี่ยงหรือจำเป็นต้องใช้ผู้เชี่ยวชาญ ให้ตอบอย่างระมัดระวังและแนะนำแหล่งช่วยเหลือที่เหมาะสม",
    "อย่าอ้างว่ามีข้อมูลการทดลองจริงนอกจากสิ่งที่ผู้ใช้หรือบริบทห้องแล็บให้มา",
    getAiInstruction(aiStyle, aiDetail),
    labContext,
  ].join("\n");

  // Map messages to Gemini contents structure
  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  let data: unknown;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: instructions }],
        },
        generationConfig: {
          maxOutputTokens: getMaxOutputTokens(aiDetail),
          temperature: 0.7,
        },
      }),
    });
    data = (await response.json().catch(() => null)) as unknown;
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError";
    await logAiUsage(usageContext, {
      labId: lab?.id || null,
      model,
      requestChars,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCode: isTimeout ? "timeout" : "network_error",
    });
    return NextResponse.json(
      {
        error: isTimeout
          ? "AI ใช้เวลาตอบนานเกินไป กรุณาลองถามใหม่อีกครั้งค่ะ"
          : "เชื่อมต่อ Gemini API ไม่สำเร็จ กรุณาลองใหม่อีกครั้งค่ะ",
      },
      { status: isTimeout ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let errorMessage = "AI ไออุ่นตอบกลับไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

    if (response.status === 503) {
      errorMessage = "ระบบ AI ของ Google กำลังมีผู้ใช้งานหนาแน่นชั่วคราว (Service Unavailable) กรุณากดส่งข้อความใหม่อีกครั้งค่ะ";
    } else if (response.status === 429) {
      errorMessage = "ความเร็วในการส่งคำถามเกินโควตาฟรีชั่วคราว (Rate Limit Exceeded) กรุณาเว้นระยะห่าง 10-15 วินาทีก่อนถามใหม่อีกครั้งค่ะ";
    }

    await logAiUsage(usageContext, {
      labId: lab?.id || null,
      model,
      requestChars,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCode: `provider_${response.status}`,
    });

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: response.status }
    );
  }

  const answer = extractGeminiText(data);
  await logAiUsage(usageContext, {
    labId: lab?.id || null,
    model,
    requestChars,
    responseChars: answer.length,
    latencyMs: Date.now() - startedAt,
    success: true,
  });

  return NextResponse.json({
    answer:
      answer ||
      "ตอนนี้ AI ยังไม่สามารถสร้างคำตอบได้ ลองถามใหม่โดยระบุหัวข้อหรือค่าการทดลองให้ชัดขึ้นอีกนิดค่ะ",
    model,
  });
}

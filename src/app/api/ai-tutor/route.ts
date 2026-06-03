import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { labsById } from "@/data/labs";
import {
  createClient as createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 900;
const REQUEST_TIMEOUT_MS = 15_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

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
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function getRateLimitKey(request: NextRequest): string {
  const rawClient = [
    getClientId(request),
    request.headers.get("user-agent") || "unknown-agent",
  ].join(":");

  return createHash("sha256").update(rawClient).digest("hex");
}

function isMemoryRateLimited(clientId: string): boolean {
  const now = Date.now();
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
  if (context.supabase) {
    try {
      const { data, error } = await context.supabase.rpc("check_ai_rate_limit", {
        p_client_key: clientKey,
        p_window_seconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
        p_max_requests: RATE_LIMIT_MAX_REQUESTS,
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

  if (!apiKey) {
    return NextResponse.json({
      error:
        "ยังไม่ได้ตั้งค่า GEMINI_API_KEY ใน .env.local กรุณาเพิ่ม key และ restart dev server",
      needsConfiguration: true,
    });
  }

  const usageContext = await createUsageContext();

  if (await isRateLimited(getRateLimitKey(request), usageContext)) {
    return NextResponse.json(
      {
        error:
          "ส่งคำถามถี่เกินไป กรุณารอสักครู่แล้วลองถาม SciSiam AI Tutor ใหม่อีกครั้งครับ",
      },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const messages = sanitizeMessages(body && typeof body === "object" ? (body as { messages?: unknown }).messages : null);
  const labId =
    body && typeof body === "object" && typeof (body as { labId?: unknown }).labId === "string"
      ? (body as { labId: string }).labId
      : "";
  const lab = labsById[labId] || null;
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
          maxOutputTokens: 1000,
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
          ? "AI ใช้เวลาตอบนานเกินไป กรุณาลองถามใหม่อีกครั้งครับ"
          : "เชื่อมต่อ Gemini API ไม่สำเร็จ กรุณาลองใหม่อีกครั้งครับ",
      },
      { status: isTimeout ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorObject = data && typeof data === "object" ? (data as { error?: { message?: string } }).error : null;
    let errorMessage = errorObject?.message || "เรียก Gemini API ไม่สำเร็จ";

    if (response.status === 503) {
      errorMessage = "ระบบ AI ของ Google กำลังมีผู้ใช้งานหนาแน่นชั่วคราว (Service Unavailable) กรุณากดส่งข้อความใหม่อีกครั้งครับ";
    } else if (response.status === 429) {
      errorMessage = "ความเร็วในการส่งคำถามเกินโควตาฟรีชั่วคราว (Rate Limit Exceeded) กรุณาเว้นระยะห่าง 10-15 วินาทีก่อนถามใหม่อีกครั้งครับ";
    } else {
      errorMessage = `${errorMessage} (กรุณาตรวจสอบ API key หรือโควตาการใช้งาน)`;
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
      "ตอนนี้ AI ยังไม่สามารถสร้างคำตอบได้ ลองถามใหม่โดยระบุหัวข้อหรือค่าการทดลองให้ชัดขึ้นอีกนิดครับ",
    model,
  });
}

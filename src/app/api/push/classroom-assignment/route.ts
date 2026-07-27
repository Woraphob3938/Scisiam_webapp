import { after, NextResponse } from "next/server";
import webPush from "web-push";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const PUSH_TIMEOUT_MS = 5_000;
const PUSH_CONCURRENCY = 10;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PushError = Error & { statusCode?: number };
type AssignmentSummary = {
  id: string;
  classroom_id: string;
  created_by: string;
  title: string;
};
type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth_key: string;
};

export async function POST(request: Request) {
  if (!configureWebPush()) {
    return NextResponse.json(
      { error: "Push notifications are not configured" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const assignmentId =
    typeof body?.assignmentId === "string" ? body.assignmentId.trim() : "";
  if (!UUID_PATTERN.test(assignmentId)) {
    return NextResponse.json({ error: "Invalid assignment" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId =
    typeof claimsData?.claims?.sub === "string"
      ? claimsData.claims.sub
      : null;
  if (claimsError || !userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("classroom_assignments")
    .select("id, classroom_id, created_by, title")
    .eq("id", assignmentId)
    .maybeSingle();
  if (assignmentError || !assignment) {
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 },
    );
  }
  if (assignment.created_by !== userId) {
    return NextResponse.json(
      { error: "Classroom owner access required" },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const { error: claimError } = await admin
    .from("assignment_push_deliveries")
    .insert({
      assignment_id: assignmentId,
      requested_by: userId,
      status: "queued",
    });
  if (claimError?.code === "23505") {
    return NextResponse.json({ queued: false, duplicate: true });
  }
  if (claimError) {
    return NextResponse.json(
      { error: "Push delivery unavailable" },
      { status: 500 },
    );
  }

  const assignmentSummary: AssignmentSummary = assignment;
  after(() => deliverAssignmentPush(assignmentId, assignmentSummary));

  return NextResponse.json({ queued: true }, { status: 202 });
}

async function deliverAssignmentPush(
  assignmentId: string,
  assignment: AssignmentSummary,
) {
  const admin = createAdminClient();

  try {
    const { data: notificationRows, error: notificationError } = await admin
      .from("classroom_notifications")
      .select("recipient_id, title, message")
      .eq("assignment_id", assignmentId)
      .limit(500);
    if (notificationError) throw new Error("notification_query_failed");

    const recipientIds = [
      ...new Set((notificationRows ?? []).map((item) => item.recipient_id)),
    ];
    if (recipientIds.length === 0) {
      await completeDelivery(assignmentId, 0);
      return;
    }

    const { data: subscriptions, error: subscriptionError } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .in("user_id", recipientIds)
      .limit(1000);
    if (subscriptionError) throw new Error("subscription_query_failed");

    const firstNotification = notificationRows?.[0];
    const payload = JSON.stringify({
      title: firstNotification?.title ?? "งานใหม่จากคุณครู",
      body:
        firstNotification?.message ??
        `คุณครูได้เพิ่มงาน "${assignment.title}" แล้ว`,
      url: `/classrooms/${assignment.classroom_id}?tab=classwork&assignment=${assignmentId}`,
      tag: `classroom-assignment-${assignmentId}`,
    });
    const expiredEndpoints: string[] = [];
    let sent = 0;
    const rows = (subscriptions ?? []) as PushSubscriptionRow[];

    for (
      let index = 0;
      index < rows.length;
      index += PUSH_CONCURRENCY
    ) {
      const batch = rows.slice(index, index + PUSH_CONCURRENCY);
      await Promise.allSettled(
        batch.map(async (subscription) => {
          try {
            await webPush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dh,
                  auth: subscription.auth_key,
                },
              },
              payload,
              {
                TTL: 24 * 60 * 60,
                urgency: "high",
                timeout: PUSH_TIMEOUT_MS,
              },
            );
            sent += 1;
          } catch (error) {
            const statusCode = (error as PushError).statusCode;
            if (statusCode === 404 || statusCode === 410) {
              expiredEndpoints.push(subscription.endpoint);
            }
          }
        }),
      );
    }

    if (expiredEndpoints.length > 0) {
      await admin
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    await completeDelivery(assignmentId, sent);
  } catch {
    await admin
      .from("assignment_push_deliveries")
      .update({
        status: "failed",
        error_code: "delivery_failed",
        completed_at: new Date().toISOString(),
      })
      .eq("assignment_id", assignmentId);
  }
}

async function completeDelivery(assignmentId: string, sentCount: number) {
  const admin = createAdminClient();
  await admin
    .from("assignment_push_deliveries")
    .update({
      status: "completed",
      sent_count: sentCount,
      error_code: null,
      completed_at: new Date().toISOString(),
    })
    .eq("assignment_id", assignmentId);
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
  const subject = process.env.WEB_PUSH_VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  if (!subject.startsWith("mailto:") && !subject.startsWith("https://")) {
    return false;
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

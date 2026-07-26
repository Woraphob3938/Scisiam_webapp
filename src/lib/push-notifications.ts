"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type PushNotificationStatus =
  | "unsupported"
  | "unavailable"
  | "prompt"
  | "enabled"
  | "blocked";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

async function getRegistration() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return null;
  }

  return navigator.serviceWorker.getRegistration();
}

export async function getPushNotificationStatus(): Promise<PushNotificationStatus> {
  const registration = await getRegistration();
  if (!registration) return "unsupported";
  if (!process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || !isSupabaseConfigured()) {
    return "unavailable";
  }
  if (Notification.permission === "denied") return "blocked";

  const subscription = await registration.pushManager.getSubscription();
  if (subscription) return "enabled";
  return "prompt";
}

export async function enablePushNotifications() {
  const registration = await getRegistration();
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;

  if (!registration || !publicKey || !isSupabaseConfigured()) {
    throw new Error("อุปกรณ์นี้ยังไม่พร้อมรับการแจ้งเตือน");
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("กรุณาอนุญาตการแจ้งเตือนในการตั้งค่าโทรศัพท์");
  }

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));
  const serialized = subscription.toJSON();
  const p256dh = serialized.keys?.p256dh;
  const authKey = serialized.keys?.auth;

  if (!serialized.endpoint || !p256dh || !authKey) {
    await subscription.unsubscribe();
    throw new Error("สร้างการเชื่อมต่อแจ้งเตือนไม่สำเร็จ");
  }

  const { error } = await createClient().rpc("upsert_push_subscription", {
    p_endpoint: serialized.endpoint,
    p_p256dh: p256dh,
    p_auth_key: authKey,
    p_user_agent: navigator.userAgent.slice(0, 500),
  });
  if (error) {
    await subscription.unsubscribe();
    throw new Error("บันทึกการแจ้งเตือนไม่สำเร็จ");
  }
}

export async function disablePushNotifications() {
  const registration = await getRegistration();
  if (!registration || !isSupabaseConfigured()) return;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const { error } = await createClient().rpc("delete_push_subscription", {
    p_endpoint: subscription.endpoint,
  });
  if (error) throw new Error("ปิดการแจ้งเตือนไม่สำเร็จ");
  await subscription.unsubscribe();
}

import {
  TUTORIAL_IDS,
  isTutorialId,
  type TutorialId,
} from "@/lib/tutorials/catalog";

import { createClient, isSupabaseConfigured } from "./client";

export type TutorialTerminalStatus = "completed" | "skipped";

type PendingTutorialProgress = {
  tutorialId: TutorialId;
  status: TutorialTerminalStatus;
  recordedAt: string;
};

export type PersistTutorialStatusResult =
  | { ok: true; queued: false }
  | { ok: false; queued: true };

const PENDING_KEY_PREFIX = "scisiam-tutorial-pending:";

function isTerminalStatus(value: unknown): value is TutorialTerminalStatus {
  return value === "completed" || value === "skipped";
}

function pendingStorageKey(userId: string) {
  return `${PENDING_KEY_PREFIX}${userId}`;
}

function readPendingProgress(userId: string): PendingTutorialProgress[] {
  if (typeof window === "undefined" || !userId) return [];

  try {
    const raw = window.localStorage.getItem(pendingStorageKey(userId));
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const byTutorial = new Map<TutorialId, PendingTutorialProgress>();
    for (const entry of parsed) {
      if (typeof entry !== "object" || entry === null) continue;
      const candidate = entry as Record<string, unknown>;
      if (
        typeof candidate.tutorialId !== "string" ||
        !isTutorialId(candidate.tutorialId) ||
        !isTerminalStatus(candidate.status) ||
        typeof candidate.recordedAt !== "string"
      ) {
        continue;
      }

      const previous = byTutorial.get(candidate.tutorialId);
      if (previous?.status === "completed" && candidate.status === "skipped") {
        continue;
      }

      byTutorial.set(candidate.tutorialId, {
        tutorialId: candidate.tutorialId,
        status: candidate.status,
        recordedAt: candidate.recordedAt,
      });
    }

    return [...byTutorial.values()];
  } catch {
    return [];
  }
}

function writePendingProgress(userId: string, entries: PendingTutorialProgress[]) {
  if (typeof window === "undefined" || !userId) return;

  try {
    const key = pendingStorageKey(userId);
    if (entries.length === 0) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    // Persistence is best effort when storage is blocked or full.
  }
}

function queuePendingProgress(userId: string, entry: PendingTutorialProgress) {
  const pending = readPendingProgress(userId);
  const current = pending.find((item) => item.tutorialId === entry.tutorialId);
  if (current?.status === "completed" && entry.status === "skipped") return;

  writePendingProgress(userId, [
    ...pending.filter((item) => item.tutorialId !== entry.tutorialId),
    entry,
  ]);
}

function removePendingProgress(
  userId: string,
  tutorialId: TutorialId,
  status: TutorialTerminalStatus,
) {
  const pending = readPendingProgress(userId);
  writePendingProgress(
    userId,
    pending.filter(
      (entry) => entry.tutorialId !== tutorialId || entry.status !== status,
    ),
  );
}

function isGeneralTutorial(tutorialId: TutorialId) {
  return (
    tutorialId === TUTORIAL_IDS.studentGeneral ||
    tutorialId === TUTORIAL_IDS.teacherGeneral
  );
}

async function writeTutorialProgress(
  userId: string,
  tutorialId: TutorialId,
  status: TutorialTerminalStatus,
  recordedAt: string,
) {
  if (!userId || !isSupabaseConfigured()) return false;

  try {
    const supabase = createClient();

    if (status === "skipped") {
      const { data: current, error: readError } = await supabase
        .from("user_tutorial_progress")
        .select("status")
        .eq("user_id", userId)
        .eq("tutorial_id", tutorialId)
        .maybeSingle();

      if (readError) return false;
      if (current?.status === "completed") return true;
    }

    const { error } = await supabase.from("user_tutorial_progress").upsert(
      {
        user_id: userId,
        tutorial_id: tutorialId,
        status,
        completed_at: status === "completed" ? recordedAt : null,
        skipped_at: status === "skipped" ? recordedAt : null,
        updated_at: recordedAt,
      },
      { onConflict: "user_id,tutorial_id" },
    );

    if (error) return false;

    if (isGeneralTutorial(tutorialId)) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true, updated_at: recordedAt })
        .eq("id", userId);
    }

    return true;
  } catch {
    return false;
  }
}

export async function loadTutorialStatus(
  userId: string,
  tutorialId: TutorialId,
): Promise<TutorialTerminalStatus | null> {
  if (!userId || !isSupabaseConfigured()) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_tutorial_progress")
      .select("status")
      .eq("user_id", userId)
      .eq("tutorial_id", tutorialId)
      .maybeSingle();

    if (error || !isTerminalStatus(data?.status)) return null;
    return data.status;
  } catch {
    return null;
  }
}

export async function persistTutorialStatus(
  userId: string,
  tutorialId: TutorialId,
  status: TutorialTerminalStatus,
): Promise<PersistTutorialStatusResult> {
  const recordedAt = new Date().toISOString();
  const saved = await writeTutorialProgress(
    userId,
    tutorialId,
    status,
    recordedAt,
  );

  if (saved) {
    removePendingProgress(userId, tutorialId, status);
    return { ok: true, queued: false };
  }

  queuePendingProgress(userId, { tutorialId, status, recordedAt });
  return { ok: false, queued: true };
}

export async function flushPendingTutorialProgress(userId: string) {
  if (!userId || !isSupabaseConfigured()) return 0;

  let flushed = 0;
  for (const entry of readPendingProgress(userId)) {
    const saved = await writeTutorialProgress(
      userId,
      entry.tutorialId,
      entry.status,
      entry.recordedAt,
    );
    if (!saved) continue;

    removePendingProgress(userId, entry.tutorialId, entry.status);
    flushed += 1;
  }

  return flushed;
}

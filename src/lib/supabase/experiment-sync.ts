import { createClient, isSupabaseConfigured } from "./client";
import { cacheSciSiamAuth } from "./auth-cache";
import type { Json } from "./database.types";

export type SyncExperimentInput = {
  labId: string;
  title?: string;
  variables?: unknown;
  liveValues?: unknown;
  graphPoints?: unknown;
  tableRows?: unknown;
  prediction?: unknown | null;
  reflection?: string | null;
  summary?: unknown;
  score?: number | null;
  durationSeconds?: number | null;
};

export type SyncExperimentResult =
  | { ok: true; runId: string }
  | { ok: false; reason: "not_configured" | "signed_out" | "supabase_error"; message?: string };

export type SaveExperimentInput = SyncExperimentInput & {
  localStorageKey: string;
  localPayload: unknown;
  localPoints?: number;
};

export function saveExperimentLocally({
  localStorageKey,
  localPayload,
  localPoints = 25,
}: Pick<SaveExperimentInput, "localStorageKey" | "localPayload" | "localPoints">) {
  if (typeof window === "undefined") {
    return { awardedPoints: false };
  }

  const wasAlreadySaved = window.localStorage.getItem(localStorageKey) !== null;
  window.localStorage.setItem(localStorageKey, JSON.stringify(localPayload));

  if (!wasAlreadySaved && localPoints > 0) {
    const currentPoints = Number(window.localStorage.getItem("scisiam_points") || "120");
    window.localStorage.setItem("scisiam_points", String(currentPoints + localPoints));
  }

  window.dispatchEvent(new Event("points-updated"));
  window.dispatchEvent(new Event("scisiam-auth-update"));

  return { awardedPoints: !wasAlreadySaved && localPoints > 0 };
}

export async function saveExperimentAndSync(input: SaveExperimentInput): Promise<SyncExperimentResult> {
  saveExperimentLocally({
    localStorageKey: input.localStorageKey,
    localPayload: input.localPayload,
    localPoints: input.localPoints,
  });

  return syncExperimentRun(input);
}

export async function syncExperimentRun(input: SyncExperimentInput): Promise<SyncExperimentResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: "not_configured" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "signed_out" };
  }

  const { data, error } = await supabase.rpc("save_experiment_run", {
    p_lab_id: input.labId,
    p_title: input.title ?? null,
    p_variables: (input.variables ?? {}) as Json,
    p_live_values: (input.liveValues ?? {}) as Json,
    p_graph_points: (input.graphPoints ?? []) as Json,
    p_table_rows: (input.tableRows ?? []) as Json,
    p_prediction: (input.prediction ?? null) as Json,
    p_reflection: input.reflection ?? null,
    p_summary: (input.summary ?? {}) as Json,
    p_score: input.score ?? null,
    p_duration_seconds: input.durationSeconds ?? null,
  });

  if (error) {
    return {
      ok: false,
      reason: "supabase_error",
      message: error.message,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, total_points")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    cacheSciSiamAuth({
      email: user.email,
      role: profile.role,
      displayName: profile.display_name,
      totalPoints: profile.total_points,
    });
  }

  return { ok: true, runId: data };
}

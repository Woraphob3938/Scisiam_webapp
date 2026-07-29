import { createClient, isSupabaseConfigured } from "./client";
import type { Json } from "./database.types";
import { captureExperimentSnapshot, uploadExperimentSnapshot } from "../experiment-snapshot";
import { showExperimentSaveToast } from "../experiment-save-toast";

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
};

export function saveExperimentLocally({
  localStorageKey,
  localPayload,
}: Pick<SaveExperimentInput, "localStorageKey" | "localPayload">) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(localStorageKey, JSON.stringify(localPayload));
  window.dispatchEvent(new Event("scisiam-auth-update"));
}

export async function saveExperimentAndSync(input: SaveExperimentInput): Promise<SyncExperimentResult> {
  saveExperimentLocally({
    localStorageKey: input.localStorageKey,
    localPayload: input.localPayload,
  });

  const result = await syncExperimentRun(input);
  showExperimentSaveToast();
  return result;
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
    p_score: null,
    p_duration_seconds: input.durationSeconds ?? null,
  });

  if (error) {
    return {
      ok: false,
      reason: "supabase_error",
      message: error.message,
    };
  }

  try {
    const { data: orphanPaths } = await supabase.rpc(
      "list_own_orphan_experiment_snapshots",
    );
    if (orphanPaths?.length) {
      await supabase.storage
        .from("experiment-snapshots")
        .remove(orphanPaths.slice(0, 5));
    }

    const snapshot = await captureExperimentSnapshot();
    if (snapshot) {
      const path = await uploadExperimentSnapshot(supabase, user.id, data, snapshot);
      if (path) {
        const { error: attachError } = await supabase.rpc("attach_experiment_run_snapshot", {
          p_run_id: data,
          p_snapshot_path: path,
        });
        if (attachError) {
          await supabase.storage.from("experiment-snapshots").remove([path]);
        }
      }
    }
  } catch {
    // The experiment run is authoritative; an optional image must never invalidate it.
  }

  return { ok: true, runId: data };
}

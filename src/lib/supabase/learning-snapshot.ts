import { LAB_SAVED_EXPERIMENT_KEYS } from "@/data/labSavedExperiments";
import { labsById, labsData } from "@/data/labs";

import { cacheScisiamAuth } from "./auth-cache";
import { createClient, isSupabaseConfigured } from "./client";
import type { ScisiamUserRole } from "./database.types";

type LocalExperimentDefinition = {
  labId: string;
  title: string;
  storageKeys: string[];
};

export type LearningRunSnapshot = {
  id: string;
  labId: string;
  title: string;
  createdAt: string;
};

export type LearningSnapshot = {
  completedCount: number;
  completedLabIds: string[];
  recentRuns: LearningRunSnapshot[];
  profile?: {
    displayName: string;
    avatarUrl: string | null;
    role: ScisiamUserRole;
  };
};

const LEGACY_EXPERIMENT_KEYS: Partial<Record<string, string[]>> = {
  "snells-law": ["scisiam_saved_snell_experiment"],
  "ideal-gas-law": ["scisiam_saved_gas_experiment"],
  "newtons-second-law": ["scisiam_saved_second_law_experiment"],
  "stefan-boltzmann": ["scisiam_saved_stefan_experiment"],
};

export const LOCAL_EXPERIMENTS: LocalExperimentDefinition[] = labsData.flatMap((lab) => {
  const primaryKey = LAB_SAVED_EXPERIMENT_KEYS[lab.id];
  if (!primaryKey) return [];

  return [{
    labId: lab.id,
    title: lab.title,
    storageKeys: [primaryKey, ...(LEGACY_EXPERIMENT_KEYS[lab.id] ?? [])],
  }];
});

const getTitle = (labId: string, fallback?: string | null) =>
  fallback || labsById[labId]?.title || labId;

const parseLocalTimestamp = (storageKeys: string[]) => {
  for (const key of storageKeys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as { timestamp?: string };
      return parsed.timestamp || "เมื่อไม่นานมานี้";
    } catch {
      return "เมื่อไม่นานมานี้";
    }
  }

  return "เมื่อไม่นานมานี้";
};

export function readLocalLearningSnapshot(): LearningSnapshot {
  if (typeof window === "undefined") {
    return { completedCount: 0, completedLabIds: [], recentRuns: [] };
  }

  const completedLabIds: string[] = [];
  const recentRuns: LearningRunSnapshot[] = [];

  LOCAL_EXPERIMENTS.forEach((lab) => {
    const completed = lab.storageKeys.some((key) => window.localStorage.getItem(key));
    if (!completed) return;

    completedLabIds.push(lab.labId);
    recentRuns.push({
      id: `local-${lab.labId}`,
      labId: lab.labId,
      title: lab.title,
      createdAt: parseLocalTimestamp(lab.storageKeys),
    });
  });

  return {
    completedCount: completedLabIds.length,
    completedLabIds,
    recentRuns,
  };
}

export async function loadSupabaseLearningSnapshot(): Promise<LearningSnapshot | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [profileResult, progressResult, runsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("lab_progress")
      .select("lab_id, status, completed_at, last_activity_at")
      .order("last_activity_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("experiment_runs")
      .select("id, lab_id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const completedIds = new Set<string>();
  progressResult.data?.forEach((row) => {
    if (row.status === "completed") {
      completedIds.add(row.lab_id);
    }
  });

  const recentRuns =
    runsResult.data?.map((run) => {
      return {
        id: run.id,
        labId: run.lab_id,
        title: getTitle(run.lab_id, run.title),
        createdAt: run.created_at,
      };
    }) ?? [];

  const profile = profileResult.data
    ? {
        displayName: profileResult.data.display_name,
        avatarUrl: profileResult.data.avatar_url,
        role: profileResult.data.role,
      }
    : undefined;

  if (profile) {
    cacheScisiamAuth(
      {
        role: profile.role,
        displayName: profile.displayName,
      },
      { emit: false },
    );
  }

  return {
    completedCount: completedIds.size,
    completedLabIds: [...completedIds],
    recentRuns,
    profile,
  };
}

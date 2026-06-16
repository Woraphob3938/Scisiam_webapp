import { LAB_SAVED_EXPERIMENT_KEYS } from "@/data/labSavedExperiments";
import { labsById, labsData } from "@/data/labs";

import { cacheSciSiamAuth } from "./auth-cache";
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
  pointsAwarded: number;
  score: number | null;
  createdAt: string;
};

export type LearningSnapshot = {
  points: number;
  completedCount: number;
  completedLabIds: string[];
  recentRuns: LearningRunSnapshot[];
  profile?: {
    displayName: string;
    role: ScisiamUserRole;
    totalPoints: number;
    currentLevel: number;
    xp: number;
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
    return { points: 0, completedCount: 0, completedLabIds: [], recentRuns: [] };
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
      pointsAwarded: 25,
      score: null,
      createdAt: parseLocalTimestamp(lab.storageKeys),
    });
  });

  return {
    points: Number(window.localStorage.getItem("scisiam_points") || "0"),
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
      .select("display_name, role, total_points, current_level, xp")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("lab_progress")
      .select("lab_id, status, points_awarded, completed_at, last_activity_at, last_score")
      .order("last_activity_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("experiment_runs")
      .select("id, lab_id, title, score, points_awarded, created_at")
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
        pointsAwarded: run.points_awarded,
        score: run.score,
        createdAt: run.created_at,
      };
    }) ?? [];

  const profile = profileResult.data
    ? {
        displayName: profileResult.data.display_name,
        role: profileResult.data.role,
        totalPoints: profileResult.data.total_points,
        currentLevel: profileResult.data.current_level,
        xp: profileResult.data.xp,
      }
    : undefined;

  if (profile) {
    cacheSciSiamAuth(
      {
        email: user.email,
        role: profile.role,
        displayName: profile.displayName,
        totalPoints: profile.totalPoints,
      },
      { emit: false },
    );
  }

  return {
    points: profile?.totalPoints ?? 0,
    completedCount: completedIds.size,
    completedLabIds: [...completedIds],
    recentRuns,
    profile,
  };
}

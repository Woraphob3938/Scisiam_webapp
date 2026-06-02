import { labsById } from "@/data/labs";

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

export const LOCAL_EXPERIMENTS: LocalExperimentDefinition[] = [
  { labId: "newtons-cooling", title: "Newton's law of cooling", storageKeys: ["scisiam_saved_cooling_experiment"] },
  { labId: "ohms-law", title: "Ohm's Law & DC Circuits", storageKeys: ["scisiam_saved_ohms_experiment"] },
  { labId: "hookes-law", title: "Hooke's Law of Elasticity", storageKeys: ["scisiam_saved_hookes_experiment"] },
  { labId: "acid-base-titration", title: "Acid-Base Titration Lab", storageKeys: ["scisiam_saved_titration_experiment"] },
  { labId: "boyles-law", title: "Boyle's Gas Law Lab", storageKeys: ["scisiam_saved_boyle_experiment"] },
  { labId: "charles-law", title: "Charles's Temperature-Volume Lab", storageKeys: ["scisiam_saved_charles_experiment"] },
  { labId: "photosynthesis-rate", title: "Photosynthesis Rate Chamber", storageKeys: ["scisiam_saved_photosynthesis_experiment"] },
  { labId: "mendels-inheritance", title: "Mendelian Genetics Lab", storageKeys: ["scisiam_saved_mendelian_experiment"] },
  { labId: "mitosis-division", title: "Mitosis & Cell Cycle", storageKeys: ["scisiam_saved_mitosis_experiment"] },
  { labId: "snells-law", title: "Snell's Law of Refraction", storageKeys: ["scisiam_saved_snells_experiment", "scisiam_saved_snell_experiment"] },
  { labId: "ideal-gas-law", title: "Ideal Gas Law Simulation", storageKeys: ["scisiam_saved_ideal_gas_experiment", "scisiam_saved_gas_experiment"] },
  { labId: "newtons-second-law", title: "Newton's Second Law of Motion", storageKeys: ["scisiam_saved_newtons_second_experiment", "scisiam_saved_second_law_experiment"] },
  { labId: "momentum-conservation", title: "Conservation of Linear Momentum", storageKeys: ["scisiam_saved_momentum_experiment"] },
  { labId: "faradays-law", title: "Faraday's Electromagnetic Induction", storageKeys: ["scisiam_saved_faradays_experiment"] },
  { labId: "bernoullis-principle", title: "Bernoulli's Principle & Fluid Dynamics", storageKeys: ["scisiam_saved_bernoulli_experiment"] },
  { labId: "photoelectric-effect", title: "Einstein's Photoelectric Effect", storageKeys: ["scisiam_saved_photoelectric_experiment"] },
  { labId: "keplers-laws", title: "Kepler's Third Law of Planetary Motion", storageKeys: ["scisiam_saved_kepler_experiment"] },
  { labId: "stefan-boltzmann", title: "Stefan-Boltzmann Law of Blackbody Radiation", storageKeys: ["scisiam_saved_stefan_boltzmann_experiment", "scisiam_saved_stefan_experiment"] },
  { labId: "le-chateliers-principle", title: "Chemical Equilibrium Shift", storageKeys: ["scisiam_saved_le_chateliers_experiment"] },
  { labId: "beer-lambert-law", title: "Spectrophotometry & Concentration", storageKeys: ["scisiam_saved_beer_lambert_experiment"] },
  { labId: "hesss-law", title: "Hess's Law & Calorimetry", storageKeys: ["scisiam_saved_hesss_experiment"] },
  { labId: "galvanic-cell", title: "Galvanic Cells & Voltage", storageKeys: ["scisiam_saved_galvanic_experiment"] },
  { labId: "chemical-kinetics", title: "Chemical Reaction Rates", storageKeys: ["scisiam_saved_kinetics_experiment"] },
  { labId: "solubility-product", title: "Solubility Product Constant", storageKeys: ["scisiam_saved_ksp_experiment"] },
  { labId: "avogadros-law", title: "Avogadro's Molar Volume", storageKeys: ["scisiam_saved_avogadro_experiment"] },
  { labId: "electrolysis-lab", title: "Electrolysis & Metal Plating", storageKeys: ["scisiam_saved_electrolysis_experiment"] },
  { labId: "colligative-properties", title: "Colligative Properties Lab", storageKeys: ["scisiam_saved_colligative_experiment"] },
];

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
    return { points: 120, completedCount: 0, completedLabIds: [], recentRuns: [] };
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
    points: Number(window.localStorage.getItem("scisiam_points") || "120"),
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
      completedIds.add(run.lab_id);
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
    points: profile?.totalPoints ?? 120,
    completedCount: completedIds.size,
    completedLabIds: [...completedIds],
    recentRuns,
    profile,
  };
}

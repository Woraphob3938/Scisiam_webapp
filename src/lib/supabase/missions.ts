import { createClient, isSupabaseConfigured } from "./client";

type ClaimMissionFailureReason =
  | "not_configured"
  | "signed_out"
  | "mission_not_found"
  | "not_completed"
  | "supabase_error";

export type ClaimMissionResult =
  | {
      ok: true;
      claimed: boolean;
      alreadyClaimed: boolean;
    }
  | {
      ok: false;
      reason: ClaimMissionFailureReason;
      message?: string;
    };

type ClaimMissionRpcResult = {
  ok?: boolean;
  claimed?: boolean;
  already_claimed?: boolean;
  reason?: string;
};

export async function loadClaimedMissionIds() {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_mission_progress")
    .select("mission_id")
    .eq("user_id", user.id)
    .not("claimed_at", "is", null);

  if (error) return [];

  return data?.map((row) => row.mission_id) ?? [];
}

export async function claimMissionReward(input: {
  missionId: string;
}): Promise<ClaimMissionResult> {
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

  const { data, error } = await supabase.rpc("claim_mission_reward", {
    p_mission_id: input.missionId,
  });

  if (error) {
    return {
      ok: false,
      reason: "supabase_error",
      message: error.message,
    };
  }

  const result = data as ClaimMissionRpcResult | null;
  if (!result?.ok) {
    return {
      ok: false,
      reason: normalizeMissionReason(result?.reason),
    };
  }

  return {
    ok: true,
    claimed: Boolean(result.claimed),
    alreadyClaimed: Boolean(result.already_claimed),
  };
}

function normalizeMissionReason(reason: string | undefined): ClaimMissionFailureReason {
  if (
    reason === "signed_out" ||
    reason === "mission_not_found" ||
    reason === "not_completed"
  ) {
    return reason;
  }

  return "supabase_error";
}

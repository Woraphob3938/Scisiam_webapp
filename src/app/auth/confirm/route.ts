import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");
  const isRecovery = type === "recovery";
  const isEmailConfirmation = type === "email";

  if (
    typeof tokenHash === "string" &&
    tokenHash.length > 0 &&
    (isRecovery || isEmailConfirmation) &&
    isSupabaseConfigured()
  ) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (!error) {
      if (isRecovery) {
        return NextResponse.redirect(new URL("/reset-password", url.origin), 303);
      }

      return NextResponse.redirect(
        new URL("/login?confirmed=success", url.origin),
        303,
      );
    }
  }

  const invalidDestination = isRecovery
    ? "/reset-password?error=invalid_link"
    : "/login?confirmed=invalid_link";
  return NextResponse.redirect(new URL(invalidDestination, url.origin), 303);
}

import { NextResponse, type NextRequest } from "next/server";

import { getSafeSameOriginPath } from "@/lib/safe-redirect";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const isDesktopCallback = url.searchParams.get("desktop") === "1";
  const requestedNext = url.searchParams.get("next") ?? "/profile";
  const next = getSafeSameOriginPath(requestedNext, "/profile");

  if (isDesktopCallback && code && code.length <= 2048) {
    const desktopCallback = new URL("scisiam://auth/callback");
    desktopCallback.searchParams.set("code", code);
    return new NextResponse(null, {
      status: 307,
      headers: { Location: desktopCallback.toString() },
    });
  }

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?oauth=error", url.origin));
}

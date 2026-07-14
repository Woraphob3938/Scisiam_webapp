import { NextResponse, type NextRequest } from "next/server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function getSafeRedirectPath(requestedNext: string) {
  if (
    !requestedNext.startsWith("/") ||
    requestedNext.startsWith("//") ||
    requestedNext.includes("\\") ||
    requestedNext.includes("\0")
  ) {
    return "/profile";
  }

  try {
    const base = new URL("https://scisiam.invalid");
    const destination = new URL(requestedNext, base);
    return destination.origin === base.origin
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : "/profile";
  } catch {
    return "/profile";
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const isDesktopCallback = url.searchParams.get("desktop") === "1";
  const requestedNext = url.searchParams.get("next") ?? "/profile";
  const next = getSafeRedirectPath(requestedNext);

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

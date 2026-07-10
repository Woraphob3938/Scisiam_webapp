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
  const requestedNext = url.searchParams.get("next") ?? "/profile";
  const next = getSafeRedirectPath(requestedNext);

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?oauth=error", url.origin));
}

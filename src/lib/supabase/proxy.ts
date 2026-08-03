import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig, isSupabaseConfigured } from "./config";
import type { Database } from "./database.types";

const PRIVATE_PATH_PREFIXES = ["/profile", "/classrooms", "/dashboard"];
const LAB_SIMULATION_PATH = /^\/labs\/[^/]+\/simulation(?:\/|$)/;

function isPrivatePath(pathname: string) {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function buildLoginRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  redirectUrl.pathname = "/login";
  redirectUrl.search = `?next=${encodeURIComponent(nextPath)}`;
  return NextResponse.redirect(redirectUrl);
}

function buildRegisterRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  redirectUrl.pathname = "/register";
  redirectUrl.search = `?next=${encodeURIComponent(nextPath)}`;
  return NextResponse.redirect(redirectUrl);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pendingAuthResponseWrites: Array<(response: NextResponse) => void> = [];
  const applyPendingAuthState = (response: NextResponse) => {
    pendingAuthResponseWrites.forEach((writeAuthState) => writeAuthState(response));
    return response;
  };

  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const { url, publishableKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        pendingAuthResponseWrites.push((response) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        });
        supabaseResponse = applyPendingAuthState(NextResponse.next({ request }));
      },
    },
  });

  const claimsResult = await supabase.auth.getClaims().catch(() => null);
  const claims = claimsResult?.data?.claims;

  if (LAB_SIMULATION_PATH.test(request.nextUrl.pathname) && !claims?.sub) {
    return applyPendingAuthState(buildRegisterRedirect(request));
  }

  if (isPrivatePath(request.nextUrl.pathname) && !claims?.sub) {
    return applyPendingAuthState(buildLoginRedirect(request));
  }

  return supabaseResponse;
}

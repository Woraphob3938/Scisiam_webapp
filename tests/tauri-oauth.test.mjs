import assert from "node:assert/strict";
import test from "node:test";
import { getGoogleOAuthOptions } from "../src/lib/desktop-runtime.ts";

test("desktop Google OAuth uses system-browser PKCE callback", () => {
  assert.deepEqual(getGoogleOAuthOptions("https://scisiam-app.vercel.app", true), {
    redirectTo: "scisiam://auth/callback",
    skipBrowserRedirect: true,
    queryParams: { prompt: "select_account" },
  });
});

test("browser Google OAuth keeps the existing HTTPS callback", () => {
  assert.deepEqual(getGoogleOAuthOptions("https://scisiam-app.vercel.app", false), {
    redirectTo: "https://scisiam-app.vercel.app/auth/oauth-callback?next=/profile",
    skipBrowserRedirect: false,
    queryParams: { prompt: "select_account" },
  });
});

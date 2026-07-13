import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getGoogleOAuthOptions } from "../src/lib/desktop-runtime.ts";

const readProjectFile = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

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

test("release desktop OAuth keeps PKCE on the remote SciSiam origin", () => {
  const launcher = readProjectFile("src-tauri/launcher/launcher.js");
  const runtime = readProjectFile("src-tauri/src/lib.rs");
  const navigation = readProjectFile("src-tauri/src/navigation.rs");
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const releaseOrigin = "https://scisiam-app.vercel.app";

  assert.match(launcher, /const APP_ORIGIN = "https:\/\/scisiam-app\.vercel\.app"/);
  assert.match(launcher, /window\.location\.replace\(APP_ORIGIN\)/);
  assert.match(runtime, /const PRODUCTION_ORIGIN: &str = "https:\/\/scisiam-app\.vercel\.app"/);
  assert.match(runtime, /WebviewUrl::App\("index\.html"\.into\(\)\)/);
  assert.match(runtime, /let callback = build_web_callback\(&app_origin\(\), &code\)/);
  assert.match(runtime, /window\.navigate\(callback\)/);
  assert.match(navigation, /app_origin\s*\.join\("\/auth\/oauth-callback"\)/);
  assert.match(authForm, /getGoogleOAuthOptions\(window\.location\.origin, desktop\)/);
  assert.match(authForm, /window\.location\.assign\(data\.url\)/);
  assert.equal(
    getGoogleOAuthOptions(releaseOrigin, true).redirectTo,
    "scisiam://auth/callback",
  );
  assert.doesNotMatch(launcher, /tauri:\/\/localhost/);
  assert.doesNotMatch(authForm, /tauri:\/\/localhost/);
});

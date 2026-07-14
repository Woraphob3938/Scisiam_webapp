import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getDesktopOAuthError,
  getGoogleOAuthOptions,
} from "../src/lib/desktop-runtime.ts";

const readProjectFile = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("desktop Google OAuth uses system-browser PKCE callback", () => {
  assert.deepEqual(getGoogleOAuthOptions("https://scisiam-app.vercel.app", true), {
    redirectTo: "https://scisiam-app.vercel.app/auth/oauth-callback?desktop=1",
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

test("desktop browser-open failure exposes only a fixed retryable Thai error", () => {
  assert.equal(
    getDesktopOAuthError("?desktop-oauth-error=browser-open-failed"),
    "เปิดเบราว์เซอร์เพื่อเข้าสู่ระบบ Google ไม่สำเร็จ กรุณาตรวจสอบเบราว์เซอร์เริ่มต้นแล้วลองใหม่อีกครั้ง",
  );
  assert.equal(getDesktopOAuthError("?desktop-oauth-error=unknown"), "");
  assert.equal(getDesktopOAuthError("?code=secret"), "");

  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  assert.match(authForm, /getDesktopOAuthError\(window\.location\.search\)/);
  assert.match(authForm, /setOauthLoading\(false\)/);
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
  assert.match(
    runtime,
    /fn forward_callback_code[\s\S]*build_web_callback\(&app_origin\(\), code\)[\s\S]*navigate_main\(app, &callback/,
  );
  assert.match(navigation, /app_origin\s*\.join\("\/auth\/oauth-callback"\)/);
  assert.match(authForm, /getGoogleOAuthOptions\(window\.location\.origin, desktop\)/);
  assert.match(authForm, /window\.location\.assign\(data\.url\)/);
  assert.equal(
    getGoogleOAuthOptions(releaseOrigin, true).redirectTo,
    "https://scisiam-app.vercel.app/auth/oauth-callback?desktop=1",
  );
  assert.doesNotMatch(launcher, /tauri:\/\/localhost/);
  assert.doesNotMatch(authForm, /tauri:\/\/localhost/);
});

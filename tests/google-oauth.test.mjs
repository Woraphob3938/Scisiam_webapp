import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("Google OAuth returns authenticated users to the student profile", () => {
  const callbackPath = "src/app/auth/oauth-callback/route.ts";

  assert.equal(
    existsSync(join(rootDir, callbackPath)),
    true,
    `${callbackPath} should exist`,
  );

  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const desktopRuntime = readProjectFile("src/lib/desktop-runtime.ts");
  const callbackRoute = readProjectFile(callbackPath);

  assert.match(authForm, /signInWithOAuth\(\{/);
  assert.match(authForm, /provider:\s*["']google["']/);
  assert.match(authForm, /getGoogleOAuthOptions\(window\.location\.origin, desktop\)/);
  assert.match(desktopRuntime, /auth\/oauth-callback\?next=\/profile/);
  assert.match(desktopRuntime, /auth\/oauth-callback\?desktop=1/);
  assert.match(authForm, /เข้าสู่ระบบด้วย Google/);
  assert.match(authForm, /สมัครด้วย Google/);

  assert.match(callbackRoute, /exchangeCodeForSession\(code\)/);
  assert.match(callbackRoute, /searchParams\.get\("desktop"\)\s*===\s*"1"/);
  assert.match(callbackRoute, /new URL\("scisiam:\/\/auth\/callback"\)/);
  assert.match(callbackRoute, /headers:\s*\{\s*Location:\s*desktopCallback\.toString\(\)\s*\}/);
  assert.match(callbackRoute, /searchParams\.get\("next"\)\s*\?\?\s*"\/profile"/);
  assert.match(callbackRoute, /function getSafeRedirectPath/);
  assert.match(callbackRoute, /requestedNext\.includes\("\\\\"\)/);
  assert.match(callbackRoute, /destination\.origin === base\.origin/);
  assert.match(callbackRoute, /NextResponse\.redirect\(new URL\(next, url\.origin\)\)/);
  assert.doesNotMatch(callbackRoute, /user_metadata|requested_role|role\s*:/);
});

test("Google OAuth always asks the user to select an account", () => {
  const desktopRuntime = readProjectFile("src/lib/desktop-runtime.ts");

  assert.match(
    desktopRuntime,
    /queryParams:\s*\{\s*prompt:\s*["']select_account["']\s*\}/,
  );
});

test("login and register expose an accessible Windows app installer link", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const envExample = readProjectFile(".env.example");

  assert.match(authForm, /NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL/);
  assert.match(authForm, /github\.com\/Woraphob3938\/Scisiam_webapp\/releases/);
  assert.match(authForm, /ติดตั้งแอป Windows/);
  assert.match(authForm, /aria-label="ดาวน์โหลดและติดตั้งแอป Scisiam สำหรับ Windows"/);
  assert.match(authForm, /target="_blank"/);
  assert.match(authForm, /rel="noreferrer"/);
  assert.match(authForm, /!desktopRuntime/);
  assert.match(envExample, /NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL=/);
});

test("Google OAuth loading state resets when returning from browser history", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");

  assert.match(authForm, /window\.addEventListener\("pageshow",\s*resetOAuthLoading\)/);
  assert.match(authForm, /window\.removeEventListener\("pageshow",\s*resetOAuthLoading\)/);
  assert.match(authForm, /const resetOAuthLoading = \(\) => setOauthLoading\(false\)/);
});

test("email login remember me persists the next login email only after success", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const authCache = readProjectFile("src/lib/supabase/auth-cache.ts");

  assert.match(authForm, /getRememberedLogin/);
  assert.match(authForm, /setTimeout\(\(\) => \{/);
  assert.match(authForm, /setRememberMe\(remembered\.rememberMe\)/);
  assert.match(authForm, /setEmail\(remembered\.email\)/);
  assert.match(authForm, /cacheRememberedLogin\(normalizedEmail, rememberMe\)/);
  assert.match(authCache, /SCISIAM_REMEMBER_ME_KEY/);
  assert.match(authCache, /SCISIAM_REMEMBER_EMAIL_KEY/);
  assert.match(authCache, /localStorage\.setItem\(SCISIAM_REMEMBER_EMAIL_KEY, email\)/);
  assert.match(authCache, /localStorage\.removeItem\(SCISIAM_REMEMBER_EMAIL_KEY\)/);
});

test("email login sends students to labs and teachers to dashboard", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");

  assert.match(authForm, /let nextPath = "\/labs"/);
  assert.match(authForm, /nextPath = profile\.role === "teacher" \? "\/dashboard" : "\/labs"/);
  assert.match(authForm, /cacheRememberedLogin\(normalizedEmail, rememberMe\);[\s\S]*router\.replace\(nextPath\)/);
  assert.doesNotMatch(authForm, /router\.push\("\/"\)/);
});

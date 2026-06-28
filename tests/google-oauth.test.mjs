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
  const callbackRoute = readProjectFile(callbackPath);

  assert.match(authForm, /signInWithOAuth\(\{/);
  assert.match(authForm, /provider:\s*["']google["']/);
  assert.match(
    authForm,
    /redirectTo:\s*`\$\{window\.location\.origin\}\/auth\/oauth-callback\?next=\/profile`/,
  );
  assert.match(authForm, /เข้าสู่ระบบด้วย Google/);
  assert.match(authForm, /สมัครด้วย Google/);

  assert.match(callbackRoute, /exchangeCodeForSession\(code\)/);
  assert.match(callbackRoute, /searchParams\.get\("next"\)\s*\?\?\s*"\/profile"/);
  assert.match(callbackRoute, /requestedNext\.startsWith\("\/"\)/);
  assert.match(callbackRoute, /!requestedNext\.startsWith\("\/\/"\)/);
  assert.match(callbackRoute, /NextResponse\.redirect\(new URL\(next, url\.origin\)\)/);
  assert.doesNotMatch(callbackRoute, /user_metadata|requested_role|role\s*:/);
});

test("Google OAuth always asks the user to select an account", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");

  assert.match(
    authForm,
    /queryParams:\s*\{\s*prompt:\s*["']select_account["']\s*\}/,
  );
});

test("Google OAuth loading state resets when returning from browser history", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");

  assert.match(authForm, /window\.addEventListener\("pageshow",\s*resetOAuthLoading\)/);
  assert.match(authForm, /window\.removeEventListener\("pageshow",\s*resetOAuthLoading\)/);
  assert.match(authForm, /const resetOAuthLoading = \(\) => setOauthLoading\(false\)/);
});

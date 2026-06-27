import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("password recovery uses Supabase PKCE without exposing account existence", () => {
  const callbackPath = "src/app/auth/callback/route.ts";
  const resetFormPath = "src/components/auth/ResetPasswordForm.tsx";
  const resetPagePath = "src/app/reset-password/page.tsx";

  assert.equal(existsSync(join(rootDir, callbackPath)), true, `${callbackPath} should exist`);
  assert.equal(existsSync(join(rootDir, resetFormPath)), true, `${resetFormPath} should exist`);
  assert.equal(existsSync(join(rootDir, resetPagePath)), true, `${resetPagePath} should exist`);

  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const callback = readProjectFile(callbackPath);
  const resetForm = readProjectFile(resetFormPath);
  const resetPage = readProjectFile(resetPagePath);

  assert.match(authForm, /resetPasswordForEmail/);
  assert.match(authForm, /\/auth\/callback/);
  assert.match(authForm, /หากอีเมลนี้มีบัญชี/);
  assert.doesNotMatch(authForm, /ระบบกู้คืนรหัสผ่านจะเปิดให้ใช้งานในเวอร์ชันถัดไป/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.doesNotMatch(callback, /searchParams\.get\("next"\)/);
  assert.match(callback, /new URL\("\/reset-password", url\.origin\)/);
  assert.match(resetForm, /auth\.getUser\(\)/);
  assert.match(resetForm, /updateUser\(\{ password/);
  assert.match(resetForm, /password !== confirmPassword/);
  assert.match(resetForm, /aria-invalid=/);
  assert.match(resetForm, /aria-describedby=/);
  assert.match(resetForm, /aria-pressed=\{visible\}/);
  assert.match(resetPage, /ResetPasswordForm/);
});

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("password recovery uses a cross-device token-hash flow without exposing account existence", () => {
  const verifyPagePath = "src/app/auth/verify/page.tsx";
  const confirmRoutePath = "src/app/auth/confirm/route.ts";
  const resetFormPath = "src/components/auth/ResetPasswordForm.tsx";
  const resetPagePath = "src/app/reset-password/page.tsx";

  assert.equal(existsSync(join(rootDir, verifyPagePath)), true, `${verifyPagePath} should exist`);
  assert.equal(existsSync(join(rootDir, confirmRoutePath)), true, `${confirmRoutePath} should exist`);
  assert.equal(existsSync(join(rootDir, resetFormPath)), true, `${resetFormPath} should exist`);
  assert.equal(existsSync(join(rootDir, resetPagePath)), true, `${resetPagePath} should exist`);

  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const verifyPage = readProjectFile(verifyPagePath);
  const confirmRoute = readProjectFile(confirmRoutePath);
  const resetForm = readProjectFile(resetFormPath);
  const resetPage = readProjectFile(resetPagePath);

  assert.match(authForm, /resetPasswordForEmail/);
  assert.match(authForm, /\/auth\/verify/);
  assert.match(authForm, /หากอีเมลนี้มีบัญชี/);
  assert.doesNotMatch(authForm, /ระบบกู้คืนรหัสผ่านจะเปิดให้ใช้งานในเวอร์ชันถัดไป/);
  assert.match(verifyPage, /action="\/auth\/confirm"/);
  assert.match(verifyPage, /name="token_hash"/);
  assert.match(verifyPage, /name="type"/);
  assert.match(confirmRoute, /export async function POST/);
  assert.match(confirmRoute, /request\.formData\(\)/);
  assert.match(confirmRoute, /verifyOtp/);
  assert.match(confirmRoute, /token_hash/);
  assert.doesNotMatch(confirmRoute, /searchParams\.get\("next"\)/);
  assert.match(confirmRoute, /new URL\("\/reset-password", url\.origin\)/);
  assert.match(resetForm, /auth\.getUser\(\)/);
  assert.match(resetForm, /updateUser\(\{ password/);
  assert.match(resetForm, /password !== confirmPassword/);
  assert.match(resetForm, /aria-invalid=/);
  assert.match(resetForm, /aria-describedby=/);
  assert.match(resetForm, /aria-pressed=\{visible\}/);
  assert.match(resetPage, /ResetPasswordForm/);
});

test("email signup uses the shared token-hash verification page and returns to login", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const confirmRoute = readProjectFile("src/app/auth/confirm/route.ts");
  const loginPage = readProjectFile("src/app/login/page.tsx");

  assert.match(authForm, /emailRedirectTo/);
  assert.match(authForm, /emailRedirectTo = `\$\{window\.location\.origin\}\/auth\/verify`/);
  assert.match(confirmRoute, /type === "email"/);
  assert.match(confirmRoute, /\/login\?confirmed=success/);
  assert.match(loginPage, /confirmed === "success"/);
  assert.match(authForm, /router\.replace\("\/login\?registered=success"\)/);
  assert.match(loginPage, /registered === "success"/);
  assert.match(loginPage, /สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี/);
});

test("SciSiam provides a Thai signup confirmation email template", () => {
  const templatePath = "supabase/templates/confirmation.html";
  assert.equal(existsSync(join(rootDir, templatePath)), true);

  const template = readProjectFile(templatePath);
  assert.match(template, /ยืนยันอีเมล SciSiam/);
  assert.match(template, /ยืนยันอีเมลของฉัน/);
  assert.match(template, /\{\{ \.ConfirmationURL \}\}/);
  assert.doesNotMatch(template, /Confirm your email address/);
});

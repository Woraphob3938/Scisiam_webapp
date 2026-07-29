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
  assert.match(verifyPage, /name="email"/);
  assert.match(verifyPage, /name="token"/);
  assert.match(verifyPage, /ยืนยัน OTP/);
  assert.match(verifyPage, /pattern="\[0-9\]\{6,8\}"/);
  assert.match(verifyPage, /name="token_hash"/);
  assert.match(verifyPage, /name="type"/);
  assert.match(confirmRoute, /export async function POST/);
  assert.match(confirmRoute, /request\.formData\(\)/);
  assert.match(confirmRoute, /verifyOtp/);
  assert.match(confirmRoute, /email: cleanEmail,\s*token: cleanToken,\s*type: "recovery"/);
  assert.match(confirmRoute, /\^\[0-9\]\{6,8\}\$/);
  assert.match(confirmRoute, /replace\(\/\\s\+\/g, ""\)/);
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

test("account settings can send a password change email through the shared recovery flow", () => {
  const settingsModal = readProjectFile("src/components/SettingsModal.tsx");
  const displayPreferences = readProjectFile("src/lib/display-preferences.ts");
  const globals = readProjectFile("src/app/globals.css");

  assert.match(settingsModal, /เปลี่ยนรหัสผ่าน/);
  assert.match(settingsModal, /createPortal/);
  assert.match(settingsModal, /document\.body/);
  assert.match(settingsModal, /z-\[999\]/);
  assert.match(settingsModal, /getUser\(\)/);
  assert.match(settingsModal, /resetPasswordForEmail/);
  assert.match(settingsModal, /\/auth\/verify/);
  assert.match(settingsModal, /ส่งลิงก์เปลี่ยนรหัสผ่านแล้ว/);
  assert.match(settingsModal, /ตาบอดสี/);
  assert.match(settingsModal, /function SwitchButton/);
  assert.match(settingsModal, /role="switch"/);
  assert.match(settingsModal, /aria-checked=\{checked\}/);
  assert.match(settingsModal, /ON/);
  assert.match(settingsModal, /OFF/);
  assert.match(displayPreferences, /scisiam_display_color_blind/);
  assert.match(displayPreferences, /dataset\.scisiamColorblind/);
  assert.match(settingsModal, /label="เปิดโหมดช่วยสำหรับผู้ตาบอดสี"/);
  assert.match(settingsModal, /onMouseDown=\{\(event\) => event\.stopPropagation\(\)\}/);
  assert.match(settingsModal, /onClick=\{\(event\) => \{/);
  assert.match(settingsModal, /event\.stopPropagation\(\);\s*onChange\(!checked\);/);
  assert.match(settingsModal, /setReduceMotion/);
  assert.match(settingsModal, /setColorBlind/);
  assert.match(settingsModal, /scisiam-colorblind-panel/);
  assert.match(settingsModal, /scisiam-colorblind-pattern-blue/);
  assert.match(globals, /data-scisiam-colorblind="true"/);
  assert.match(globals, /repeating-linear-gradient/);
  assert.match(globals, /\.scisiam-colorblind-panel/);
  assert.match(globals, /\.bg-blue-600/);
  assert.match(globals, /\.text-blue-600/);
  assert.match(globals, /\.border-blue-200/);
  assert.match(globals, /\.bg-emerald-50/);
  assert.match(globals, /background-color: #dbeafe !important/);
  assert.doesNotMatch(globals, /\[class\*="bg-blue-/);
  assert.doesNotMatch(globals, /\[class\*="text-slate-/);
});

test("email signup uses the shared token-hash verification page and returns to login", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const confirmRoute = readProjectFile("src/app/auth/confirm/route.ts");
  const loginPage = readProjectFile("src/app/login/page.tsx");

  assert.match(authForm, /emailRedirectTo/);
  assert.match(authForm, /new URL\("\/auth\/verify", window\.location\.origin\)/);
  assert.match(authForm, /emailRedirectUrl\.searchParams\.set\("next", initialNext\)/);
  assert.match(authForm, /new URLSearchParams\(\{\s*registered: "success",\s*email: normalizedEmail/);
  assert.match(authForm, /setMode\("login"\)/);
  assert.match(authForm, /สมัครสมาชิกสำเร็จแล้ว กรุณาตรวจสอบอีเมล/);
  assert.match(confirmRoute, /type === "email"/);
  assert.match(confirmRoute, /loginUrl\.searchParams\.set\("confirmed", "success"\)/);
  assert.match(confirmRoute, /loginUrl\.searchParams\.set\("next", safeNext\)/);
  assert.match(loginPage, /confirmed === "success"/);
  assert.match(authForm, /router\.replace\(`\/login\?\$\{loginParams\.toString\(\)\}`\)/);
  assert.match(loginPage, /registered === "success"/);
  assert.match(loginPage, /กรุณาตรวจสอบอีเมล/);
  assert.match(loginPage, /สแปมหรือจดหมายขยะ/);
});

test("Scisiam provides a Thai signup confirmation email template", () => {
  const templatePath = "supabase/templates/confirmation.html";
  assert.equal(existsSync(join(rootDir, templatePath)), true);

  const template = readProjectFile(templatePath);
  assert.match(template, /ยืนยันอีเมล Scisiam/);
  assert.match(template, />Scisiam<\/p>/);
  assert.match(template, /น้องไออุ่น/);
  assert.match(template, /สวัสดีค่ะ/);
  assert.match(template, /ai-oon-avatar\.png/);
  assert.match(template, /ยืนยันอีเมลของฉัน/);
  assert.match(template, /\{\{ \.SiteURL \}\}\/auth\/verify\?token_hash=\{\{ \.TokenHash \}\}&type=email/);
  assert.doesNotMatch(template, /\{\{ \.ConfirmationURL \}\}/);
  assert.doesNotMatch(template, /SciSiam/);
  assert.doesNotMatch(template, /Scisiam Virtual Lab/);
  assert.doesNotMatch(template, /Confirm your email address/);
});

test("Scisiam provides a Thai branded password recovery email template", () => {
  const templatePath = "supabase/templates/recovery.html";
  assert.equal(existsSync(join(rootDir, templatePath)), true);

  const template = readProjectFile(templatePath);
  assert.match(template, /ตั้งรหัสผ่านใหม่ Scisiam/);
  assert.match(template, />Scisiam<\/p>/);
  assert.doesNotMatch(template, /Scisiam Virtual Lab/);
  assert.match(template, /น้องไออุ่น/);
  assert.match(template, /สวัสดีค่ะ/);
  assert.match(template, /ai-oon-avatar\.png/);
  assert.match(template, /\{\{ \.SiteURL \}\}\/auth\/verify\?type=recovery/);
  assert.doesNotMatch(template, /token_hash=/);
  assert.match(template, /\{\{ \.Token \}\}/);
  assert.match(template, /รหัส OTP สำหรับคำขอนี้/);
  assert.doesNotMatch(template, /Reset your password/);
});

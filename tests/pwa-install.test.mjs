import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const readProjectFile = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

test("web app manifest makes Scisiam installable as a standalone Thai app", () => {
  const manifest = readProjectFile("src/app/manifest.ts");

  assert.match(manifest, /name:\s*"Scisiam"/);
  assert.match(manifest, /start_url:\s*"\/login"/);
  assert.match(manifest, /display:\s*"standalone"/);
  assert.match(manifest, /lang:\s*"th"/);
  assert.match(manifest, /\/icons\/scisiam-full-192\.png/);
  assert.match(manifest, /\/icons\/scisiam-full-512\.png/);
  assert.match(manifest, /\/icons\/scisiam-maskable-full-512\.png/);
});

test("mobile install control prompts Android and guides iOS users", () => {
  const installButton = readProjectFile(
    "src/components/auth/AppInstallButton.tsx",
  );

  assert.match(installButton, /beforeinstallprompt/);
  assert.match(installButton, /\.prompt\(\)/);
  assert.match(installButton, /appinstalled/);
  assert.match(installButton, /เพิ่มไปยังหน้าจอโฮม/);
  assert.match(installButton, /ติดตั้งแอป Windows/);
  assert.match(installButton, /NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL/);
});

test("service worker is registered and avoids caching private application data", () => {
  const registration = readProjectFile(
    "src/components/PwaServiceWorker.tsx",
  );
  const worker = readProjectFile("public/sw.js");
  const layout = readProjectFile("src/app/layout.tsx");

  assert.match(registration, /serviceWorker\.register\("\/sw\.js"\)/);
  assert.match(worker, /request\.method !== "GET"/);
  assert.match(worker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /url\.pathname\.startsWith\("\/auth\/"\)/);
  assert.match(layout, /<PwaServiceWorker \/>/);
});

test("auth form delegates installation behavior to the platform-aware control", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");

  assert.match(authForm, /import AppInstallButton/);
  assert.match(authForm, /<AppInstallButton desktopRuntime=\{desktopRuntime\} \/>/);
  assert.doesNotMatch(
    authForm,
    /aria-label="ดาวน์โหลดและติดตั้งแอป Scisiam สำหรับ Windows"/,
  );
});

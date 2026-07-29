import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const rootDir = process.cwd();
const readProjectFile = (file) => readFileSync(join(rootDir, file), "utf8");

test("mobile app stays portrait and no longer mounts the splash video", () => {
  const manifest = readProjectFile("src/app/manifest.ts");
  const layout = readProjectFile("src/app/layout.tsx");
  const worker = readProjectFile("src/components/PwaServiceWorker.tsx");

  assert.match(manifest, /orientation:\s*"portrait-primary"/);
  assert.match(worker, /orientation\.lock\?\.\("portrait-primary"\)/);
  assert.doesNotMatch(layout, /MobileAppSplash/);
});

test("returning users skip login while the mobile navbar hides the wordmark", () => {
  const login = readProjectFile("src/app/login/page.tsx");
  const navbar = readProjectFile("src/components/Navbar.tsx");

  assert.match(login, /supabase\.auth\.getClaims\(\)/);
  assert.match(login, /getSafeSameOriginPath/);
  assert.match(login, /const safeNext = getSafeSameOriginPath\(next,[\s\S]*\)/);
  assert.match(login, /redirect\(safeNext \|\| "\/labs"\)/);
  assert.match(navbar, /hidden[^"]*sm:inline/);
});

test("classroom Web Push is private, owner-triggered, and opens the assignment", () => {
  const migration = readProjectFile(
    "supabase/migrations/20260726140000_add_web_push_subscriptions.sql",
  );
  const route = readProjectFile(
    "src/app/api/push/classroom-assignment/route.ts",
  );
  const worker = readProjectFile("public/sw.js");

  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all on table public\.push_subscriptions/i);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(route, /assignment\.created_by !== userId/);
  assert.match(route, /createAdminClient\(\)/);
  assert.match(worker, /addEventListener\("push"/);
  assert.match(worker, /addEventListener\("notificationclick"/);
  assert.match(worker, /openWindow/);
});

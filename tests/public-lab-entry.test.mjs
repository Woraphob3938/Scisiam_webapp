import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("public visitors can browse labs but must register before a simulation", () => {
  const labsPage = read("src/app/labs/page.tsx");
  const proxy = read("src/lib/supabase/proxy.ts");
  const registerPage = read("src/app/register/page.tsx");
  const authForm = read("src/components/auth/AuthForm.tsx");

  assert.match(labsPage, /const simulationPath = `\/labs\/\$\{id\}\/simulation`/);
  assert.match(labsPage, /if \(!isLoggedIn\)/);
  assert.match(labsPage, /\/register\?next=/);
  assert.match(proxy, /LAB_SIMULATION_PATH/);
  assert.match(proxy, /buildRegisterRedirect\(request\)/);
  assert.match(registerPage, /initialNext=\{safeNext\}/);
  assert.match(authForm, /initialNext \|\| \(profile\.role === "teacher"/);
});

test("the welcome animation overlays the loaded catalogue and never replaces loading", () => {
  const home = read("src/app/page.tsx");
  const labsPage = read("src/app/labs/page.tsx");
  const splash = read("src/components/ScisiamSplash.tsx");
  const splashStyles = read("src/components/ScisiamSplash.module.css");

  assert.match(home, /redirect\("\/labs"\)/);
  assert.match(
    labsPage,
    /<ScisiamSplash\s+active=\{isAuthReady && isLoggedIn\}\s+hidden=\{isEnteringLab\}\s*\/>/,
  );
  assert.match(splash, /WELCOME_SEEN_KEY/);
  assert.match(splash, /if \(!active\) return;/);
  assert.match(splash, /FADE_DELAY_MS = 2500/);
  assert.match(splash, /REMOVE_DELAY_MS = 3000/);
  assert.match(splash, /phase === "leaving"/);
  assert.match(splashStyles, /\.leaving[\s\S]*opacity:\s*0/);
  assert.match(splashStyles, /pointer-events:\s*none/);
});

test("legacy detail URLs never render a detail page", () => {
  const detailRoute = read("src/app/labs/[id]/page.tsx");
  const history = read("src/components/history/LearningHistoryPage.tsx");

  assert.match(detailRoute, /redirect\("\/labs"\)/);
  assert.match(history, /href=\{`\/labs\/\$\{lab\.id\}\/simulation`\}/);
  assert.doesNotMatch(history, /href=\{`\/labs\/\$\{lab\.id\}`\}/);
});

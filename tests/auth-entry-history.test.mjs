import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (relativePath) => readFileSync(join(rootDir, relativePath), "utf8");

test("site root opens labs before the welcome overlay appears", () => {
  const home = read("src/app/page.tsx");
  const labs = read("src/app/labs/page.tsx");
  const splash = read("src/components/ScisiamSplash.tsx");

  assert.match(home, /redirect\("\/labs"\)/);
  assert.match(
    labs,
    /<ScisiamSplash\s+active=\{isAuthReady && isLoggedIn\}\s+hidden=\{isEnteringLab\}\s*\/>/,
  );
  assert.match(splash, /sessionStorage\.getItem\(WELCOME_SEEN_KEY\)/);
  assert.match(splash, /const FADE_DELAY_MS = 2500/);
  assert.match(splash, /const REMOVE_DELAY_MS = 3000/);
  assert.match(splash, /setPhase\("leaving"\)/);
  assert.doesNotMatch(splash, /router\.replace/);
});

test("authenticated history excludes device-local runs", () => {
  const source = read("src/components/history/LearningHistoryPage.tsx");

  assert.match(
    source,
    /nextSource === "cloud"\s*\?\s*mapCloudHistoryRecords\(nextSnapshot\.recentRuns\)\s*:\s*sortHistoryRecords\(localRecords\)/,
  );
  assert.doesNotMatch(
    source,
    /mergeHistoryRecords\(nextSource === "cloud"[\s\S]*localRecords\)/,
  );
});

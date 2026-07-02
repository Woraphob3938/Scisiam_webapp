import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (relativePath) => readFileSync(join(rootDir, relativePath), "utf8");

test("site root redirects directly to login", () => {
  const source = read("src/app/page.tsx");

  assert.match(source, /redirect\("\/login"\)/);
  assert.doesNotMatch(source, /redirect\("\/labs"\)/);
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

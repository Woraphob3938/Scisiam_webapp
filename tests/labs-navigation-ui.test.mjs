import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("lab categories show complete labels without truncation", () => {
  const categoryFilter = readProjectFile("src/components/CategoryFilter.tsx");

  assert.match(categoryFilter, /sm:max-w-6xl/);
  assert.match(categoryFilter, /sm:whitespace-nowrap/);
  assert.doesNotMatch(categoryFilter, /min-w-0 truncate/);
});

test("entering a ready lab shows an accessible loading overlay", () => {
  const labsPage = readProjectFile("src/app/labs/page.tsx");

  assert.match(labsPage, /setIsEnteringLab\(true\)/);
  assert.match(labsPage, /role="status"/);
  assert.match(labsPage, /กำลังโหลดแล็บทดลอง/);
  assert.doesNotMatch(labsPage, /backdrop-blur/);
});

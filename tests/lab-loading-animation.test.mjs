import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("lab routes use the playful atom loading indicator", () => {
  const loader = read("src/components/labs/LabLoadingAtom.tsx");
  const routeLoading = read("src/app/labs/loading.tsx");
  const labsPage = read("src/app/labs/page.tsx");

  assert.match(loader, /lab-atom-bounce/);
  assert.match(loader, /lab-atom-electrons/);
  assert.match(loader, /กำลังเตรียมห้องแล็บ/);
  assert.doesNotMatch(loader, /prefers-reduced-motion: reduce/);
  assert.match(loader, /role="status"/);
  assert.match(routeLoading, /LabLoadingAtom/);
  assert.match(labsPage, /<LabLoadingAtom \/>/);
});

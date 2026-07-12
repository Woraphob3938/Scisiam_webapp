import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const labsPage = readFileSync(path.join(root, "src", "app", "labs", "page.tsx"), "utf8");
const labCard = readFileSync(path.join(root, "src", "components", "LabCard.tsx"), "utf8");

test("lab catalog does not repeat all-ready status copy", () => {
  assert.doesNotMatch(labsPage, /พร้อมทดลอง \{readyFilteredLabCount\}/);
  assert.doesNotMatch(labsPage, /ทุกแล็บในมุมมองนี้พร้อมทดลองแล้ว/);
  assert.doesNotMatch(labCard, /readiness\.label/);
  assert.doesNotMatch(labCard, /disabled=\{!readiness\.isReady\}/);
});

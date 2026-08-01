import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(
  path.join(root, "src/components/labs/simulation/ChemistryConceptSimulation.tsx"),
  "utf8",
);

test("chemistry concept labs use dedicated replayable experiment scenes", () => {
  assert.match(source, /function GalvanicExperimentScene\(/);
  assert.match(source, /function ReactionRateExperimentScene\(/);
  assert.match(source, /function SolubilityExperimentScene\(/);
  assert.match(source, /const \[runToken, setRunToken\] = useState\(0\)/);
  assert.match(source, /onRun=\{\(\) => setRunToken\(\(token\) => token \+ 1\)\}/);
  assert.match(source, /runLabel=\{usesExperimentAnimation \? "เริ่มทดลอง" : "คำนวณผล"\}/);
});

test("rebuilt scenes expose observable chemistry and reduced-motion fallback", () => {
  assert.match(source, /electron-flow/);
  assert.match(source, /reaction-collision/);
  assert.match(source, /precipitate-settle/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /aria-labelledby=/);
});

test("removed in-scene graph and numeric result content stays removed", () => {
  const start = source.indexOf("function GalvanicExperimentScene(");
  const end = source.indexOf("function ChemistryScene(");

  assert.notEqual(start, -1, "the rebuilt scene block must exist");
  assert.ok(end > start, "the rebuilt scene block must precede ChemistryScene");

  const rebuiltScenes = source.slice(start, end);

  assert.doesNotMatch(rebuiltScenes, /result\./);
  assert.doesNotMatch(rebuiltScenes, /โปรไฟล์พลังงาน/);
  assert.doesNotMatch(rebuiltScenes, /<text[^>]*>\s*\{[^}]*value/);
});

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
const canvasPath = path.join(
  root,
  "src/components/labs/simulation/ReactionRateParticleCanvas.tsx",
);

test("chemistry concept labs use live scene models and the intended renderers", () => {
  assert.match(source, /function GalvanicExperimentScene\(/);
  assert.match(source, /function SolubilityExperimentScene\(/);
  assert.doesNotMatch(source, /function ReactionRateExperimentScene\(/);
  assert.match(source, /buildGalvanicSceneModel/);
  assert.match(source, /buildReactionRateSceneModel/);
  assert.match(source, /buildSolubilitySceneModel/);
  assert.match(source, /ReactionRateParticleCanvas/);
  assert.match(source, /primary=\{primary\}/);
  assert.match(source, /secondary=\{secondary\}/);
  assert.match(source, /<ReactionRateParticleCanvas[\s\S]*?model=\{reactionModel\}[\s\S]*?runToken=\{runToken\}[\s\S]*?isRunning=\{isRunning\}/);
  assert.match(source, /toggleExperimentPlayback/);
  assert.match(source, /runLabel=\{usesExperimentAnimation && isRunning \? "หยุดชั่วคราว"/);
  assert.match(source, /runActive=\{usesExperimentAnimation && isRunning\}/);
});

test("SVG scenes expose named chemistry and state-dependent outcomes", () => {
  assert.match(source, /electron-flow/);
  assert.match(source, /Zn²⁺/);
  assert.match(source, /Cu²⁺/);
  assert.match(source, /K⁺/);
  assert.match(source, /NO₃⁻/);
  assert.match(source, /near-saturation/);
  assert.match(source, /state === "precipitating"/);
  assert.match(source, /M⁺/);
  assert.match(source, /X⁻/);
  assert.match(source, /index < model\.precipitateCount/);
  assert.match(source, /--experiment-play-state/);
  assert.match(source, /animation: electron-flow [^;]* infinite/);
  assert.match(source, /animation: solution-drop [^;]* infinite/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /aria-labelledby=/);
});

test("reaction-rate Canvas has a bounded accessible animation lifecycle", () => {
  assert.ok(fs.existsSync(canvasPath), "reaction-rate Canvas component must exist");
  const canvasSource = fs.readFileSync(canvasPath, "utf8");

  assert.match(canvasSource, /<canvas/);
  assert.match(canvasSource, /requestAnimationFrame/);
  assert.match(canvasSource, /cancelAnimationFrame/);
  assert.match(canvasSource, /isRunning: boolean/);
  assert.match(canvasSource, /isRunningRef/);
  assert.match(canvasSource, /if \(isRunningRef\.current\) frameIdRef\.current = requestAnimationFrame/);
  assert.doesNotMatch(canvasSource, /if \(progress < 1\) frameId = requestAnimationFrame/);
  assert.match(canvasSource, /prefers-reduced-motion: reduce/);
  assert.match(canvasSource, /Math\.min\(32,/);
  assert.match(canvasSource, /role="img"/);
  assert.match(canvasSource, /aria-label=/);
  assert.doesNotMatch(canvasSource, /setInterval|setTimeout/);
});

test("experiment renderers shrink inside the docked desktop stage instead of clipping", () => {
  assert.match(source, /<svg className="h-\[320px\][^"]*sm:h-full sm:min-h-0"/);
  assert.ok(fs.existsSync(canvasPath), "reaction-rate Canvas component must exist");
  const canvasSource = fs.readFileSync(canvasPath, "utf8");
  assert.match(canvasSource, /min-h-\[320px\][^"]*sm:h-full sm:min-h-0/);
  assert.match(canvasSource, /className="h-full w-full object-contain"/);
});

test("changing an animated experiment variable returns the scene to its ready state", () => {
  assert.match(source, /const handlePrimaryChange = \(value: number\) => \{[\s\S]*?setPrimary\(value\);[\s\S]*?resetExperimentPlayback/);
  assert.match(source, /const handleSecondaryChange = \(value: number\) => \{[\s\S]*?setSecondary\(value\);[\s\S]*?resetExperimentPlayback/);
  assert.match(source, /onChange=\{handlePrimaryChange\}/);
  assert.match(source, /onChange=\{handleSecondaryChange\}/);
});

test("experiment scenes keep graphs and measured values outside the renderer", () => {
  const start = source.indexOf("function GalvanicExperimentScene(");
  const end = source.indexOf("function ChemistryScene(");

  assert.notEqual(start, -1, "the SVG scene block must exist");
  assert.ok(end > start, "the SVG scene block must precede ChemistryScene");

  const experimentScenes = source.slice(start, end);

  assert.doesNotMatch(experimentScenes, /result\.|ResultGraph|ResultTable|xLabel|yLabel/);
  assert.doesNotMatch(experimentScenes, /โปรไฟล์พลังงาน/);
  assert.doesNotMatch(experimentScenes, /<text[^>]*>\s*\{[^}]*value/);
});

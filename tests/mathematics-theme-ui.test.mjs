import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("Mathematics uses the shared Pastel Blush theme", () => {
  const filter = readProjectFile("src/components/CategoryFilter.tsx");
  const cards = readProjectFile("src/components/LabCard.tsx");
  const hero = readProjectFile("src/components/labs/LabHero.tsx");
  const shell = readProjectFile("src/components/labs/simulation/SharedSimulationShell.tsx");

  assert.match(filter, /id: "Mathematics"[\s\S]*?color: "pink"/);
  assert.match(filter, /pink: "border-pink-200 bg-pink-50\/80 text-pink-900/);
  assert.match(cards, /Mathematics:[\s\S]*?btnPrimary: "bg-pink-200 hover:bg-pink-300 text-pink-900/);
  assert.doesNotMatch(cards, /Mathematics:[\s\S]*?(?:rose-600|red-600|pink-600)/);
  assert.match(hero, /isMathematics \? "bg-pink-200 text-pink-900 shadow-pink-200\/40"/);
  assert.match(hero, /isMathematics \? "bg-pink-50 text-pink-900 border-pink-200"/);
  assert.match(hero, /const primaryButtonClass = isMathematics[\s\S]*?bg-pink-200 hover:bg-pink-300[\s\S]*?text-pink-900/);
  assert.match(hero, /\$\{primaryButtonClass\}/);
  assert.match(shell, /Mathematics: "pink"/);
  assert.match(shell, /const resolvedAccent = categoryAccents\[category\] \?\? accent/);
  assert.match(shell, /accentClasses\[resolvedAccent\]/);
  assert.match(shell, /metricToneClasses[\s\S]*?pink: "bg-pink-50 text-pink-900"/);
});

test("lab navigation links have visible button affordances", () => {
  const hero = readProjectFile("src/components/labs/LabHero.tsx");
  const shell = readProjectFile("src/components/labs/simulation/SharedSimulationShell.tsx");

  assert.match(hero, /href="\/labs"[\s\S]*?border-slate-200[\s\S]*?bg-white[\s\S]*?กลับไปหน้ารายชื่อห้องแล็บ/);
  assert.match(shell, /href=\{exitHref\}[\s\S]*?border[\s\S]*?bg-white[\s\S]*?ออกจากแล็บ/);
  assert.match(shell, /searchParams\.get\("classroom"\)[\s\S]*?tab=labs/);
  assert.doesNotMatch(shell, /tab=classwork/);
  assert.doesNotMatch(shell, /รายละเอียดแล็บ/);
});

test("Mathematics simulation command buttons use Pastel Blush chrome", () => {
  const files = [
    "AppliedMathSimulation.tsx",
    "CenterVariabilitySimulation.tsx",
    "CurveFittingSimulation.tsx",
    "DiscreteGraphTheorySimulation.tsx",
    "FunctionBuilderSimulation.tsx",
    "GraphingLinesSimulation.tsx",
    "NormalDistributionSimulation.tsx",
    "MathematicalModelingSimulation.tsx",
    "ProbabilitySimulation.tsx",
    "RatioProportionSimulation.tsx",
    "TrigonometryWavesSimulation.tsx",
    "VectorAdditionSimulation.tsx",
    "VectorFieldsGradientsSimulation.tsx",
  ];

  for (const file of files) {
    const source = readProjectFile(`src/components/labs/simulation/${file}`);
    assert.doesNotMatch(
      source,
      /<button[\s\S]{0,400}?bg-(?:violet|purple|indigo|rose|red|pink)-600/,
      `${file} still has a saturated command button`,
    );
    assert.match(source, /<button[\s\S]{0,400}?bg-pink-200[\s\S]{0,200}?text-pink-900/);
  }
});

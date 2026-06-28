import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("Mathematics uses the shared soft pink theme", () => {
  const filter = readProjectFile("src/components/CategoryFilter.tsx");
  const cards = readProjectFile("src/components/LabCard.tsx");
  const hero = readProjectFile("src/components/labs/LabHero.tsx");
  const shell = readProjectFile("src/components/labs/simulation/SharedSimulationShell.tsx");

  assert.match(filter, /id: "Mathematics"[\s\S]*?color: "rose"/);
  assert.match(filter, /rose: "border-rose-200 bg-rose-50\/80 text-rose-700/);
  assert.match(cards, /Mathematics:[\s\S]*?btnPrimary: "bg-rose-600 hover:bg-rose-700/);
  assert.doesNotMatch(cards, /Mathematics:[\s\S]*?from-rose-600 to-red-600/);
  assert.match(hero, /isMathematics \? "bg-rose-600 shadow-rose-500\/20"/);
  assert.match(hero, /isMathematics \? "bg-rose-50 text-rose-700 border-rose-100"/);
  assert.match(hero, /const primaryButtonClass = isMathematics[\s\S]*?bg-rose-600 hover:bg-rose-700/);
  assert.match(hero, /\$\{primaryButtonClass\}/);
  assert.match(shell, /const resolvedAccent = category === "Mathematics" \? "rose" : accent/);
  assert.match(shell, /accentClasses\[resolvedAccent\]/);
});

test("lab navigation links have visible button affordances", () => {
  const hero = readProjectFile("src/components/labs/LabHero.tsx");
  const shell = readProjectFile("src/components/labs/simulation/SharedSimulationShell.tsx");

  assert.match(hero, /href="\/labs"[\s\S]*?border-slate-200[\s\S]*?bg-white[\s\S]*?กลับไปหน้ารายชื่อห้องแล็บ/);
  assert.match(shell, /href=\{`\/labs\/\$\{labId\}`\}[\s\S]*?border[\s\S]*?bg-white[\s\S]*?รายละเอียดแล็บ/);
});

test("Mathematics simulation command buttons use rose instead of violet chrome", () => {
  const files = [
    "AppliedMathSimulation.tsx",
    "CenterVariabilitySimulation.tsx",
    "CurveFittingSimulation.tsx",
    "FunctionBuilderSimulation.tsx",
    "GraphingLinesSimulation.tsx",
    "NormalDistributionSimulation.tsx",
    "ProbabilitySimulation.tsx",
    "RatioProportionSimulation.tsx",
    "TrigonometryWavesSimulation.tsx",
    "VectorAdditionSimulation.tsx",
  ];

  for (const file of files) {
    const source = readProjectFile(`src/components/labs/simulation/${file}`);
    assert.doesNotMatch(
      source,
      /<button[\s\S]{0,400}?bg-(?:violet|purple|indigo)-600/,
      `${file} still has a violet command button`,
    );
  }
});

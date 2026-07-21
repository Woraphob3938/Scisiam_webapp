import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const rootDir = process.cwd();
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("Newton cooling exposes persistent controls with editable negative temperatures", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.match(source, /const MIN_TEMPERATURE_C = -50/);
  assert.match(source, /shortLabel: "T₀"[\s\S]*min: MIN_TEMPERATURE_C/);
  assert.match(source, /shortLabel: "Tₛ"[\s\S]*min: MIN_TEMPERATURE_C/);
  assert.match(source, /shortLabel: "k"[\s\S]*min: 0\.001/);
  assert.match(source, /persistentControls/);
});

test("Newton cooling approaches ambient temperature from either direction", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.doesNotMatch(source, /Math\.max\(ambientTempRef\.current/);
  assert.match(source, /currentTempRef\.current - coolingAmount/);
});

test("Newton cooling graph auto-scales around zero for negative values", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.match(source, /const graphScale = React\.useMemo/);
  assert.match(source, /Math\.min\(0, \.\.\.temperatures\)/);
  assert.match(source, /Math\.max\(0, \.\.\.temperatures\)/);
  assert.match(source, /data-testid="temperature-zero-axis"/);
});

test("Newton cooling viewport uses unique accessible SVG definitions", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.match(source, /const svgId = useId\(\)/);
  assert.match(source, /aria-labelledby=\{`\$\{svgId\}-title/);
  assert.doesNotMatch(source, /url\(#dropShadow\)/);
});

test("Newton cooling viewport visualizes model-driven thermal flow", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.match(source, /const temperatureDelta = currentTemp - ambientTemp/);
  assert.match(source, /const thermalDirection =/);
  assert.match(source, /data-thermal-direction=\{thermalDirection\}/);
  assert.match(source, /กำลังเย็นลง/);
  assert.match(source, /กำลังอุ่นขึ้น/);
  assert.match(source, /ใกล้สมดุล/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /min-h-\[180px\][^"]*sm:min-h-\[300px\]/);
  assert.match(source, /min-h-\[160px\][^"]*sm:min-h-\[280px\]/);
  assert.match(source, /className="h-auto min-h-\[160px\][^"]*sm:h-full/);
  assert.doesNotMatch(source, /Convection Bubbles/);
  assert.doesNotMatch(source, /Animated steam columns/);
});

test("shared shell persistent mode keeps primary controls visible", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /persistentControls\?: boolean/);
  assert.match(source, /data-testid="persistent-control-dock"/);
  assert.match(source, /ตั้งค่าขั้นสูง/);
});

test("shared shell promotes compact controls to the persistent dock", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /const hasCompactControls =/);
  assert.match(
    source,
    /const collapsedControls = compactControls \?\? controls/,
  );
  assert.match(
    source,
    /usesPersistentControlDock \? persistentControlDock : controlsDrawer/,
  );
});

test("shared shell promotes regular controls into the persistent dock", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(
    source,
    /const usesPersistentControlDock = persistentControls \|\| hasCollapsedControls/,
  );
  assert.match(
    source,
    /className=\{hasCompactControls \? "min-w-0" : "max-h-\[170px\] min-w-0 overflow-y-auto pr-1"\}/,
  );
});

test("shared shell clears the stage above regular control docks", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(
    source,
    /const usesRegularControlDock = usesPersistentControlDock && !hasCompactControls/,
  );
  assert.match(source, /usesRegularControlDock\s*\?\s*"sm:bottom-\[272px\]"/);
});

test("shared shell keeps advanced controls inside the fullscreen stage", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );
  const stageStart = source.indexOf("const simulationStage");
  const tabsStart = source.indexOf("const activeTabContent");
  const stageSource = source.slice(stageStart, tabsStart);
  const pageLayoutSource = source.slice(source.indexOf("return (", tabsStart));

  assert.match(source, /data-testid="simulation-advanced-controls"/);
  assert.match(stageSource, /\{persistentAdvancedPanel\}/);
  assert.match(stageSource, /usesPersistentControlDock \? persistentControlDock : controlsDrawer/);
  assert.doesNotMatch(pageLayoutSource, /persistentAdvancedControls/);
});

test("shared shell uses one visual boundary around the experiment scene", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /data-testid="simulation-stage-content"/);
  assert.doesNotMatch(
    source,
    /data-testid="simulation-stage-content"[^>]*border border-white\/70[^>]*bg-white[^>]*p-3/,
  );
});

test("shared shell keeps its title compact and fullscreen control inside the scene", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(
    source,
    /data-testid="simulation-stage-metrics" className="absolute right-5 top-5 z-20 hidden w-\[320px\] xl:block"/,
  );
  assert.match(source, /data-testid="simulation-fullscreen-toggle"/);
  assert.match(
    source,
    /pointer-events-auto block min-w-0[^\n]+sm:inline-block sm:max-w-\[calc\(100%-64px\)\]/,
  );
  const sceneStart = source.indexOf('data-testid="simulation-stage-content"');
  const advancedPanelStart = source.indexOf("{persistentAdvancedPanel}", sceneStart);
  const sceneSource = source.slice(sceneStart, advancedPanelStart);
  assert.match(sceneSource, /data-testid="simulation-fullscreen-toggle"/);
  assert.match(sceneSource, /className="absolute bottom-3 right-3 z-30/);
});

test("shared shell stacks the mobile experiment instead of clipping overlays", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /data-testid="simulation-mobile-metric"/);
  assert.match(source, /relative z-20 px-4 pt-4[^"]*sm:absolute/);
  assert.match(source, /relative z-10 mx-4 mt-3 min-h-\[320px\][^"]*sm:absolute/);
  assert.match(source, /relative z-30 mx-4 mb-4 mt-3[^"]*sm:absolute/);
  assert.match(source, /grid grid-cols-3 gap-2[^"]*sm:flex/);
  assert.doesNotMatch(source, /absolute right-5 top-\[148px\][^>]*sm:hidden/);
});

test("Newton cooling compact controls wrap on mobile", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.match(source, /grid grid-cols-2 gap-2 lg:grid-cols-3/);
  assert.doesNotMatch(source, /auto-cols-\[minmax\(210px,1fr\)\] grid-flow-col/);
});

test("shared real-time metrics omit mission progress for every lab", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );
  const cardStart = source.indexOf("const liveMetricsCard");
  const cardEnd = source.indexOf("const controlsDrawer");
  const cardSource = source.slice(cardStart, cardEnd);

  assert.doesNotMatch(cardSource, /boundedProgress/);
  assert.doesNotMatch(cardSource, /progressLabel/);
  assert.doesNotMatch(cardSource, /progressValue/);
  assert.doesNotMatch(cardSource, /conic-gradient/);
});

test("Newton cooling shows k as a visual cooling-rate scale beside the apparatus", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.match(source, /data-testid="cooling-coefficient-readout"/);
  assert.match(source, /data-testid="cooling-rate-scale"/);
  assert.match(source, /เย็นช้า/);
  assert.match(source, /เย็นเร็ว/);
  assert.match(source, /coolingRatePercent/);
  assert.doesNotMatch(source, /markerEnd=/);
  assert.doesNotMatch(source, /ลูกศรแสดงทิศทาง/);
});

test("Newton cooling keeps a borderless stage with compact left-aligned readouts", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.doesNotMatch(
    source,
    /<rect x="12" y="14" width="576" height="292"[^>]*stroke="#cbd5e1"/,
  );
  assert.match(
    source,
    /data-testid="cooling-coefficient-readout" transform="translate\(18 248\)"/,
  );
  assert.match(source, /data-testid="temperature-sensor" transform="translate\(438 86\)"/);
  assert.match(source, /data-testid="temperature-sensor"[\s\S]*?<rect width="104" height="64"/);
});

test("SVG simulator skill defines layout, fullscreen, and annotation contracts", () => {
  const source = readProjectFile(".agents/skills/svg-simulator/SKILL.md");

  assert.match(source, /## Simulation Layout Contract/);
  assert.match(source, /one visual boundary/i);
  assert.match(source, /advanced controls[\s\S]*fullscreen container/i);
  assert.match(source, /## Annotation Contract/);
  assert.match(source, /capability-based/i);
});

test("shared manual number fields preserve an in-progress negative value", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/ManualNumberInput.tsx",
  );

  assert.match(source, /const \[draftValue, setDraftValue\] = useState/);
  assert.match(source, /rawValue === "-"/);
  assert.match(source, /onBlur=\{restoreValidValue\}/);
});

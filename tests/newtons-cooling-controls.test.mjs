import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
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

test("shared shell keeps experiment actions outside advanced settings", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );
  const actionStart = source.indexOf('data-testid="simulation-primary-actions"');
  const advancedStart = source.indexOf("const persistentAdvancedPanel");
  const advancedEnd = source.indexOf("const simulationStage");
  const advancedSource = source.slice(advancedStart, advancedEnd);

  assert.ok(actionStart > -1, "the always-visible primary action bar should exist");
  assert.ok(actionStart < advancedStart, "primary actions should render before advanced settings");
  assert.match(source, /onRun\?: \(\) => void/);
  assert.match(source, /onReset\?: \(\) => void/);
  assert.match(source, /ทดลอง/);
  assert.match(source, /บันทึก/);
  assert.match(source, /รีเซ็ต/);
  assert.match(source, /role="group"/);
  assert.doesNotMatch(advancedSource, /onClick=\{onSave\}/);
});

test("advanced controls keep keyboard focus and mobile actions reachable", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /handleAdvancedPanelKeyDown/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /max-h-\[32vh\][^"\n]*overflow-y-auto/);
  assert.match(source, /primaryActions && <div className="px-4 pb-4">/);
});

test("shared simulation engines expose immediate run and reset actions", () => {
  const engines = [
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
    "src/components/labs/simulation/UnifiedLegacySimulation.tsx",
    "src/components/labs/simulation/AppliedMathSimulation.tsx",
  ];

  for (const file of engines) {
    const source = readProjectFile(file);
    assert.match(source, /onRun=/, `${file} should expose its run action`);
    assert.match(source, /onReset=/, `${file} should expose its reset action`);
  }
});

test("compact specialist simulations expose immediate run and reset actions", () => {
  const simulations = [
    "BayesianReasoningSimulation.tsx",
    "CenterVariabilitySimulation.tsx",
    "ComplexPhasorsSimulation.tsx",
    "CrisprGeneEditingSimulation.tsx",
    "CurveFittingSimulation.tsx",
    "DiscreteGraphTheorySimulation.tsx",
    "FlowCytometrySimulation.tsx",
    "FourierAnalysisSimulation.tsx",
    "FunctionBuilderSimulation.tsx",
    "GraphingLinesSimulation.tsx",
    "LightShadowsSimulation.tsx",
    "MathematicalModelingSimulation.tsx",
    "MetabolicPathwayFluxSimulation.tsx",
    "MultivariableCalculusSimulation.tsx",
    "PcrGelElectrophoresisSimulation.tsx",
    "ProbabilitySimulation.tsx",
    "PushPullForcesSimulation.tsx",
    "RatioProportionSimulation.tsx",
    "RecombinantDnaTransformationSimulation.tsx",
    "SoundVibrationsSimulation.tsx",
    "StatisticalInferenceSimulation.tsx",
    "SystemsEquationsSimulation.tsx",
    "TrigonometryWavesSimulation.tsx",
    "VectorAdditionSimulation.tsx",
    "VectorFieldsGradientsSimulation.tsx",
    "WesternBlottingSimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.match(source, /onRun=/, `${simulation} should expose its run action`);
    assert.match(source, /onReset=/, `${simulation} should expose its reset action`);
  }
});

test("shared shell promotes compact controls to the persistent dock", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /const hasCompactControls =/);
  assert.match(source, /const collapsedControls = sanitizedCompactControls \?\? sanitizedControls;/);
  assert.match(
    source,
    /usesPersistentControlDock \? persistentControlDock : controlsDrawer/,
  );
});

test("shared shell keeps primary actions in the persistent dock", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(
    source,
    /const usesPersistentControlDock = persistentControls \|\| hasCollapsedControls \|\| hasPrimaryActions/,
  );
  assert.match(source, /primaryActions && <div className="mt-3">/);
});

test("shared shell exposes full controls when a lab has no compact controls", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /const collapsedControls = sanitizedCompactControls \?\? sanitizedControls;/);
  assert.match(
    source,
    /const hasAdvancedControls =[\s\S]*hasCompactControls &&[\s\S]*controls !== null &&[\s\S]*controls !== undefined &&[\s\S]*controls !== compactControls;/,
  );
  assert.match(source, /usesPersistentControlDock \? persistentControlDock : controlsDrawer/);
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
  assert.match(sceneSource, /className="absolute bottom-4 right-3 z-50[^"\n]*sm:bottom-14/);
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
  assert.match(source, /isEditableNumberDraft/);
  assert.match(source, /onBlur=\{commitDraft\}/);
});

test("legacy physics simulations expose compact controls and primary actions", () => {
  const simulations = [
    "HookesLawSimulation.tsx",
    "OhmsLawSimulation.tsx",
    "MomentumConservationSimulation.tsx",
    "FaradaysLawSimulation.tsx",
    "BernoullisPrincipleSimulation.tsx",
    "PhotosynthesisRateSimulation.tsx",
    "XpsSpectroscopySimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.match(source, /compactControls=/, `${simulation} should keep settings clear of the stage`);
    assert.match(source, /onRun=/, `${simulation} should expose its run action`);
    assert.match(source, /onReset=/, `${simulation} should expose its reset action`);
  }
});

test("fullscreen control stays above the experiment dock", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /className="absolute bottom-4 right-3 z-50[^"\n]*sm:bottom-14/);
});

test("light and shadows waits for the learner to start", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/LightShadowsSimulation.tsx",
  );

  assert.match(source, /useState<boolean>\(false\)/);
});

test("push and pull renders an accessible force diagram", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/PushPullForcesSimulation.tsx",
  );

  assert.match(source, /role="img"/);
  assert.match(source, /<title id="push-pull-title">แรงผลักและแรงดึง/);
  assert.match(source, /id="push-pull-arrow"/);
  assert.match(source, /markerEnd="url\(#push-pull-arrow\)"/);
});

test("remaining timed simulations expose immediate run and reset actions", () => {
  const simulations = [
    "BeerLambertLawSimulation.tsx",
    "BloodTypingAgglutinationSimulation.tsx",
    "BraggDiffractionSimulation.tsx",
    "CellularRespirationSimulation.tsx",
    "EnzymeKineticsSimulation.tsx",
    "HesssLawSimulation.tsx",
    "KeplersLawsSimulation.tsx",
    "LeChateliersPrincipleSimulation.tsx",
    "MendelianGeneticsSimulation.tsx",
    "MichelsonInterferometerSimulation.tsx",
    "MitosisCellCycleSimulation.tsx",
    "NaturalSelectionSimulation.tsx",
    "OsmosisPlasmolysisSimulation.tsx",
    "PhotoelectricEffectSimulation.tsx",
    "PhysicalChemicalChangesSimulation.tsx",
    "PlantTranspirationSimulation.tsx",
    "QuantumTunnelingSimulation.tsx",
    "RelativisticKinematicsSimulation.tsx",
    "StefanBoltzmannSimulation.tsx",
    "SuperconductivityMeissnerSimulation.tsx",
    "ZeemanEffectSimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.match(source, /onRun=/, `${simulation} should expose its run action`);
    assert.match(source, /onReset=/, `${simulation} should expose its reset action`);
  }
});

test("specialist instrument simulations expose their real run action", () => {
  const simulations = [
    "EisElectrochemistrySimulation.tsx",
    "HeatingCoolingMaterialsSimulation.tsx",
    "HplcChromatographySimulation.tsx",
    "NmrSpectroscopySimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.match(source, /onRun=/, `${simulation} should expose its instrument action`);
    assert.match(source, /onReset=/, `${simulation} should expose its reset action`);
  }
});

test("instant-response simulations expose reset without a fake run action", () => {
  const simulations = [
    "AcidsBasesAroundUsSimulation.tsx",
    "CardiovascularSystemSimulation.tsx",
    "ChemistryConceptSimulation.tsx",
    "DnaExtractionSimulation.tsx",
    "FoodChainEcologySimulation.tsx",
    "NormalDistributionSimulation.tsx",
    "OptimizationConstraintsSimulation.tsx",
    "RatesOfChangeSimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.match(source, /onReset=/, `${simulation} should expose its reset action`);
  }
});

test("foundation simulations keep their real actions outside advanced settings", () => {
  const simulations = [
    "DissolvingSolutionsSimulation.tsx",
    "FloatingSinkingSimulation.tsx",
    "MagnetExplorationSimulation.tsx",
    "MixingAndSeparatingSimulation.tsx",
    "SimpleCircuitsSimulation.tsx",
    "StatesOfMatterSimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.match(source, /onRun=/, `${simulation} should expose its run action`);
    assert.match(source, /onReset=/, `${simulation} should expose its reset action`);
    assert.match(source, /onSave=/, `${simulation} should expose its save action`);
  }
});

test("full legacy settings are immediately available when no compact controls exist", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /const collapsedControls = sanitizedCompactControls \?\? sanitizedControls;/);
});

test("Newton cooling omits timing and simulation-speed controls", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.doesNotMatch(source, /ช่วงบันทึกข้อมูล/);
  assert.doesNotMatch(source, /ความเร็วการจำลอง/);
});

test("Kepler and Stefan-Boltzmann keep core controls visible without point logging or speed controls", () => {
  for (const simulation of [
    "KeplersLawsSimulation.tsx",
    "StefanBoltzmannSimulation.tsx",
  ]) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);

    assert.match(source, /const compactControls = \(/, simulation);
    assert.match(source, /compactControls=\{compactControls\}/, simulation);
    assert.doesNotMatch(source, /บันทึกจุด/, simulation);
    assert.doesNotMatch(source, /ความเร็วจำลอง|ความเร็วการจำลอง/, simulation);
  }
});

test("foundation force, light, and sound labs expose their real controls and redesigned experiment scenes", () => {
  const cases = [
    ["PushPullForcesSimulation.tsx", "push-pull-experiment-scene"],
    ["LightShadowsSimulation.tsx", "light-shadow-experiment-scene"],
    ["SoundVibrationsSimulation.tsx", "sound-vibration-experiment-scene"],
  ];

  for (const [simulation, sceneTestId] of cases) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);

    assert.match(source, new RegExp(`data-testid="${sceneTestId}"`), simulation);
    assert.match(source, /compactControls=\{compactControls\}/, simulation);
    assert.match(source, /onRun=/, simulation);
    assert.match(source, /onReset=/, simulation);
    assert.match(source, /onSave=/, simulation);
    assert.doesNotMatch(source, /จดบันทึกผล/, simulation);
  }
});

test("shared shell only offers advanced settings when a compact control set exists", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /\{hasAdvancedControls && \(/);
  assert.match(source, /usesPersistentControlDock && hasAdvancedControls && controlsOpen/);
});

test("shared legacy labs keep primary actions and time shortcuts out of advanced settings", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/UnifiedLegacySimulation.tsx",
  );
  const controls = source.slice(
    source.indexOf("const controls = ("),
    source.indexOf("const compactControls = ("),
  );

  assert.doesNotMatch(controls, /handleRunToggle/);
  assert.doesNotMatch(controls, /setElapsedSeconds/);
  assert.doesNotMatch(controls, /handleReset/);
  assert.doesNotMatch(controls, /\+เวลา/);
});

test("specialized advanced controls do not duplicate shared run and reset actions", () => {
  const cases = [
    ["OhmsLawSimulation.tsx", /handleStartStop|handleReset/],
    ["PhotoelectricEffectSimulation.tsx", /handleStartStop|handleReset/],
  ];

  for (const [file, duplicatedAction] of cases) {
    const source = readProjectFile(`src/components/labs/simulation/${file}`);
    const controlsStart = source.indexOf("const controls = (");
    const controls = source.slice(
      controlsStart,
      source.indexOf("return (", controlsStart),
    );
    assert.doesNotMatch(controls, duplicatedAction, file);
  }
});

test("shared shell removes duplicate primary actions from every control surface", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /function stripDuplicatePrimaryActions\(/);
  assert.match(source, /actionHandlers\.has\(child\.props\.onClick\)/);
  assert.match(source, /isDuplicateActionLabel\(label, actions\)/);
  assert.match(source, /const sanitizedControls = stripDuplicatePrimaryActions\(controls, actionHandlers\)/);
  assert.match(source, /const sanitizedCompactControls = stripDuplicatePrimaryActions\(compactControls, actionHandlers\)/);
  assert.match(source, /\{sanitizedControls\}/);
  assert.match(source, /const collapsedControls = sanitizedCompactControls \?\? sanitizedControls/);
});

test("animated simulations wait for the learner to start", () => {
  const simulations = [
    "BernoullisPrincipleSimulation.tsx",
    "ComplexPhasorsSimulation.tsx",
    "FaradaysLawSimulation.tsx",
    "FourierAnalysisSimulation.tsx",
    "KeplersLawsSimulation.tsx",
    "MathematicalModelingSimulation.tsx",
    "StefanBoltzmannSimulation.tsx",
    "TrigonometryWavesSimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.doesNotMatch(
      source,
      /\[(?:isRunning|isPlaying), set(?:IsRunning|IsPlaying)\] = useState(?:<boolean>)?\(true\)/,
      `${simulation} should start paused`,
    );
  }
});

test("saving a simulation stays in the lab instead of navigating away", () => {
  const simulationDir = join(rootDir, "src/components/labs/simulation");
  const simulationFiles = readdirSync(simulationDir).filter((file) =>
    file.endsWith("Simulation.tsx"),
  );

  for (const simulation of simulationFiles) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.doesNotMatch(
      source,
      /\brouter\.push\(/,
      `${simulation} must not navigate away after saving`,
    );
  }
});

test("shared shell keeps results and exit actions inside the simulation workflow", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /data-testid="simulation-results-trigger"/);
  assert.match(source, /data-testid="simulation-results-drawer"/);
  assert.match(source, /ผลการทดลอง/);
  assert.match(source, /บันทึกผล/);
  assert.match(source, /ออกจากแล็บ/);
  assert.match(source, /searchParams\.get\("classroom"\)/);
  assert.match(source, /tab=classwork/);
  assert.doesNotMatch(source, /\{ key: "results", label: "ผลการทดลอง"/);
});

test("photoelectric controls follow the shared shell pattern without manual point logging", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/PhotoelectricEffectSimulation.tsx",
  );

  assert.match(source, /const compactControls = \(/);
  assert.match(source, /compactControls=\{compactControls\}/);
  assert.doesNotMatch(source, /จดค่าลงตาราง/);
  assert.match(source, /const currentPoint: PhotoelectricDataPoint = \{/);
});

test("Ohm and Hooke labs save the current reading without duplicate point buttons", () => {
  const ohm = readProjectFile(
    "src/components/labs/simulation/OhmsLawSimulation.tsx",
  );
  const hooke = readProjectFile(
    "src/components/labs/simulation/HookesLawSimulation.tsx",
  );

  assert.doesNotMatch(ohm, /จดค่าลงตาราง/);
  assert.match(ohm, /const currentPoint: OhmsDataPoint = \{/);
  assert.doesNotMatch(hooke, /บันทึกจุด/);
  assert.match(hooke, /const currentPoint: HookesDataPoint = \{/);
});

test("foundation circuit, buoyancy, and magnet labs keep real controls visible without missions or log buttons", () => {
  const cases = [
    ["SimpleCircuitsSimulation.tsx", "simple-circuit-experiment-scene"],
    ["FloatingSinkingSimulation.tsx", null],
    ["MagnetExplorationSimulation.tsx", null],
  ];

  for (const [simulation, sceneTestId] of cases) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);

    assert.match(source, /const compactControls = \(/, simulation);
    assert.match(source, /compactControls=\{compactControls\}/, simulation);
    assert.match(source, /onRun=/, simulation);
    assert.match(source, /onReset=/, simulation);
    assert.match(source, /onSave=/, simulation);
    assert.doesNotMatch(source, /ภารกิจสั้น 3 ขั้น|จดผล/, simulation);
    if (sceneTestId) {
      assert.match(source, new RegExp(`data-testid="${sceneTestId}"`));
      assert.match(source, /aria-labelledby=/);
    }
  }
});

test("advanced physics labs use compact controls with primary actions outside advanced settings", () => {
  const simulations = [
    "QuantumTunnelingSimulation.tsx",
    "MichelsonInterferometerSimulation.tsx",
    "ZeemanEffectSimulation.tsx",
    "SuperconductivityMeissnerSimulation.tsx",
    "BraggDiffractionSimulation.tsx",
    "RelativisticKinematicsSimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);

    assert.match(source, /const compactControls = \(/, simulation);
    assert.match(source, /compactControls=\{compactControls\}/, simulation);
    assert.match(source, /onRun=/, simulation);
    assert.match(source, /onReset=/, simulation);
    assert.match(source, /onSave=/, simulation);
    assert.doesNotMatch(source, /title="บันทึกจุด/, simulation);
  }
});

test("chemistry labs use compact controls with primary actions outside advanced settings", () => {
  const simulations = [
    "LeChateliersPrincipleSimulation.tsx",
    "BeerLambertLawSimulation.tsx",
    "HesssLawSimulation.tsx",
    "ChemistryConceptSimulation.tsx",
    "StatesOfMatterSimulation.tsx",
    "AcidsBasesAroundUsSimulation.tsx",
    "HeatingCoolingMaterialsSimulation.tsx",
    "PhysicalChemicalChangesSimulation.tsx",
    "NmrSpectroscopySimulation.tsx",
    "HplcChromatographySimulation.tsx",
    "TransitionMetalComplexesSimulation.tsx",
    "EisElectrochemistrySimulation.tsx",
    "QuantumChemistryOrbitalsSimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);

    assert.match(source, /const compactControls = \(/, simulation);
    assert.match(source, /compactControls=\{compactControls\}/, simulation);
    assert.match(source, /onRun=/, simulation);
    assert.match(source, /onReset=/, simulation);
    assert.match(source, /onSave=/, simulation);
    assert.doesNotMatch(source, /compactControls=\{controls\}/, simulation);
  }
});

test("shared compact controls auto-fit without covering the chemistry stage", () => {
  const shell = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );
  const compactRange = readProjectFile(
    "src/components/labs/simulation/CompactRangeControl.tsx",
  );

  assert.match(shell, /repeat\(auto-fit, minmax\(min\(100%, 11\.5rem\), 1fr\)\)/);
  assert.match(shell, /sm:bottom-\[300px\] lg:bottom-\[220px\]/);
  assert.match(compactRange, /rounded-xl border border-slate-100/);
  assert.doesNotMatch(compactRange, /rounded-2xl border border-slate-200 bg-slate-50\/80 p-3/);
});

test("biology labs keep compact controls and primary actions visible without manual point logging", () => {
  const simulations = [
    "PhotosynthesisRateSimulation.tsx",
    "MendelianGeneticsSimulation.tsx",
    "MitosisCellCycleSimulation.tsx",
    "OsmosisPlasmolysisSimulation.tsx",
    "EnzymeKineticsSimulation.tsx",
    "DnaExtractionSimulation.tsx",
    "CellularRespirationSimulation.tsx",
    "PlantTranspirationSimulation.tsx",
    "NaturalSelectionSimulation.tsx",
    "BloodTypingAgglutinationSimulation.tsx",
    "FoodChainEcologySimulation.tsx",
    "CardiovascularSystemSimulation.tsx",
    "PcrGelElectrophoresisSimulation.tsx",
    "CrisprGeneEditingSimulation.tsx",
    "RecombinantDnaTransformationSimulation.tsx",
    "FlowCytometrySimulation.tsx",
    "WesternBlottingSimulation.tsx",
    "MetabolicPathwayFluxSimulation.tsx",
  ];

  for (const simulation of simulations) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);

    assert.match(source, /onRun=/, `${simulation} should expose its experiment action`);
    assert.match(source, /onReset=/, `${simulation} should expose its reset action`);
    assert.match(source, /onSave=/, `${simulation} should expose its save action`);
    assert.doesNotMatch(
      source,
      /เพิ่มจุด|บันทึกจุด(?:วัด)?|จดค่าลงตาราง/,
      `${simulation} should not require manual point logging`,
    );
    assert.doesNotMatch(
      source,
      /<section className="flex min-h-\[300px\]/,
      `${simulation} result cards should stay compact`,
    );
  }

  const specializedControls = [
    "PcrGelElectrophoresisSimulation.tsx",
    "CrisprGeneEditingSimulation.tsx",
    "RecombinantDnaTransformationSimulation.tsx",
    "FlowCytometrySimulation.tsx",
    "WesternBlottingSimulation.tsx",
    "MetabolicPathwayFluxSimulation.tsx",
  ];

  for (const simulation of specializedControls) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.match(
      source,
      /CompactRangeControl|<fieldset/,
      `${simulation} should expose compact, lab-specific controls`,
    );
    assert.doesNotMatch(
      source,
      /Cycles -5|gRNA -10|Time -5s|Dye -0\.2|Expose -1s|O2 Low/,
      `${simulation} should not expose temporary increment controls`,
    );
  }

  const pcr = readProjectFile(
    "src/components/labs/simulation/PcrGelElectrophoresisSimulation.tsx",
  );
  assert.match(
    pcr,
    /Math\.min\(cycleCount, c \+ 1\)/,
    "PCR progress should never exceed the selected cycle count",
  );

  const shell = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );
  assert.match(shell, /เพิ่มจุด\|บันทึกจุด/, "manual point logging should be filtered");
  assert.match(shell, /lg:grid-cols-3/, "fallback controls should use a compact grid");
  assert.match(shell, /max-h-\[260px\]/, "result cards should stay below the stage");
  assert.match(
    shell,
    /min-w-0 max-w-full overflow-hidden/,
    "the mobile experiment shell should not expand beyond the viewport",
  );
  assert.match(
    shell,
    /overflow-x-clip/,
    "the simulation page should not create horizontal scrolling on mobile",
  );
});

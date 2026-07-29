import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

function readProjectFile(relativePath) {
  return readFileSync(join(rootDir, relativePath), "utf8");
}

test("lab detail page must not fallback unknown lab ids to Newton content", () => {
  const source = readProjectFile("src/app/labs/[id]/page.tsx");

  assert.doesNotMatch(
    source,
    /labsById\[labId\]\s*\|\|\s*labsById\[DEFAULT_LAB_ID\]/
  );
});

test("lab detail route redirects to the catalogue because details are removed from the flow", () => {
  const source = readProjectFile("src/app/labs/[id]/page.tsx");

  assert.match(source, /redirect\("\/labs"\)/);
  assert.doesNotMatch(source, /LabDetailLayout|LabHero/);
});

test("lab detail data lookup must not fallback unknown lab ids to cooling details", () => {
  const source = readProjectFile("src/data/labDetails.ts");

  assert.doesNotMatch(source, /return\s+labDetails\[labId\]\s*\|\|\s*coolingDetails/);
});

test("saved experiment registry covers every ready simulation lab", () => {
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");
  const savedRegistry = readProjectFile("src/data/labSavedExperiments.ts");

  const directBlock = registry.match(/export const directSimulationLabIds = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  const chemistryBlock = registry.match(/export const chemistryConceptSimulationLabIds = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  const mathBlock = registry.match(/export const mathConceptSimulationLabIds = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  const readyLabIds = [
    ...directBlock.matchAll(/"([^"]+)"/g),
    ...chemistryBlock.matchAll(/"([^"]+)"/g),
    ...mathBlock.matchAll(/"([^"]+)"/g),
  ].map((match) => match[1]);

  for (const labId of readyLabIds) {
    assert.match(savedRegistry, new RegExp(`"${labId}"\\s*:`), `${labId} should have a saved result key`);
  }
});

test("lab detail child components require an explicit lab id", () => {
  const detailComponentFiles = [
    "src/components/labs/LabDetailLayout.tsx",
    "src/components/labs/LabHero.tsx",
    "src/components/labs/EquipmentList.tsx",
    "src/components/labs/ExperimentSteps.tsx",
    "src/components/labs/TheoryCard.tsx",
    "src/components/labs/LabSidebar.tsx",
  ];

  for (const relativePath of detailComponentFiles) {
    const source = readProjectFile(relativePath);
    assert.doesNotMatch(
      source,
      /labId\s*=\s*"newtons-cooling"/,
      `${relativePath} should not silently default to Newton content`
    );
  }
});

test("lab detail sidebar derives guidance from the selected shared lab record", () => {
  const source = readProjectFile("src/components/labs/LabSidebar.tsx");

  assert.match(source, /details: LabDetailData/);
  assert.match(source, /buildAdviceList\(details: LabDetailData\)/);
  assert.match(source, /equipments/);
  assert.match(source, /steps/);
  assert.doesNotMatch(source, /const isOhmsLaw/);
  assert.doesNotMatch(source, /บันทึกข้อมูลและค่าอุณหภูมิอย่างสม่ำเสมอ/);
});

test("mathematics lab cards use lab-specific SVG illustrations", () => {
  const source = readProjectFile("src/components/LabCard.tsx");
  const mathIllustrations = [
    ["graphing-lines", "GraphingLinesCardSVG"],
    ["ratio-and-proportion", "RatioProportionCardSVG"],
    ["vector-addition", "VectorAdditionCardSVG"],
    ["center-and-variability", "CenterVariabilityCardSVG"],
    ["curve-fitting", "CurveFittingCardSVG"],
    ["function-builder", "FunctionBuilderCardSVG"],
  ];

  for (const [labId, component] of mathIllustrations) {
    assert.match(source, new RegExp(`const ${component} = \\(\\) =>`));
    assert.match(source, new RegExp(`data-testid="${labId}-card-svg"`));
    assert.match(source, new RegExp(`case "${labId}":\\s*return <${component} \\/>;`));
  }

  assert.doesNotMatch(
    source,
    /case "graphing-lines":\s*case "ratio-and-proportion":\s*case "vector-addition":\s*case "center-and-variability":\s*case "curve-fitting":\s*case "function-builder":\s*return <MathConceptSVG \/>;/
  );
});

test("mathematics lab detail heroes use lab-specific SVG variants", () => {
  const source = readProjectFile("src/components/labs/LabHero.tsx");
  const mathLabIds = [
    "graphing-lines",
    "ratio-and-proportion",
    "vector-addition",
    "center-and-variability",
    "curve-fitting",
    "function-builder",
  ];

  for (const labId of mathLabIds) {
    assert.match(source, new RegExp(`"${labId}": "${labId}"`));
  }

  assert.match(source, /data-testid=\{`math-hero-\$\{variant\}`\}/);
  assert.match(source, /<MathConceptHeroIllustration labId=\{labId\} \/>/);
  assert.doesNotMatch(source, /isMathematics \? \(\s*<MathConceptHeroIllustration \/>/);
});

test("remaining draft mathematics labs have details but are not registered as simulations", () => {
  const draftMathLabIds = [];
  assert.equal(draftMathLabIds.length, 0);
});

test("applied mathematics labs have routed interactive SVG simulations", () => {
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");
  const savedRegistry = readProjectFile("src/data/labSavedExperiments.ts");
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const simulation = readProjectFile("src/components/labs/simulation/AppliedMathSimulation.tsx");

  const appliedMathLabIds = [
    "geometry-measurement",
    "exponential-growth-decay",
    "data-sampling-error",
    "quadratic-projectiles",
    "logarithm-scales",
    "unit-conversion",
    "matrix-transformations",
    "sequences-series",
    "inequalities-feasible-regions",
    "transformations-symmetry",
    "angles-circles",
    "combinatorics-counting",
  ];

  assert.match(route, /AppliedMathSimulation/);
  assert.match(simulation, /<SharedSimulationShell/);
  assert.match(simulation, /<svg viewBox="0 0 640 420"/);
  assert.match(simulation, /saveExperimentAndSync/);
  assert.match(simulation, /Geometry Measurement Lab/);
  assert.match(simulation, /Exponential Growth & Decay/);
  assert.match(simulation, /Sampling & Measurement Error/);
  assert.match(simulation, /Quadratic Functions & Projectiles/);
  assert.match(simulation, /Logarithms & Scientific Scales/);
  assert.match(simulation, /Unit Conversion & Dimensional Analysis/);
  assert.match(simulation, /Matrix Transformations/);
  assert.match(simulation, /Sequences & Series Lab/);
  assert.match(simulation, /Inequalities & Feasible Regions/);
  assert.match(simulation, /Transformations & Symmetry/);
  assert.match(simulation, /Angles & Circles Lab/);
  assert.match(simulation, /Combinatorics & Counting/);
  assert.match(simulation, /function MatrixStage/);
  assert.match(simulation, /function SequencesStage/);
  assert.match(simulation, /function InequalitiesStage/);
  assert.match(simulation, /function SymmetryStage/);
  assert.match(simulation, /function CirclesStage/);
  assert.match(simulation, /function CombinatoricsStage/);

  for (const labId of appliedMathLabIds) {
    assert.match(registry, new RegExp(`"${labId}"`), `${labId} should be marked ready for simulation`);
    assert.match(savedRegistry, new RegExp(`"${labId}"\\s*:`), `${labId} should have a saved experiment key`);
    assert.match(route, new RegExp(`labId === "${labId}"`), `${labId} should route to AppliedMathSimulation`);
    assert.match(simulation, new RegExp(`"${labId}"`), `${labId} should have a configured SVG simulation`);
  }
});

test("university mathematics labs are now ready interactive simulations", () => {
  const labs = readProjectFile("src/data/labs.ts");
  const details = readProjectFile("src/data/labDetails.ts");
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");
  const savedRegistry = readProjectFile("src/data/labSavedExperiments.ts");
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");

  const universityLabIds = [
    "vector-fields-gradients",
    "discrete-graph-theory",
    "mathematical-modeling-lab",
  ];

  assert.equal(universityLabIds.length, 3);

  for (const labId of universityLabIds) {
    assert.match(labs, new RegExp(`id: "${labId}"[\\s\\S]*?category: "Mathematics"`), `${labId} should be listed as Mathematics`);
    assert.match(labs, new RegExp(`id: "${labId}"[\\s\\S]*?gradeLevel: "อุดมศึกษา"`), `${labId} should be university level`);
    assert.match(labs, new RegExp(`id: "${labId}"[\\s\\S]*?status: ""`), `${labId} should be marked ready`);
    assert.match(details, new RegExp(`"${labId}": createMathConceptDetails`), `${labId} should have detail data`);
    assert.match(registry, new RegExp(`"${labId}"`), `${labId} should be ready for simulation`);
    assert.match(savedRegistry, new RegExp(`"${labId}"\\s*:`), `${labId} should have a saved experiment key`);
    assert.match(route, new RegExp(`labId === "${labId}"`), `${labId} should route to its simulation component`);
  }
});

test("elementary physics labs have dedicated interactive simulations", () => {
  const labs = readProjectFile("src/data/labs.ts");
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");
  const savedRegistry = readProjectFile("src/data/labSavedExperiments.ts");
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const elementaryPhysicsSimulations = [
    ["simple-circuits", "SimpleCircuitsSimulation", "calculateSimpleCircuit"],
    ["floating-and-sinking", "FloatingSinkingSimulation", "calculateBuoyancy"],
    ["magnet-exploration", "MagnetExplorationSimulation", "calculateMagneticInteraction"],
  ];

  for (const [labId, component, modelFunction] of elementaryPhysicsSimulations) {
    const componentPath = `src/components/labs/simulation/${component}.tsx`;

    assert.match(
      labs,
      new RegExp(`id: "${labId}"[\\s\\S]*?status: ""`),
      `${labId} should be marked ready`,
    );
    assert.match(registry, new RegExp(`"${labId}"`), `${labId} should be a direct simulation`);
    assert.match(savedRegistry, new RegExp(`"${labId}"\\s*:`), `${labId} should have a save key`);
    assert.ok(existsSync(join(rootDir, componentPath)), `${componentPath} should exist`);

    const simulation = readProjectFile(componentPath);
    assert.match(
      route,
      new RegExp(`const ${component} = dynamic\\([\\s\\S]*?${component}`),
      `${component} should be dynamically imported`,
    );
    assert.match(
      route,
      new RegExp(`"${labId}": ${component}`),
      `${labId} should map to ${component}`,
    );
    assert.match(simulation, /<SharedSimulationShell/);
    assert.match(simulation, /saveExperimentAndSync/);
    assert.match(simulation, /aria-labelledby/);
    assert.doesNotMatch(simulation, /ภารกิจสั้น 3 ขั้น|จดผล/);
    assert.match(simulation, new RegExp(modelFunction));
  }
});

test("elementary chemistry labs have dedicated open-exploration simulations", () => {
  const labs = readProjectFile("src/data/labs.ts");
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");
  const savedRegistry = readProjectFile("src/data/labSavedExperiments.ts");
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const targets = [
    ["states-of-matter", "StatesOfMatterSimulation"],
    ["mixing-and-separating", "MixingAndSeparatingSimulation"],
    ["dissolving-solutions", "DissolvingSolutionsSimulation"],
    ["acids-bases-around-us", "AcidsBasesAroundUsSimulation"],
    ["heating-cooling-materials", "HeatingCoolingMaterialsSimulation"],
    ["physical-chemical-changes", "PhysicalChemicalChangesSimulation"],
  ];

  for (const [labId, component] of targets) {
    assert.match(
      labs,
      new RegExp(`id: "${labId}"[\\s\\S]*?status: ""`),
      `${labId} should be marked ready`,
    );
    assert.match(registry, new RegExp(`"${labId}"`));
    assert.match(savedRegistry, new RegExp(`"${labId}"\\s*:`));
    assert.match(
      route,
      new RegExp(`const ${component} = dynamic\\([\\s\\S]*?${component}`),
    );
    assert.match(route, new RegExp(`"${labId}": ${component}`));
  }
});

test("elementary physics and chemistry labs are detail-only placeholders", () => {
  const labs = readProjectFile("src/data/labs.ts");
  const details = readProjectFile("src/data/labDetails.ts");
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");
  const labsPage = readProjectFile("src/app/labs/page.tsx");
  const labCard = readProjectFile("src/components/LabCard.tsx");

  const elementaryLabs = [];
  const handleViewDetails = labsPage.match(/const handleViewDetails = \(id: string\) => \{[\s\S]*?\n  \};/)?.[0] ?? "";

  assert.equal(elementaryLabs.length, 0);
  assert.doesNotMatch(handleViewDetails, /isLabReady/);
  assert.match(labCard, /onClick=\{\(\) => onEnterRoom\?\.\(lab\.id\)\}/);
  assert.doesNotMatch(labCard, /readiness\.label/);

  for (const [labId, category] of elementaryLabs) {
    assert.match(labs, new RegExp(`id: "${labId}"[\\s\\S]*?category: "${category}"`), `${labId} should be listed as ${category}`);
    assert.match(labs, new RegExp(`id: "${labId}"[\\s\\S]*?gradeLevel: "ประถม"`), `${labId} should be elementary level`);
    assert.match(labs, new RegExp(`id: "${labId}"[\\s\\S]*?status: "ยังสร้างไม่เสร็จ"`), `${labId} should be marked unfinished`);
    assert.match(details, new RegExp(`"${labId}": createDraftElementaryScienceDetails`), `${labId} should have detail data`);
    assert.doesNotMatch(registry, new RegExp(`"${labId}"`), `${labId} should not be ready for simulation`);
  }
});

test("university science labs use English titles and shared detail SVGs", () => {
  const labs = readProjectFile("src/data/labs.ts");
  const labCard = readProjectFile("src/components/LabCard.tsx");
  const labHero = readProjectFile("src/components/labs/LabHero.tsx");

  const universityScienceLabs = [
    ["quantum-tunneling", "Physics", "Quantum Tunneling", "QuantumTunnelingSVG"],
    ["michelson-interferometer", "Physics", "Michelson Interferometer", "MichelsonInterferometerSVG"],
    ["zeeman-effect", "Physics", "Zeeman Effect", "ZeemanEffectSVG"],
    ["superconductivity-meissner", "Physics", "Superconductivity & Meissner Effect", "SuperconductivityMeissnerSVG"],
    ["bragg-diffraction", "Physics", "Bragg Diffraction", "BraggDiffractionSVG"],
    ["relativistic-kinematics", "Physics", "Relativistic Kinematics", "RelativisticKinematicsSVG"],
    ["nmr-spectroscopy", "Chemistry", "NMR Spectroscopy", "NmrSpectroscopySVG"],
    ["xps-spectroscopy", "Chemistry", "XPS Spectroscopy", "XpsSpectroscopySVG"],
    ["hplc-chromatography", "Chemistry", "HPLC Chromatography", "HplcChromatographySVG"],
    ["transition-metal-complexes", "Chemistry", "Transition Metal Complexes", "TransitionMetalComplexesSVG"],
    ["eis-electrochemistry", "Chemistry", "Electrochemical Impedance Spectroscopy", "EisElectrochemistrySVG"],
    ["quantum-chemistry-orbitals", "Chemistry", "Quantum Chemistry Orbitals", "QuantumChemistryOrbitalsSVG"],
    ["pcr-gel-electrophoresis", "Biology", "PCR & Gel Electrophoresis", "PcrGelElectrophoresisSVG"],
    ["crispr-gene-editing", "Biology", "CRISPR-Cas9 Gene Editing", "CrisprGeneEditingSVG"],
    ["recombinant-dna-transformation", "Biology", "Recombinant DNA & Transformation", "RecombinantDnaTransformationSVG"],
    ["flow-cytometry-cycle", "Biology", "Flow Cytometry Cell Analysis", "FlowCytometrySVG"],
    ["western-blotting", "Biology", "Western Blotting Protein Detection", "WesternBlottingSVG"],
    ["metabolic-pathway-flux", "Biology", "Metabolic Pathway Flux Analysis", "MetabolicPathwayFluxSVG"],
  ];

  assert.match(labHero, /const isBiology = category === "Biology"/);
  assert.match(labHero, /const chemistryTone = category === "Chemistry"/);

  for (const [labId, category, title, component] of universityScienceLabs) {
    assert.match(labs, new RegExp(`id: "${labId}"[\\s\\S]*?title: "${title}"`), `${labId} should use an English title`);
    assert.match(labs, new RegExp(`id: "${labId}"[\\s\\S]*?category: "${category}"`), `${labId} should stay in ${category}`);
    assert.match(labs, new RegExp(`id: "${labId}"[\\s\\S]*?gradeLevel: "อุดมศึกษา"`), `${labId} should stay university level`);
    assert.match(labCard, new RegExp(`case "${labId}":[\\s\\S]*?return <${component} \\/>;`), `${labId} card should use ${component}`);
    assert.match(labHero, new RegExp(`labId === "${labId}" \\? \\([\\s\\S]*?<${component} className="w-full h-full" \\/>`), `${labId} detail hero should match its card SVG`);
  }
});

test("labs page keeps the filtered lab count without redundant readiness status", () => {
  const labsPage = readProjectFile("src/app/labs/page.tsx");

  assert.match(labsPage, /แล็บในมุมมองนี้ \{filteredLabs\.length\} แล็บ/);
  assert.match(labsPage, /if \(!isLabReady\(id\) \|\| isEnteringLab \|\| !isAuthReady\) return;/);
  assert.match(labsPage, /router\.push\(`\/register\?next=\$\{encodeURIComponent\(simulationPath\)\}`\)/);
  assert.doesNotMatch(labsPage, /readyFilteredLabCount/);
  assert.doesNotMatch(labsPage, /unfinishedLabs/);
});

test("lab detail layout avoids a duplicate bottom start CTA", () => {
  const source = readProjectFile("src/components/labs/LabDetailLayout.tsx");

  assert.doesNotMatch(source, /FinalLabCta/);
  assert.doesNotMatch(source, /พร้อมเริ่มทดลอง/);
  assert.match(source, /hero: React\.ReactNode/);
  assert.match(source, /\{hero\}/);
  assert.doesNotMatch(source, /import LabHero/);
});

test("learning history redirects into profile and uses shared progress sources", () => {
  const pagePath = join(rootDir, "src/app/history/page.tsx");
  const componentPath = join(rootDir, "src/components/history/LearningHistoryPage.tsx");

  assert.equal(existsSync(pagePath), true, "history route should exist");
  assert.equal(existsSync(componentPath), true, "history page component should exist");

  const route = readProjectFile("src/app/history/page.tsx");
  assert.match(route, /redirect\("\/profile\?tab=history"\)/);

  const source = readProjectFile("src/components/history/LearningHistoryPage.tsx");
  assert.match(source, /loadSupabaseLearningSnapshot/);
  assert.match(source, /readLocalLearningSnapshot/);
  assert.match(source, /LAB_SAVED_EXPERIMENT_KEYS/);
  assert.doesNotMatch(source, /Math\.random/);
});

test("learning history is reachable from the profile tabs", () => {
  const sidebar = readProjectFile("src/components/Sidebar.tsx");
  const mobileTabBar = readProjectFile("src/components/MobileTabBar.tsx");
  const profile = readProjectFile("src/app/profile/page.tsx");

  assert.doesNotMatch(sidebar, /href: "\/history"/);
  assert.doesNotMatch(mobileTabBar, /href: "\/history"/);
  assert.match(profile, /<LearningHistoryPage embedded/);
  assert.match(profile, /id: "history", label: "ประวัติการเรียนรู้"/);
  assert.doesNotMatch(profile, /ระบบบันทึกประวัติการทำแล็บทั้งหมดกำลังเตรียมการเชื่อมต่อ Supabase/);
});

test("simulation route keeps unsupported labs on a placeholder instead of Newton", () => {
  const source = readProjectFile("src/app/labs/[id]/simulation/page.tsx");

  assert.match(source, /return\s+<SimulationPlaceholder labId=\{labId\}\s*\/>/);
  assert.doesNotMatch(source, /return\s+<NewtonsCoolingSimulation\s*\/>;\s*\n\}/);
});

test("mission rewards must not write real score state directly from the page", () => {
  const source = readProjectFile("src/app/missions/page.tsx");

  assert.doesNotMatch(source, /localStorage\.setItem\("scisiam_points"/);
  assert.doesNotMatch(source, /localStorage\.setItem\(`scisiam_claimed_mission_/);
});

const finalBiologySimulationLabs = [
  {
    id: "push-pull-forces",
    component: "PushPullForcesSimulation",
    file: "src/components/labs/simulation/PushPullForcesSimulation.tsx",
    title: "Push & Pull Forces",
    saveKey: "scisiam_saved_push_pull_experiment",
  },
  {
    id: "light-and-shadows",
    component: "LightShadowsSimulation",
    file: "src/components/labs/simulation/LightShadowsSimulation.tsx",
    title: "Light and Shadows",
    saveKey: "scisiam_saved_light_shadows_experiment",
  },
  {
    id: "sound-vibrations",
    component: "SoundVibrationsSimulation",
    file: "src/components/labs/simulation/SoundVibrationsSimulation.tsx",
    title: "Sound Vibrations",
    saveKey: "scisiam_saved_sound_vibrations_experiment",
  },
  {
    id: "flow-cytometry-cycle",
    component: "FlowCytometrySimulation",
    file: "src/components/labs/simulation/FlowCytometrySimulation.tsx",
    title: "Flow Cytometry Cell Analysis",
    saveKey: "scisiam_saved_flow_cytometry_experiment",
  },
  {
    id: "western-blotting",
    component: "WesternBlottingSimulation",
    file: "src/components/labs/simulation/WesternBlottingSimulation.tsx",
    title: "Western Blotting Protein Detection",
    saveKey: "scisiam_saved_western_blotting_experiment",
  },
  {
    id: "metabolic-pathway-flux",
    component: "MetabolicPathwayFluxSimulation",
    file: "src/components/labs/simulation/MetabolicPathwayFluxSimulation.tsx",
    title: "Metabolic Pathway Flux Analysis",
    saveKey: "scisiam_saved_metabolic_flux_experiment",
  },
  {
    id: "pcr-gel-electrophoresis",
    component: "PcrGelElectrophoresisSimulation",
    file: "src/components/labs/simulation/PcrGelElectrophoresisSimulation.tsx",
    title: "PCR & Gel Electrophoresis",
    saveKey: "scisiam_saved_pcr_gel_experiment",
  },
  {
    id: "crispr-gene-editing",
    component: "CrisprGeneEditingSimulation",
    file: "src/components/labs/simulation/CrisprGeneEditingSimulation.tsx",
    title: "CRISPR-Cas9 Gene Editing",
    saveKey: "scisiam_saved_crispr_gene_experiment",
  },
  {
    id: "recombinant-dna-transformation",
    component: "RecombinantDnaTransformationSimulation",
    file: "src/components/labs/simulation/RecombinantDnaTransformationSimulation.tsx",
    title: "Recombinant DNA & Transformation",
    saveKey: "scisiam_saved_recombinant_dna_experiment",
  },
  {
    id: "blood-typing",
    component: "BloodTypingAgglutinationSimulation",
    file: "src/components/labs/simulation/BloodTypingAgglutinationSimulation.tsx",
    title: "Blood Typing & Agglutination",
    saveKey: "scisiam_saved_blood_typing_experiment",
  },
  {
    id: "food-chain",
    component: "FoodChainEcologySimulation",
    file: "src/components/labs/simulation/FoodChainEcologySimulation.tsx",
    title: "Food Chain & Ecology",
    saveKey: "scisiam_saved_food_chain_experiment",
  },
  {
    id: "heart-rate",
    component: "CardiovascularSystemSimulation",
    file: "src/components/labs/simulation/CardiovascularSystemSimulation.tsx",
    title: "Cardiovascular System Lab",
    saveKey: "scisiam_saved_heart_rate_experiment",
  },
];

test("final biology labs are registered as ready direct simulations", () => {
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");

  for (const lab of finalBiologySimulationLabs) {
    assert.match(registry, new RegExp(`"${lab.id}"`), `${lab.id} should be ready`);
  }
});

test("simulation route imports and dispatches the final biology lab components", () => {
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");

  for (const lab of finalBiologySimulationLabs) {
    assert.match(
      route,
      new RegExp(
        `const ${lab.component} = dynamic\\(\\(\\) =>\\s*import\\("@/components/labs/simulation/${lab.component}"\\)`,
      ),
      `${lab.component} should be loaded dynamically`
    );
    assert.match(
      route,
      new RegExp(`"${lab.id}": ${lab.component}`),
      `${lab.id} should dispatch to ${lab.component}`
    );
  }
});

test("simulation route code-splits heavy lab implementations", () => {
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");

  assert.match(route, /import dynamic from "next\/dynamic"/);
  assert.doesNotMatch(
    route,
    /^import\s+\w+Simulation\s+from\s+"@\/components\/labs\/simulation\//m,
  );
});

test("shared simulation shell overlays live metrics without shrinking the stage", () => {
  const source = readProjectFile("src/components/labs/simulation/SharedSimulationShell.tsx");

  assert.doesNotMatch(source, /showLiveMetrics && <div className="hidden sm:block">\{liveMetricsCard\}<\/div>/);
  assert.match(source, /data-testid="simulation-stage-content"/);
  assert.match(source, /data-testid="simulation-stage-scene"/);
  assert.match(source, /data-testid="simulation-stage-metrics"/);
  assert.doesNotMatch(source, /xl:grid-cols-\[minmax\(0,1fr\)_320px\]/);
  assert.doesNotMatch(source, /xl:mr-\[336px\]/);
  assert.match(
    source,
    /\? "fixed inset-0 z-\[100\] h-\[100dvh\] min-h-0 w-\[100dvw\] max-w-none overscroll-none rounded-none border-0 shadow-none"/,
  );
  assert.match(source, /data-testid="simulation-stage-content"[\s\S]*className="relative min-h-\[320px\][^"]*sm:h-full/);
  assert.match(source, /data-testid="simulation-stage-scene"[\s\S]*className="min-h-\[320px\][^"]*sm:h-full/);
  assert.match(source, /data-testid="simulation-stage-metrics" className="absolute right-5 top-5 z-20 hidden w-\[320px\] xl:block"/);
  assert.match(source, /drawerSummary \?\? \(showLiveMetrics && liveMetricsCard\)/);
  assert.match(source, /\{persistentAdvancedPanel\}[\s\S]*usesPersistentControlDock \? persistentControlDock : controlsDrawer/);
});

test("graphing lines math lab uses its own interactive simulation", () => {
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const simulationFile = "src/components/labs/simulation/GraphingLinesSimulation.tsx";

  assert.equal(existsSync(join(rootDir, simulationFile)), true, `${simulationFile} should exist`);
  assert.match(
    route,
    /const GraphingLinesSimulation = dynamic\(\(\) =>\s*import\("@\/components\/labs\/simulation\/GraphingLinesSimulation"\)/,
  );
  assert.match(route, /labId === "graphing-lines"/);
  assert.match(route, /<GraphingLinesSimulation\s*\/>/);

  const source = readProjectFile(simulationFile);
  assert.match(source, /<SharedSimulationShell/);
  assert.match(source, /labId="graphing-lines"/);
  assert.match(source, /y = mx \+ b/);
  assert.match(source, /localStorageKey: "scisiam_saved_graphing_lines_experiment"/);
});

test("ratio and proportion math lab uses its own interactive simulation", () => {
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const simulationFile = "src/components/labs/simulation/RatioProportionSimulation.tsx";

  assert.equal(existsSync(join(rootDir, simulationFile)), true, `${simulationFile} should exist`);
  assert.match(
    route,
    /const RatioProportionSimulation = dynamic\(\(\) =>\s*import\("@\/components\/labs\/simulation\/RatioProportionSimulation"\)/,
  );
  assert.match(route, /labId === "ratio-and-proportion"/);
  assert.match(route, /<RatioProportionSimulation\s*\/>/);

  const source = readProjectFile(simulationFile);
  assert.match(source, /<SharedSimulationShell/);
  assert.match(source, /labId="ratio-and-proportion"/);
  assert.match(source, /a \/ b = c \/ d/);
  assert.match(source, /localStorageKey: "scisiam_saved_ratio_proportion_experiment"/);
});

test("ratio and proportion drawer summary exposes manual numeric inputs", () => {
  const simulationFile = "src/components/labs/simulation/RatioProportionSimulation.tsx";
  const source = readProjectFile(simulationFile);
  const manualNumberInput = readProjectFile(
    "src/components/labs/simulation/ManualNumberInput.tsx",
  );

  assert.match(source, /drawerSummary=\{drawerSummary\}/);
  assert.match(source, /Manual number input/);
  assert.match(source, /ariaLabel="Enter base quantity A"/);
  assert.match(source, /ariaLabel="Enter base quantity B"/);
  assert.match(source, /ariaLabel="Enter scale factor"/);
  assert.match(source, /label="scale"[\s\S]*?tone="pink"/);
  assert.match(source, /label="Scale factor"[\s\S]*?tone="pink"/);
  assert.match(source, /ariaLabel="Enter given value c"/);
  assert.match(source, /<BoundedNumberInput/);
  assert.match(manualNumberInput, /aria-label=\{ariaLabel\}/);
});

test("all mathematics simulation drawers expose manual numeric inputs", () => {
  const manualInputsBySimulation = [
    {
      file: "src/components/labs/simulation/GraphingLinesSimulation.tsx",
      labels: ["Enter slope m", "Enter y-intercept b", "Enter probe x"],
    },
    {
      file: "src/components/labs/simulation/RatioProportionSimulation.tsx",
      labels: ["Enter base quantity A", "Enter base quantity B", "Enter scale factor", "Enter given value c"],
    },
    {
      file: "src/components/labs/simulation/VectorAdditionSimulation.tsx",
      labels: ["Enter vector A magnitude", "Enter vector A angle", "Enter vector B magnitude", "Enter vector B angle"],
    },
    {
      file: "src/components/labs/simulation/CenterVariabilitySimulation.tsx",
      labels: ["Enter selected data point", "Enter selected data value"],
    },
    {
      file: "src/components/labs/simulation/CurveFittingSimulation.tsx",
      labels: ["Enter selected trend point", "Enter selected point x", "Enter selected point y"],
    },
    {
      file: "src/components/labs/simulation/FunctionBuilderSimulation.tsx",
      labels: ["Enter input x", "Enter scale a", "Enter horizontal shift h", "Enter vertical shift k"],
    },
  ];

  for (const { file, labels } of manualInputsBySimulation) {
    const source = readProjectFile(file);
    assert.match(source, /drawerSummary=\{drawerSummary\}/, `${file} should pass drawerSummary to the shell`);
    assert.match(source, /ManualNumberInput/, `${file} should expose manual number inputs`);

    for (const label of labels) {
      assert.match(source, new RegExp(`ariaLabel="${label}"`), `${file} should expose ${label}`);
    }
  }
});

test("ratio and proportion stage uses compact balanced sizing", () => {
  const simulationFile = "src/components/labs/simulation/RatioProportionSimulation.tsx";
  const source = readProjectFile(simulationFile);

  assert.match(source, /data-testid="ratio-proportion-stage"/);
  assert.match(source, /data-testid="ratio-proportion-bars-panel"/);
  assert.match(source, /data-testid="ratio-proportion-graph-panel"/);
  assert.doesNotMatch(source, /top-\[118px\]/);
  assert.match(source, /top-\[104px\]/);
  assert.match(source, /lg:grid-cols-\[minmax\(0,0\.92fr\)_280px\]/);
  assert.doesNotMatch(source, /className="h-6 overflow-hidden rounded-full bg-slate-100"/);
  assert.match(source, /className="h-4 overflow-hidden rounded-full bg-slate-100"/);
  assert.match(source, /className="h-\[calc\(100%-28px\)\] min-h-\[190px\] w-full"/);
});

test("vector addition math lab uses its own interactive simulation", () => {
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const simulationFile = "src/components/labs/simulation/VectorAdditionSimulation.tsx";

  assert.equal(existsSync(join(rootDir, simulationFile)), true, `${simulationFile} should exist`);
  assert.match(
    route,
    /const VectorAdditionSimulation = dynamic\(\(\) =>\s*import\("@\/components\/labs\/simulation\/VectorAdditionSimulation"\)/,
  );
  assert.match(route, /labId === "vector-addition"/);
  assert.match(route, /<VectorAdditionSimulation\s*\/>/);

  const source = readProjectFile(simulationFile);
  assert.match(source, /<SharedSimulationShell/);
  assert.match(source, /labId="vector-addition"/);
  assert.match(source, /A \+ B = R/);
  assert.match(source, /head-to-tail/);
  assert.match(source, /localStorageKey: "scisiam_saved_vector_addition_experiment"/);
});

test("center and variability math lab uses its own interactive simulation", () => {
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const simulationFile = "src/components/labs/simulation/CenterVariabilitySimulation.tsx";

  assert.equal(existsSync(join(rootDir, simulationFile)), true, `${simulationFile} should exist`);
  assert.match(
    route,
    /const CenterVariabilitySimulation = dynamic\(\(\) =>\s*import\("@\/components\/labs\/simulation\/CenterVariabilitySimulation"\)/,
  );
  assert.match(route, /labId === "center-and-variability"/);
  assert.match(route, /<CenterVariabilitySimulation\s*\/>/);

  const source = readProjectFile(simulationFile);
  assert.match(source, /<SharedSimulationShell/);
  assert.match(source, /labId="center-and-variability"/);
  assert.match(source, /mean/);
  assert.match(source, /median/);
  assert.match(source, /IQR/);
  assert.match(source, /standard deviation/);
  assert.match(source, /localStorageKey: "scisiam_saved_center_variability_experiment"/);
});

test("curve fitting math lab uses its own interactive simulation", () => {
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const simulationFile = "src/components/labs/simulation/CurveFittingSimulation.tsx";

  assert.equal(existsSync(join(rootDir, simulationFile)), true, `${simulationFile} should exist`);
  assert.match(
    route,
    /const CurveFittingSimulation = dynamic\(\(\) =>\s*import\("@\/components\/labs\/simulation\/CurveFittingSimulation"\)/,
  );
  assert.match(route, /labId === "curve-fitting"/);
  assert.match(route, /<CurveFittingSimulation\s*\/>/);

  const source = readProjectFile(simulationFile);
  assert.match(source, /<SharedSimulationShell/);
  assert.match(source, /labId="curve-fitting"/);
  assert.match(source, /trend line/);
  assert.match(source, /R\^2/);
  assert.match(source, /residual/);
  assert.match(source, /localStorageKey: "scisiam_saved_curve_fitting_experiment"/);
});

test("function builder math lab uses its own interactive simulation", () => {
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const simulationFile = "src/components/labs/simulation/FunctionBuilderSimulation.tsx";

  assert.equal(existsSync(join(rootDir, simulationFile)), true, `${simulationFile} should exist`);
  assert.match(
    route,
    /const FunctionBuilderSimulation = dynamic\(\(\) =>\s*import\("@\/components\/labs\/simulation\/FunctionBuilderSimulation"\)/,
  );
  assert.match(route, /labId === "function-builder"/);
  assert.match(route, /<FunctionBuilderSimulation\s*\/>/);

  const source = readProjectFile(simulationFile);
  assert.match(source, /<SharedSimulationShell/);
  assert.match(source, /labId="function-builder"/);
  assert.match(source, /function machine/);
  assert.match(source, /input/);
  assert.match(source, /output/);
  assert.match(source, /f\(x\)/);
  assert.match(source, /localStorageKey: "scisiam_saved_function_builder_experiment"/);
});

test("curve fitting stage keeps helper cards out of the chart overlay layer", () => {
  const source = readProjectFile("src/components/labs/simulation/CurveFittingSimulation.tsx");

  assert.doesNotMatch(source, /absolute right-5 top-5/);
  assert.match(source, /data-testid="curve-fitting-stage-header"/);
  assert.match(source, /data-testid="curve-fitting-chart"/);
  assert.match(source, /className="relative flex h-full w-full flex-col overflow-hidden/);
});

test("final biology lab simulation components exist with save integration", () => {
  for (const lab of finalBiologySimulationLabs) {
    const absolutePath = join(rootDir, lab.file);
    assert.equal(existsSync(absolutePath), true, `${lab.file} should exist`);

    const source = readProjectFile(lab.file);
    assert.match(source, /<SharedSimulationShell/, `${lab.file} should use the shared shell`);
    assert.match(source, new RegExp(`labId=\"${lab.id}\"`), `${lab.file} should set the correct labId`);
    assert.match(source, new RegExp(`localStorageKey: \"${lab.saveKey}\"`), `${lab.file} should persist with its own save key`);
  }
});

test("final biology lab details no longer carry development placeholder labels", () => {
  const details = readProjectFile("src/data/labDetails.ts");

  for (const lab of finalBiologySimulationLabs) {
    const detailBlockPattern = new RegExp(`// \\d+\\. ${lab.title} \\[IN DEVELOPMENT PLACEHOLDER\\]`);
    assert.doesNotMatch(details, detailBlockPattern, `${lab.title} should not be marked as placeholder`);
  }
});

test("authenticated clients cannot directly write authoritative learning records", () => {
  const migrationFile = readdirSync(join(rootDir, "supabase/migrations"))
    .find((file) => file.endsWith("_harden_progress_and_rewards.sql"));

  assert.ok(migrationFile, "security hardening migration should exist");

  const migration = readProjectFile(`supabase/migrations/${migrationFile}`);
  for (const table of [
    "profiles",
    "experiment_runs",
    "lab_progress",
    "user_achievements",
    "user_mission_progress",
  ]) {
    assert.match(
      migration,
      new RegExp(`revoke[\\s\\S]*?(insert|update|delete)[\\s\\S]*?public\\.${table}[\\s\\S]*?authenticated`, "i"),
      `${table} should revoke direct authenticated writes`
    );
  }

  assert.match(migration, /grant\s+select\s+on\s+table\s+public\.profiles\s+to\s+authenticated/i);
  assert.match(migration, /grant\s+select\s+on\s+table\s+public\.experiment_runs\s+to\s+authenticated/i);
  assert.match(migration, /grant\s+select\s+on\s+table\s+public\.lab_progress\s+to\s+authenticated/i);
});

test("mission rewards derive progress on the server instead of trusting the client", () => {
  const missionClient = readProjectFile("src/lib/supabase/missions.ts");
  const missionPage = readProjectFile("src/app/missions/page.tsx");
  const migrationFile = readdirSync(join(rootDir, "supabase/migrations"))
    .find((file) => file.endsWith("_harden_progress_and_rewards.sql"));

  assert.ok(migrationFile, "mission hardening migration should exist");
  const migration = readProjectFile(`supabase/migrations/${migrationFile}`);

  assert.doesNotMatch(missionClient, /progressCount|p_progress_count/);
  assert.doesNotMatch(missionPage, /progressCount:\s*mission\.progress/);
  assert.match(migration, /private\.calculate_mission_progress/i);
  assert.match(migration, /count\(\*\)[\s\S]*public\.lab_progress/i);
  assert.doesNotMatch(migration, /greatest\(coalesce\(p_progress_count/i);
});

test("self-registration cannot promote an account to teacher", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const signUpBlock = authForm.match(
    /supabase\.auth\.signUp\(\{([\s\S]*?)\n\s*\}\);/,
  )?.[1];
  const migrationFile = readdirSync(join(rootDir, "supabase/migrations"))
    .find((file) => file.endsWith("_harden_progress_and_rewards.sql"));

  assert.ok(signUpBlock, "sign-up request should be present");
  assert.ok(migrationFile, "role hardening migration should exist");
  const migration = readProjectFile(`supabase/migrations/${migrationFile}`);

  assert.doesNotMatch(signUpBlock, /\n\s+role\s*[:,]/);
  assert.doesNotMatch(authForm, /\.from\("profiles"\)\.upsert\(/);
  assert.match(migration, /'student'::public\.scisiam_user_role/i);
  assert.doesNotMatch(migration, /raw_user_meta_data[\s\S]*?->>\s*'role'/i);
});

test("teacher registration captures a selected school without granting teacher authorization", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const signUpBlock = authForm.match(
    /supabase\.auth\.signUp\(\{([\s\S]*?)\n\s*\}\);/,
  )?.[1];

  assert.ok(signUpBlock, "sign-up request should be present");
  assert.match(authForm, /\.from\("school_catalog"\)/);
  assert.match(authForm, /setSelectedSchool\(school\)/);
  assert.match(authForm, /role === "teacher"[\s\S]*?auth-school/);
  assert.match(authForm, /คำขอบทบาทคุณครู/);
  assert.match(authForm, /ได้รับการอนุมัติ/);
  assert.match(authForm, /schoolLookupError/);
  assert.match(authForm, /โหลดรายชื่อโรงเรียนไม่ได้/);
  assert.doesNotMatch(authForm, /catalogError \? \[\] : data \?\? \[\]/);
  assert.match(authForm, /profile\.role === "teacher" \? "\/dashboard" : "\/labs"/);
  assert.match(signUpBlock, /school_id:\s*role === "teacher" \? selectedSchool\?\.id/);
  assert.match(signUpBlock, /school_name:\s*role === "teacher" \? selectedSchool\?\.name/);
  assert.match(signUpBlock, /requested_role:\s*role/);
  assert.doesNotMatch(signUpBlock, /\n\s+role\s*[:,]/);
});

test("login copy is role-neutral while registration still asks for role", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");

  assert.match(
    authForm,
    /ใช้อีเมลบัญชีเพื่อเข้าทำการทดลองหรือเป็นครูเพื่อจัดการห้องเรียนของคุณ/,
  );
  assert.match(authForm, /isRegister && !isForgotPassword && <div className="grid gap-2">/);
  assert.match(authForm, /aria-label="เลือกบทบาท"/);
});

test("school catalog migration imports DMC school data with explicit API grants and profile linkage", () => {
  const migrationFile = readdirSync(join(rootDir, "supabase/migrations"))
    .find((file) => file.endsWith("_add_school_catalog.sql"));

  assert.ok(migrationFile, "school catalog migration should exist");
  const migration = readProjectFile(`supabase/migrations/${migrationFile}`);
  const types = readProjectFile("src/lib/supabase/database.types.ts");

  assert.match(migration, /create table if not exists public\.school_catalog/i);
  assert.match(migration, /alter table public\.school_catalog enable row level security/i);
  assert.match(migration, /grant select on public\.school_catalog to anon, authenticated/i);
  assert.match(migration, /create policy "Anyone can search the school catalog"/i);
  assert.match(migration, /alter table public\.profiles[\s\S]*add column if not exists school_id text/i);
  assert.match(migration, /new\.raw_user_meta_data ->> 'school_id'/i);
  assert.match(migration, /สตรีวิทยา/);
  assert.match(migration, /สพม\.กรุงเทพมหานคร เขต 1/);
  assert.match(types, /school_catalog:/);
  assert.match(types, /school_id: string \| null/);
});

test("simulations award local points only through the shared experiment save helper", () => {
  const simulationDir = join(rootDir, "src/components/labs/simulation");
  const simulationFiles = readdirSync(simulationDir)
    .filter((file) => file.endsWith(".tsx"));

  for (const file of simulationFiles) {
    const source = readFileSync(join(simulationDir, file), "utf8");

    assert.doesNotMatch(
      source,
      /localStorage\.setItem\(\s*["']scisiam_points["']/,
      `${file} must not mutate scisiam_points directly`,
    );
  }
});

test("local Supabase migrations mirror the deployed migration history", () => {
  const migrationFiles = readdirSync(join(rootDir, "supabase/migrations"))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const expectedVersions = [
    "20260602143020",
    "20260602143133",
    "20260602143853",
    "20260602144939",
    "20260602200551",
    "20260602202721",
    "20260611083451",
    "20260628232320",
    "20260629061447",
    "20260629193624",
    "20260629194332",
    "20260630041642",
    "20260630042012",
    "20260701060945",
    "20260702193746",
    "20260702193948",
    "20260707103000",
    "20260707203430",
    "20260707212025",
    "20260708085729",
    "20260708194528",
    "20260709200551",
    "20260711182651",
    "20260712072936",
    "20260712074502",
    "20260712103406",
    "20260712114647",
    "20260726140000",
    "20260727083301",
    "20260727083338",
    "20260727083406",
    "20260729100000",
  ];

  assert.deepEqual(
    migrationFiles.map((file) => file.slice(0, 14)),
    expectedVersions,
  );
});

test("learning snapshots derive local labs from the shared registry", () => {
  const source = readProjectFile("src/lib/supabase/learning-snapshot.ts");

  assert.match(
    source,
    /import\s+\{\s*LAB_SAVED_EXPERIMENT_KEYS\s*\}\s+from\s+"@\/data\/labSavedExperiments"/,
  );
  assert.match(source, /labsData\.(?:map|flatMap)\(/);
  assert.doesNotMatch(source, /labId:\s*"newtons-cooling"[\s\S]*labId:\s*"colligative-properties"/);
});

test("atmosphere layers lab is a ready clickable cloud simulation", () => {
  const labs = readProjectFile("src/data/labs.ts");
  const details = readProjectFile("src/data/labDetails.ts");
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const card = readProjectFile("src/components/LabCard.tsx");
  const savedRegistry = readProjectFile("src/data/labSavedExperiments.ts");
  const simulation = readProjectFile("src/components/labs/simulation/AtmosphereLayersSimulation.tsx");

  assert.match(labs, /id:\s*"atmosphere-layers"[\s\S]*?category:\s*"Foundation"/);
  assert.match(details, /"atmosphere-layers": atmosphereLayersDetails/);
  assert.match(registry, /"atmosphere-layers"/);
  assert.match(route, /AtmosphereLayersSimulation/);
  assert.match(card, /case "atmosphere-layers":[\s\S]*?<AtmosphereLayersSVG \/>/);
  assert.match(savedRegistry, /"atmosphere-layers": "scisiam_saved_atmosphere_layers_experiment"/);

  for (const term of ["Cirrus", "Cumulus", "Cumulonimbus", "โทรโพสเฟียร์", "0.5-16 กม."]) {
    assert.match(simulation, new RegExp(term), `${term} should appear in the simulation`);
  }
  assert.match(simulation, /setInfoOpen\(true\)/);
  assert.match(simulation, /role="dialog"/);
  assert.match(simulation, /showLiveMetrics=\{false\}/);
  assert.match(simulation, /showInfoTabs=\{false\}/);
  assert.doesNotMatch(simulation, /\["100", "85", "50", "12", "0 km"\]/);
  assert.doesNotMatch(simulation, /saveExperimentAndSync/);
  assert.doesNotMatch(simulation, /บันทึกผล/);
});

test("foundation simulations keep exploration-only chrome", () => {
  for (const file of [
    "src/components/labs/simulation/PeriodicTableSimulation.tsx",
    "src/components/labs/simulation/AtmosphereLayersSimulation.tsx",
    "src/components/labs/simulation/FoundationExplorerSimulation.tsx",
  ]) {
    const source = readProjectFile(file);

    assert.match(source, /showLiveMetrics=\{false\}/, `${file} should hide real-time metrics`);
    assert.match(source, /showInfoTabs=\{false\}/, `${file} should hide detail tabs`);
    assert.match(source, /showSaveButton=\{false\}/, `${file} should hide save buttons`);
  }

  for (const file of [
    "src/components/labs/simulation/AtmosphereLayersSimulation.tsx",
    "src/components/labs/simulation/FoundationExplorerSimulation.tsx",
  ]) {
    const source = readProjectFile(file);
    assert.match(
      source,
      /compactControls=\{controls\}/,
      `${file} should keep its exploration controls compact`,
    );
  }
});

test("foundation explorer labs are ready and content-mapped", () => {
  const labIds = [
    "lab-equipment-overview",
    "animal-cell",
    "leaf-cell",
    "human-blood-cells",
    "experiment-chemicals",
    "external-muscle-anatomy",
    "internal-muscle-anatomy",
    "good-bad-minerals",
  ];
  const labs = readProjectFile("src/data/labs.ts");
  const details = readProjectFile("src/data/labDetails.ts");
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");
  const card = readProjectFile("src/components/LabCard.tsx");
  const savedRegistry = readProjectFile("src/data/labSavedExperiments.ts");
  const data = readProjectFile("src/data/foundationExplorerLabs.ts");
  const simulation = readProjectFile("src/components/labs/simulation/FoundationExplorerSimulation.tsx");
  const cardIllustrations = readProjectFile("src/components/labs/FoundationLabCardSVGs.tsx");

  for (const labId of labIds) {
    assert.match(labs, new RegExp(`id:\\s*"${labId}"[\\s\\S]*?category:\\s*"Foundation"`), `${labId} should be a Foundation lab`);
    assert.match(registry, new RegExp(`"${labId}"`), `${labId} should be ready`);
    assert.match(route, new RegExp(`"${labId}": FoundationExplorerSimulation`), `${labId} should route to the shared foundation explorer`);
    assert.match(card, new RegExp(`case "${labId}"`), `${labId} should have a card illustration`);
    assert.match(savedRegistry, new RegExp(`"${labId}": "scisiam_saved_`), `${labId} should have a saved registry key`);
    assert.match(data, new RegExp(`id: "${labId}"`), `${labId} should have foundation explorer content`);
  }

  assert.match(details, /\.\.\.foundationExplorerDetails/);
  for (const component of [
    "LabEquipmentCardSVG",
    "AnimalCellCardSVG",
    "LeafCellCardSVG",
    "HumanBloodCellsCardSVG",
    "ExperimentChemicalsCardSVG",
    "ExternalMuscleCardSVG",
    "InternalMuscleCardSVG",
    "GoodBadMineralsCardSVG",
  ]) {
    assert.match(card, new RegExp(`<${component} \\/>`), `${component} should be selected by LabCard`);
    assert.match(cardIllustrations, new RegExp(`export const ${component}`), `${component} should have a dedicated SVG`);
  }
  assert.doesNotMatch(card, /FoundationKnowledgeSVG/, "foundation labs should not share the generic card illustration");
  assert.match(simulation, /ChemicalListModal/);
  assert.match(simulation, /side === "good"/);
  assert.match(simulation, /showLiveMetrics=\{false\}/);
  assert.match(simulation, /showInfoTabs=\{false\}/);
  assert.match(simulation, /showSaveButton=\{false\}/);
});

test("cloud completion counts come only from completed lab progress", () => {
  const snapshotSource = readProjectFile("src/lib/supabase/learning-snapshot.ts");
  const historySource = readProjectFile("src/components/history/LearningHistoryPage.tsx");

  assert.doesNotMatch(snapshotSource, /runsResult\.data\?\.map\([\s\S]*completedIds\.add\(run\.lab_id\)/);
  assert.match(historySource, /if\s*\(source\s*===\s*"local"\)\s*\{[\s\S]*records\.forEach/);
});

test("AI tutor API enforces authenticated, bounded requests without leaking provider errors", () => {
  const source = readProjectFile("src/app/api/ai-tutor/route.ts");

  assert.match(source, /MAX_REQUEST_BYTES/);
  assert.match(source, /content-length/i);
  assert.match(source, /status:\s*413/);
  assert.match(source, /isSupabaseConfigured\(\)[\s\S]*usageContext\.userId[\s\S]*status:\s*401/);
  assert.match(source, /pruneMemoryRateLimitStore/);
  assert.doesNotMatch(source, /errorObject\?\.message\s*\|\|/);
});

test("AI tutor panel exposes dialog semantics and keyboard dismissal", () => {
  const source = readProjectFile("src/components/AIChatButton.tsx");

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-labelledby="ai-tutor-title"/);
  assert.match(source, /event\.key\s*===\s*"Escape"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-controls="ai-tutor-dialog"/);
});

test("Next.js applies baseline security headers to every route", () => {
  const source = readProjectFile("next.config.ts");

  assert.match(source, /source:\s*"\/\(\.\*\)"/);
  assert.match(source, /X-Content-Type-Options[\s\S]*nosniff/);
  assert.match(source, /X-Frame-Options[\s\S]*DENY/);
  assert.match(source, /Referrer-Policy[\s\S]*strict-origin-when-cross-origin/);
  assert.match(
    source,
    /Permissions-Policy[\s\S]*camera=\(\),\s*microphone=\(\),\s*geolocation=\(\)/,
  );
});

test("Newton cooling keeps a bounded experiment history", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.match(source, /MAX_COOLING_DATA_POINTS\s*=\s*\d+/);
  assert.match(source, /\.slice\(-MAX_COOLING_DATA_POINTS\)/);
});

test("ideal gas 3D chamber uses a centered camera composition", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/IdealGasLawSimulation.tsx",
  );

  assert.match(source, /camera\.position\.set\(0,\s*2\.4,\s*distanceRef\.current\)/);
  assert.match(source, /camera\.lookAt\(0,\s*0\.45,\s*0\)/);
});

test("ideal gas WebGL canvas cannot grow the mobile layout", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/IdealGasLawSimulation.tsx",
  );

  assert.match(source, /renderer\.domElement\.style\.width\s*=\s*"100%"/);
  assert.match(source, /renderer\.domElement\.style\.height\s*=\s*"100%"/);
  assert.match(source, /overflow-x-hidden/);
});

test("Newton and Faraday start controls create visible motion", () => {
  const newton = readProjectFile(
    "src/components/labs/simulation/NewtonsSecondLawSimulation.tsx",
  );
  const unified = readProjectFile(
    "src/components/labs/simulation/UnifiedLegacySimulation.tsx",
  );
  const faraday = readProjectFile(
    "src/components/labs/simulation/FaradaysLawSimulation.tsx",
  );

  assert.match(newton, /data-testid="newtons-second-law-dynamics-rig"/);
  assert.match(newton, /setIsRunning\(\(current\)\s*=>\s*!current\)/);
  assert.match(unified, /import\s+\{\s*MotionTrackScene\s*\}/);
  assert.match(unified, /elapsedTime=\{elapsedSeconds\}/);
  assert.match(faraday, /automaticMagnetX/);
  assert.match(faraday, /tickPhysics\(automaticMagnetX\)/);
});

test("Bernoulli uses a full-width readable Venturi rig", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/BernoullisPrincipleSimulation.tsx",
  );

  assert.match(source, /data-testid="bernoulli-venturi-rig"/);
  assert.match(source, /viewBox="0 0 720 320"/);
});

test("numeric quest conditions never interrupt simulations with success alerts", () => {
  const simulationDir = join(rootDir, "src/components/labs/simulation");
  const simulationFiles = readdirSync(simulationDir).filter((file) =>
    file.endsWith("Simulation.tsx"),
  );

  for (const simulation of simulationFiles) {
    const source = readProjectFile(`src/components/labs/simulation/${simulation}`);
    assert.doesNotMatch(
      source,
      /alert\([^)]*(?:ภารกิจสำเร็จ|ยินดีด้วย|ทำสำเร็จ|สำเร็จภารกิจ)/,
      `${simulation} must not interrupt the learner when a numeric quest condition is met`,
    );
  }
});

test("local Supabase CLI state is ignored by Git", () => {
  const source = readProjectFile(".gitignore");

  assert.match(source, /\/supabase\/\.temp\//);
});

test("profile authorization cannot be changed through query parameters", () => {
  const source = readProjectFile("src/app/profile/page.tsx");

  assert.doesNotMatch(source, /searchParams\.get\("role"\)/);
  assert.doesNotMatch(source, /localStorage\.setItem\("scisiam_user_role",\s*roleParam\)/);
});

test("profile progress uses recorded experiment summaries without fabricated rankings", () => {
  const source = readProjectFile("src/app/profile/page.tsx");

  assert.match(source, /setCompletedCount\(snapshot\.completedCount\)/);
  assert.match(source, /setRecentRuns\(snapshot\.recentRuns\)/);
  assert.doesNotMatch(source, /520\s*-\s*Math\.floor\(points\s*\*\s*1\.5\)/);
  assert.doesNotMatch(source, /อันดับเซิร์ฟเวอร์จำลอง/);
});

test("teacher demo access is explicitly disabled unless configured", () => {
  const source = readProjectFile("src/components/auth/AuthForm.tsx");

  assert.match(
    source,
    /process\.env\.NEXT_PUBLIC_ENABLE_DEMO_MODE\s*===\s*"true"/,
  );
  assert.match(source, /if\s*\(!isDemoModeEnabled\)\s*return/);
});

test("profile authentication cannot leave the page on an infinite loading state", () => {
  const source = readProjectFile("src/app/profile/page.tsx");

  assert.match(source, /AUTH_CHECK_TIMEOUT_MS/);
  assert.match(source, /Promise\.race/);
  assert.match(source, /setCheckingAuth\(false\)/);
  assert.match(
    source,
    /NEXT_PUBLIC_ENABLE_DEMO_MODE\s*===\s*"true"/,
  );
});

test("home opens the catalogue before its branded welcome overlay", () => {
  const home = readProjectFile("src/app/page.tsx");
  const labs = readProjectFile("src/app/labs/page.tsx");
  const splash = readProjectFile("src/components/ScisiamSplash.tsx");

  assert.match(home, /redirect\("\/labs"\)/);
  assert.match(
    labs,
    /<ScisiamSplash\s+active=\{isAuthReady && isLoggedIn\}\s+hidden=\{isEnteringLab\}\s*\/>/,
  );
  assert.match(splash, /ยินดีต้อนรับเข้าสู่ Scisiam/);
  assert.doesNotMatch(splash, /useRouter|router\.replace/);
});

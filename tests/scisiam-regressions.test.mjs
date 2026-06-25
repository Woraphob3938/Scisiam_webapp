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

test("lab detail route delegates rendering to the shared detail layout", () => {
  const source = readProjectFile("src/app/labs/[id]/page.tsx");

  assert.match(
    source,
    /import LabDetailLayout from "@\/components\/labs\/LabDetailLayout"/
  );
  assert.match(source, /<LabDetailLayout\s+labId=\{labId\}/);
  assert.doesNotMatch(source, /const SAVED_EXPERIMENT_KEYS/);
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
  const readyLabIds = [
    ...directBlock.matchAll(/"([^"]+)"/g),
    ...chemistryBlock.matchAll(/"([^"]+)"/g),
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

test("lab detail sidebar derives guidance from shared lab data", () => {
  const source = readProjectFile("src/components/labs/LabSidebar.tsx");

  assert.match(source, /getLabDetails/);
  assert.match(source, /equipments/);
  assert.match(source, /steps/);
  assert.doesNotMatch(source, /const isOhmsLaw/);
  assert.doesNotMatch(source, /บันทึกข้อมูลและค่าอุณหภูมิอย่างสม่ำเสมอ/);
});

test("lab detail layout avoids a duplicate bottom start CTA", () => {
  const source = readProjectFile("src/components/labs/LabDetailLayout.tsx");

  assert.doesNotMatch(source, /FinalLabCta/);
  assert.doesNotMatch(source, /พร้อมเริ่มทดลอง/);
  assert.match(source, /<LabHero[\s\S]*onStartExperiment=\{handleStartExperiment\}/);
});

test("learning history has its own route and uses shared progress sources", () => {
  const pagePath = join(rootDir, "src/app/history/page.tsx");
  const componentPath = join(rootDir, "src/components/history/LearningHistoryPage.tsx");

  assert.equal(existsSync(pagePath), true, "history route should exist");
  assert.equal(existsSync(componentPath), true, "history page component should exist");

  const source = readProjectFile("src/components/history/LearningHistoryPage.tsx");
  assert.match(source, /loadSupabaseLearningSnapshot/);
  assert.match(source, /readLocalLearningSnapshot/);
  assert.match(source, /LAB_SAVED_EXPERIMENT_KEYS/);
  assert.doesNotMatch(source, /Math\.random/);
});

test("learning history is reachable from desktop and mobile navigation", () => {
  const sidebar = readProjectFile("src/components/Sidebar.tsx");
  const mobileTabBar = readProjectFile("src/components/MobileTabBar.tsx");
  const profile = readProjectFile("src/app/profile/page.tsx");

  assert.match(sidebar, /href: "\/history"/);
  assert.match(mobileTabBar, /href: "\/history"/);
  assert.match(mobileTabBar, /pathname === "\/history"/);
  assert.match(profile, /href="\/history"/);
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

test("local Supabase CLI state is ignored by Git", () => {
  const source = readProjectFile(".gitignore");

  assert.match(source, /\/supabase\/\.temp\//);
});

test("profile authorization cannot be changed through query parameters", () => {
  const source = readProjectFile("src/app/profile/page.tsx");

  assert.doesNotMatch(source, /searchParams\.get\("role"\)/);
  assert.doesNotMatch(source, /localStorage\.setItem\("scisiam_user_role",\s*roleParam\)/);
});

test("profile progress uses recorded lab ids without fabricated rankings", () => {
  const source = readProjectFile("src/app/profile/page.tsx");

  assert.match(source, /setCompletedLabIds\(snapshot\.completedLabIds\)/);
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

test("home progress uses the shared learning snapshot instead of counting storage keys", () => {
  const source = readProjectFile("src/app/page.tsx");

  assert.match(source, /readLocalLearningSnapshot/);
  assert.match(source, /loadSupabaseLearningSnapshot/);
  assert.doesNotMatch(source, /key\?\.startsWith\("scisiam_saved_"\)/);
});

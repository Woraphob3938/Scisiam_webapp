import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("global interactive UI is deferred until the authenticated device needs it", () => {
  const layout = readProjectFile("src/app/layout.tsx");
  const overlays = readProjectFile("src/components/GlobalClientOverlays.tsx");

  assert.match(layout, /import GlobalClientOverlays from "@\/components\/GlobalClientOverlays"/);
  assert.match(layout, /<GlobalClientOverlays \/>/);
  assert.doesNotMatch(layout, /import AIChatButton from "@\/components\/AIChatButton"/);
  assert.doesNotMatch(layout, /import MobileTabBar from "@\/components\/MobileTabBar"/);

  assert.match(overlays, /dynamic\(\(\) => import\("@\/components\/AIChatButton"\), \{ ssr: false \}\)/);
  assert.match(overlays, /dynamic\(\(\) => import\("@\/components\/MobileTabBar"\), \{ ssr: false \}\)/);
  assert.match(overlays, /const \{ isAuthReady, isLoggedIn \} = useAuth\(\)/);
  assert.match(overlays, /window\.matchMedia\("\(max-width: 1023px\)"\)/);
});

test("classroom launcher keeps the full lab picker out of the initial navigation bundle", () => {
  const launcher = readProjectFile("src/components/classrooms/ClassroomActionLauncher.tsx");
  const dialog = readProjectFile("src/components/classrooms/ClassroomActions.tsx");

  assert.match(launcher, /dynamic\(\(\) => import\("@\/components\/classrooms\/ClassroomActions"\)/);
  assert.match(launcher, /open && <ClassroomActions/);
  assert.doesNotMatch(launcher, /from "@\/data\/labs"/);

  assert.match(dialog, /from "@\/data\/labs"/);
  assert.match(dialog, /<Dialog open=\{open\} onOpenChange=\{handleOpenChange\}>/);
});

test("lab detail client components receive one lab record instead of importing every lab", () => {
  const detailPage = readProjectFile("src/app/labs/[id]/page.tsx");
  const detailLayout = readProjectFile("src/components/labs/LabDetailLayout.tsx");
  const hero = readProjectFile("src/components/labs/LabHero.tsx");

  assert.match(detailPage, /import LabHero from "@\/components\/labs\/LabHero"/);
  assert.match(detailPage, /<LabHero[\s\S]+simulationHref=\{`\/labs\/\$\{labId\}\/simulation`\}/);
  assert.match(detailLayout, /hero: React\.ReactNode/);
  assert.match(detailLayout, /\{hero\}/);
  assert.doesNotMatch(detailLayout, /import LabHero from "@\/components\/labs\/LabHero"/);
  assert.doesNotMatch(hero, /^"use client";/);
  assert.match(hero, /simulationHref: string/);
  assert.match(hero, /href=\{simulationHref\}/);

  for (const path of [
    "src/components/labs/EquipmentList.tsx",
    "src/components/labs/TheoryCard.tsx",
    "src/components/labs/ExperimentSteps.tsx",
    "src/components/labs/LabSidebar.tsx",
  ]) {
    const source = readProjectFile(path);
    assert.doesNotMatch(source, /import (?!type )[^;]+ from "@\/data\/labDetails"/, path);
  }

  assert.doesNotMatch(
    readProjectFile("src/components/labs/EquipmentList.tsx"),
    /from "@\/data\/labs"/,
  );
  assert.doesNotMatch(
    readProjectFile("src/components/labs/LabSidebar.tsx"),
    /from "@\/data\/labs"/,
  );
});

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

test("the always-visible AI I-Oon artwork is loaded eagerly at a bounded size", () => {
  const aiChat = readProjectFile("src/components/AIChatButton.tsx");

  assert.match(
    aiChat,
    /<Image[\s\S]*?src="\/ai-oon-logo\.png"[\s\S]*?alt=""[\s\S]*?width=\{64\}[\s\S]*?height=\{64\}[\s\S]*?loading="eager"[\s\S]*?className="object-contain"/,
  );
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

test("lab detail routes stay out of the simulation flow", () => {
  const detailPage = readProjectFile("src/app/labs/[id]/page.tsx");

  assert.match(detailPage, /redirect\("\/labs"\)/);
  assert.doesNotMatch(detailPage, /@\/components\/labs/);
  assert.doesNotMatch(detailPage, /@\/data\/labs/);

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

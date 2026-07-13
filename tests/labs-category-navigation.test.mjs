import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("labs page can still open a requested category directly", () => {
  const labsPage = readProjectFile("src/app/labs/page.tsx");

  assert.match(labsPage, /const requestedCategory = getRequestedCategory\(searchParams\)/);
  assert.match(
    labsPage,
    /\(\) => requestedCategory \?\? restoredState\?\.selectedCategory \?\? "All"/,
  );
  assert.match(
    labsPage,
    /\(\) => requestedCategory \? "All" : restoredState\?\.selectedGradeLevel \?\? "All"/,
  );
  assert.match(
    labsPage,
    /\(\) => requestedCategory \? "" : restoredState\?\.searchQuery \?\? ""/,
  );
});

test("typing a Thai lab keyword searches every category and grade", () => {
  const labsPage = readProjectFile("src/app/labs/page.tsx");
  const labSearch = readProjectFile("src/lib/lab-search.ts");

  assert.match(labsPage, /const searchLabs = searchQuery\.trim\(\) \? labsData : categoryLabs/);
  assert.match(labsPage, /matchesLabSearch\(lab, searchQuery\)/);
  assert.match(labSearch, /lab\.thaiTitle/);
  assert.match(labSearch, /lab\.id/);
  assert.match(
    labsPage,
    /if \(query\.trim\(\)\) \{\s*setSelectedCategory\("All"\);\s*setSelectedGradeLevel\("All"\);/s,
  );
});

test("lab detail and simulation pages do not render breadcrumbs", () => {
  const detailLayout = readProjectFile("src/components/labs/LabDetailLayout.tsx");
  const simulationDir = join(rootDir, "src/components/labs/simulation");

  assert.doesNotMatch(detailLayout, /import Breadcrumb|<Breadcrumb/);

  for (const file of readdirSync(simulationDir).filter((name) => name.endsWith(".tsx"))) {
    const source = readFileSync(join(simulationDir, file), "utf8");
    assert.doesNotMatch(source, /\/\*\s*Breadcrumb\s*\*\//, file);
    assert.doesNotMatch(source, />Simulator<\/span>/, file);
    assert.doesNotMatch(source, /href=\{`\/labs\?category=/, file);
  }
});

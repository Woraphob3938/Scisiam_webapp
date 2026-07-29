import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const labsPage = readFileSync(join(rootDir, "src/app/labs/page.tsx"), "utf8");

test("mobile lab discovery hides filters and ignores their hidden state", () => {
  assert.match(labsPage, /window\.matchMedia\("\(max-width: 639px\)"\)/);
  assert.match(labsPage, /mediaQuery\.addEventListener\("change", handleChange\)/);
  assert.match(labsPage, /mediaQuery\.removeEventListener\("change", handleChange\)/);
  assert.match(
    labsPage,
    /const effectiveCategory = isMobileDiscovery \? "All" : selectedCategory;/,
  );
  assert.match(
    labsPage,
    /const effectiveGradeLevel = isMobileDiscovery \? "All" : selectedGradeLevel;/,
  );
  assert.match(labsPage, /<div className="hidden sm:block">\s*<CategoryFilter/);
  assert.match(labsPage, /className="mb-4 hidden flex-wrap justify-center gap-2 sm:flex"/);
});

test("mobile search starts from the complete lab collection", () => {
  assert.match(
    labsPage,
    /const searchLabs = searchQuery\.trim\(\) \? labsData : categoryLabs;/,
  );
  assert.match(labsPage, /matchesLabSearch\(lab, searchQuery\)/);
});

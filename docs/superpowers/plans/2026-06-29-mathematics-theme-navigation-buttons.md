# Mathematics Theme And Navigation Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply one soft pink Mathematics identity across lab discovery, detail, and simulation surfaces, strengthen two existing navigation links, and publish the verified current project state to `main`.

**Architecture:** Reuse the existing category theme maps and shared lab components. Mathematics simulations resolve to the existing `rose` shell accent in one place; no provider, dependency, or new UI abstraction is introduced.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, lucide-react, Node test runner, Git.

---

## File Map

- Create `tests/mathematics-theme-ui.test.mjs`: regression checks for the Mathematics palette and navigation actions.
- Modify `src/components/CategoryFilter.tsx`: change the Mathematics filter from violet to rose.
- Modify `src/components/LabCard.tsx`: keep Mathematics surfaces light pink and remove the red gradient from its primary action.
- Modify `src/components/labs/LabHero.tsx`: use rose for Mathematics identity and promote the back-to-labs link.
- Modify `src/components/labs/simulation/SharedSimulationShell.tsx`: resolve all Mathematics simulations to rose and promote the detail link.

### Task 1: Lock The Shared UI Contract

**Files:**
- Create: `tests/mathematics-theme-ui.test.mjs`

- [ ] **Step 1: Write the failing regression test**

```js
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
  assert.match(shell, /const resolvedAccent = category === "Mathematics" \? "rose" : accent/);
  assert.match(shell, /accentClasses\[resolvedAccent\]/);
});

test("lab navigation links have visible button affordances", () => {
  const hero = readProjectFile("src/components/labs/LabHero.tsx");
  const shell = readProjectFile("src/components/labs/simulation/SharedSimulationShell.tsx");

  assert.match(hero, /href="\/labs"[\s\S]*?border-slate-200[\s\S]*?bg-white[\s\S]*?กลับไปหน้ารายชื่อห้องแล็บ/);
  assert.match(shell, /href=\{`\/labs\/\$\{labId\}`\}[\s\S]*?border[\s\S]*?bg-white[\s\S]*?รายละเอียดแล็บ/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/mathematics-theme-ui.test.mjs`

Expected: FAIL because Mathematics still uses `violet`/`indigo`, the card uses a red gradient, the shared shell does not resolve Mathematics centrally, and the links are text-only.

- [ ] **Step 3: Commit the test after the implementation passes in Task 2**

The test and implementation ship in one behavior commit so the branch never records a permanently failing test.

### Task 2: Apply The Minimal Shared Theme And Button Changes

**Files:**
- Modify: `src/components/CategoryFilter.tsx`
- Modify: `src/components/LabCard.tsx`
- Modify: `src/components/labs/LabHero.tsx`
- Modify: `src/components/labs/simulation/SharedSimulationShell.tsx`
- Test: `tests/mathematics-theme-ui.test.mjs`

- [ ] **Step 1: Change Mathematics filter tokens**

```ts
{ id: "Mathematics" as Category, name: "คณิตศาสตร์", icon: Calculator, color: "rose", imagePath: null },

rose: "border-rose-200 bg-rose-50/80 text-rose-700 shadow-sm shadow-rose-500/5",
```

- [ ] **Step 2: Keep Mathematics card actions pink rather than red**

Replace only the Mathematics `btnPrimary` value:

```ts
btnPrimary: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/10",
```

- [ ] **Step 3: Change Mathematics detail identity and back button**

```ts
const iconClass = isMathematics
  ? "bg-rose-600 shadow-rose-500/20"
  : isBiology
    ? "bg-emerald-600 shadow-emerald-500/20"
    : chemistryTone
      ? "bg-violet-600 shadow-violet-500/20"
      : "bg-blue-600 shadow-blue-500/20";
const badgeClass = isMathematics
  ? "bg-rose-50 text-rose-700 border-rose-100"
  : isBiology
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : chemistryTone
      ? "bg-violet-50 text-violet-700 border-violet-100"
      : "bg-blue-50 text-blue-700 border-blue-100";
```

Use this class on the existing `/labs` link:

```tsx
className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
```

- [ ] **Step 4: Resolve Mathematics simulation accent once and promote the detail link**

```ts
const resolvedAccent = category === "Mathematics" ? "rose" : accent;
const tone = accentClasses[resolvedAccent];
```

Use this class on the existing detail link:

```tsx
className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `node --test tests/mathematics-theme-ui.test.mjs`

Expected: 2 tests pass.

- [ ] **Step 6: Run focused lint**

Run:

```powershell
npx eslint src/components/CategoryFilter.tsx src/components/LabCard.tsx src/components/labs/LabHero.tsx src/components/labs/simulation/SharedSimulationShell.tsx tests/mathematics-theme-ui.test.mjs
```

Expected: exit code 0.

- [ ] **Step 7: Commit the UI behavior**

```powershell
git add -- src/components/CategoryFilter.tsx src/components/LabCard.tsx src/components/labs/LabHero.tsx src/components/labs/simulation/SharedSimulationShell.tsx tests/mathematics-theme-ui.test.mjs
git commit -m "feat: refresh mathematics theme and lab navigation"
```

### Task 3: Verify The Complete Current Project State

**Files:**
- Verify all intended source, migration, and test changes already present in the working tree.
- Exclude `graphify-out/`, `recovery_step_9.json`, `test_output.log`, and `test_output.txt`.

- [ ] **Step 1: Inspect desktop and mobile pages**

Inspect these routes at desktop and 390px mobile widths:

```text
http://localhost:3000/labs?category=Mathematics
http://localhost:3000/labs/graphing-lines
http://localhost:3000/labs/graphing-lines/simulation
```

Expected: Mathematics uses soft pink throughout; both navigation links look like buttons; no text overlap or horizontal page overflow.

- [ ] **Step 2: Run the full verification suite**

```powershell
npm test
npm run lint
npm run build
```

Expected: every command exits 0.

- [ ] **Step 3: Scan for committed secrets**

```powershell
rg --files-with-matches --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\s*="
```

Expected: no real secret values in tracked project files.

- [ ] **Step 4: Review publish scope**

```powershell
git status -sb
git diff --stat
git diff --check
```

Expected: source/tests/docs are intentional; generated and local-only artifacts remain untracked and unstaged.

### Task 4: Publish The Verified Work To Main

**Files:**
- Commit all remaining intended source/tests/docs.
- Do not stage the excluded local artifacts.

- [ ] **Step 1: Confirm GitHub access**

```powershell
gh --version
gh auth status
git fetch origin
```

Expected: GitHub CLI is installed and authenticated; fetch succeeds.

- [ ] **Step 2: Stage only intended project work**

```powershell
git add -- src/app src/components src/data src/lib tests package.json package-lock.json components.json
```

Do not use `git add -A` while excluded artifacts exist.

- [ ] **Step 3: Commit remaining project work**

```powershell
git commit -m "feat: expand SciSiam labs and authentication"
```

Expected: working tree contains only excluded untracked artifacts.

- [ ] **Step 4: Update local main and merge the feature branch**

```powershell
git switch main
git pull --ff-only origin main
git merge --no-ff codex/shadcn-radix -m "merge: publish SciSiam lab updates"
```

Expected: merge completes without conflicts.

- [ ] **Step 5: Push main and verify the remote commit**

```powershell
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Expected: local `HEAD` and remote `refs/heads/main` resolve to the same commit SHA.

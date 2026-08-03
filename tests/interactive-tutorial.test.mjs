import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const readMigration = (suffix) => {
  const files = readdirSync(new URL("../supabase/migrations/", import.meta.url)).filter(
    (name) => name.endsWith(suffix),
  );
  assert.equal(files.length, 1, `expected one migration ending with ${suffix}`);
  return read(`supabase/migrations/${files[0]}`);
};

test("tutorial catalog keeps role tours short and Newton action-driven", () => {
  const catalog = read("src/lib/tutorials/catalog.ts");

  assert.match(catalog, /general-student-v2/);
  assert.match(catalog, /general-teacher-v2/);
  assert.match(catalog, /newtons-cooling-v1/);
  assert.match(catalog, /studentSteps[\s\S]*data-tour="lab-search/);
  assert.match(catalog, /teacherSteps[\s\S]*data-tour="teacher-dashboard/);
  assert.match(catalog, /newtonSteps[\s\S]*newton\.initial-temperature\.changed/);
  assert.match(catalog, /newtonSteps[\s\S]*simulation\.started/);
  assert.match(catalog, /newtonSteps[\s\S]*simulation\.paused/);
  assert.match(catalog, /newtonSteps[\s\S]*simulation\.results-opened/);
  assert.match(catalog, /getAutoTutorialId/);
});

test("tutorial action events are scoped by tutorial and lab", () => {
  const events = read("src/lib/tutorials/events.ts");

  assert.match(events, /scisiam:tutorial-action/);
  assert.match(events, /detail\.tutorialId === tutorialId/);
  assert.match(events, /detail\.actionId === step\.actionId/);
  assert.match(events, /detail\.labId === step\.labId/);
  assert.match(events, /CustomEvent<TutorialActionDetail>/);
});

test("tutorial replay stores an exact tutorial id and session progress", () => {
  const source = read("src/lib/onboarding-tour.ts");

  assert.match(source, /requestTutorialReplay\(tutorialId: TutorialId\)/);
  assert.match(source, /peekTutorialReplay/);
  assert.match(source, /consumeTutorialReplay/);
  assert.match(source, /TutorialSessionState/);
  assert.match(source, /completedStepIds/);
  assert.match(source, /sessionStorage/);
});

test("tutorial progress migration is self-only and backfills the role-specific tour", () => {
  const migration = readMigration("_add_user_tutorial_progress.sql");

  assert.match(migration, /create table public\.user_tutorial_progress/);
  assert.match(migration, /primary key \(user_id, tutorial_id\)/);
  assert.match(migration, /status text not null check \(status in \('completed', 'skipped'\)\)/);
  assert.match(migration, /alter table public\.user_tutorial_progress enable row level security/);
  assert.match(migration, /grant select, insert, update on public\.user_tutorial_progress to authenticated/);
  assert.match(migration, /for select to authenticated[\s\S]*auth\.uid\(\)\) = user_id/);
  assert.match(migration, /for insert to authenticated[\s\S]*with check \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /for update to authenticated[\s\S]*using \(\(select auth\.uid\(\)\) = user_id\)[\s\S]*with check \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /when role = 'teacher' then 'general-teacher-v2'/);
  assert.match(migration, /else 'general-student-v2'/);
  assert.match(migration, /from public\.profiles/);
});

test("tutorial progress helper persists canonical status and keeps a per-user retry queue", () => {
  const helper = read("src/lib/supabase/tutorial-progress.ts");

  assert.match(helper, /loadTutorialStatus/);
  assert.match(helper, /persistTutorialStatus/);
  assert.match(helper, /flushPendingTutorialProgress/);
  assert.match(helper, /\.from\("user_tutorial_progress"\)/);
  assert.match(helper, /onConflict:\s*"user_id,tutorial_id"/);
  assert.match(helper, /scisiam-tutorial-pending:/);
  assert.match(helper, /isTutorialId/);
  assert.match(helper, /\.from\("profiles"\)[\s\S]*onboarding_completed:\s*true/);
});

test("database types expose writable tutorial progress rows", () => {
  const types = read("src/lib/supabase/database.types.ts");

  assert.match(types, /user_tutorial_progress:\s*\{/);
  assert.match(types, /status:\s*"completed" \| "skipped"/);
  assert.match(types, /tutorial_id:\s*string/);
  assert.match(types, /completed_at:\s*string \| null/);
  assert.match(types, /skipped_at:\s*string \| null/);
});

test("shared simulation shell exposes scoped tutorial targets and reports results", () => {
  const shell = read("src/components/labs/simulation/SharedSimulationShell.tsx");

  assert.match(shell, /tutorialId\?: TutorialId/);
  assert.match(shell, /data-tutorial-lab=\{tutorialId \? labId : undefined\}/);
  assert.match(shell, /data-tutorial=\{tutorialId \? `\$\{labId\}-run` : undefined\}/);
  assert.match(shell, /data-tutorial=\{tutorialId \? `\$\{labId\}-results` : undefined\}/);
  assert.match(shell, /data-tutorial=\{tutorialId \? `\$\{labId\}-results-save` : undefined\}/);
  assert.match(shell, /reportTutorialAction\(\{[\s\S]*actionId:\s*"simulation\.results-opened"/);
});

test("Newton tutorial actions come from real user controls and run state", () => {
  const newton = read("src/components/labs/simulation/NewtonsCoolingSimulation.tsx");

  assert.match(newton, /TUTORIAL_IDS\.newtonsCooling/);
  assert.match(newton, /handleInitialTemperatureChange/);
  assert.match(newton, /handleAmbientTemperatureChange/);
  assert.match(newton, /newton\.initial-temperature\.changed/);
  assert.match(newton, /newton\.ambient-temperature\.changed/);
  assert.match(newton, /nextIsRunning \? "simulation\.started" : "simulation\.paused"/);
  assert.match(newton, /tutorialTarget:\s*"newtons-cooling-initial-temperature"/);
  assert.match(newton, /tutorialTarget:\s*"newtons-cooling-ambient-temperature"/);
  assert.match(newton, /data-tutorial=\{control\.tutorialTarget\}/);
  assert.match(newton, /tutorialId=\{TUTORIAL_IDS\.newtonsCooling\}/);
  assert.match(newton, /runLabel=\{isRunning \? "หยุดชั่วคราว" : "เริ่มทดลอง"\}/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("navigation and profile no longer expose missions or rewards", () => {
  assert.doesNotMatch(read("src/components/Sidebar.tsx"), /\/missions|ภารกิจนักวิทย์/);
  assert.doesNotMatch(read("src/components/MobileTabBar.tsx"), /\/missions|ภารกิจ/);
  assert.doesNotMatch(read("src/app/profile/page.tsx"), /rewards|รางวัล|รางวัลที่ปลดล็อก/);
});

test("classroom owners can add an unused lab through a guarded RPC", () => {
  const client = read("src/lib/supabase/classrooms.ts");
  const types = read("src/lib/supabase/database.types.ts");
  const workspace = read("src/app/classrooms/[id]/page.tsx");
  const migration = read("supabase/migrations/20260712114647_add_classroom_labs.sql");

  assert.match(client, /export async function addClassroomLab/);
  assert.match(client, /rpc\("add_classroom_lab"/);
  assert.match(types, /add_classroom_lab:/);
  assert.match(migration, /private\.is_class_creator/i);
  assert.match(migration, /grant execute on function public\.add_classroom_lab/i);
  assert.match(workspace, /onAddLab/);
  assert.match(workspace, /type="search"/);
  assert.match(workspace, /setLabSearch/);
});

test("classroom submission action has an immediate loading state", () => {
  const source = read("src/components/classrooms/SimulationClassroomSubmission.tsx");

  assert.match(source, /กำลังเตรียมส่งงาน/);
  assert.match(source, /simulation-classroom-submission-slot/);
});

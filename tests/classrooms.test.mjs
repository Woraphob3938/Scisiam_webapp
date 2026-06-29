import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const migrations = path.join(root, "supabase", "migrations");

function classroomMigration() {
  const files = fs.readdirSync(migrations).filter((name) => name.endsWith("_classroom_system.sql"));
  assert.equal(files.length, 1, "expected exactly one classroom_system migration");
  return fs.readFileSync(path.join(migrations, files[0]), "utf8");
}

test("classroom migration keeps codes private and removes direct joining", () => {
  const sql = classroomMigration();
  assert.match(sql, /private\.classroom_join_codes/i);
  assert.match(sql, /drop column\s+code/i);
  assert.match(sql, /drop policy if exists "Users can join or teachers can add members" on public\.classroom_members;/i);
  assert.match(sql, /revoke\s+insert[\s\S]+classroom_members[\s\S]+authenticated/i);
});

test("classroom RPCs are authenticated and validate the caller", () => {
  const sql = classroomMigration();
  for (const name of ["create_classroom", "join_classroom", "get_classroom_join_code", "get_classroom_members"]) {
    assert.match(sql, new RegExp(`function public\\.${name}`, "i"));
  }
  assert.match(sql, /auth\.uid\(\)/i);
  assert.match(sql, /set search_path\s*=\s*''/i);
  assert.match(sql, /revoke execute[\s\S]+from public, anon/i);
  assert.match(sql, /grant execute[\s\S]+to authenticated/i);
});

test("classroom labs are ordered and membership-protected", () => {
  const sql = classroomMigration();
  assert.match(sql, /create table public\.classroom_labs/i);
  assert.match(sql, /primary key\s*\(classroom_id,\s*lab_id\)/i);
  assert.match(sql, /private\.is_class_member\(classroom_id\)/i);
});

test("classroom migration preserves legacy nullable grade levels", () => {
  const sql = classroomMigration();
  assert.doesNotMatch(sql, /alter table public\.classrooms alter column grade_level set not null;/i);
});

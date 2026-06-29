import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const migrations = path.join(root, "supabase", "migrations");

function classroomMigration() {
  const file = fs.readdirSync(migrations).find((name) => name.endsWith("_classroom_system.sql"));
  assert.ok(file, "classroom_system migration must exist");
  return fs.readFileSync(path.join(migrations, file), "utf8");
}

test("classroom migration keeps codes private and removes direct joining", () => {
  const sql = classroomMigration();
  assert.match(sql, /private\.classroom_join_codes/i);
  assert.match(sql, /drop column\s+code/i);
  assert.match(sql, /revoke\s+insert[\s\S]+classroom_members[\s\S]+authenticated/i);
  assert.doesNotMatch(sql, /Users can join or teachers can add members/i);
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

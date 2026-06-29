import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("student profile supports secure name and avatar updates", () => {
  const profile = read("src/app/profile/page.tsx");
  const snapshot = read("src/lib/supabase/learning-snapshot.ts");
  const types = read("src/lib/supabase/database.types.ts");
  const migration = read("supabase/migrations/20260629061447_add_profile_editing.sql");

  assert.match(profile, /rpc\("update_own_profile"/);
  assert.match(profile, /storage\.from\("profile-avatars"\)\.upload/);
  assert.match(profile, /type="file"/);
  assert.match(profile, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(snapshot, /select\("display_name, role, avatar_url"\)/);
  assert.match(types, /update_own_profile:/);

  assert.match(migration, /insert into storage\.buckets[\s\S]*?'profile-avatars'/i);
  assert.match(migration, /file_size_limit[\s\S]*?2097152/i);
  assert.match(migration, /storage\.foldername\(name\)[\s\S]*?auth\.uid\(\)/i);
  assert.match(migration, /create or replace function private\.update_own_profile_internal/i);
  assert.match(migration, /v_user_id\s+uuid\s*:=\s*auth\.uid\(\)/i);
  assert.match(migration, /char_length\(v_display_name\) > 80/i);
});

test("learning history filters keep compact layout and expose one action", () => {
  const history = read("src/components/history/LearningHistoryPage.tsx");

  assert.match(history, /<div className="grid gap-5 self-start">/);
  assert.doesNotMatch(history, /รายละเอียด/);
  assert.doesNotMatch(history, /<Activity/);
  assert.match(history, /ทดลองต่อ/);
});

test("profile View All control has primary button styling", () => {
  const profile = read("src/app/profile/page.tsx");

  assert.match(profile, /bg-blue-600[\s\S]{0,500}>ดูทั้งหมด<\/button>/);
});

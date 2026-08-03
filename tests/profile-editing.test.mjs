import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
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
  assert.match(snapshot, /select\("display_name, role, avatar_url, updated_at"\)/);
  assert.match(types, /update_own_profile:/);

  assert.match(migration, /insert into storage\.buckets[\s\S]*?'profile-avatars'/i);
  assert.match(migration, /file_size_limit[\s\S]*?2097152/i);
  assert.match(migration, /storage\.foldername\(name\)[\s\S]*?auth\.uid\(\)/i);
  assert.match(migration, /create or replace function private\.update_own_profile_internal/i);
  assert.match(migration, /v_user_id\s+uuid\s*:=\s*auth\.uid\(\)/i);
  assert.match(migration, /char_length\(v_display_name\) > 80/i);
});

test("students and teachers can remove their profile avatar as part of the edit draft", () => {
  const profile = read("src/app/profile/page.tsx");
  const types = read("src/lib/supabase/database.types.ts");
  const migrations = join(root, "supabase", "migrations");
  const removalMigrations = readdirSync(migrations).filter((name) => name.endsWith("_allow_profile_avatar_removal.sql"));

  assert.match(profile, /draftAvatarRemoved/);
  assert.match(profile, /ลบรูปโปรไฟล์/);
  assert.match(profile, /rpc\("remove_own_profile_avatar"\)/);
  assert.match(profile, /storage\.from\("profile-avatars"\)\.remove\(\[avatarPath\]\)/);
  assert.match(types, /remove_own_profile_avatar:/);
  assert.equal(removalMigrations.length, 1, "expected one profile avatar removal migration");
  const removalMigration = readFileSync(join(migrations, removalMigrations[0]), "utf8");
  assert.match(removalMigration, /for delete[\s\S]*?storage\.foldername\(name\)[\s\S]*?auth\.uid\(\)/i);
  assert.match(removalMigration, /create or replace function public\.remove_own_profile_avatar\(\)/i);
  assert.match(removalMigration, /auth\.uid\(\)/i);
  assert.match(removalMigration, /avatar_url = null/i);
});

test("profile avatar replacements use owner-scoped versioned storage paths", () => {
  const profile = read("src/app/profile/page.tsx");
  const avatarHelpers = read("src/lib/supabase/profile-avatar.ts");
  const migrations = join(root, "supabase", "migrations");
  const versionedPathMigrations = readdirSync(migrations).filter((name) =>
    name.endsWith("_use_versioned_profile_avatar_paths.sql"),
  );

  assert.match(avatarHelpers, /export function createProfileAvatarPath/);
  assert.match(avatarHelpers, /avatar-\$\{revision\}-\$\{nonce\}\.\$\{extension\}/);
  assert.match(profile, /nextAvatarPath !== avatarPath/);
  assert.equal(versionedPathMigrations.length, 1, "expected one versioned profile avatar path migration");
  const migration = readFileSync(join(migrations, versionedPathMigrations[0]), "utf8");
  assert.match(migration, /avatar-\[0-9\]\{13\}-\[a-z0-9\]\{8\}/i);
  assert.match(migration, /v_user_id::text \|\| '\/avatar-'/i);
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

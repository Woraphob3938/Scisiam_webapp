import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");

test("Navbar follows profile name and avatar updates", () => {
  const navbar = read("src", "components", "Navbar.tsx");
  const profile = read("src", "app", "profile", "page.tsx");

  assert.match(navbar, /select\("display_name, role, avatar_url"\)/);
  assert.match(navbar, /getProfileAvatarSrc/);
  assert.match(navbar, /src=\{profileAvatarSrc\}/);
  assert.match(profile, /saveProfile/);
  assert.match(profile, /dispatchEvent\(new Event\(SCISIAM_AUTH_EVENT\)\)/);
});

test("classroom members expose email and current profile avatar", () => {
  const client = read("src", "lib", "supabase", "classrooms.ts");
  const page = read("src", "app", "classrooms", "[id]", "page.tsx");
  const types = read("src", "lib", "supabase", "database.types.ts");

  assert.match(client, /email: member\.email/);
  assert.match(client, /avatarUpdatedAt: member\.avatar_updated_at/);
  assert.match(types, /avatar_updated_at: string/);
  assert.match(page, /member\.email/);
  assert.match(page, /getProfileAvatarSrc\(member\.avatarUrl, member\.avatarUpdatedAt\)/);
});

test("classroom member RPC shares profile details only through the guarded member function", () => {
  const files = fs
    .readdirSync(path.join(root, "supabase", "migrations"))
    .filter((name) => name.endsWith("_add_classroom_member_profile_details.sql"));

  assert.equal(files.length, 1, "expected one classroom member profile details migration");
  const sql = read("supabase", "migrations", files[0]);
  assert.match(sql, /email text/);
  assert.match(sql, /avatar_updated_at timestamptz/);
  assert.match(sql, /private\.is_class_member\(p_classroom_id\)/);
  assert.match(sql, /revoke execute[\s\S]+from public, anon/i);
  assert.match(sql, /grant execute[\s\S]+to authenticated/i);
});

test("AI I-Oon trigger has no green online dot", () => {
  const source = read("src", "components", "AIChatButton.tsx");
  assert.doesNotMatch(source, /bg-emerald-(?:400|500)/);
  assert.doesNotMatch(source, /animate-ping/);
});

test("profile edits are confirmed or canceled as one draft", () => {
  const source = read("src", "app", "profile", "page.tsx");

  assert.match(source, /isEditingProfile/);
  assert.match(source, /handleStartEditProfile/);
  assert.match(source, /handleCancelEditProfile/);
  assert.match(source, /saveProfile/);
  assert.match(source, /ยืนยัน/);
  assert.match(source, /ยกเลิก/);
  assert.match(source, /แก้ไขโปรไฟล์/);
  assert.doesNotMatch(source, /onChange=\{uploadAvatar\}/);
});

test("missions waits for the correct auth-scoped snapshot before rendering progress", () => {
  const source = read("src", "app", "missions", "page.tsx");

  assert.match(source, /loadingMissions/);
  assert.match(source, /auth\.getUser\(\)/);
  assert.match(source, /if\s*\(user\)\s*\{/);
  assert.match(source, /setLoadingMissions\(false\)/);
  assert.ok(
    source.indexOf("loadSupabaseLearningSnapshot") < source.indexOf("readLocalLearningSnapshot"),
    "Supabase users should not see local mission progress first",
  );
});

test("mobile category filter stays inside the viewport", () => {
  const source = read("src", "components", "CategoryFilter.tsx");

  assert.match(source, /max-w-\[calc\(100vw-1rem\)\]/);
  assert.match(source, /overflow-hidden/);
  assert.match(source, /min-w-0/);
});

test("navbar notifications do not reuse local lab keys for Supabase accounts", () => {
  const source = read("src", "components", "Navbar.tsx");

  assert.match(source, /localNotificationMode/);
  assert.match(source, /setLocalNotificationMode\(false\)/);
  assert.match(source, /if\s*\(!localNotificationMode\)\s*\{/);
  assert.match(source, /return;/);
});

test("mobile tab bar avoids server-client route mismatches", () => {
  const source = read("src", "components", "MobileTabBar.tsx");

  assert.match(source, /const \[mounted, setMounted\] = useState\(false\)/);
  assert.match(source, /setTimeout\(\(\) => setMounted\(true\), 0\)/);
  assert.match(source, /if \(!mounted\) return null/);
});

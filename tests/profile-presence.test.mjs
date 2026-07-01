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
  assert.ok(
    (profile.match(/dispatchEvent\(new Event\(SCISIAM_AUTH_EVENT\)\)/g) ?? []).length >= 2,
    "name and avatar saves must both notify shared navigation",
  );
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

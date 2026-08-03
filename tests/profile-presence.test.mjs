import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");

test("Navbar follows profile name and avatar updates", () => {
  const navbar = read("src", "components", "Navbar.tsx");
  const authProvider = read("src", "context", "AuthContext.tsx");
  const profile = read("src", "app", "profile", "page.tsx");

  assert.match(authProvider, /select\("display_name, role, avatar_url, updated_at"\)/);
  assert.match(navbar, /getProfileAvatarSrc/);
  assert.match(navbar, /src=\{profileAvatarSrc\}/);
  assert.match(profile, /saveProfile/);
  assert.match(profile, /cacheScisiamAuth\(\{/);
  assert.match(profile, /avatarUrl:\s*nextAvatarPath/);
});

test("profile avatar updates use a new cache identity and refresh after iOS resume", () => {
  const navbar = read("src", "components", "Navbar.tsx");
  const authProvider = read("src", "context", "AuthContext.tsx");
  const authCache = read("src", "lib", "supabase", "auth-cache.ts");
  const profile = read("src", "app", "profile", "page.tsx");

  assert.match(profile, /createProfileAvatarPath\(user\.id, draftAvatarFile\.type\)/);
  assert.match(profile, /cacheControl:\s*"31536000"/);
  assert.match(profile, /avatarVersion:\s*nextAvatarVersion/);
  assert.match(authCache, /SCISIAM_AUTH_AVATAR_VERSION_KEY/);
  assert.match(authProvider, /select\("display_name, role, avatar_url, updated_at"\)/);
  assert.match(authProvider, /window\.addEventListener\("pageshow", handleAppResume\)/);
  assert.match(authProvider, /document\.addEventListener\("visibilitychange", handleVisibilityChange\)/);
  assert.match(navbar, /<Image[\s\S]{0,300}src=\{profileAvatarSrc\}[\s\S]{0,300}unoptimized/);
});

test("navbar auth state persists across route navigation", () => {
  const layout = read("src", "app", "layout.tsx");
  const navbar = read("src", "components", "Navbar.tsx");
  const authProvider = read("src", "context", "AuthContext.tsx");

  assert.match(layout, /<AuthProvider>[\s\S]*?<SidebarProvider>/);
  assert.match(navbar, /useAuth\(\)/);
  assert.doesNotMatch(navbar, /auth\.getUser\(\)/);
  assert.doesNotMatch(navbar, /auth\.onAuthStateChange\(/);
  assert.match(authProvider, /auth\.getUser\(\)/);
  assert.match(
    authProvider,
    /const handleAuthUpdated = \(\) => \{[\s\S]*?loadAuthStateFromCache\(false\);[\s\S]*?void loadAuthState\(\);/,
  );
  assert.match(authProvider, /auth\.onAuthStateChange\(/);
});

test("auth provider contains Supabase network failures without clearing responsive UI state", () => {
  const authProvider = read("src", "context", "AuthContext.tsx");

  assert.match(authProvider, /try\s*\{[\s\S]*?auth\.getUser\(\)[\s\S]*?\}\s*catch/);
  assert.match(authProvider, /loadAuthStateFromCache\(false\)/);
  assert.match(authProvider, /window\.addEventListener\("online", handleAuthUpdated\)/);
  assert.match(authProvider, /window\.removeEventListener\("online", handleAuthUpdated\)/);
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
  assert.match(source, /text-xs/);
  assert.doesNotMatch(source, /text-\[11px\]/);
});

test("mobile navigation and common icon buttons meet the touch target baseline", () => {
  const mobileTabBar = read("src", "components", "MobileTabBar.tsx");
  const navbar = read("src", "components", "Navbar.tsx");
  const authForm = read("src", "components", "auth", "AuthForm.tsx");
  const labsPage = read("src", "app", "labs", "page.tsx");

  assert.match(mobileTabBar, /text-xs/);
  assert.match(navbar, /size-11/);
  assert.match(authForm, /className="min-h-11 text-xs/);
  assert.match(authForm, /className="absolute right-2 top-1\/2 grid h-11 w-11/);
  assert.match(authForm, /mx-auto inline-flex min-h-11 items-center justify-center/);
  assert.match(labsPage, /className={`min-h-11 rounded-xl border/);
});

test("navbar notifications do not reuse local lab keys for Supabase accounts", () => {
  const source = read("src", "components", "Navbar.tsx");
  const authProvider = read("src", "context", "AuthContext.tsx");
  const profile = read("src", "app", "profile", "page.tsx");

  assert.match(source, /localNotificationMode/);
  assert.match(authProvider, /isDemoModeEnabled[\s\S]*scisiam_demo_mode/);
  assert.match(authProvider, /localNotificationMode:\s*false/);
  assert.match(source, /loadClassroomNotificationsSafely/);
  assert.match(source, /if\s*\(!isAuthReady\s*\|\|\s*!isLoggedIn\s*\|\|\s*localNotificationMode\s*\|\|\s*!isSupabaseConfigured\(\)\)/);
  assert.doesNotMatch(source, /auth\.getSession\(\)/);
  assert.match(source, /if\s*\(role === "teacher"\)\s*\{[\s\S]*?setNotifications\(\[\]\)/);
  assert.match(profile, /if\s*\(storedRole !== "teacher"\)\s*\{[\s\S]*?readLocalLearningSnapshot/);
  assert.match(source, /listMyClassroomNotifications/);
  assert.match(source, /markClassroomNotificationsRead/);
  assert.match(source, /toNavbarClassroomNotification/);
  assert.match(source, /classroomId/);
  assert.match(source, /if\s*\(!localNotificationMode\)\s*\{/);
  assert.match(source, /void loadSupabaseNotifications\(\);/);
  assert.match(source, /window\.addEventListener\("focus", checkNotifications\)/);
  assert.match(source, /window\.setInterval\(checkNotifications, 30_000\)/);
  assert.match(source, /window\.clearInterval\(refreshIntervalId\)/);
  assert.match(source, /\[isAuthReady,\s*isLoggedIn,\s*localNotificationMode,\s*loadClassroomNotificationsSafely,\s*role\]/);
  assert.match(source, /unreadNotificationCount/);
  assert.match(source, /closeNotifications/);
  assert.match(source, /dismissNotification/);
  assert.match(source, /openClassroomNotification/);
  assert.match(source, /\?tab=classwork/);
  assert.match(source, /aria-label=\{`ลบแจ้งเตือน/);
  assert.match(source, /n\.type === "classroom"/);
  assert.match(source, /return;/);
});

test("mobile tab bar avoids server-client route mismatches", () => {
  const source = read("src", "components", "MobileTabBar.tsx");

  assert.match(source, /const \[mounted, setMounted\] = useState\(false\)/);
  assert.match(source, /setTimeout\(\(\) => setMounted\(true\), 0\)/);
  assert.match(source, /if \(!mounted\) return null/);
});

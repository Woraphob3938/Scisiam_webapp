> Historical implementation plan from 2026-06-29. Read the active documentation and current source code before reusing any step.

# SciSiam Classrooms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure responsive classroom system where authenticated students and teachers can create rooms with selected SciSiam labs, share a creator-only code, join rooms, and use Labs, Classwork, and People tabs.

**Architecture:** Reuse the empty classroom tables through one hardening migration, keep join codes in the private schema, and expose creation/join/member reads through narrow authenticated RPCs. The Next.js client uses one Supabase helper module, one shared dialog state machine for both navigation entry points, and two authenticated App Router pages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, existing shadcn/Radix components, lucide-react, Supabase Auth/Postgres/RLS, Node test runner.

## Global Constraints

- `src/data/labs.ts` remains the source of truth for all 103 lab records.
- Both `student` and `teacher` profiles may create and join classrooms.
- Join codes contain 5-8 uppercase alphanumeric characters; implementation generates 8-character codes.
- Only the creator may retrieve a classroom join code.
- Classwork remains an honest empty state; do not add assignment tables or controls.
- No new npm dependency.
- All database tables in `public` use RLS; all privileged RPCs check `auth.uid()`, set `search_path = ''`, revoke `PUBLIC`/`anon`, and grant only `authenticated`.
- Thai labels use normal letter spacing and comfortable line height.
- Verify mobile at 390px, tablet, and desktop.

---

## File Map

- Create `tests/classrooms.test.mjs`: static regression guards for schema security, routes, source-of-truth lab reuse, navigation placement, and classwork scope.
- Create the Supabase CLI-generated `supabase/migrations/*_classroom_system.sql`: normalize classroom ownership, private codes, selected labs, RLS, and RPCs.
- Modify `src/lib/supabase/database.types.ts`: add classroom table rows and RPC signatures.
- Create `src/lib/supabase/classrooms.ts`: typed client-side classroom reads and RPC wrappers.
- Create `src/components/classrooms/ClassroomActions.tsx`: desktop/mobile triggers, menu, create form, join form, lab picker, and creator code success state.
- Modify `src/components/Navbar.tsx`: place the desktop classroom action before notifications.
- Modify `src/components/MobileTabBar.tsx`: use five stable columns with the classroom action centered.
- Modify `src/components/Sidebar.tsx`: add persistent classroom navigation.
- Create `src/app/classrooms/page.tsx`: authenticated classroom list and empty state.
- Create `src/app/classrooms/[id]/page.tsx`: authenticated member workspace with Labs, Classwork, and People tabs.

---

### Task 1: Harden And Extend The Classroom Database

**Files:**
- Create: `tests/classrooms.test.mjs`
- Create: Supabase CLI output `supabase/migrations/*_classroom_system.sql`

**Interfaces:**
- Produces: `create_classroom(p_name text, p_grade_level text, p_description text, p_lab_ids text[]) -> jsonb`
- Produces: `join_classroom(p_code text) -> jsonb`
- Produces: `get_classroom_join_code(p_classroom_id uuid) -> text`
- Produces: `get_classroom_members(p_classroom_id uuid) -> table(...)`
- Produces: `public.classroom_labs(classroom_id uuid, lab_id text, position smallint)`

- [ ] **Step 1: Write the failing schema regression test**

Create `tests/classrooms.test.mjs` with Node's built-in test runner. Resolve the migration dynamically by suffix because the Supabase CLI owns the timestamp.

```js
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/classrooms.test.mjs`

Expected: FAIL with `classroom_system migration must exist`.

- [ ] **Step 3: Ask the Supabase CLI for the migration filename**

Run: `npx supabase migration new classroom_system`

Expected: one new empty file under `supabase/migrations/` ending in `_classroom_system.sql`.

- [ ] **Step 4: Implement the migration**

Write the generated migration with these exact operations, preserving existing rows if they appear between planning and execution:

```sql
create extension if not exists pgcrypto;

drop policy if exists "Teachers and members can read classrooms" on public.classrooms;
drop policy if exists "Teachers can create own classrooms" on public.classrooms;
drop policy if exists "Teachers can update own classrooms" on public.classrooms;
drop policy if exists "Teachers can delete own classrooms" on public.classrooms;
drop policy if exists "Members and teachers can read memberships" on public.classroom_members;
drop policy if exists "Users can join or teachers can add members" on public.classroom_members;
drop policy if exists "Members and teachers can update memberships" on public.classroom_members;
drop policy if exists "Members and teachers can delete memberships" on public.classroom_members;

alter table public.classrooms rename column teacher_id to creator_id;
alter table public.classrooms add column description text;
alter table public.classrooms add constraint classrooms_name_length
  check (char_length(btrim(name)) between 1 and 80);
alter table public.classrooms add constraint classrooms_description_length
  check (description is null or char_length(description) <= 500);
alter table public.classrooms add constraint classrooms_grade_level_allowed
  check (grade_level in ('ประถม', 'มัธยมต้น', 'มัธยมปลาย', 'อุดมศึกษา'));
alter table public.classrooms alter column grade_level set not null;

create table private.classroom_join_codes (
  classroom_id uuid primary key references public.classrooms(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z2-9]{5,8}$'),
  created_at timestamptz not null default now()
);

insert into private.classroom_join_codes (classroom_id, code)
select id, upper(translate(code, '01', 'GH')) from public.classrooms
on conflict (classroom_id) do nothing;

alter table public.classrooms drop constraint if exists classrooms_code_key;
alter table public.classrooms drop column code;

create table public.classroom_labs (
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  lab_id text not null check (lab_id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  position smallint not null check (position between 0 and 23),
  created_at timestamptz not null default now(),
  primary key (classroom_id, lab_id),
  unique (classroom_id, position)
);

create index classroom_labs_classroom_position_idx
  on public.classroom_labs (classroom_id, position);

alter table public.classroom_labs enable row level security;

insert into public.classroom_members (classroom_id, user_id, member_role)
select classrooms.id, classrooms.creator_id, profiles.role
from public.classrooms
join public.profiles on profiles.id = classrooms.creator_id
on conflict (classroom_id, user_id) do nothing;

create or replace function private.is_class_creator(target_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.classrooms
    where id = target_classroom_id and creator_id = (select auth.uid())
  );
$$;

create or replace function private.is_class_member(target_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.classroom_members
    where classroom_id = target_classroom_id and user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_class_creator(uuid) from public, anon;
revoke all on function private.is_class_member(uuid) from public, anon;
grant execute on function private.is_class_creator(uuid) to authenticated;
grant execute on function private.is_class_member(uuid) to authenticated;
drop function if exists private.is_class_teacher(uuid);

create policy "Members can read classrooms" on public.classrooms
for select to authenticated using (private.is_class_member(id));

create policy "Members can read classroom labs" on public.classroom_labs
for select to authenticated using (private.is_class_member(classroom_id));

create policy "Members can read memberships" on public.classroom_members
for select to authenticated using (private.is_class_member(classroom_id));

revoke insert, update, delete on public.classrooms from authenticated;
revoke insert, update, delete on public.classroom_members from authenticated;
revoke insert, update, delete on public.classroom_labs from authenticated;
grant select on public.classrooms, public.classroom_members, public.classroom_labs to authenticated;
```

Add the generator and four RPCs exactly as follows:

```sql
create or replace function private.generate_classroom_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  loop
    v_code := pg_catalog.upper(
      pg_catalog.substr(
        pg_catalog.translate(
          pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''),
          '01',
          'GH'
        ),
        1,
        8
      )
    );

    exit when not exists (
      select 1 from private.classroom_join_codes where code = v_code
    );
  end loop;

  return v_code;
end;
$$;

revoke all on function private.generate_classroom_code() from public, anon, authenticated;

create or replace function public.create_classroom(
  p_name text,
  p_grade_level text,
  p_description text,
  p_lab_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_role public.scisiam_user_role;
  v_name text := pg_catalog.btrim(pg_catalog.coalesce(p_name, ''));
  v_description text := pg_catalog.nullif(pg_catalog.btrim(pg_catalog.coalesce(p_description, '')), '');
  v_room_id uuid;
  v_code text;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select role into v_role from public.profiles where id = v_user_id;
  if v_role is null then
    raise exception 'Profile required' using errcode = '42501';
  end if;

  if pg_catalog.char_length(v_name) not between 1 and 80 then
    raise exception 'Classroom name must contain 1-80 characters' using errcode = '22023';
  end if;
  if p_grade_level not in ('ประถม', 'มัธยมต้น', 'มัธยมปลาย', 'อุดมศึกษา') then
    raise exception 'Invalid grade level' using errcode = '22023';
  end if;
  if v_description is not null and pg_catalog.char_length(v_description) > 500 then
    raise exception 'Description exceeds 500 characters' using errcode = '22023';
  end if;
  if p_lab_ids is null or pg_catalog.cardinality(p_lab_ids) not between 1 and 24 then
    raise exception 'Choose 1-24 labs' using errcode = '22023';
  end if;
  if exists (
    select 1 from pg_catalog.unnest(p_lab_ids) as selected(lab_id)
    where selected.lab_id !~ '^[a-z0-9][a-z0-9-]{0,99}$'
  ) then
    raise exception 'Invalid lab id' using errcode = '22023';
  end if;
  if pg_catalog.cardinality(p_lab_ids) <> (
    select pg_catalog.count(distinct selected.lab_id)
    from pg_catalog.unnest(p_lab_ids) as selected(lab_id)
  ) then
    raise exception 'Duplicate lab ids are not allowed' using errcode = '22023';
  end if;

  insert into public.classrooms (creator_id, name, grade_level, description)
  values (v_user_id, v_name, p_grade_level, v_description)
  returning id into v_room_id;

  v_code := private.generate_classroom_code();
  insert into private.classroom_join_codes (classroom_id, code)
  values (v_room_id, v_code);

  insert into public.classroom_members (classroom_id, user_id, member_role)
  values (v_room_id, v_user_id, v_role);

  insert into public.classroom_labs (classroom_id, lab_id, position)
  select v_room_id, selected.lab_id, (selected.ordinality - 1)::smallint
  from pg_catalog.unnest(p_lab_ids) with ordinality as selected(lab_id, ordinality);

  return pg_catalog.jsonb_build_object('classroom_id', v_room_id, 'code', v_code);
end;
$$;

create or replace function public.join_classroom(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_role public.scisiam_user_role;
  v_code text := pg_catalog.upper(
    pg_catalog.regexp_replace(pg_catalog.coalesce(p_code, ''), '\s', '', 'g')
  );
  v_room_id uuid;
  v_rows integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_code !~ '^[A-Z2-9]{5,8}$' then
    raise exception 'Invalid classroom code' using errcode = '22023';
  end if;

  select classrooms.id into v_room_id
  from private.classroom_join_codes
  join public.classrooms on classrooms.id = classroom_join_codes.classroom_id
  where classroom_join_codes.code = v_code and classrooms.is_active
  limit 1;

  if v_room_id is null then
    raise exception 'Classroom not found' using errcode = 'P0002';
  end if;

  select role into v_role from public.profiles where id = v_user_id;
  if v_role is null then
    raise exception 'Profile required' using errcode = '42501';
  end if;

  insert into public.classroom_members (classroom_id, user_id, member_role)
  values (v_room_id, v_user_id, v_role)
  on conflict (classroom_id, user_id) do nothing;
  get diagnostics v_rows = row_count;

  return pg_catalog.jsonb_build_object(
    'classroom_id', v_room_id,
    'joined', v_rows = 1
  );
end;
$$;

create or replace function public.get_classroom_join_code(p_classroom_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select classroom_join_codes.code
  from private.classroom_join_codes
  join public.classrooms on classrooms.id = classroom_join_codes.classroom_id
  where classrooms.id = p_classroom_id
    and classrooms.creator_id = (select auth.uid());
$$;

create or replace function public.get_classroom_members(p_classroom_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  role public.scisiam_user_role,
  is_creator boolean,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_class_member(p_classroom_id) then
    raise exception 'Classroom not found or access denied' using errcode = '42501';
  end if;

  return query
  select
    members.user_id,
    profiles.display_name,
    profiles.avatar_url,
    profiles.role,
    classrooms.creator_id = members.user_id,
    members.joined_at
  from public.classroom_members as members
  join public.profiles as profiles on profiles.id = members.user_id
  join public.classrooms as classrooms on classrooms.id = members.classroom_id
  where members.classroom_id = p_classroom_id
  order by (classrooms.creator_id = members.user_id) desc, members.joined_at asc;
end;
$$;

revoke execute on function public.create_classroom(text, text, text, text[]) from public, anon;
grant execute on function public.create_classroom(text, text, text, text[]) to authenticated;
revoke execute on function public.join_classroom(text) from public, anon;
grant execute on function public.join_classroom(text) to authenticated;
revoke execute on function public.get_classroom_join_code(uuid) from public, anon;
grant execute on function public.get_classroom_join_code(uuid) to authenticated;
revoke execute on function public.get_classroom_members(uuid) from public, anon;
grant execute on function public.get_classroom_members(uuid) to authenticated;
```

- [ ] **Step 5: Run the schema regression test**

Run: `node --test tests/classrooms.test.mjs`

Expected: all classroom schema tests PASS.

- [ ] **Step 6: Apply and verify the migration on the linked Supabase project**

Apply the complete SQL once through Supabase MCP `apply_migration` with project `ekcsbxirzsbdlemtfanf` and name `classroom_system`. Then query `information_schema.columns`, `pg_policies`, and `information_schema.routine_privileges` to verify:

- `classrooms.creator_id` and `classrooms.description` exist.
- `classrooms.code` is absent.
- `classroom_labs` has RLS enabled.
- authenticated has SELECT but no direct INSERT on all three public classroom tables.
- anon cannot execute any classroom RPC.

Expected: each assertion returns true.

- [ ] **Step 7: Run Supabase advisors**

Run security and performance advisors for `ekcsbxirzsbdlemtfanf`.

Expected: no new classroom warning. Record existing unrelated advisories separately.

- [ ] **Step 8: Commit the database slice**

```powershell
git add -- tests/classrooms.test.mjs supabase/migrations/*_classroom_system.sql
git commit -m "feat: secure classroom persistence"
```

---

### Task 2: Add Typed Classroom Client Operations

**Files:**
- Modify: `src/lib/supabase/database.types.ts`
- Create: `src/lib/supabase/classrooms.ts`
- Modify: `tests/classrooms.test.mjs`

**Interfaces:**
- Produces: `ClassroomSummary`, `ClassroomDetail`, `ClassroomMember`
- Produces: `listMyClassrooms()`, `getClassroom(id)`, `createClassroom(input)`, `joinClassroom(code)`, `getClassroomJoinCode(id)`, `getClassroomMembers(id)`

- [ ] **Step 1: Add failing client contract tests**

Append tests that read `src/lib/supabase/classrooms.ts` and assert these exported names, `labsById` validation, RPC calls, and absence of direct `.insert(` calls against classroom tables.

```js
test("classroom client uses RPC writes and the SciSiam lab catalog", () => {
  const source = fs.readFileSync(path.join(root, "src", "lib", "supabase", "classrooms.ts"), "utf8");
  for (const name of ["listMyClassrooms", "getClassroom", "createClassroom", "joinClassroom", "getClassroomJoinCode", "getClassroomMembers"]) {
    assert.match(source, new RegExp(`export\\s+(?:async\\s+)?function\\s+${name}`));
  }
  assert.match(source, /labsById/);
  assert.match(source, /rpc\("create_classroom"/);
  assert.match(source, /rpc\("join_classroom"/);
  assert.doesNotMatch(source, /from\("classroom_(?:members|labs)"\)\.insert/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/classrooms.test.mjs`

Expected: FAIL because `src/lib/supabase/classrooms.ts` does not exist.

- [ ] **Step 3: Extend generated-style database types**

Add `classrooms`, `classroom_members`, and `classroom_labs` under `Database.public.Tables`, including Row/Insert/Update shapes that match the migrated schema. Add function signatures:

```ts
create_classroom: {
  Args: { p_name: string; p_grade_level: string; p_description: string | null; p_lab_ids: string[] };
  Returns: Json;
};
join_classroom: { Args: { p_code: string }; Returns: Json };
get_classroom_join_code: { Args: { p_classroom_id: string }; Returns: string | null };
get_classroom_members: {
  Args: { p_classroom_id: string };
  Returns: Array<{
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    role: ScisiamUserRole;
    is_creator: boolean;
    joined_at: string;
  }>;
};
```

- [ ] **Step 4: Implement the client module**

Create these exact public types:

```ts
export type ClassroomSummary = {
  id: string;
  creatorId: string;
  name: string;
  description: string | null;
  gradeLevel: GradeLevel;
  isActive: boolean;
  createdAt: string;
  labIds: string[];
  memberCount: number;
  isCreator: boolean;
};

export type ClassroomDetail = ClassroomSummary;

export type ClassroomMember = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: ScisiamUserRole;
  isCreator: boolean;
  joinedAt: string;
};

export type CreateClassroomInput = {
  name: string;
  gradeLevel: GradeLevel;
  description: string;
  labIds: string[];
};
```

Use `createClient()` for all operations. `createClassroom` must trim input, reject unknown IDs with `labsById[id]`, reject duplicates, and call `create_classroom`. `joinClassroom` must normalize code before RPC. `listMyClassrooms` should select visible classrooms, then accessible labs and memberships with `.in("classroom_id", ids)`, and merge counts locally. `getClassroom` performs the same reads for one ID and throws a neutral `ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์เข้าถึง` error when no row is visible.

- [ ] **Step 5: Run focused tests and TypeScript checks**

Run: `node --test tests/classrooms.test.mjs`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: exit 0.

- [ ] **Step 6: Commit the client slice**

```powershell
git add -- src/lib/supabase/database.types.ts src/lib/supabase/classrooms.ts tests/classrooms.test.mjs
git commit -m "feat: add classroom data client"
```

---

### Task 3: Build The Shared Create And Join Experience

**Files:**
- Create: `src/components/classrooms/ClassroomActions.tsx`
- Modify: `tests/classrooms.test.mjs`

**Interfaces:**
- Consumes: `createClassroom`, `joinClassroom`, `labsData`, `GradeLevel`
- Produces: `<ClassroomActions placement="desktop" | "mobile" />`

- [ ] **Step 1: Add failing UI contract tests**

Assert the component contains Thai action labels, all form labels, the four grades, `labsData`, category/search controls, copy/share actions, and a single controlled `Dialog` state machine.

```js
test("classroom action dialog covers create and join flows", () => {
  const source = fs.readFileSync(path.join(root, "src", "components", "classrooms", "ClassroomActions.tsx"), "utf8");
  for (const label of ["เข้าร่วมห้อง", "สร้างห้อง", "ชื่อห้อง", "ชั้นปี", "เลือกแล็บ", "รายละเอียดเพิ่มเติม", "คัดลอกรหัส", "แชร์รหัส"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /labsData/);
  assert.match(source, /placement:\s*"desktop"\s*\|\s*"mobile"/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/classrooms.test.mjs`

Expected: FAIL because `ClassroomActions.tsx` does not exist.

- [ ] **Step 3: Implement one dialog state machine**

Use the existing `Dialog`, `Button`, and lucide icons. Define:

```ts
type ClassroomActionMode = "menu" | "create" | "join" | "created";
type ClassroomActionsProps = { placement: "desktop" | "mobile" };
```

The component must:

- Render a 40px desktop icon button and a stable 56px circular mobile button.
- Use one controlled Dialog; switching mode changes content without nesting dialogs.
- Redirect to `/login` when Supabase has no authenticated user.
- Preserve create values after RPC errors.
- Validate name 1-80, description <=500, 1-24 unique labs, and one of four grades.
- Search Thai title, English title, description, and category.
- Filter by category using compact segmented buttons.
- Use native checkboxes with visible selected count.
- Disable submit while busy and expose `aria-invalid`/`aria-describedby` for field errors.
- Normalize join code and set `autoCapitalize="characters"`, `autoComplete="off"`, and `spellCheck={false}`.
- On create success, show the returned code with copy and `navigator.share` support.
- On join success, call `router.push(`/classrooms/${classroomId}`)`.
- Reset to `menu` only after the dialog closes.

- [ ] **Step 4: Run focused tests and lint the component**

Run: `node --test tests/classrooms.test.mjs`

Expected: PASS.

Run: `npx eslint src/components/classrooms/ClassroomActions.tsx`

Expected: exit 0.

- [ ] **Step 5: Commit the action experience**

```powershell
git add -- src/components/classrooms/ClassroomActions.tsx tests/classrooms.test.mjs
git commit -m "feat: add classroom create and join dialogs"
```

---

### Task 4: Integrate Navigation And Classroom Listing

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/MobileTabBar.tsx`
- Modify: `src/components/Sidebar.tsx`
- Create: `src/app/classrooms/page.tsx`
- Modify: `tests/classrooms.test.mjs`

**Interfaces:**
- Consumes: `ClassroomActions`, `listMyClassrooms`
- Produces: discoverable `/classrooms` route on desktop and mobile

- [ ] **Step 1: Add failing navigation and list tests**

Add assertions that Navbar places `ClassroomActions` before the bell block, MobileTabBar uses five columns and a centered mobile action, Sidebar links to `/classrooms`, and the list route calls `listMyClassrooms`.

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/classrooms.test.mjs`

Expected: FAIL on missing navigation integration and route.

- [ ] **Step 3: Add desktop and mobile entry points**

- Import `ClassroomActions` in Navbar and render `<ClassroomActions placement="desktop" />` immediately before the notification container.
- Change MobileTabBar to five grid columns: Labs, Missions, `<ClassroomActions placement="mobile" />`, Classrooms, Profile. Update active-state logic for `/classrooms`.
- Add `{ name: "ชั้นเรียน", icon: UsersRound, href: "/classrooms" }` to Sidebar.
- Keep icon buttons at least 40px desktop and 44px mobile with visible focus rings.

- [ ] **Step 4: Implement the authenticated classroom list**

Create a client route following the existing Navbar/Sidebar shell. On mount:

1. Resolve Supabase `auth.getUser()` with the same 6-second timeout pattern used by Profile.
2. Redirect unauthenticated users to `/login?next=/classrooms`.
3. Call `listMyClassrooms()`.
4. Render loading skeletons, a retryable error state, an empty state with create/join actions, or responsive room cards.
5. Each card shows name, grade, lab/member counts, owner/member badge, optional description, and `เปิดห้อง` linking to `/classrooms/[id]`.

Do not add a marketing hero. Use a restrained header and scanning-first grid.

- [ ] **Step 5: Run focused tests and lint changed files**

Run: `node --test tests/classrooms.test.mjs`

Expected: PASS.

Run: `npx eslint src/components/Navbar.tsx src/components/MobileTabBar.tsx src/components/Sidebar.tsx src/app/classrooms/page.tsx`

Expected: exit 0.

- [ ] **Step 6: Commit navigation and list**

```powershell
git add -- src/components/Navbar.tsx src/components/MobileTabBar.tsx src/components/Sidebar.tsx src/app/classrooms/page.tsx tests/classrooms.test.mjs
git commit -m "feat: add classroom navigation and list"
```

---

### Task 5: Build The Classroom Workspace

**Files:**
- Create: `src/app/classrooms/[id]/page.tsx`
- Modify: `tests/classrooms.test.mjs`

**Interfaces:**
- Consumes: `getClassroom`, `getClassroomMembers`, `getClassroomJoinCode`, `labsById`
- Produces: member-only room page with `labs`, `classwork`, and `people` tabs

- [ ] **Step 1: Add failing workspace tests**

Assert the route uses all three client reads, resolves labs through `labsById`, includes the labels `ห้องแล็บ`, `งานของชั้นเรียน`, `บุคคล`, and includes the exact empty-state copy `ยังไม่มีงานของชั้นเรียน`.

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/classrooms.test.mjs`

Expected: FAIL because the room route does not exist.

- [ ] **Step 3: Implement authenticated room loading**

Use `useParams<{ id: string }>()`. Verify auth, then load the room and members together. Request the join code only when `room.isCreator` is true. Use a neutral unavailable state for missing/non-member rooms and never reveal whether another private room exists.

- [ ] **Step 4: Implement the workspace UI**

- Use Navbar/Sidebar and a constrained content width.
- Add a full-width blue header band with name, grade, description, member count, and lab count.
- Show creator-only code in a bordered utility strip with copy/share icon buttons and tooltips.
- Use the existing shadcn Tabs with three stable tabs.
- Labs tab maps `room.labIds.map((id) => labsById[id]).filter(Boolean)`, shows Thai title first, English title below, category/grade, and `เข้าห้อง` linking to `/labs/${lab.id}`.
- Classwork tab shows `ยังไม่มีงานของชั้นเรียน` and no creation control.
- People tab orders creator first and displays safe RPC fields only.
- Add loading, empty, retry, and unavailable states.
- Keep cards at 8px radius or the existing design token; do not nest cards.

- [ ] **Step 5: Run focused tests and lint the route**

Run: `node --test tests/classrooms.test.mjs`

Expected: PASS.

Run: `npx eslint "src/app/classrooms/[id]/page.tsx"`

Expected: exit 0.

- [ ] **Step 6: Commit the workspace**

```powershell
git add -- "src/app/classrooms/[id]/page.tsx" tests/classrooms.test.mjs
git commit -m "feat: add classroom workspace"
```

---

### Task 6: End-To-End Verification And Push

**Files:**
- Modify only files required by failures found in this task.

**Interfaces:**
- Consumes: complete classroom feature
- Produces: verified branch pushed to GitHub

- [ ] **Step 1: Verify real Supabase behavior**

Use two authenticated test users when available. Verify:

1. Student and teacher can each create a room.
2. The creator receives and can retrieve the 8-character code.
3. A second user gets null from `get_classroom_join_code`.
4. A second user cannot select the room before joining.
5. A valid code joins once; repeating it is idempotent.
6. Invalid codes fail without exposing room data.
7. Direct inserts into `classroom_members` and `classroom_labs` fail.

If two safe test users are unavailable, verify policies with transaction-scoped JWT claims in SQL and roll back all test rows.

- [ ] **Step 2: Run the full automated suite**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run lint`

Expected: 0 errors; report only pre-existing warnings.

- [ ] **Step 3: Run the production build safely**

Stop the SciSiam dev server before build so `.next` is not overwritten under a running `next dev` process.

Run: `npm run build`

Expected: exit 0 and routes `/classrooms` plus `/classrooms/[id]` appear in build output.

- [ ] **Step 4: Restart and verify browser behavior**

Restart `npm run dev`, then verify HTTP `/` redirects to `/labs`, `/labs` returns 200, and `/classrooms` does not return 404.

Use browser QA at 390x844, tablet, and 1440x900:

- Mobile `+` stays centered and tab items do not overflow.
- Desktop `+` appears beside the notification bell.
- Dialog focus, Escape, close, validation, loading, copy/share fallback, and focus return work.
- Create, join, classroom list, all three tabs, and lab links work.
- AI tutor and bottom navigation do not cover actions.
- Console has no errors or hydration warnings.

- [ ] **Step 5: Run security checks**

Run:

```powershell
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\s*="
```

Expected: no committed secret value.

Run Supabase security and performance advisors again.

Expected: no new classroom finding.

- [ ] **Step 6: Update the knowledge graph**

Run: `graphify update .`

Expected: successful AST update. Do not stage generated `graphify-out/` files.

- [ ] **Step 7: Review the final diff and commit any verification fixes**

Run:

```powershell
git diff --check
git status --short
```

Stage only classroom source, tests, migration, and docs. Do not stage `.superpowers/`, `graphify-out/`, recovery files, or test logs.

If verification created code fixes:

```powershell
git commit -m "fix: polish classroom experience"
```

- [ ] **Step 8: Push the feature branch**

Run: `git push -u origin codex/classrooms`

Expected: push succeeds and `git rev-list --left-right --count origin/codex/classrooms...codex/classrooms` returns `0 0`.

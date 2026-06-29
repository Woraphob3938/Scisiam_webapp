# SciSiam Classrooms Design

## Goal

Add a secure, responsive classroom flow where authenticated students and teachers can create rooms, select SciSiam labs, share a private join code, join other rooms, and open a room with Labs, Classwork, and People tabs.

## Scope

### Included

- A centered mobile `+` action in the bottom tab bar.
- A desktop `+` action beside notifications in the navbar.
- Create-room and join-room dialogs.
- A classroom list at `/classrooms`.
- A classroom workspace at `/classrooms/[id]`.
- Three room tabs: Labs, Classwork, and People.
- Supabase persistence, RLS, and authenticated RPCs.
- Creator-only join-code visibility with copy and native share actions.
- Responsive and keyboard-accessible states.

### Deferred

- Creating, assigning, submitting, grading, or scheduling classwork.
- Removing members, transferring ownership, archiving rooms, and regenerating codes.
- Classroom chat, announcements, and realtime presence.

The Classwork tab will show an honest empty state in this release.

## Existing System

SciSiam already has empty `classrooms` and `classroom_members` tables, but no classroom UI. The current schema is teacher-only, exposes the code as a classroom column, and permits authenticated users to insert their own membership without proving they know the join code. This release replaces that access path before exposing the feature.

`src/data/labs.ts` remains the source of truth for the 103 lab records. Classroom records store selected lab IDs and the UI resolves their metadata through `labsById`.

## Product Flow

1. An authenticated user opens the `+` menu from the desktop navbar or mobile tab bar.
2. The menu offers `เข้าร่วมห้อง` and `สร้างห้อง`.
3. Create opens a form for name, grade level, lab selection, and optional details.
4. A successful create transaction adds the creator as the first member and returns the new room ID and join code.
5. The success view lets the creator copy or share the code, then enter the room.
6. Join accepts a normalized code, validates it in a database RPC, adds the current user once, and opens the room.
7. `/classrooms` lists rooms the current user owns or has joined.
8. `/classrooms/[id]` exposes Labs, Classwork, and People. Only the creator sees the join-code panel.

Unauthenticated users are redirected to `/login`. Demo/offline identity does not create fake classroom data; it receives a sign-in requirement.

## Navigation

- Desktop navbar: icon-only `+` button immediately before the notification bell.
- Desktop sidebar: add `ชั้นเรียน` linking to `/classrooms` so rooms remain discoverable after creation.
- Mobile tab bar: five stable columns: Labs, Missions, centered `+`, Classrooms, Profile.
- The centered action is circular and elevated but does not resize the bar or cover page actions.

The same classroom action component owns both create and join dialogs so the flows cannot drift between desktop and mobile.

## Create Room UX

The create dialog uses a single-column form with visible labels:

- `ชื่อห้อง` required, 1-80 characters.
- `ชั้นปี` required, using the four existing SciSiam grade values.
- `เลือกแล็บ` required, 1-24 unique labs.
- `รายละเอียดเพิ่มเติม` optional, up to 500 characters.

Lab selection has search and category filters, then compact rows with the Thai title as primary text, English title as secondary text, category, grade, and checkbox state. A selected-count summary stays visible. The submit button has loading, disabled, and retry states.

## Join Room UX

The join dialog has one uppercase alphanumeric code field. Spaces are removed before submission. Errors distinguish invalid format, room not found/inactive, already joined, and network failure. Joining an existing membership is idempotent and opens the room instead of creating a duplicate.

## Classroom Pages

### Classroom List

`/classrooms` shows a calm work-focused header and responsive room cards. Each card includes room name, grade, member count, lab count, creator/member status, and an `เปิดห้อง` action. Empty state actions open create or join.

### Classroom Workspace

The room page uses a SciSiam blue header band with room name, grade, details, creator identity, and counts. The join-code panel appears only for the creator.

- Labs: selected lab cards with Thai title, smaller English title, subject/grade metadata, and `เข้าห้อง` linking to the lab detail page.
- Classwork: an empty state saying no classwork has been assigned yet.
- People: creator first, followed by members with avatar, display name, and student/teacher label.

Missing lab IDs are omitted with a small unavailable count instead of rendering unrelated content.

## Data Model

### `public.classrooms`

- Rename `teacher_id` to `creator_id` because either user role may create a room.
- Keep `name`, `grade_level`, `is_active`, timestamps.
- Add `description` with a 500-character check.
- Remove the public `code` column.

### `private.classroom_join_codes`

- `classroom_id` primary key and cascading foreign key.
- Unique normalized `code` between 5 and 8 uppercase alphanumeric characters.
- Not exposed through the Data API.

### `public.classroom_labs`

- Composite primary key `(classroom_id, lab_id)`.
- Stable `position` for creator-selected ordering.
- Lab IDs are application catalog identifiers; client validation uses `labsById`.

### `public.classroom_members`

- Keep unique `(classroom_id, user_id)`.
- The creator is inserted automatically.
- `member_role` snapshots the profile role for display.

No classwork table is added in this release.

## Database API

### `create_classroom`

An authenticated, tightly scoped `SECURITY DEFINER` RPC:

- Checks `auth.uid()` and an existing profile.
- Trims and validates all text and the lab array.
- Creates a unique 5-8 character code from an unambiguous uppercase alphabet.
- Inserts the room, private code, creator membership, and selected labs in one transaction.
- Returns only the created room ID and code.

### `join_classroom`

- Checks `auth.uid()` and normalizes the submitted code.
- Resolves only an active room from the private code table.
- Inserts one membership with `ON CONFLICT DO NOTHING`.
- Returns the room ID and whether the membership was newly created.

### `get_classroom_join_code`

- Returns the code only when `auth.uid()` is the room creator.
- Returns no row for members and non-members.

### `get_classroom_members`

- Checks that the caller belongs to the requested room.
- Returns only member ID, safe display name, avatar URL, role, creator flag, and join date.
- Does not expose profile email or unrelated profile fields.

All RPCs set an empty `search_path`, qualify relations, revoke execution from `PUBLIC` and `anon`, and grant only the intended authenticated execution.

## RLS And Grants

- Classrooms are readable only by their members.
- Classroom labs are readable only by room members.
- Memberships are readable only by users in the same room.
- Direct classroom, classroom-lab, and membership inserts are revoked from authenticated users; creation and joining go through RPCs.
- Other users' profile rows remain unreadable directly; the People tab uses the safe member-list RPC.
- Creator-only code storage remains in the private schema and is never selected directly by clients.
- Existing permissive classroom policies are dropped before new policies are added.

## Frontend Structure

- `ClassroomActions`: shared create/join state and dialog triggers.
- `CreateClassroomForm`: validated form and searchable lab picker.
- `JoinClassroomForm`: normalized code entry and error states.
- `src/lib/supabase/classrooms.ts`: typed classroom reads and RPC wrappers.
- `/classrooms`: authenticated room list.
- `/classrooms/[id]`: authenticated member-only workspace.

Existing shadcn/Radix primitives, lucide icons, `labsData`, `labsById`, Navbar, Sidebar, and MobileTabBar are reused. No new dependency is needed.

## Error Handling

- Preserve form values after recoverable failures.
- Disable duplicate submissions and show inline loading state.
- Use concise Thai recovery messages and a toast for successful copy/share/create/join operations.
- Treat an unauthorized or missing room as unavailable without leaking whether another private room exists.
- If clipboard or Web Share is unavailable, keep the code selectable and offer clipboard fallback where supported.

## Accessibility And Responsive Behavior

- Dialogs trap focus, close with Escape, return focus to their trigger, and expose a visible close control.
- Every input has a persistent label, associated error message, `aria-invalid`, and a visible focus ring.
- Mobile controls have at least a 44px touch target.
- The mobile layout is verified at 390px; the modal becomes a height-limited sheet with internal scrolling.
- The AI tutor and bottom navigation must not cover the dialog or room actions.
- Thai text uses normal letter spacing and comfortable line height.

## Verification

- Regression tests assert navigation placement, routes, lab-source reuse, and no direct membership insert from the client.
- Database checks cover creator code visibility, member code denial, create/join idempotency, non-member denial, and RLS table access.
- Browser QA covers create, copy/share, join, room tabs, lab links, keyboard focus, 390px mobile, tablet, and desktop.
- Run `npm test`, `npm run lint`, `npm run build`, secret scan, Supabase security/performance advisors, and `graphify update .` before push.

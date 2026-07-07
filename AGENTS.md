<!-- BEGIN:scisiam-agent-rules -->
# SciSiam Agent Guidelines

Working rules for coding agents that modify **SciSiam Virtual Lab**. Treat this as a real Thai-first educational product with a deployed web app and future PC/mobile packaging targets, not a disposable demo.

---

## 1. Project Identity

SciSiam is an interactive virtual science lab for Thai students and teachers. The product should feel clean, credible, and useful in real classrooms, not like a temporary demo.

Core product surfaces:

- 103 labs across Physics, Chemistry, Biology, Mathematics, and Foundation; all 103 are currently registered as ready simulations (61 direct, 6 shared chemistry-concept, 36 shared mathematics-concept).
- Lab detail pages with objectives, equipment, theory, steps, readiness, and start actions.
- Simulation pages where learners change variables, observe live results, review graphs/tables, and save experiment runs.
- Auth-first navigation: `/` redirects to `/login`; successful email login opens `/labs` and Google OAuth returns to `/profile` by default.
- AI ไออุ่น support through the authenticated server-side AI route.
- Profile editing, rewards, missions, learning history, and Supabase-backed experiment progress. Active scoring and points are intentionally disabled; legacy score columns remain only for schema compatibility.
- Shared classrooms for teachers and students, including invite codes, selected labs, member profiles, classroom assignments, and guarded owner actions.
- Future packaging targets for web, PC, and mobile distribution.

When choosing between a flashy feature and a reliable learning flow, prefer the reliable learning flow.

---

## 2. Technology Stack

- **Framework**: Next.js 16.2.6 App Router
- **React**: React 19.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 through `src/app/globals.css` and CSS variables
- **UI primitives**: Radix UI, shadcn components, `class-variance-authority`, `tailwind-merge`, and Sonner notifications
- **Icons**: `lucide-react`
- **Images**: `next/image` for app bitmap assets
- **Optional 3D**: `three`
- **AI API**: `src/app/api/ai-tutor/route.ts`
- **Data source**: `src/data/labs.ts` is the source of truth for lab metadata
- **Lab details**: `src/data/labDetails.ts`
- **Readiness**: `src/data/labReadiness.ts` and `src/data/labSimulationRegistry.ts`
- **Persistence**: Supabase for real user data, localStorage only for prototype/offline convenience

Do not add large frameworks or dependencies unless they clearly reduce complexity or are required for the web/PC/mobile targets.

---

## 3. Repository Map

- `src/app/page.tsx`: Redirects the site root to `/login`.
- `src/app/labs/page.tsx`: Lab listing, search, category, and grade-level filtering.
- `src/app/labs/[id]/page.tsx`: Lab detail route.
- `src/app/labs/[id]/simulation/page.tsx`: Simulation route selector by `labId`.
- `src/app/api/ai-tutor/route.ts`: Server route for SciSiam AI Tutor.
- `src/app/classrooms/page.tsx`: Authenticated classroom list with creator names.
- `src/app/classrooms/[id]/page.tsx`: Classroom workspace for labs, assignments, and members.
- `src/app/auth/*`: Email confirmation, recovery, and OAuth callback routes.
- `middleware.ts` + `src/lib/supabase/proxy.ts`: Refresh Supabase sessions and protect `/profile` and `/classrooms`.
- `src/components/LabCard.tsx`: Lab card UI and shared `LabData` type.
- `src/components/labs/*`: Lab detail components.
- `src/components/labs/simulation/*`: Simulation components and the shared `SharedSimulationShell`.
- `src/components/labs/simulation/AppliedMathSimulation.tsx`: Shared simulation engine for most Mathematics labs.
- `src/components/labs/simulation/UnifiedLegacySimulation.tsx`: Shared engine for legacy chemistry/physics labs (Boyle/Charles/Snell/ideal gas/second law/acid-base).
- `src/components/AIChatButton.tsx`: Floating AI tutor UI.
- `src/components/SettingsModal.tsx`: User-facing settings.
- `src/components/auth/*`: Login, register, and password-reset forms.
- `src/components/classrooms/ClassroomActions.tsx`: Create/join classroom dialog shared by desktop and mobile navigation.
- `src/components/profile/*`: Student profile and teacher dashboard surfaces.
- `src/context/SidebarContext.tsx`: Layout/sidebar state.
- `src/data/labs.ts`: Lab metadata for all 103 labs.
- `src/data/labDetails.ts`: Detail-page content.
- `src/data/labReadiness.ts`: Ready/coming-soon labels and helpers.
- `src/data/labSimulationRegistry.ts`: Authoritative registry of ready lab ids (direct, chemistry-concept, math-concept).
- `src/data/labSavedExperiments.ts`: localStorage keys used by the save flow for every ready lab.
- `src/lib/supabase/*`: Supabase clients, experiment sync, missions, and learning data helpers.
- `src/lib/supabase/classrooms.ts`: Classroom reads and owner/member RPC wrappers.
- `supabase/migrations/*`: Database migrations and RPC hardening.
- `tests/*.test.mjs`: Node regression tests.

Before adding a new component or data structure, look for an existing shared component or data model.

### Runtime Data Flow

- **Labs**: `labs.ts` → listing/detail routes → readiness registry → simulation selector. Unsupported ids must stop at a matching not-found/placeholder state.
- **Experiment saves**: simulation → `saveExperimentAndSync` → local offline copy when applicable + authenticated `save_experiment_run` RPC → `experiment_runs` and `lab_progress` → profile/history snapshots.
- **Profiles**: Supabase Auth session → `profiles`; avatar files use the `profile-avatars` Storage bucket and the profile row stores the resulting path.
- **Classrooms**: UI → `src/lib/supabase/classrooms.ts` → RLS-protected tables and SECURITY DEFINER RPCs. Owner status comes from `classrooms.creator_id`, never from a client-provided role flag.
- **AI ไออุ่น**: client → `/api/ai-tutor` → authenticated/rate-limited server route → Gemini. Usage telemetry stores bounded metadata only, never prompts, secrets, or provider payloads.

---

## 4. Prompt Optimizer Workflow

Use the Prompt Optimizer MCP before complex work that affects multiple parts of the project, especially:

- Project, security, performance, responsive UI, or deployment audits.
- Major redesigns such as auth, labs, simulations, classrooms, profile, or teacher dashboard surfaces.
- Architecture, shared data model, API, Supabase, or migration planning.
- Implementation plans that touch many routes/components or many labs.

Rules:

- If the user asks for planning or review first, summarize the optimized prompt before acting.
- If the user asks to implement immediately, use the optimized prompt to scope the work internally and continue.
- Prompt Optimizer must not override `AGENTS.md`, `DESIGN.md`, security rules, or the user's latest instruction.
- Skip Prompt Optimizer for small changes such as text, colors, one button, or a narrow bug fix.

---

## 5. Lab Content Rules

SciSiam has 103 labs in `labsData`; all 103 are registered as ready in `src/data/labSimulationRegistry.ts`. Never show content from the wrong lab.

- Do not fallback an unsupported lab to Newton cooling or any other unrelated lab.
- If a future lab is added before its simulation is complete, show a placeholder or disabled state that matches the requested lab.
- Detail content, equipment, theory, steps, hero imagery, and simulation visuals must match the lab name.
- Prefer data-driven/shared layout structures over long `if/else` trees. The simulation selector (`src/app/labs/[id]/simulation/page.tsx`) already favors the `simulationComponents` map; route new labs through the registry instead of adding more `if` branches.
- When adding or changing a lab, check both:
  - `/labs/[id]`
  - `/labs/[id]/simulation`
- Keep the three registries in sync: `labsData`, `labSimulationRegistry.ts` (readiness), and `labSavedExperiments.ts` (save keys). The regression suite asserts every ready lab has a save key.

If `src/app/labs/[id]/simulation/page.tsx` changes, verify unsupported labs are not routed to the wrong simulation.

---

## 6. Simulation UX And Logic Standards

Simulation pages should behave like interactive lab simulators, not static calculators.

Every meaningful simulation should provide:

- A visible experiment stage/viewport as the main focus.
- Controls that do not block the stage.
- Live values close to the experiment.
- Real-time visual feedback when variables change.
- At least one graph or table when the lab produces measurable data.
- Objectives, theory/formula, steps, tips, and mission/checkpoint context.
- Start/pause, reset, save/log data, and clear disabled/loading states when relevant.

Implementation rules:

- Store continuously changing simulation variables in `useRef` when possible.
- Use React state only for values that must render.
- Throttle live UI updates when a simulation ticks frequently.
- Clean up `setInterval`, `requestAnimationFrame`, timeouts, and listeners in `useEffect`.
- Use `useMemo` for graph points, table rows, derived metrics, SVG paths, or canvas coordinates.
- Limit history arrays so they cannot grow forever.
- Avoid heavy work in render paths.

For shared simulation shell changes, improve the shared layer before copying UI into individual labs.

---

## 7. AI Tutor And API Security

The AI tutor is important, but secrets must never ship to users.

- Never place API keys in client components, Electron/Tauri/Capacitor bundles, `main.js`, public assets, or committed files.
- Use `GEMINI_API_KEY` only on the server, such as `.env.local` in development or hosting environment variables.
- `.env.local` must never be committed.
- `.env.example` may contain placeholders only.
- Client UI must call a backend route such as `/api/ai-tutor`, not the provider directly.
- The AI route must validate input, cap message length/history, use timeouts, handle invalid JSON, and rate limit requests. The current implementation already enforces a Supabase session, a `check_ai_rate_limit` RPC with in-memory fallback, message/payload caps, a 15s abort timeout, and `labId` validation against `labsById`.
- Do not log secrets, authorization headers, or sensitive provider responses. Only latency, char counts, success, and error codes are written to `ai_usage_events`.
- AI answers should be scoped to the current `labId` when available and should clearly avoid pretending to be always correct.

For PC/mobile apps, assume the app bundle can be inspected. The app must not contain secrets.

---

## 8. Supabase, Auth, Classrooms, And Data Rules

Supabase is the canonical store for sessions, profiles, avatar storage, experiment runs, progress, missions/rewards, AI usage limits, classrooms, memberships, selected labs, and classroom assignments.

- Use helpers in `src/lib/supabase/*`; do not duplicate client creation or hand-roll session cookies.
- Client code may use only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Service-role/database secrets remain server-side and uncommitted.
- `middleware.ts` delegates to `src/lib/supabase/proxy.ts`; `/profile` and `/classrooms/**` require a valid Supabase claim and preserve the intended destination in `?next=`.
- Email registration always returns to login. Email confirmation and password recovery use token-hash pages: `/auth/verify` → POST `/auth/confirm` → `/login` or `/reset-password`.
- Google login uses `/auth/oauth-callback`, validates the relative `next` path, and requests account selection.
- `auth-cache.ts` mirrors display name/avatar/role and remembered email only for responsive UI. It is not authorization and must never unlock private data.
- Read `window`, `document`, and `localStorage` only in mounted client code. Authenticated history must come from Supabase, not another account's device-local runs.
- Active score/point mutation is disabled. Do not reintroduce score UI, trust client-provided scores, or treat legacy `total_points`, `score`, `points_awarded`, level, or XP columns as active product state.
- Authoritative experiment writes go through `save_experiment_run`; mission claims are server-derived and idempotent through `claim_mission_reward` but no longer award points.
- Apply schema changes through ordered files in `supabase/migrations/`. Use a new forward migration instead of editing an applied migration. Keep local filenames aligned with deployed migration history; regression tests assert that alignment.

### Classroom Authorization

- Teachers and students may create or join rooms. A room contains a name, grade level, description, 1-24 selected labs, an owner-only invite code, members, and assignments.
- Room members may read room labs, member profile details, creator name, and assignments through RLS/guarded RPCs.
- Only the creator may read the invite code, rename or disband the room, remove a non-owner member, or create an assignment. Enforce this with `private.is_class_creator` inside database RPCs, not only by hiding buttons.
- Disbanding sets `is_active = false` and invalidates the join code; it does not hard-delete classroom history.
- Never expose private join codes in list queries, client caches, logs, or public profile data.
- Any classroom schema/RPC change requires a migration, corresponding `database.types.ts` update, and regression coverage in `tests/classrooms.test.mjs` and/or `tests/classroom-workspace-ui.test.mjs`.

---

## 9. UI, UX, And Thai Typography

SciSiam should feel like a focused learning dashboard for Thai students: friendly, clean, and credible.

- Login/register: keep the auth form as the primary experience; `/` is not a marketing/home dashboard.
- Labs page: prioritize discovery, search, subject/grade filters, readiness summary, and readable Thai-first cards.
- Classroom workspace: keep labs, classwork, and members as clear tabs; owner-only destructive actions require confirmation and must remain usable on mobile.
- Lab detail: complete but not crowded; clear hierarchy; no unrelated decoration.
- Simulation: experiment first; controls and panels should support the task without covering key content.
- Avoid nested cards and decorative UI that has no job.
- Use `lucide-react` icons when an appropriate icon exists.
- Buttons need hover, disabled, loading, and focus states when applicable.
- Floating AI and mobile navigation must not cover primary actions.
- Test at least mobile 390px, tablet, and desktop.

Thai text guidance:

- Use comfortable line height such as `leading-relaxed` or `leading-[1.6]`.
- Avoid `tracking-tight` and `tracking-tighter` on Thai text.
- Use `break-words` or `[word-break:keep-all]` where long labels may overflow.
- Avoid `text-justify` for short Thai paragraphs.
- Keep the primary UI font aligned with `Prompt` and `Inter` in `globals.css`.

---

## 10. Performance And React/Next.js Rules

- Use Server Components by default when no interactivity is needed.
- Add `"use client"` only for state, effects, event handlers, or browser APIs.
- Avoid long prop drilling; use scoped context only when it reduces real complexity.
- Do not create new objects/arrays/functions in render and pass them into heavy children unless needed.
- Use `next/image` for bitmap assets and meaningful alt text.
- Dynamic routes must handle missing or invalid ids safely.
- Avoid importing a large library for a small UI or math task.
- Verify performance changes with lint/build and browser QA, not code inspection alone.

---

## 11. Deployment And Packaging Readiness

Current and future targets:

- **Web**: Next.js deployment on Vercel; the fallback canonical origin in `next.config.ts` is `https://scisiam-app.vercel.app`. The host must support route handlers, middleware, and server environment variables.
- **PC app**: Electron or Tauri later, with no bundled API secrets.
- **Mobile app**: Capacitor/PWA or native wrapper later, with AI calls routed through a backend.

Watch-outs:

- Static export cannot use built-in API routes; use a separate backend if static export becomes necessary.
- There is currently no committed `.github/workflows` CI pipeline. Do not claim GitHub Actions coverage unless a workflow is added and verified.
- Configure `NEXT_PUBLIC_SITE_URL`, Supabase redirect URLs, publishable credentials, `GEMINI_API_KEY`, and optional `GEMINI_MODEL` in the deployment environment.
- Do not commit build outputs such as `.next`, `dist`, screenshots, local package output, or generated QA folders.
- Before production deployment, run lint, build, regression tests, secret scan, and dependency review.
- In-memory rate limits are not enough for multi-instance production. Use Supabase, Redis, or another durable store.

---

## 12. Security Checklist

Before commit or push, scan for secrets:

```powershell
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\\s*="
```

Checklist:

- No `.env.local`, `.env`, private keys, or tokens in commits.
- No API key in client or public assets.
- API routes validate input and handle invalid JSON.
- Provider errors are safe to show.
- Old leaked keys are revoked/rotated before continuing.
- AI endpoint has rate limit and max output/token budget.

---

## 13. Verification Checklist

Run as appropriate after code changes:

```powershell
npm test
npm run lint
npm run build
```

For UI work, inspect at least:

- `/login` (and verify `/` redirects there)
- `/labs`
- `/labs/newtons-cooling`
- `/labs/newtons-cooling/simulation`
- The lab detail or simulation route that changed
- `/missions` and `/profile?tab=history` if progress, rewards, or missions changed; `/history` is only a redirect.
- `/profile` if progress, profile editing, auth, avatar storage, or localStorage mirrors changed.
- `/classrooms` and one `/classrooms/[id]` workspace for classroom, member, assignment, or navigation changes. Test both creator and ordinary-member permissions when possible.
- `/login`, `/register`, `/auth/verify`, and `/reset-password` if auth, email, redirect, or brand UI changed.

Check console errors, hydration warnings, layout overflow, mobile width around 390px, search/filter flows, enter-lab actions, save result actions, AI tutor interactions, and password-reset redirects.

---

## 14. Git Hygiene

- Do not revert user work without explicit permission.
- If the working tree is dirty, separate your changes from existing user changes.
- Use `codex/` for new agent-created branches unless the user requests another name. Treat `main` as the Vercel deployment branch when the connected project is configured that way.
- Commit or push only when the user asks. Before pushing `main`, confirm the intended files, current branch, remote, and required verification have succeeded.
- Do not commit build output, local environment files, generated screenshots, or tool caches.
- If `package-lock.json` changes, confirm it came from an intentional dependency change.
- Before handing off, summarize changed files, verification commands, and remaining warnings.

---

## 15. Current Priority Backlog

If the user gives no more specific direction, prioritize:

1. Keep all 103 labs aligned across metadata, detail content, readiness, routing, and save keys; preserve the anti-fallback regression guards.
2. Continue consolidating shared lab detail/simulation data models and replace remaining selector branches with registry-driven dispatch where practical.
3. Audit every ready simulation's save/log flow so authenticated runs use `saveExperimentAndSync` and history never leaks device-local data across accounts.
4. Extend classrooms without weakening database authorization: assignment lifecycle, lab-set editing, member workflows, and creator/member browser QA.
5. Harden AI ไออุ่น for multi-instance deployment, monitor the durable Supabase limiter, and rotate provider credentials before public launch.
6. Finish production auth operations: verified SMTP/custom Thai email templates, canonical redirects, Google consent verification, and recovery testing across devices.
7. Improve 390px mobile QA for tabs, dialogs, floating AI, navigation, and simulation controls.
8. Prepare packaging strategy for web, PC, and mobile. The Electron scaffold (`main.js`) exists; confirm no bundled secrets before any packaging build.

<!-- END:scisiam-agent-rules -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

# SciSiam Virtual Lab

> Interactive virtual science lab for Thai students and teachers — competition-ready today, production web/PC/mobile platform tomorrow.

SciSiam is built so learners explore science through **doing**, not just reading formulas. A student picks a lab, reviews objectives and equipment, adjusts variables in a live simulator, observes real-time results, reviews graphs and tables, saves experiment runs, and asks the **AI ไออุ่น** tutor for guided help — all in Thai-first UI.

---

## Highlights

- **103 labs** across Physics, Chemistry, Biology, Mathematics, and Foundation; every registered lab has a ready, topic-matched simulation route.
- Lab listing with search, subject filters, grade-level filters, and honest readiness labels.
- Lab detail pages with objectives, equipment, theory, steps, readiness, and start actions.
- Interactive simulation routes resolved by `labId` through a typed registry: 61 direct simulations, 6 shared chemistry-concept simulations, and 36 shared mathematics-concept simulations.
- Shared `SharedSimulationShell` for consistent simulator UX (stage, controls, live metrics, graph/table, theory, steps, save).
- AI ไออุ่น tutor through a hardened server-side API route (`/api/ai-tutor`).
- Profile editing, learning history, missions/rewards, and teacher-oriented progress surfaces. Gamification score and point mutation remain disabled.
- Supabase integration for auth, profiles, experiment runs, classrooms, assignment submissions and lab grading, notifications, learning snapshots, and AI rate limiting.
- Responsive UI tuned for desktop, tablet, and **390px mobile**.

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 + CSS variables |
| Icons | `lucide-react` |
| Backend / API | Next.js Route Handlers |
| AI provider | Google Gemini via `/api/ai-tutor` (server-only key) |
| Database / Auth | Supabase (`@supabase/ssr`, typed client) |
| Optional 3D | `three` |
| Tests | Node test runner |

---

## Project Structure

```text
src/app/page.tsx                            Redirects the root route to /login
src/app/labs/page.tsx                       Lab listing, search, filters
src/app/labs/[id]/page.tsx                  Lab detail route
src/app/labs/[id]/simulation/page.tsx       Simulation selector by labId
src/app/api/ai-tutor/route.ts               Server-side AI ไออุ่น route
src/app/auth/*                              Email confirmation, recovery, and OAuth callback routes
src/app/{login,register,reset-password}     Auth surfaces
src/app/{profile,dashboard,missions,history} Profile, teacher dashboard, and progress surfaces
src/app/classrooms/                         Classroom list and workspace routes
src/components/                             Shared UI components
src/components/labs/                        Lab detail components
src/components/labs/simulation/             Simulation components + SharedSimulationShell
src/data/labs.ts                            Source of truth for lab metadata (103 labs)
src/data/labDetails.ts                      Detail-page content
src/data/labSimulationRegistry.ts           Authoritative registry of ready lab ids
src/data/labReadiness.ts                    Readiness labels and helpers
src/data/labSavedExperiments.ts             localStorage keys for every ready lab
src/lib/supabase/                           Supabase clients + data helpers
supabase/migrations/                        Database migrations and RPCs
supabase/seed.sql                           Mission seed data
tests/                                      Node regression tests
```

Companion documents:

- `AGENTS.md` — working rules for coding agents
- `DESIGN.md` — design system and visual language
- `PRODUCT.md` — product vision and users
- `docs/README.md` — current documentation map and operational notes

---

## Getting Started

Install dependencies:

```bash
npm install
```

Create your environment file from the example:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
GEMINI_API_KEY=replace_with_your_server_side_gemini_key
GEMINI_MODEL=gemini-2.5-flash

NEXT_PUBLIC_SUPABASE_URL=replace_with_your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=replace_with_your_supabase_publishable_key
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
```

Run the development server:

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Serve the production build
npm run lint     # ESLint
npm test         # Node regression tests
```

For stricter linting:

```bash
npm run lint -- --max-warnings=0
```

---

## Supabase Setup

The project ships migrations for:

- user profiles (auto-created on signup via trigger)
- experiment run saving (RPC-hardened)
- missions and rewards (claim via RPC)
- AI usage analytics + rate-limit support
- classrooms, assignments, owned experiment-run submissions, teacher grading, notifications, and file-access hardening
- missing foreign-key indexes

Apply migrations to the target Supabase project before using the app as a real multi-user product. Seed mission data with `supabase/seed.sql` when needed.

**Client-side code must use the publishable Supabase key only.** Any service-role or secret key must stay server-side.

### Authentication redirect URLs

Add these URLs in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:

- `http://localhost:3000/auth/verify`
- `http://localhost:3000/auth/oauth-callback`
- The matching `/auth/verify` and `/auth/oauth-callback` paths on the canonical deployed origin

Email confirmation and recovery use `/auth/verify` → `POST /auth/confirm` → `/login` or `/reset-password`. Google OAuth returns through `/auth/oauth-callback`. Production password-reset email requires custom SMTP or a Supabase Send Email Hook; the default sender is suitable only for limited development testing.

---

## Windows Desktop (Tauri) / เดสก์ท็อป Windows (Tauri)

### Prerequisites / สิ่งที่ต้องมี

- Windows 10/11 x64 and Microsoft Edge WebView2 Runtime
- Rust stable MSVC `1.77.2+`
- Visual Studio Build Tools with the **Desktop development with C++** workload

On the verified Windows development machine, `rustc` and `cargo` resolve from `C:\Users\HP\.cargo\bin`, which is on `PATH`. If a new terminal cannot find Rust after installing Rustup, reopen the terminal so the PATH update takes effect.

### Supabase redirect / ตั้งค่า Supabase

**Operator action required / ผู้ดูแลต้องดำเนินการเอง:** This repository cannot confirm or change Supabase Dashboard settings. In Supabase Dashboard → Authentication → URL Configuration, keep the existing **Site URL** as:

`https://scisiam-app.vercel.app`

Then add this exact value under **Additional Redirect URLs** and save the configuration:

`scisiam://auth/callback`

No wildcard custom scheme is required. Google OAuth opens in the system browser and returns to the installed app through the registered `scisiam://` protocol.

The public compile-time desktop value `SCISIAM_SUPABASE_ORIGIN` must be a credential-free HTTPS root origin and **must be exactly equal** to `NEXT_PUBLIC_SUPABASE_URL`, including whether a trailing slash is present. Export both values before a desktop build; never include a path, query, fragment, username, or password:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://ekcsbxirzsbdlemtfanf.supabase.co"
$env:SCISIAM_SUPABASE_ORIGIN=$env:NEXT_PUBLIC_SUPABASE_URL
```

### Desktop commands / คำสั่งเดสก์ท็อป

```bash
npm run desktop:dev    # Starts Next.js and the Tauri development window
npm run desktop:check  # Checks the Rust desktop crate
npm run desktop:build  # Creates an unsigned development NSIS installer
```

The local build output at `src-tauri/target/release/bundle/nsis/Scisiam_<version>_x64-setup.exe` is an **unsigned development installer**. The installer UI uses Thai and the Windows app icon uses the AI I-Oon mascot. It is not production-signed and must not be described as a production installer.

### Distribution / การแจกให้ผู้ใช้อื่น

For a small trusted test group, send the generated `.exe` file directly or attach it to a private GitHub pre-release. Windows SmartScreen may show an unknown-publisher warning because the test installer is unsigned.

For a public release:

1. Build the NSIS installer with `npm run desktop:build`.
2. Sign and verify the exact `.exe` using the Authenticode steps below.
3. Generate and record its SHA-256 checksum.
4. Create a versioned GitHub Release and upload the signed installer.
5. Publish the checksum beside the download link so users can verify the file before installation.

Users only need Windows 10/11, an internet connection, and the installer. After installation, SciSiam opens the hosted web application inside the desktop window, so application updates normally deploy through Vercel without requiring a new installer. A new installer is required only when the Tauri wrapper, permissions, icon, protocol registration, or other native desktop behavior changes.

### Release security / ความปลอดภัยก่อนเผยแพร่

Never place `GEMINI_API_KEY`, Supabase service-role credentials, database passwords, or signing credentials in Tauri source or configuration. The desktop wrapper uses the hosted SciSiam backend for server-side secrets and API access.

Production distribution has a manual release gate: obtain the SciSiam Authenticode certificate from protected release storage, sign with SHA-256 and an RFC 3161 timestamp, and verify the signature. The certificate and its password must remain outside Git and outside the application bundle. From a release shell with the certificate available to SignTool, run:

```powershell
signtool sign /fd SHA256 /tr https://timestamp.digicert.com /td SHA256 /a "src-tauri/target/release/bundle/nsis/Scisiam_<version>_x64-setup.exe"
signtool verify /pa /v "src-tauri/target/release/bundle/nsis/Scisiam_<version>_x64-setup.exe"
```

Only a successful `signtool verify` result satisfies the signing gate. After verification, generate the publication digest from that exact signed file:

```powershell
Get-FileHash -LiteralPath "src-tauri/target/release/bundle/nsis/Scisiam_<version>_x64-setup.exe" -Algorithm SHA256
```

Publish the versioned installer filename and its exact SHA-256 value beside the release download. Recompute the hash after every signing or rebuild operation; never reuse the checksum of an unsigned or earlier artifact.

---

## AI ไออุ่น Security

The AI tutor is served through `src/app/api/ai-tutor/route.ts`.

Security posture (already implemented):

- `GEMINI_API_KEY` is used server-side only via the `x-goog-api-key` header.
- Requests require an authenticated Supabase session when Supabase is configured.
- Input is validated and capped (max 10 messages, 900 chars each, 16 KB payload).
- A 15s abort timeout prevents hanging requests.
- Rate limiting is keyed to the verified user through the `check_ai_rate_limit` RPC (12 requests / 60s), with an in-memory fallback only for availability during local or transient failures.
- `labId` is validated against `labsById`; the system prompt is scoped to the current lab.
- Only latency, char counts, success, and error codes are logged to `ai_usage_events` — never secrets, headers, or provider payloads.

Before any production go-live: rotate any key that may have leaked, switch to a durable multi-instance rate-limit store, and confirm the deployed environment variables.

---

## Lab Data Rules

- `src/data/labs.ts` is the source of truth for lab metadata (103 labs).
- A lab route must never show content from a different lab as a fallback.
- Readiness is governed by `src/data/labSimulationRegistry.ts` (direct, chemistry-concept, math-concept groups).
- Detail content, equipment, theory, steps, hero imagery, and simulation visuals must match the lab title.
- Future unregistered labs must show a matching placeholder or disabled state, never another lab's simulation.
- When adding or updating a lab, check both:
  - `/labs/[id]`
  - `/labs/[id]/simulation`
- Keep `labsData`, `labSimulationRegistry.ts`, and `labSavedExperiments.ts` in sync. The regression suite asserts that every ready lab has a save key.

---

## Simulation UX Standards

SciSiam simulations should feel like interactive learning tools:

- The experiment stage is the primary visual focus.
- Live values and mini-results stay close to the experiment.
- Controls are easy to reach and do not cover important content.
- Variable changes produce visible real-time feedback.
- Graphs/tables support analysis without distracting from the experiment.
- Theory, steps, hints, and mission goals are available but not crowded.
- Mobile screens around 390px must not overflow horizontally.

Implementation conventions are enforced in `AGENTS.md` §6: `useRef` for ticking values, `useMemo` for derived data, cleanup of timers/listeners, and bounded history arrays.

---

## Quality Checks

Before handing off major changes, run:

```bash
npm test
npm run lint
npm run build
```

For UI changes, manually inspect:

- `/`
- `/labs`
- `/labs/newtons-cooling`
- `/labs/newtons-cooling/simulation`
- `/missions`
- `/history`
- `/profile`
- `/dashboard`
- `/classrooms` and one classroom workspace
- `/login`, `/register`, `/reset-password`

Check mobile width around 390px, browser console errors, hydration warnings, layout overflow, search/filter behavior, enter-lab actions, save-result actions, AI tutor behavior, and password-reset redirects.

---

## Deployment And Packaging

**Web** — Deploy to a host that supports Next.js Route Handlers (e.g. Vercel). The AI route and Supabase server logic rely on a Node runtime.

**PC / Mobile (future)** — Electron, Tauri, Capacitor, PWA, or another wrapper. The packaged app must not include API secrets; AI calls must go through a backend controlled by SciSiam. An Electron scaffold exists at `main.js` for development.

> If the project ever switches to static export, the AI API route and Supabase server logic must move to a separate backend.

---

## Git Hygiene

Do not commit local or generated artifacts:

- `.env.local`, `.env`
- `.next/`, `dist/`, `node_modules/`
- `.playwright-cli/`, `qa-screenshots/`, `.agents/`, `.impeccable/`
- local screenshots, `test_output.*`, `recovery_step_*.json`, `tsconfig.tsbuildinfo`

Recommended secret scan before pushing:

```bash
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\\s*="
```

---

## Product Direction

SciSiam stays an **educational product first**: simple enough for students to use independently, structured enough for teachers to trust, and technically clean enough to deploy and package later.

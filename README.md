# SciSiam Virtual Lab

> Interactive virtual science lab for Thai students and teachers — competition-ready today, production web/PC/mobile platform tomorrow.

SciSiam is built so learners explore science through **doing**, not just reading formulas. A student picks a lab, reviews objectives and equipment, adjusts variables in a live simulator, observes real-time results, reviews graphs and tables, saves experiment runs, and asks the **AI ไออุ่น** tutor for guided help — all in Thai-first UI.

---

## Highlights

- **103 labs** across Physics, Chemistry, Biology, and Mathematics, plus a Foundation entry; **61** currently ship a ready interactive simulation.
- Lab listing with search, subject filters, grade-level filters, and honest readiness labels.
- Lab detail pages with objectives, equipment, theory, steps, readiness, and start actions.
- Interactive simulation routes resolved by `labId` through a typed registry — unsupported labs get a matching placeholder, never a wrong-lab fallback.
- Shared `SharedSimulationShell` for consistent simulator UX (stage, controls, live metrics, graph/table, theory, steps, save).
- AI ไออุ่น tutor through a hardened server-side API route (`/api/ai-tutor`).
- Profile, missions, points, learning history, and teacher-oriented progress surfaces.
- Supabase integration for auth, experiment runs, missions, rewards, learning snapshots, and durable rate limiting.
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
src/app/page.tsx                            Home dashboard
src/app/labs/page.tsx                       Lab listing, search, filters
src/app/labs/[id]/page.tsx                  Lab detail route
src/app/labs/[id]/simulation/page.tsx       Simulation selector by labId
src/app/api/ai-tutor/route.ts               Server-side AI ไออุ่น route
src/app/auth/*                              Supabase email auth + password reset
src/app/{login,register,reset-password}     Auth surfaces
src/app/{profile,missions,history}          Progress surfaces
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
- `docs/` — design notes and flow documentation

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
- progress and rewards hardening
- missing foreign-key indexes

Apply migrations to the target Supabase project before using the app as a real multi-user product. Seed mission data with `supabase/seed.sql` when needed.

**Client-side code must use the publishable Supabase key only.** Any service-role or secret key must stay server-side.

### Password recovery

Add these URLs in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:

- `http://localhost:3000/auth/callback`
- The `/auth/callback` path on the canonical deployed origin

The recovery flow is `/auth/callback` → `/reset-password`. Production password-reset email requires custom SMTP or a Supabase Send Email Hook; the default sender is suitable only for limited development testing.

---

## AI ไออุ่น Security

The AI tutor is served through `src/app/api/ai-tutor/route.ts`.

Security posture (already implemented):

- `GEMINI_API_KEY` is used server-side only via the `x-goog-api-key` header.
- Requests require an authenticated Supabase session when Supabase is configured.
- Input is validated and capped (max 10 messages, 900 chars each, 16 KB payload).
- A 15s abort timeout prevents hanging requests.
- Rate limiting uses the `check_ai_rate_limit` RPC with an in-memory fallback (12 req / 60s).
- `labId` is validated against `labsById`; the system prompt is scoped to the current lab.
- Only latency, char counts, success, and error codes are logged to `ai_usage_events` — never secrets, headers, or provider payloads.

Before any production go-live: rotate any key that may have leaked, switch to a durable multi-instance rate-limit store, and confirm the deployed environment variables.

---

## Lab Data Rules

- `src/data/labs.ts` is the source of truth for lab metadata (103 labs).
- A lab route must never show content from a different lab as a fallback.
- Readiness is governed by `src/data/labSimulationRegistry.ts` (direct, chemistry-concept, math-concept groups).
- Detail content, equipment, theory, steps, hero imagery, and simulation visuals must match the lab title.
- If a lab is not ready, show a matching placeholder or disabled state.
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

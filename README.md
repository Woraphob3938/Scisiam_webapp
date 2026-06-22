# SciSiam Virtual Lab

SciSiam is an interactive virtual science lab for Thai students and teachers. It is built as a competition-ready Next.js demo that can grow into a production web platform and later be packaged for PC and mobile use.

The product focuses on helping learners explore science through lab simulations, not just read formulas. Students can choose a lab, review objectives and equipment, adjust variables in a simulator, observe live results, save experiment runs, and ask the SciSiam AI Tutor for help.

## Highlights

- 36 virtual labs across Physics, Chemistry, and Biology.
- Lab listing with search, subject filters, grade-level filters, and readiness labels.
- Lab detail pages with objectives, equipment, theory, steps, readiness, and start actions.
- Interactive simulation routes by `labId`.
- Shared simulation shell for consistent simulator UX.
- AI Tutor through a server-side API route.
- Profile, missions, points, learning history, and teacher-oriented progress surfaces.
- Supabase integration for auth, experiment runs, missions, progress, and rate-limit support.
- Responsive UI for desktop, tablet, and mobile.

## Tech Stack

- **Framework**: Next.js 16 App Router
- **React**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: `lucide-react`
- **Backend/API**: Next.js route handlers
- **AI provider**: Gemini API through `/api/ai-tutor`
- **Database/Auth**: Supabase
- **Testing**: Node test runner for regression tests

## Project Structure

```text
src/app/page.tsx                         Home page
src/app/labs/page.tsx                    Lab listing, search, filters
src/app/labs/[id]/page.tsx               Lab detail route
src/app/labs/[id]/simulation/page.tsx    Simulation route selector
src/app/api/ai-tutor/route.ts            Server-side AI Tutor route
src/components/                          Shared UI components
src/components/labs/                     Lab detail components
src/components/labs/simulation/          Simulation components and shared shells
src/data/labs.ts                         Source of truth for lab metadata
src/data/labDetails.ts                   Detail-page content
src/data/labReadiness.ts                 Readiness labels and helpers
src/data/labSimulationRegistry.ts        Simulation readiness registry
src/lib/supabase/                        Supabase clients and data helpers
supabase/migrations/                     Database migrations and RPCs
supabase/seed.sql                        Mission seed data
tests/scisiam-regressions.test.mjs       Regression tests
```

Additional product and design documentation:

- `AGENTS.md`
- `DESIGN.md`
- `PRODUCT.md`
- `docs/`

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

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

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm test
npm run lint
npm run build
npm run dev
npm start
```

For stricter linting:

```bash
npm run lint -- --max-warnings=0
```

## Supabase Setup

The project includes Supabase migrations for:

- user/profile progress
- experiment run saving
- missions and rewards
- AI rate-limit support
- RPC hardening
- missing foreign-key indexes

Apply migrations to the target Supabase project before using the app as a real multi-user product. Seed mission data with `supabase/seed.sql` when needed.

Client-side code must use the publishable Supabase key only. Any secret or service-role key must stay server-side.

## AI Tutor Security

The AI tutor is served through `src/app/api/ai-tutor/route.ts`.

Security rules:

- Keep `GEMINI_API_KEY` server-side only.
- Never place AI provider keys in client components, public assets, Electron/Tauri/Capacitor bundles, or committed files.
- Client UI should call `/api/ai-tutor`, not Gemini directly.
- The route should validate input, cap message length/history, use timeouts, handle invalid JSON, and rate limit requests.
- Use durable rate limiting for production or multi-instance deployment.
- If a key leaks, revoke and rotate it before continuing.

## Lab Data Rules

- `src/data/labs.ts` is the source of truth for lab metadata.
- A lab route must never show content from a different lab as a fallback.
- Detail content, equipment, theory, steps, hero imagery, and simulation visuals should match the lab title.
- If a lab is not ready, show a matching placeholder or disabled state.
- When adding or updating a lab, check both:
  - `/labs/[id]`
  - `/labs/[id]/simulation`

## Simulation UX Standards

SciSiam simulations should feel like interactive learning tools:

- The experiment stage should be the primary visual focus.
- Live values and mini-results should stay close to the experiment.
- Controls should be easy to reach and should not cover important content.
- Variable changes should produce visible real-time feedback.
- Graphs/tables should support analysis, not distract from the experiment.
- Theory, steps, hints, and mission goals should be available but not crowded.
- Mobile screens around 390px must not overflow horizontally.

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
- `/login`
- `/register`

Check mobile width around 390px, browser console errors, hydration warnings, layout overflow, search/filter behavior, enter-lab actions, save-result actions, and AI tutor behavior.

## Deployment And Packaging Notes

Web deployment should use a host that supports Next.js route handlers, such as Vercel.

Future PC/mobile packaging can use Electron, Tauri, Capacitor, PWA, or another wrapper. The packaged app must not include API secrets. AI calls should go through a backend controlled by SciSiam.

If the project ever uses static export, the AI API route and Supabase server logic must move to a separate backend.

## Git Hygiene

Do not commit local or generated artifacts such as:

- `.env.local`
- `.env`
- `.next/`
- `dist/`
- `node_modules/`
- `.playwright-cli/`
- `qa-screenshots/`
- `.agents/`
- `.impeccable/`
- local screenshots or generated package outputs

Recommended secret scan before pushing:

```bash
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\\s*="
```

## Current Product Direction

SciSiam should remain an educational product first: simple enough for students to use, structured enough for teachers to trust, and technically clean enough to deploy and package later.

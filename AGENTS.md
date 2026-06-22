<!-- BEGIN:scisiam-agent-rules -->
# SciSiam Agent Guidelines

Working rules for coding agents that modify **SciSiam Virtual Lab**. Treat this project as a competition-ready educational product that can later become a web demo, PC app, and mobile learning app.

---

## 1. Project Identity

SciSiam is an interactive virtual science lab for Thai students and teachers. The product should feel clean, credible, and useful in real classrooms, not like a temporary demo.

Core product surfaces:

- 36 science labs across Physics, Chemistry, and Biology.
- Lab detail pages with objectives, equipment, theory, steps, readiness, and start actions.
- Simulation pages where learners change variables, observe live results, review graphs/tables, and save experiment runs.
- AI tutor support through the server-side AI route.
- Points, missions, learning history, profile, and teacher-oriented progress workflows.
- Future packaging targets for web, PC, and mobile distribution.

When choosing between a flashy feature and a reliable learning flow, prefer the reliable learning flow.

---

## 2. Technology Stack

- **Framework**: Next.js 16.2.6 App Router
- **React**: React 19.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 through `src/app/globals.css` and CSS variables
- **Icons**: `lucide-react`
- **Images**: `next/image` for app bitmap assets
- **AI API**: `src/app/api/ai-tutor/route.ts`
- **Data source**: `src/data/labs.ts` is the source of truth for lab metadata
- **Lab details**: `src/data/labDetails.ts`
- **Readiness**: `src/data/labReadiness.ts` and `src/data/labSimulationRegistry.ts`
- **Persistence**: Supabase for real user data, localStorage only for prototype/offline convenience

Do not add large frameworks or dependencies unless they clearly reduce complexity or are required for the web/PC/mobile targets.

---

## 3. Repository Map

- `src/app/page.tsx`: Home page and high-level entry point.
- `src/app/labs/page.tsx`: Lab listing, search, category, and grade-level filtering.
- `src/app/labs/[id]/page.tsx`: Lab detail route.
- `src/app/labs/[id]/simulation/page.tsx`: Simulation route selector by `labId`.
- `src/app/api/ai-tutor/route.ts`: Server route for SciSiam AI Tutor.
- `src/components/LabCard.tsx`: Lab card UI and shared `LabData` type.
- `src/components/labs/*`: Lab detail components.
- `src/components/labs/simulation/*`: Simulation components and shared simulation shell UI.
- `src/components/AIChatButton.tsx`: Floating AI tutor UI.
- `src/components/SettingsModal.tsx`: User-facing settings.
- `src/context/SidebarContext.tsx`: Layout/sidebar state.
- `src/data/labs.ts`: Lab metadata for all 36 labs.
- `src/data/labDetails.ts`: Detail-page content.
- `src/data/labReadiness.ts`: Ready/coming-soon labels and helpers.
- `src/lib/supabase/*`: Supabase clients, experiment sync, missions, and learning data helpers.
- `supabase/migrations/*`: Database migrations and RPC hardening.
- `tests/*.test.mjs`: Node regression tests.

Before adding a new component or data structure, look for an existing shared component or data model.

---

## 4. Prompt Optimizer Workflow

Use the Prompt Optimizer MCP before complex work that affects multiple parts of the project, especially:

- Project, security, performance, responsive UI, or deployment audits.
- Major redesigns such as the home page, lab detail pages, simulations, profile, or teacher dashboard.
- Architecture, shared data model, API, Supabase, or migration planning.
- Implementation plans that touch many routes/components or many labs.

Rules:

- If the user asks for planning or review first, summarize the optimized prompt before acting.
- If the user asks to implement immediately, use the optimized prompt to scope the work internally and continue.
- Prompt Optimizer must not override `AGENTS.md`, `DESIGN.md`, security rules, or the user's latest instruction.
- Skip Prompt Optimizer for small changes such as text, colors, one button, or a narrow bug fix.

---

## 5. Lab Content Rules

SciSiam has 36 labs in `labsData`. Never show content from the wrong lab.

- Do not fallback an unsupported lab to Newton cooling or any other unrelated lab.
- If a simulation is incomplete, show a placeholder or disabled state that matches the requested lab.
- Detail content, equipment, theory, steps, hero imagery, and simulation visuals must match the lab name.
- Prefer data-driven/shared layout structures over long `if/else` trees.
- When adding or changing a lab, check both:
  - `/labs/[id]`
  - `/labs/[id]/simulation`

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
- The AI route must validate input, cap message length/history, use timeouts, handle invalid JSON, and rate limit requests.
- Do not log secrets, authorization headers, or sensitive provider responses.
- AI answers should be scoped to the current `labId` when available and should clearly avoid pretending to be always correct.

For PC/mobile apps, assume the app bundle can be inspected. The app must not contain secrets.

---

## 8. Supabase, Auth, And Data Rules

Supabase is used for real user-facing data such as profiles, experiment runs, missions, rewards, learning snapshots, and rate-limit support.

- Use Supabase helpers in `src/lib/supabase/*` instead of duplicating client setup.
- Use publishable keys only on the client.
- Keep service-role or secret keys server-side only.
- Apply schema changes through migrations in `supabase/migrations/`.
- Prefer database/RPC checks for important scoring or progress operations.
- Treat localStorage as convenience data, not the source of truth for real points or classroom progress.
- When data is still mock/demo, label it clearly and do not present it as production state.
- Read browser APIs (`window`, `document`, `localStorage`) only after mount in client components.

Avoid making score/progress flows easy to exploit by repeated local saves.

---

## 9. UI, UX, And Thai Typography

SciSiam should feel like a focused learning dashboard for Thai students: friendly, clean, and credible.

- Home page: prioritize lab discovery, search, filters, and readable cards.
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

Targets:

- **Web demo**: Next.js deployment on Vercel or another host that supports route handlers.
- **PC app**: Electron or Tauri later, with no bundled API secrets.
- **Mobile app**: Capacitor/PWA or native wrapper later, with AI calls routed through a backend.

Watch-outs:

- Static export cannot use built-in API routes; use a separate backend if static export becomes necessary.
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

- `/`
- `/labs`
- `/labs/newtons-cooling`
- `/labs/newtons-cooling/simulation`
- The lab detail or simulation route that changed
- `/profile` if progress, points, auth, or localStorage changed
- `/login` and `/register` if auth or brand UI changed

Check console errors, hydration warnings, layout overflow, mobile width around 390px, search/filter flows, enter-lab actions, save result actions, and AI tutor interactions.

---

## 14. Git Hygiene

- Do not revert user work without explicit permission.
- If the working tree is dirty, separate your changes from existing user changes.
- Do not commit build output, local environment files, generated screenshots, or tool caches.
- If `package-lock.json` changes, confirm it came from an intentional dependency change.
- Before handing off, summarize changed files, verification commands, and remaining warnings.

---

## 15. Current Priority Backlog

If the user gives no more specific direction, prioritize:

1. Prevent wrong-lab fallback and keep all 36 labs aligned across detail/simulation routes.
2. Continue shared lab detail and simulation data models to reduce copy/paste.
3. Harden AI Tutor for deployable server-side use and durable rate limiting.
4. Make profile, points, progress, missions, and learning history reflect real data.
5. Complete save/log flows for each simulation.
6. Improve mobile QA for floating AI, navigation, and simulation panels.
7. Prepare packaging strategy for web, PC, and mobile targets.

<!-- END:scisiam-agent-rules -->

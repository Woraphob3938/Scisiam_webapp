---
name: deploy-readiness
description: Audit SciSiam readiness for web deploy, PC packaging, and mobile packaging. Checks secrets, env vars, build/lint, API routing, AI backend safety, localStorage limits, generated files, and package target risks.
---
# Deploy Readiness - SciSiam Web/PC/Mobile

Use before pushing, presenting, deploying, packaging Electron/Tauri, or wrapping with mobile/PWA tooling.

## Checks

1. Git hygiene: no accidental build output, screenshots, package artifacts, or unrelated lockfile changes.
2. Secret safety: no Gemini/OpenAI keys in source, `main.js`, public assets, screenshots, or `.env.example`.
3. Environment: `.env.local` only for dev; hosting uses Environment Variables.
4. AI Tutor: client calls backend only; backend owns provider key; timeout, rate limit, input caps, and safe error messages exist.
5. Build quality: `npm run lint` and `npm run build`.
6. Dependency risk: run `npm audit --omit=dev` and report unresolved advisories.
7. Target strategy:
   - Web: hosting must support Next.js route handlers if AI API is included.
   - PC: packaged app must not contain provider keys.
   - Mobile: app must call a production backend URL for AI.
8. Data readiness: localStorage-only score/progress is acceptable for prototype, not production trust.

## Useful Commands

```powershell
git status --short --branch
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\\s*="
npm run lint
npm run build
npm audit --omit=dev
```

## Report Format

- Findings first, ordered by severity.
- Include command results.
- Separate blockers from nice-to-have polish.
- State whether the app is ready for web demo, PC packaging, and mobile packaging independently.

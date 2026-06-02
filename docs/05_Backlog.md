---
title: SciSiam Backlog
tags:
  - scisiam
  - backlog
---

# SciSiam Backlog

## P0 - Blockers

- Rotate/revoke any API key that was ever exposed
- Ensure no API key exists in packaged app files
- Stop unsupported labs from silently showing Newton cooling content

## P1 - Before Competition Demo

- Make all 36 labs show correct detail content or a clear coming-soon state
- Fix save flow for simulations with unused `handleSaveResults`
- Make Profile data match real saved progress or mark clearly as placeholder
- Resolve mobile AI floating button overlap
- Clean git state before push/deploy

## P2 - Product Polish

- Build shared lab detail data model
- Build shared simulation shell for not-yet-custom labs
- Add stronger browser QA for mobile/tablet/desktop
- Improve accessibility for icon-only controls and focus states
- Add repeatable lab consistency audit

## P3 - Production Direction

- Move score/progress to backend/database if accounts matter
- Use production rate limit storage for AI Tutor
- Decide PC packaging route: Electron or Tauri
- Decide mobile route: Capacitor or PWA

## Related Notes

- [[01_Competition_Readiness]]
- [[03_AI_Tutor_Policy]]
- [[04_Deploy_PC_Mobile]]
- [[labs/00_Lab_Catalog]]


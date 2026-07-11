# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Implemented locally on 2026-07-10. The migration was applied to the linked project and code verification passed. Enabling Supabase leaked-password protection remains an operational dashboard task.

**Goal:** Prevent cross-student classroom file access, bound unlinked uploads, and harden OAuth, AI, and browser security controls.

**Architecture:** A forward-only Supabase migration moves classroom-file authorization into private, guarded helper functions. Client code cleans up unreferenced files after failed or replaced uploads. Route and header hardening stay in their existing Next.js modules.

**Tech Stack:** Next.js 16, TypeScript, Supabase Postgres/Storage RLS, Node test runner.

## Global Constraints

- Preserve teacher access to all room submissions and student access to active teacher assignment files.
- Never grant classroom-file access based only on membership.
- Keep all migration changes forward-only and apply only after regression tests pass.
- Do not expose secrets or service-role credentials to the browser.

### Task 1: Regression Coverage

**Files:**
- Create: `tests/security-hardening.test.mjs`

- [x] Write failing static regression checks for storage ownership, bounded staging files, OAuth relative redirects, authenticated AI rate limits, streaming request limits, and enforced CSP.
- [x] Run `npm test` and confirm the new checks fail before implementation.

### Task 2: Classroom File Authorization

**Files:**
- Create: `supabase/migrations/<timestamp>_harden_classroom_file_access.sql`
- Modify: `src/lib/supabase/classrooms.ts`

- [x] Create guarded private SQL helpers for read, upload, and deletion permissions.
- [x] Replace member-wide Storage reads with creator, owner, or active assignment access.
- [x] Limit unlinked uploads to ten files per member per classroom and allow deletion only after an object is unreferenced.
- [x] Validate supported file MIME types in Storage and the browser.
- [x] Clean up replaced and deleted assignment files after their database reference is removed.

### Task 3: Route And Header Hardening

**Files:**
- Modify: `src/app/auth/oauth-callback/route.ts`
- Modify: `src/app/api/ai-tutor/route.ts`
- Modify: `next.config.ts`

- [x] Reject redirect values that resolve to a different origin, including backslash paths.
- [x] Key authenticated AI limits by the verified user id and read request streams with a real byte cap.
- [x] Enforce CSP in production, remove the direct Gemini browser origin, and restrict image sources to configured origins.

### Task 4: Verification And Operational Follow-Up

- [x] Apply the migration to the linked Supabase project.
- [x] Run Supabase security/performance advisors, `npm test`, `npm run lint`, `npm run build`, and the secret scan.
- [ ] Enable Supabase Auth leaked-password protection in the dashboard because it is not migration-configurable.

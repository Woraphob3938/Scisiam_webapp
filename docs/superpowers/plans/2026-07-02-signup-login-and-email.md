# Signup Login Redirect And Thai Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redirect successful email registrations to Login with a Thai confirmation notice and add a ready-to-install Thai SciSiam confirmation-email template.

**Architecture:** Keep Supabase Auth as the source of truth and preserve the existing `/auth/verify` token-hash flow. Handle the post-signup state through a narrow `registered=success` query parameter, while storing the hosted email HTML as a standalone template that can later be pasted into Supabase when Custom SMTP is configured.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Supabase Auth, Node test runner, HTML email.

## Global Constraints

- Preserve `/auth/verify` as the signup email redirect target.
- Do not add dependencies or expose Supabase secrets.
- Do not claim the hosted sender name has changed until Custom SMTP is configured.
- Keep all new user-facing copy in clear Thai suitable for SciSiam.

---

### Task 1: Redirect Successful Registrations To Login

**Files:**
- Modify: `tests/password-recovery.test.mjs`
- Modify: `src/components/auth/AuthForm.tsx`
- Modify: `src/app/login/page.tsx`

**Interfaces:**
- Consumes: Supabase `signUp` result `{ user, session }` and existing `emailRedirectTo`.
- Produces: `/login?registered=success` and `initialNotice` text for `AuthForm`.

- [ ] **Step 1: Add a failing regression assertion**

Extend the existing email-signup test with:

```js
assert.match(authForm, /router\.replace\("\/login\?registered=success"\)/);
assert.match(loginPage, /registered === "success"/);
assert.match(loginPage, /สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี/);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test tests/password-recovery.test.mjs`

Expected: the email-signup test fails because the registration redirect and query handling do not exist yet.

- [ ] **Step 3: Implement the successful-registration redirect**

In the registration branch of `AuthForm`, keep current validation and `signUp`. After confirming `data.user` exists:

```ts
if (data.session) {
  await ensureProfile({
    userId: data.user.id,
    displayName: fullName.trim(),
  });
  await supabase.auth.signOut();
}

setLoading(false);
router.replace("/login?registered=success");
router.refresh();
return;
```

Remove the current registration success error and prevent successful registration from falling through to the home-page redirect.

- [ ] **Step 4: Render the Thai Login notice**

Extend the Login page search parameter type and notice priority:

```ts
searchParams: Promise<{
  confirmed?: string;
  oauth?: string;
  registered?: string;
  reset?: string;
}>;
```

Use this notice for `registered === "success"`:

```ts
"สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี"
```

- [ ] **Step 5: Run the focused test and lint**

Run: `node --test tests/password-recovery.test.mjs`

Expected: all password recovery and signup tests pass.

Run: `npx eslint src/components/auth/AuthForm.tsx src/app/login/page.tsx`

Expected: exit code 0 with no warnings in these files.

### Task 2: Add The Thai SciSiam Confirmation Email

**Files:**
- Create: `supabase/templates/confirmation.html`
- Modify: `tests/password-recovery.test.mjs`

**Interfaces:**
- Consumes: Supabase template variable `{{ .ConfirmationURL }}`.
- Produces: a dependency-free HTML email ready for the hosted Supabase Confirm signup template.

- [ ] **Step 1: Add a failing template regression test**

Add a test which checks the template exists and contains the required Thai copy and confirmation variable:

```js
test("SciSiam provides a Thai signup confirmation email template", () => {
  const templatePath = "supabase/templates/confirmation.html";
  assert.equal(existsSync(join(rootDir, templatePath)), true);

  const template = readProjectFile(templatePath);
  assert.match(template, /ยืนยันอีเมล SciSiam/);
  assert.match(template, /ยืนยันอีเมลของฉัน/);
  assert.match(template, /\{\{ \.ConfirmationURL \}\}/);
  assert.doesNotMatch(template, /Confirm your email address/);
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test tests/password-recovery.test.mjs`

Expected: the new test fails because `supabase/templates/confirmation.html` does not exist.

- [ ] **Step 3: Create the email template**

Create a responsive, table-based HTML email with inline CSS. It must contain:

```html
<title>ยืนยันอีเมล SciSiam</title>
<h1>ยืนยันอีเมล SciSiam</h1>
<p>ขอบคุณที่สมัครสมาชิก SciSiam กรุณายืนยันอีเมลเพื่อเริ่มใช้งานห้องทดลองเสมือนจริง</p>
<a href="{{ .ConfirmationURL }}">ยืนยันอีเมลของฉัน</a>
<p>หากคุณไม่ได้สมัครสมาชิก SciSiam สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้</p>
```

Keep the email self-contained with no scripts, forms, external stylesheets, or remote images.

- [ ] **Step 4: Run focused and full verification**

Run: `node --test tests/password-recovery.test.mjs`

Expected: all focused tests pass.

Run: `npm test`

Expected: all regression tests pass.

Run: `npm run lint`

Expected: exit code 0; existing unrelated simulation warnings may remain.

Run: `npm run build`

Expected: Next.js production build completes successfully.

- [ ] **Step 5: Update the knowledge graph**

Run: `graphify update .`

Expected: `graphify-out/graph.json`, `graph.html`, and `GRAPH_REPORT.md` are updated without an extraction error.


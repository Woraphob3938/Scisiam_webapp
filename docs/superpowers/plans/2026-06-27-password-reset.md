# Password Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a working Supabase email password recovery flow from `/login` through a PKCE callback to a secure new-password form.

**Architecture:** Extend the existing `AuthForm` with an email-only recovery state and use the existing browser Supabase client to request the reset email. Add a server callback route that exchanges the PKCE code with the existing server client, then render a focused client form that verifies the session and calls `updateUser`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, `@supabase/ssr`, `@supabase/supabase-js`, Node test runner.

---

## File Map

- Create `tests/password-recovery.test.mjs`: source-level regression coverage for request, callback, and update flows.
- Modify `src/components/auth/AuthForm.tsx`: forgot-password mode and request-email UI.
- Modify `src/app/login/page.tsx`: pass reset success/invalid notices from query parameters.
- Create `src/app/auth/callback/route.ts`: exchange the PKCE code and redirect only to `/reset-password`.
- Create `src/components/auth/ResetPasswordForm.tsx`: recovery-session validation and password update form.
- Create `src/app/reset-password/page.tsx`: route shell and invalid-link query handling.
- Modify `README.md`: document Supabase redirect allow-list and SMTP requirements.

### Task 1: Add Password Recovery Regression Coverage

**Files:**
- Create: `tests/password-recovery.test.mjs`

- [ ] **Step 1: Write the failing regression test**

Append a test that asserts the complete flow exists:

```js
test("password recovery uses Supabase PKCE without exposing account existence", () => {
  const authForm = readProjectFile("src/components/auth/AuthForm.tsx");
  const callback = readProjectFile("src/app/auth/callback/route.ts");
  const resetForm = readProjectFile("src/components/auth/ResetPasswordForm.tsx");
  const resetPage = readProjectFile("src/app/reset-password/page.tsx");

  assert.match(authForm, /resetPasswordForEmail/);
  assert.match(authForm, /\/auth\/callback\?next=\/reset-password/);
  assert.match(authForm, /หากอีเมลนี้มีบัญชี/);
  assert.doesNotMatch(authForm, /ระบบกู้คืนรหัสผ่านจะเปิดให้ใช้งานในเวอร์ชันถัดไป/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.doesNotMatch(callback, /searchParams\.get\("next"\)/);
  assert.match(callback, /new URL\("\/reset-password", url\.origin\)/);
  assert.match(resetForm, /auth\.getUser\(\)/);
  assert.match(resetForm, /updateUser\(\{ password/);
  assert.match(resetForm, /password !== confirmPassword/);
  assert.match(resetPage, /ResetPasswordForm/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
node --test tests/password-recovery.test.mjs
```

Expected: FAIL because `src/app/auth/callback/route.ts` and reset-password files do not exist.

- [ ] **Step 3: Commit the failing test**

```powershell
git add tests/password-recovery.test.mjs
git commit -m "test: define password recovery flow"
```

### Task 2: Implement The Recovery Email State

**Files:**
- Modify: `src/components/auth/AuthForm.tsx`
- Modify: `src/app/login/page.tsx`
- Test: `tests/password-recovery.test.mjs`

- [ ] **Step 1: Extend `AuthForm` state and props**

Use these types and state values:

```tsx
interface AuthFormProps {
  initialMode: "login" | "register";
  initialNotice?: string;
}

type AuthMode = "login" | "register" | "forgot-password";

export default function AuthForm({ initialMode, initialNotice = "" }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [notice, setNotice] = useState(initialNotice);
  const [recoverySent, setRecoverySent] = useState(false);
```

Set `isForgotPassword` from the mode and clear `error`, `notice`, and `recoverySent` when changing mode.

- [ ] **Step 2: Add the reset email request branch before password validation**

Inside `handleSubmit`, normalize the email first and use the existing client:

```tsx
if (mode === "forgot-password") {
  if (!email.trim()) {
    setError("กรุณากรอกอีเมลที่ใช้สมัครสมาชิก");
    setLoading(false);
    return;
  }

  if (!isSupabaseConfigured()) {
    setError("ยังไม่ได้ตั้งค่า Supabase URL หรือ Publishable Key ใน .env.local");
    setLoading(false);
    return;
  }

  const supabase = createClient();
  const normalizedEmail = email.trim().toLowerCase();
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(
    normalizedEmail,
    { redirectTo },
  );

  if (recoveryError) {
    setError("ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ กรุณารอสักครู่แล้วลองใหม่");
  } else {
    setRecoverySent(true);
  }
  setLoading(false);
  return;
}
```

- [ ] **Step 3: Render email-only recovery UI**

When `isForgotPassword` is true:

- Hide login/register segmented tabs, password, role, remember-me, and registration fields.
- Show heading `ลืมรหัสผ่าน` and only the existing email field.
- Submit label `ส่งลิงก์รีเซ็ตรหัสผ่าน`.
- After success show `หากอีเมลนี้มีบัญชี เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้แล้ว`.
- Add buttons for `ส่งอีเมลอีกครั้ง` and `กลับไปเข้าสู่ระบบ`.
- Make the existing `ลืมรหัสผ่าน?` button call `setAuthMode("forgot-password")`.

- [ ] **Step 4: Pass login notices from the route**

Update `src/app/login/page.tsx`:

```tsx
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;
  const initialNotice =
    reset === "success"
      ? "เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่"
      : "";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#f8fafc_42%,#ffffff_100%)] py-3 font-sans sm:py-4">
      <AuthForm initialMode="login" initialNotice={initialNotice} />
    </main>
  );
}
```

- [ ] **Step 5: Run the focused test**

Run the Task 1 command. Expected: still FAIL only because callback/reset files are absent; the AuthForm assertions pass.

- [ ] **Step 6: Commit recovery request UI**

```powershell
git add src/components/auth/AuthForm.tsx src/app/login/page.tsx
git commit -m "feat: request password reset emails"
```

### Task 3: Add The PKCE Callback Route

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Test: `tests/password-recovery.test.mjs`

- [ ] **Step 1: Implement the callback**

```ts
import { NextResponse, type NextRequest } from "next/server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/reset-password", url.origin));
  }

  return NextResponse.redirect(
    new URL("/reset-password?error=invalid_link", url.origin),
  );
}
```

- [ ] **Step 2: Run the focused test**

Expected: callback assertions pass; reset form/page assertions still fail.

- [ ] **Step 3: Commit callback route**

```powershell
git add src/app/auth/callback/route.ts
git commit -m "feat: exchange password recovery code"
```

### Task 4: Add The New Password Form

**Files:**
- Create: `src/components/auth/ResetPasswordForm.tsx`
- Create: `src/app/reset-password/page.tsx`
- Test: `tests/password-recovery.test.mjs`

- [ ] **Step 1: Create the client form**

Implement these state and session checks in `ResetPasswordForm.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ResetPasswordForm({ invalidLink = false }: { invalidLink?: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(!invalidLink);
  const [isValidSession, setIsValidSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (invalidLink || !isSupabaseConfigured()) {
      setCheckingSession(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data, error: userError }) => {
      setIsValidSession(Boolean(data.user) && !userError);
      setCheckingSession(false);
    });
  }, [invalidLink]);
```

The submit handler must enforce the registration password rules and then update the authenticated user:

```tsx
if (password.length < 8 || (!/[A-Z]/.test(password) && !/[0-9]/.test(password))) {
  setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวพิมพ์ใหญ่หรือตัวเลข");
  return;
}
if (password !== confirmPassword) {
  setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
  return;
}

setLoading(true);
const supabase = createClient();
const { error: updateError } = await supabase.auth.updateUser({ password });
if (updateError) {
  setError("เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาขอลิงก์รีเซ็ตใหม่");
  setLoading(false);
  return;
}
await supabase.auth.signOut({ scope: "local" });
router.replace("/login?reset=success");
router.refresh();
```

Render three explicit states:

- Checking: spinner and `กำลังตรวจสอบลิงก์รีเซ็ตรหัสผ่าน`.
- Invalid: `ลิงก์ไม่ถูกต้องหรือหมดอายุ` with a link back to `/login`, where the user can request another email.
- Valid: two password inputs with show/hide controls, requirement indicators, and disabled/loading submit.

- [ ] **Step 2: Create the route shell**

```tsx
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8 font-sans">
      <ResetPasswordForm invalidLink={error === "invalid_link"} />
    </main>
  );
}
```

- [ ] **Step 3: Run the focused test and verify GREEN**

Expected: the password recovery test passes.

- [ ] **Step 4: Commit the reset form**

```powershell
git add src/components/auth/ResetPasswordForm.tsx src/app/reset-password/page.tsx
git commit -m "feat: update recovered passwords"
```

### Task 5: Document Configuration And Verify End To End

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document required Supabase settings**

Add a Password Recovery subsection that lists:

```markdown
### Password recovery

Add these URLs in Supabase Dashboard > Authentication > URL Configuration > Redirect URLs:

- `http://localhost:3000/auth/callback`
- `/auth/callback` on the canonical deployed origin

Production password reset emails require custom SMTP or a Supabase Send Email Hook. The default sender is for limited development testing only.
```

- [ ] **Step 2: Run complete verification**

```powershell
npm test
npm run lint
npm run build
```

Expected: tests and build exit 0; lint has no errors. Existing unrelated warnings must be reported rather than silently changed.

- [ ] **Step 3: Browser QA**

At desktop and 390px mobile widths, verify:

1. `/login` opens recovery mode from `ลืมรหัสผ่าน?`.
2. Empty and malformed emails are rejected by the form.
3. A configured Supabase request shows the generic sent message.
4. `/reset-password?error=invalid_link` shows the invalid-link state.
5. `/auth/callback?next=https://example.com&code=invalid` ignores `next` and redirects only to SciSiam's invalid-link state.
6. No console errors or horizontal overflow appear.

- [ ] **Step 4: Run the secret scan**

```powershell
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\\s*="
```

Expected: only placeholder/example references; no real key appears in tracked files.

- [ ] **Step 5: Commit documentation**

```powershell
git add README.md
git commit -m "docs: configure password recovery"
```

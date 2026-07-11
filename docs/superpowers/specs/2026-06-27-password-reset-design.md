> Historical design record from 2026-06-27. It captures the decision at that time and is not the current operational specification.

# SciSiam Password Reset Design

## Goal

Replace the placeholder "ลืมรหัสผ่าน?" action with a working Supabase password recovery flow that keeps users inside SciSiam and works with the existing Next.js App Router and `@supabase/ssr` clients.

## User Flow

1. A user selects "ลืมรหัสผ่าน?" on `/login`.
2. The login form switches to an email-only recovery state.
3. SciSiam calls `resetPasswordForEmail` with a redirect to `/auth/callback` on the current origin.
4. The UI always shows the same success message after an accepted request so it does not reveal whether an account exists.
5. Supabase redirects the email link to `/auth/callback` with a PKCE authorization code.
6. The callback route exchanges the code for a session and redirects only to `/reset-password`.
7. The reset page verifies that a recovery session exists, accepts and confirms a new password, then calls `updateUser({ password })`.
8. After success, the user returns to `/login` with a confirmation message and signs in with the new password.

## Components And Routes

- `AuthForm.tsx`: add a recovery mode, email validation, loading state, generic success state, resend action, and return-to-login action.
- `/auth/callback/route.ts`: exchange the PKCE code through the existing server Supabase client and redirect only to `/reset-password`.
- `/reset-password/page.tsx`: public route shell for the password update form.
- `ResetPasswordForm.tsx`: validate the recovery session and password requirements, update the password, and handle expired or invalid links.

The existing `createClient()` helpers remain the only Supabase client setup. No dependency or database migration is required.

## Validation And Errors

- Normalize and validate the recovery email before sending.
- Require at least 8 characters and either an uppercase letter or a number for the new password, matching registration.
- Require both password fields to match.
- Disable submit controls while requests are pending.
- Use Thai user-facing messages and avoid showing raw Supabase/provider errors.
- Treat missing, invalid, or expired recovery sessions as an invalid-link state with actions to request another email or return to login.

## Security

- Use only the publishable browser key already configured in the project.
- Exchange the PKCE code in a server route so session cookies are written through the existing SSR client.
- Reject external `next` URLs to prevent open redirects.
- Do not use an admin API or service-role key to update passwords.
- Do not disclose whether an email is registered.
- Configure the deployed origin and local development origin in the Supabase Auth redirect allow list.
- Configure custom SMTP before production use; Supabase's default email sender is suitable only for limited testing.

## Testing

- Regression test that the login page invokes `resetPasswordForEmail` and no longer contains placeholder copy.
- Regression test that the callback exchanges the PKCE code and constrains redirects to local paths.
- Regression test that the reset form validates password confirmation and calls `updateUser`.
- Run the full Node regression suite, ESLint, and the production build.
- Browser QA at desktop and 390px mobile widths for recovery, invalid-link, and new-password states.

## External Configuration

The application code can derive the callback from `window.location.origin`. Supabase still needs these redirect URLs configured for each environment:

- `http://localhost:3000/auth/callback`
- The `/auth/callback` path on the canonical production origin configured for the Vercel deployment

Production email delivery additionally requires a configured SMTP provider or Supabase Send Email Hook.

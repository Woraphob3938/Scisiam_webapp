# SciSiam Signup Redirect And Confirmation Email Design

## Goal

After a successful email registration, move the user directly to the Login page and clearly tell them to verify their email. Prepare a Thai SciSiam confirmation-email template for later activation when Custom SMTP is available.

## Registration Flow

1. Submit the existing Supabase `signUp` request with `/auth/verify` as the email redirect target.
2. If Supabase accepts the registration and email confirmation is required, replace the current route with `/login?registered=success`.
3. The Login page translates that query value into a Thai success notice.
4. If email auto-confirm is enabled and Supabase returns a session, create the profile as today, sign the temporary session out, clear the local auth cache, and then move to the same Login success state.
5. Authentication errors remain on the registration form and continue using the existing Thai error mapping.

## Email Template

Add a Thai HTML confirmation template under `supabase/templates/`. The template will:

- Identify SciSiam clearly.
- Explain that the recipient registered for a SciSiam account.
- Provide one prominent confirmation link using `{{ .ConfirmationURL }}`.
- Warn users to ignore the message if they did not register.
- Avoid external images so the email remains readable when remote content is blocked.

The hosted Supabase project will continue sending its current default email until this template is configured in the Supabase Dashboard. Changing the sender label from `Supabase Auth` to `ยืนยันอีเมล SciSiam` requires Custom SMTP and is intentionally deferred.

## Verification

- Add a regression test for the registration-to-login redirect and success notice.
- Confirm the existing signup verification URL remains `/auth/verify`.
- Run the focused auth tests, ESLint, and production build.


-- Existing accounts have already completed the product introduction.
-- Future profile rows retain the schema default (false) and see the first-login guide.
update public.profiles
set onboarding_completed = true,
    updated_at = now()
where onboarding_completed = false;

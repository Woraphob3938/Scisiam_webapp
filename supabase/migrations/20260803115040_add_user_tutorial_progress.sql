create table public.user_tutorial_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  tutorial_id text not null check (
    char_length(tutorial_id) between 1 and 100
  ),
  status text not null check (status in ('completed', 'skipped')),
  completed_at timestamptz,
  skipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, tutorial_id),
  constraint user_tutorial_progress_terminal_time_matches_status check (
    (status = 'completed' and completed_at is not null and skipped_at is null)
    or
    (status = 'skipped' and skipped_at is not null and completed_at is null)
  )
);

create trigger user_tutorial_progress_set_updated_at
before update on public.user_tutorial_progress
for each row execute function public.set_updated_at();

insert into public.user_tutorial_progress (
  user_id,
  tutorial_id,
  status,
  completed_at
)
select
  id,
  case
    when role = 'teacher' then 'general-teacher-v2'
    else 'general-student-v2'
  end,
  'completed',
  now()
from public.profiles
where onboarding_completed = true
  and role in ('student', 'teacher')
on conflict (user_id, tutorial_id) do nothing;

alter table public.user_tutorial_progress enable row level security;

revoke all on table public.user_tutorial_progress from public, anon, authenticated;
grant select, insert, update on public.user_tutorial_progress to authenticated;

create policy "Users can read own tutorial progress"
on public.user_tutorial_progress
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own tutorial progress"
on public.user_tutorial_progress
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own tutorial progress"
on public.user_tutorial_progress
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

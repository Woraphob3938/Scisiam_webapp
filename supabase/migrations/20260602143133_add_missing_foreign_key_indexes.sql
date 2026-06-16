create index if not exists lab_progress_last_run_id_idx
on public.lab_progress (last_run_id)
where last_run_id is not null;

create index if not exists user_achievements_achievement_id_idx
on public.user_achievements (achievement_id);

create index if not exists user_achievements_lab_id_idx
on public.user_achievements (lab_id)
where lab_id is not null;

create index if not exists user_lab_notes_lab_id_idx
on public.user_lab_notes (lab_id);

create index if not exists user_mission_progress_mission_id_idx
on public.user_mission_progress (mission_id);

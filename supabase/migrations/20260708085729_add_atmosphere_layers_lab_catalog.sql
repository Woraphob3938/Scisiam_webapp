insert into private.classroom_lab_catalog (lab_id)
values ('atmosphere-layers')
on conflict (lab_id) do update
set is_active = true;

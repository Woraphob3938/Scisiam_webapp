insert into private.classroom_lab_catalog (lab_id)
values
  ('lab-equipment-overview'),
  ('animal-cell'),
  ('leaf-cell'),
  ('human-blood-cells'),
  ('experiment-chemicals'),
  ('external-muscle-anatomy'),
  ('internal-muscle-anatomy'),
  ('good-bad-minerals')
on conflict (lab_id) do update
set is_active = true;

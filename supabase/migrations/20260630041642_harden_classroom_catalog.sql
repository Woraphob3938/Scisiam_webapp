begin;

create table if not exists private.classroom_lab_catalog (
  lab_id text primary key check (lab_id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  is_active boolean not null default true
);

revoke all on table private.classroom_lab_catalog from public, anon, authenticated;

insert into private.classroom_lab_catalog (lab_id) values
  ('newtons-cooling'),
  ('ohms-law'),
  ('hookes-law'),
  ('snells-law'),
  ('ideal-gas-law'),
  ('newtons-second-law'),
  ('momentum-conservation'),
  ('faradays-law'),
  ('bernoullis-principle'),
  ('photoelectric-effect'),
  ('keplers-laws'),
  ('stefan-boltzmann'),
  ('push-pull-forces'),
  ('light-and-shadows'),
  ('sound-vibrations'),
  ('simple-circuits'),
  ('floating-and-sinking'),
  ('magnet-exploration'),
  ('acid-base-titration'),
  ('periodic-table'),
  ('boyles-law'),
  ('charles-law'),
  ('le-chateliers-principle'),
  ('beer-lambert-law'),
  ('hesss-law'),
  ('galvanic-cell'),
  ('chemical-kinetics'),
  ('solubility-product'),
  ('avogadros-law'),
  ('electrolysis-lab'),
  ('colligative-properties'),
  ('states-of-matter'),
  ('mixing-and-separating'),
  ('dissolving-solutions'),
  ('acids-bases-around-us'),
  ('heating-cooling-materials'),
  ('physical-chemical-changes'),
  ('photosynthesis-rate'),
  ('mendels-inheritance'),
  ('mitosis-division'),
  ('cell-osmosis'),
  ('enzyme-kinetics'),
  ('dna-extraction'),
  ('cellular-respiration'),
  ('plant-transpiration'),
  ('natural-selection'),
  ('blood-typing'),
  ('food-chain'),
  ('heart-rate'),
  ('graphing-lines'),
  ('ratio-and-proportion'),
  ('vector-addition'),
  ('center-and-variability'),
  ('curve-fitting'),
  ('function-builder'),
  ('probability-simulation'),
  ('trigonometry-waves'),
  ('systems-of-equations'),
  ('geometry-measurement'),
  ('exponential-growth-decay'),
  ('data-sampling-error'),
  ('quadratic-projectiles'),
  ('logarithm-scales'),
  ('unit-conversion'),
  ('matrix-transformations'),
  ('sequences-series'),
  ('inequalities-feasible-regions'),
  ('transformations-symmetry'),
  ('angles-circles'),
  ('combinatorics-counting'),
  ('normal-distribution'),
  ('rates-of-change'),
  ('optimization-constraints'),
  ('advanced-calculus-optimization'),
  ('linear-algebra-eigenvectors'),
  ('differential-equations-lab'),
  ('numerical-methods-lab'),
  ('multivariable-calculus'),
  ('statistical-inference'),
  ('bayesian-reasoning-lab'),
  ('fourier-analysis-signals'),
  ('complex-numbers-phasors'),
  ('vector-fields-gradients'),
  ('discrete-graph-theory'),
  ('mathematical-modeling-lab'),
  ('quantum-tunneling'),
  ('michelson-interferometer'),
  ('zeeman-effect'),
  ('superconductivity-meissner'),
  ('bragg-diffraction'),
  ('relativistic-kinematics'),
  ('nmr-spectroscopy'),
  ('xps-spectroscopy'),
  ('hplc-chromatography'),
  ('transition-metal-complexes'),
  ('eis-electrochemistry'),
  ('quantum-chemistry-orbitals'),
  ('pcr-gel-electrophoresis'),
  ('crispr-gene-editing'),
  ('recombinant-dna-transformation'),
  ('flow-cytometry-cycle'),
  ('western-blotting'),
  ('metabolic-pathway-flux')
on conflict (lab_id) do update set is_active = true;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'classroom_labs_lab_id_fkey'
      and conrelid = 'public.classroom_labs'::pg_catalog.regclass
  ) then
    alter table public.classroom_labs
      add constraint classroom_labs_lab_id_fkey
      foreign key (lab_id)
      references private.classroom_lab_catalog(lab_id)
      on delete restrict;
  end if;
end
$$;

create or replace function public.create_classroom(
  p_name text,
  p_grade_level text,
  p_description text,
  p_lab_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_role public.scisiam_user_role;
  v_name text := pg_catalog.btrim(coalesce(p_name, ''));
  v_description text := nullif(pg_catalog.btrim(coalesce(p_description, '')), '');
  v_room_id uuid;
  v_code text;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select role into v_role from public.profiles where id = v_user_id;
  if v_role is null then
    raise exception 'Profile required' using errcode = '42501';
  end if;

  if pg_catalog.char_length(v_name) not between 1 and 80 then
    raise exception 'Classroom name must contain 1-80 characters' using errcode = '22023';
  end if;
  if p_grade_level not in ('ประถม', 'มัธยมต้น', 'มัธยมปลาย', 'อุดมศึกษา') then
    raise exception 'Invalid grade level' using errcode = '22023';
  end if;
  if v_description is not null and pg_catalog.char_length(v_description) > 500 then
    raise exception 'Description exceeds 500 characters' using errcode = '22023';
  end if;
  if p_lab_ids is null or pg_catalog.cardinality(p_lab_ids) not between 1 and 24 then
    raise exception 'Choose 1-24 labs' using errcode = '22023';
  end if;
  if pg_catalog.cardinality(p_lab_ids) <> (
    select pg_catalog.count(distinct selected.lab_id)
    from pg_catalog.unnest(p_lab_ids) as selected(lab_id)
  ) then
    raise exception 'Duplicate lab ids are not allowed' using errcode = '22023';
  end if;
  if exists (
    select 1
    from pg_catalog.unnest(p_lab_ids) as selected(lab_id)
    left join private.classroom_lab_catalog as catalog
      on catalog.lab_id = selected.lab_id and catalog.is_active
    where catalog.lab_id is null
  ) then
    raise exception 'Unknown or inactive lab id' using errcode = '22023';
  end if;

  insert into public.classrooms (creator_id, name, grade_level, description)
  values (v_user_id, v_name, p_grade_level, v_description)
  returning id into v_room_id;

  v_code := private.generate_classroom_code();
  insert into private.classroom_join_codes (classroom_id, code)
  values (v_room_id, v_code);

  insert into public.classroom_members (classroom_id, user_id, member_role)
  values (v_room_id, v_user_id, v_role);

  insert into public.classroom_labs (classroom_id, lab_id, position)
  select v_room_id, selected.lab_id, (selected.ordinality - 1)::smallint
  from pg_catalog.unnest(p_lab_ids) with ordinality as selected(lab_id, ordinality);

  return pg_catalog.jsonb_build_object('classroom_id', v_room_id, 'code', v_code);
end;
$$;

create or replace function public.get_classroom_members(p_classroom_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  role public.scisiam_user_role,
  is_creator boolean,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_class_member(p_classroom_id) then
    raise exception 'Classroom not found or access denied' using errcode = '42501';
  end if;

  return query
  select
    members.user_id,
    profiles.display_name,
    profiles.avatar_url,
    members.member_role,
    classrooms.creator_id = members.user_id,
    members.joined_at
  from public.classroom_members as members
  join public.profiles as profiles on profiles.id = members.user_id
  join public.classrooms as classrooms on classrooms.id = members.classroom_id
  where members.classroom_id = p_classroom_id
  order by (classrooms.creator_id = members.user_id) desc, members.joined_at asc;
end;
$$;

revoke execute on function public.create_classroom(text, text, text, text[]) from public, anon;
grant execute on function public.create_classroom(text, text, text, text[]) to authenticated;
revoke execute on function public.get_classroom_members(uuid) from public, anon;
grant execute on function public.get_classroom_members(uuid) to authenticated;

commit;

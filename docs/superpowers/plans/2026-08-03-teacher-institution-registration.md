# Teacher Institution Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 192 active Thai higher-education institutions to teacher registration and let teachers choose between schools and universities before searching.

**Architecture:** Extend the existing `school_catalog` with a constrained `institution_type` discriminator so existing school and profile foreign keys remain compatible. Filter the existing Supabase lookup by that discriminator and keep teacher authorization independent from institution metadata.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase Postgres, Node test runner

## Global Constraints

- Import 192 active institutions from `C:\Users\HP\Downloads\20251105003uni-2568.xlsx`.
- Exclude the 3 source rows whose group is `เลิกกิจการ`.
- Preserve `profiles.school_id` and `profiles.school_name` for backward compatibility.
- A new account remains a student until the existing teacher approval process promotes it.
- Use the existing SciSiam form visual system and Thai-first copy.
- Do not add dependencies.
- Do not commit or push unless the user asks.

---

## File structure

- Modify `tests/scisiam-regressions.test.mjs`: protect institution filtering, UI copy, active source count, and authorization behavior.
- Create the exact migration path printed by `supabase migration new add_university_catalog`: add the discriminator, index it, and upsert 192 institution rows.
- Modify `src/lib/supabase/database.types.ts`: expose `institution_type` on `school_catalog` rows and write shapes.
- Modify `src/components/auth/AuthForm.tsx`: add the selector, type-aware lookup, reset behavior, labels, and result metadata.
- Modify `docs/superpowers/plans/2026-08-03-teacher-institution-registration.md`: mark completed steps during execution.

### Task 1: Regression contract

**Files:**

- Modify: `tests/scisiam-regressions.test.mjs`
- Test: `tests/scisiam-regressions.test.mjs`

**Interfaces:**

- Consumes: Source text from `AuthForm.tsx`, `database.types.ts`, and the new migration.
- Produces: A failing contract for `InstitutionType`, `.eq("institution_type", institutionType)`, 192 active university rows, and no self-promotion.

- [x] **Step 1: Write the failing tests**

Add assertions to the teacher-registration test for these exact behaviors:

```js
assert.match(authForm, /type InstitutionType = "school" \| "university"/);
assert.match(authForm, /ประเภทสถานศึกษา/);
assert.match(authForm, />โรงเรียน</);
assert.match(authForm, />มหาวิทยาลัย</);
assert.match(authForm, /\.eq\("institution_type", institutionType\)/);
assert.match(authForm, /handleInstitutionTypeChange/);
assert.match(authForm, /resetSchoolPicker\(\)/);
```

Add a migration test that locates `_add_university_catalog.sql`, checks the constraint and index, counts rows beginning with `('uni-`, and rejects the three closed source names:

```js
assert.match(migration, /institution_type text not null default 'school'/i);
assert.match(migration, /check \(institution_type in \('school', 'university'\)\)/i);
assert.match(migration, /school_catalog_institution_type_name_idx/i);
assert.equal((migration.match(/\('uni-[a-f0-9]{16}'/g) ?? []).length, 192);
assert.doesNotMatch(migration, /มหาวิทยาลัยเว็บสเตอร์\(ประเทศไทย\)/);
assert.doesNotMatch(migration, /วิทยาลัยเฉลิมกาญจนาระยอง/);
assert.doesNotMatch(migration, /สถาบันเทคโนโลยียานยนต์มหาชัย/);
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```powershell
rtk node --test tests/scisiam-regressions.test.mjs
```

Expected: FAIL because `InstitutionType`, the selector, and `_add_university_catalog.sql` do not exist yet.

### Task 2: University catalog migration and database types

**Files:**

- Create: the single path printed by `rtk supabase migration new add_university_catalog`
- Modify: `src/lib/supabase/database.types.ts`
- Source: `C:\Users\HP\Downloads\20251105003uni-2568.xlsx`

**Interfaces:**

- Consumes: Rows from sheet `ข้อมูล ณ 12-12-2567`, columns B through E.
- Produces: `school_catalog.institution_type: "school" | "university"` at the application boundary and 192 queryable `university` rows.

- [x] **Step 1: Create the forward migration through the CLI**

Run:

```powershell
rtk supabase migration new add_university_catalog
```

Expected: one empty migration path printed under `supabase/migrations/`.

- [x] **Step 2: Generate deterministic active rows from the workbook**

Use this extraction logic in the approved temporary workspace. It prints SQL tuples for insertion through `apply_patch`:

```python
from collections import Counter
import hashlib
from openpyxl import load_workbook

source = r"C:\Users\HP\Downloads\20251105003uni-2568.xlsx"
workbook = load_workbook(source, read_only=True, data_only=True)
sheet = workbook["ข้อมูล ณ 12-12-2567"]

records = []
sector = None
group = None

for row in sheet.iter_rows(values_only=True):
    if len(row) > 1 and row[1] not in (None, ""):
        sector = str(row[1]).strip()
    if len(row) > 2 and row[2] not in (None, ""):
        group = str(row[2]).strip()

    sequence = row[3] if len(row) > 3 else None
    raw_name = row[4] if len(row) > 4 else None
    if not isinstance(sequence, (int, float)) or raw_name in (None, ""):
        continue
    if group == "เลิกกิจการ":
        continue

    name = str(raw_name).strip()
    records.append({
        "id": "uni-" + hashlib.sha256(name.encode("utf-8")).hexdigest()[:16],
        "name": name,
        "group": group,
        "sector": sector,
    })

assert len(records) == 192
assert len({record["id"] for record in records}) == 192
assert len({record["name"] for record in records}) == 192
assert Counter(record["sector"] for record in records) == {
    "รัฐ": 104,
    "เอกชน": 70,
    "นอกสังกัด": 18,
}

def sql_text(value):
    return "'" + value.replace("'", "''") + "'"

for index, record in enumerate(records):
    suffix = "," if index < len(records) - 1 else ""
    print(
        "(" + ", ".join([
            sql_text(record["id"]),
            sql_text(record["name"]),
            "'university'",
            sql_text(record["group"]),
            sql_text(record["sector"]),
        ]) + ")" + suffix
    )
```

- [x] **Step 3: Add the schema change and upsert**

Apply this exact migration prefix, then insert the 192 tuple lines printed by the verified extraction code immediately after `values`:

```sql
begin;

alter table public.school_catalog
  add column if not exists institution_type text not null default 'school';

alter table public.school_catalog
  drop constraint if exists school_catalog_institution_type_check;

alter table public.school_catalog
  add constraint school_catalog_institution_type_check
  check (institution_type in ('school', 'university'));

create index if not exists school_catalog_institution_type_name_idx
  on public.school_catalog (institution_type, name);

insert into public.school_catalog
  (id, name, institution_type, school_type, region)
values
```

Apply this exact suffix after the final tuple:

```sql
on conflict (id) do update set
  name = excluded.name,
  institution_type = excluded.institution_type,
  school_type = excluded.school_type,
  region = excluded.region,
  updated_at = now();

commit;
```

The first generated tuple proves the field order and deterministic id:

```sql
('uni-7ec5522bc30a5288', 'จุฬาลงกรณ์มหาวิทยาลัย', 'university', 'ในกำกับ (26)', 'รัฐ')
```

- [x] **Step 4: Update generated TypeScript database shapes**

Add to `school_catalog.Row`:

```ts
institution_type: "school" | "university";
```

Add to `school_catalog.Insert` and `school_catalog.Update`:

```ts
institution_type?: "school" | "university";
```

- [x] **Step 5: Run the focused test**

Run:

```powershell
rtk node --test tests/scisiam-regressions.test.mjs
```

Expected: migration assertions pass; UI assertions remain RED.

### Task 3: Type-aware teacher registration UI

**Files:**

- Modify: `src/components/auth/AuthForm.tsx`
- Test: `tests/scisiam-regressions.test.mjs`

**Interfaces:**

- Consumes: `school_catalog.institution_type`, `school_type`, and `region`.
- Produces: `institutionType: InstitutionType`, a type-filtered catalog query, and unchanged `school_id` and `school_name` signup metadata.

- [x] **Step 1: Add the local types and copy map**

Use these shapes:

```ts
type InstitutionType = "school" | "university";

type SchoolOption = {
  id: string;
  name: string;
  institution_type: InstitutionType;
  district: string | null;
  province: string | null;
  education_area: string | null;
  school_type: string | null;
  region: string | null;
};

const institutionCopy = {
  school: {
    label: "โรงเรียน",
    placeholder: "เช่น สตรีวิทยา",
    loading: "กำลังค้นหาโรงเรียน...",
  },
  university: {
    label: "มหาวิทยาลัย",
    placeholder: "เช่น มหาวิทยาลัยเชียงใหม่",
    loading: "กำลังค้นหามหาวิทยาลัย...",
  },
} satisfies Record<InstitutionType, {
  label: string;
  placeholder: string;
  loading: string;
}>;
```

- [x] **Step 2: Add selector state and reset behavior**

Initialize with schools:

```ts
const [institutionType, setInstitutionType] = useState<InstitutionType>("school");
```

Changing type must reset the search and selection:

```ts
const handleInstitutionTypeChange = (nextType: InstitutionType) => {
  if (nextType === institutionType) return;
  setInstitutionType(nextType);
  resetSchoolPicker();
};
```

- [x] **Step 3: Filter the catalog request**

Select all fields needed by either result format and add the discriminator before ordering:

```ts
.select(
  "id, name, institution_type, district, province, education_area, school_type, region",
)
.ilike("name", `%${query}%`)
.eq("institution_type", institutionType)
.order("name", { ascending: true })
.limit(8);
```

Include `institutionType` in the effect dependency list. Use type-aware error copy and validation without exposing internal database names.

- [x] **Step 4: Render the accessible selector and dynamic field**

Above the search field, render a `fieldset` whose legend is `ประเภทสถานศึกษา`. Use two real buttons with `aria-pressed`, minimum 44px target height, existing border and focus styles, and labels `โรงเรียน` and `มหาวิทยาลัย`.

The field label, placeholder, loading state, and required validation use `institutionCopy[institutionType]`. University result metadata uses `[school.region, school.school_type]`; school metadata keeps `[school.district, school.province, school.education_area]`.

- [x] **Step 5: Verify GREEN**

Run:

```powershell
rtk node --test tests/scisiam-regressions.test.mjs
```

Expected: PASS.

### Task 4: Database, quality, and browser verification

**Files:**

- Verify: the CLI-created migration
- Verify: `src/components/auth/AuthForm.tsx`
- Verify: `src/lib/supabase/database.types.ts`

**Interfaces:**

- Consumes: Completed migration and UI.
- Produces: Verified remote rows and a responsive signup flow.

- [x] **Step 1: Run the complete local checks**

Run:

```powershell
rtk npm test
rtk npm run lint
rtk npm run build
```

Expected: all tests pass, lint has no new errors, and the production build completes.

- [x] **Step 2: Run the Impeccable detector once**

Run:

```powershell
rtk node C:\Users\HP\.agents\skills\impeccable\scripts\detect.mjs --json src/components/auth/AuthForm.tsx
```

Expected: no high-confidence design defects in the changed form.

- [x] **Step 3: Apply and verify the linked Supabase migration**

Discover flags first with `rtk supabase db push --help`, then push the forward migration. Verify that exactly 192 `institution_type = 'university'` rows exist and that all pre-existing rows have `institution_type = 'school'`.

- [x] **Step 4: Run security advisors**

Run `rtk supabase db advisors --help`, then execute the advisor command supported by the installed CLI. Confirm the migration introduces no new security issue.

- [x] **Step 5: Inspect the real UI in one bounded pass**

Open `/login`, choose `สมัครสมาชิก`, then `คุณครู`. Check desktop and 390px mobile together:

1. Both institution choices fit without horizontal overflow.
2. Switching type clears the selected value.
3. Searching `สตรีวิทยา` returns only schools.
4. Searching `มหาวิทยาลัยเชียงใหม่` returns the university with its source classification.
5. Keyboard focus and list selection remain usable.

- [x] **Step 6: Update the knowledge graph and inspect the final diff**

Run:

```powershell
rtk graphify update .
rtk git diff --check
rtk git status --short
```

Expected: the graph update succeeds, the diff has no whitespace errors, and unrelated profile changes remain untouched.

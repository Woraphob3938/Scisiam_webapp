---
name: lab-consistency-audit
description: Audit SciSiam's 36 lab catalog for route, detail page, equipment, theory, steps, simulation, image, and saved-result consistency. Use before adding labs or before competition/deploy reviews.
---
# Lab Consistency Audit

Use this skill when adding labs, reviewing lab coverage, fixing fallback behavior, or preparing SciSiam for judging.

## Scope

Check every lab in `src/data/labs.ts` against:

- `/labs/[id]`
- `/labs/[id]/simulation`
- detail hero/title/category/objectives
- equipment list
- theory/formula card
- experiment steps
- simulation selector
- saved result keys and profile/progress integration

## Rules

- No lab should silently show Newton cooling content unless the lab is Newton cooling.
- Unsupported labs should be marked clearly as coming soon or use a generic placeholder that names the correct lab.
- Every visible image/icon/visual should match the lab subject.
- Buttons like `รายละเอียด`, `เข้าห้อง`, `บันทึกผล`, and `กลับ` must route to the correct `lab.id`.
- If a lab is listed as available, detail and simulation pages must be coherent enough for a student to understand the topic.

## Useful Commands

```powershell
rg -n "Newton|cooling|fallback|return <NewtonCoolingSimulation|labsData|labsById" src
rg -n "scisiam_saved_|handleSaveResults|บันทึกผล" src
```

## Browser Spot Checks

Test at least one implemented lab and one not-yet-implemented lab per category:

- Physics
- Chemistry
- Biology

Report exact URLs, whether title/content/simulation match, and any incorrect fallback.

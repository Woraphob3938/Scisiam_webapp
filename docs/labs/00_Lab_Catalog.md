---
title: Lab Catalog
tags:
  - scisiam
  - labs
---

# Lab Catalog

SciSiam มี 36 labs จาก `src/data/labs.ts`

## Categories

- [[Physics]]: 12 labs
- [[Chemistry]]: 12 labs
- [[Biology]]: 12 labs

## Lab Readiness Meaning

- **Ready**: detail + simulation coherent and tested
- **Partial**: detail/simulation exists but needs polish or save/profile integration
- **Placeholder Needed**: should not route to unrelated content
- **Not Started**: only metadata exists

## Current Audit Concern

หลาย labs ยังมีความเสี่ยง fallback เป็น Newton cooling ถ้า route/detail/simulation ไม่ถูกแยกชัดเจน

## When Adding A Lab

Use [[_Lab_Template]] and check:

- `src/data/labs.ts`
- Detail page content
- Equipment list
- Theory/formula
- Experiment steps
- Simulation selector
- Save key/profile integration
- AI context

## Related Notes

- [[01_Competition_Readiness]]
- [[05_Backlog]]

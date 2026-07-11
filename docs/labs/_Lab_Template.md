---
title: Lab Template
status: active
---

# Lab Template

ใช้ template นี้ก่อนเพิ่ม lab id ใหม่ หรือก่อนเปลี่ยน simulation เดิมอย่างมีนัยสำคัญ

## Product Metadata

- Lab ID:
- Thai title:
- English title:
- Category: Physics / Chemistry / Biology / Mathematics / Foundation
- Grade range:
- Learning objective:
- Student outcome:

## Scientific Model

- Independent variable:
- Dependent variable:
- Controlled variables:
- Units:
- Formula, rule, or conceptual model:
- Assumptions and limits:
- Common misconception to address:

## Learning Experience

- Stage or viewport description:
- Controls:
- Visible real-time feedback:
- Graph or table:
- Theory, equipment, and steps:
- Save-result behavior:
- AI ไออุ่น context and safety caveat:

## Visual Brief

- LabCard SVG concept:
- Simulation SVG or Canvas concept:
- Subject accent:
- Important labels or accessible text:
- Mobile concern:

## Implementation Checklist

- Update src/data/labs.ts
- Update src/data/labDetails.ts
- Update src/data/labSimulationRegistry.ts
- Update src/data/labSavedExperiments.ts
- Confirm lab route and simulation selector
- Add or update the matching simulation component
- Verify saved runs stay account-owned
- Run npm test, npm run lint, and browser QA at 390px

---
name: grill-me
description: Ask focused alignment questions before ambiguous, high-risk, or architecture-changing SciSiam work. Use for unclear requirements, new large features, packaging decisions, or data model changes.
---
# Grill Me - Alignment Check

Use this skill only when the task is ambiguous, high-impact, or likely to create rework. Do not block simple, explicit fixes.

## Ask 1-3 Questions

Choose the smallest useful set:

- What outcome should the user see when the task is finished?
- Which route/component/data source owns this behavior?
- Should this be prototype-only local state or production-ready backend state?
- For UI work, what is the primary action and what should be visually de-emphasized?
- For labs, should unsupported labs be hidden, shown as coming soon, or implemented with a placeholder shell?

## After Answers

Summarize the decision in a short implementation outline, then proceed. Avoid long interviews unless the user explicitly asks to plan.

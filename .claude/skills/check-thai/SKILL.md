---
name: check-thai
description: Audit SciSiam Thai typography and copy layout for readable line height, word wrapping, letter spacing, button fit, mobile overflow, and consistency with AGENTS.md.
---
# Check Thai - Thai Typography Audit

Use when editing Thai UI text, lab descriptions, buttons, cards, sidebars, profile, or AI Tutor copy.

## What To Check

- Thai paragraphs use `leading-relaxed` or `leading-[1.5]` to `leading-[1.7]`.
- Thai text does not use `tracking-tight`, `tracking-tighter`, or negative letter spacing.
- Long Thai text has `break-words`, `[word-break:keep-all]`, or layout constraints that prevent overflow.
- Button labels fit at mobile width and do not crowd icons.
- Text does not overlap floating AI Tutor, nav, tabs, or card actions.
- Copy tone is student-friendly, clear, and consistent with SciSiam.

Useful searches:

```powershell
rg -n "[ก-๙]" src
rg -n "tracking-tight|tracking-tighter|leading-none|leading-tight|text-justify" src
```

## Report Format

- List file/line, issue, and suggested class or wording.
- Separate true readability bugs from optional polish.

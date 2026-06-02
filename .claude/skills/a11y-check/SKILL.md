---
name: a11y-check
description: Audit SciSiam TSX/HTML UI for accessibility: semantic structure, headings, alt text, ARIA labels, focus states, keyboard navigation, contrast, and mobile usability.
---
# A11y Check - SciSiam Accessibility Audit

Use for UI reviews, new screens, navigation changes, AI Tutor UI, forms, modals, and icon-only controls.

## Static Checks

- Semantic structure: `header`, `nav`, `main`, `section`, `aside`, `footer` where appropriate.
- Heading order: one page-level `h1`, no confusing heading jumps.
- Images: meaningful `alt`; decorative images use `alt=""` or `aria-hidden`.
- Buttons and links: icon-only controls need `aria-label`; links must describe destination or action.
- Forms: inputs need labels or accessible names.
- Focus: do not use `focus:outline-none` without a visible focus replacement.
- Contrast: avoid pale text on white, especially small Thai text.

Useful searches:

```powershell
rg -n "<button|aria-label|alt=|focus:outline-none|tabIndex|role=" src
rg -n "<Image|<img" src
```

## Browser Checks

- Tab through the affected page.
- Confirm visible focus order matches visual order.
- Confirm dialogs/chat panels can close by button and do not trap users unexpectedly.
- Check mobile width around 390px for overlap and unreachable buttons.

## Report Format

- `CRITICAL`: keyboard-blocking controls, missing accessible names on icon-only controls, unusable modal/chat.
- `WARNING`: weak heading order, missing alt, poor contrast, focus styling gaps.
- Include file/line references and a short fix suggestion.

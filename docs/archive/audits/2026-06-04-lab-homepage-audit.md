> Historical UX and accessibility snapshot from 2026-06-04. The root route and lab experience have changed since this audit; do not treat it as current QA.

# SciSiam Lab Homepage Audit

Date: 2026-06-04  
Route: `http://localhost:3000/`  
Mode: Product Design combined UX + accessibility audit  
Destination: local folder

## Captured Steps

1. `01-desktop-home.png` - Desktop homepage, 1440 x 1000
2. `02-search-results.png` - Search dropdown with `Titration`
3. `03-chemistry-filter.png` - Chemistry category selected
4. `04-mobile-home.png` - Mobile homepage, 390 x 844
5. `05-detail-entry.png` - First card detail entry route

## User Goal And Accessibility Target

Primary user goal: find a science lab, understand whether it is ready, then enter details or start a simulation quickly.

Accessibility target: the homepage should be understandable and operable with keyboard, screen readers, and small mobile screens. This audit uses visual screenshots and DOM snapshots, so it does not claim full WCAG compliance.

## Strengths

- The page now has a clear learning-first structure: search, subject filters, readiness state, then lab cards.
- Visual style is consistent with SciSiam's design system: white surfaces, slate text, restrained blue/purple/green subject accents, and clean Thai typography.
- Lab card illustrations are relevant to the lab names in the visible cards, which helps the page feel more competition-ready.
- Desktop and mobile snapshots show no horizontal overflow. Mobile measured `innerWidth=390` and `scrollWidth=390`.
- Primary actions on desktop are clear: each card has `รายละเอียด` and `เข้าห้อง`.
- Category state and readiness state expose `aria-pressed`, and the search input has an accessible label.
- Search dropdown successfully finds a matching lab and clicking `รายละเอียด` from the first card routes to `/labs/newtons-cooling`.
- No browser console errors were observed during the captured flow.

## UX Risks

### 1. First viewport still spends too much height before the actual lab choice

Evidence: `01-desktop-home.png`, `04-mobile-home.png`

On desktop, the first lab row begins around the lower half of the screen. On mobile, the first card starts around the lower half and its action buttons are below the fold. This is much cleaner than older versions, but the page still makes users pass through hero, category filter, and readiness summary before acting on a lab.

Impact: users can understand the page, but the "start a lab quickly" goal is slightly delayed, especially on mobile.

Recommendation: reduce hero vertical padding, make the category filter closer to the search, and compress the readiness summary into a thinner toolbar. Aim for the first lab card title and at least one action to be visible on a 390 x 844 viewport.

### 2. Readiness filter currently has low decision value

Evidence: `01-desktop-home.png`, `03-chemistry-filter.png`

The page shows `พร้อมทดลอง`, `ทั้งหมด`, and `กำลังจัดทำ`, but all captured categories have ready count equal to all count and in-development count is `0`.

Impact: the controls look official but do not help users choose right now. This can feel like extra UI weight.

Recommendation: hide `กำลังจัดทำ` when its count is `0`, or collapse readiness into a small status note until some labs are actually unavailable. Keep `พร้อมทดลอง` only when it changes the results meaningfully.

### 3. Search behaves like a quick-jump dropdown, not a page filter

Evidence: `02-search-results.png`

Typing `Titration` opens a useful result dropdown, but the lab grid below remains unchanged and still shows Physics cards.

Impact: users may wonder whether search filtered the page or only opened suggestions. The dropdown is useful, but the mental model is not explicit.

Recommendation: either make search filter the grid live, or label the dropdown as `ผลลัพธ์ด่วน` / `กดเพื่อเปิดรายละเอียด`. A stronger option is to update the section summary to `พบ 1 ห้องแล็บที่ตรงกับคำค้นหา`.

### 4. Two filter layers create mild redundancy

Evidence: `01-desktop-home.png`, `03-chemistry-filter.png`

There is a category segmented control followed immediately by a readiness segmented control. Both are well styled, but together they add a lot of control surface before the cards.

Impact: the page feels slightly more like a dashboard setup screen than a fast lab launcher.

Recommendation: keep category as the primary filter, and make readiness a compact secondary control inside the same toolbar or a small dropdown. This keeps power without visual repetition.

### 5. Card actions are clear visually, but repeated accessible names are weak

Evidence: DOM snapshots from desktop and mobile captures

Every card repeats generic button labels such as `รายละเอียด` and `เข้าห้อง`.

Impact: screen reader users and keyboard users navigating by controls may hear many identical buttons without knowing which lab each one belongs to.

Recommendation: keep the visible text short, but add unique accessible labels, for example `aria-label="ดูรายละเอียด Newton's law of cooling"` and `aria-label="เข้าห้องทดลอง Newton's law of cooling"`.

## Accessibility Risks

- Repeated generic card button names can make screen-reader navigation inefficient.
- The search dropdown should expose clearer combobox/listbox semantics if it becomes a primary navigation pattern.
- Some disabled/zero-count controls, especially `กำลังจัดทำ 0`, may be announced as available controls even when they do not provide useful action.
- Full keyboard flow, focus order after opening search results, and focus return after selecting a lab still need hands-on verification beyond screenshots.

## Opportunity Areas

- Make the homepage feel more like a "lab launcher" by moving lab cards higher.
- Use one compact filter system instead of two stacked filter bands.
- Treat search as either a live filter or an explicitly named quick-jump picker.
- Keep category colors as subject accents, but avoid letting the readiness toolbar compete with them.
- Consider bilingual category labels for Thai-first clarity: `ฟิสิกส์`, `เคมี`, `ชีววิทยา`, with English as secondary if needed.

## Recommendations

1. High priority: compress the top area so first lab card actions appear sooner, especially on mobile.
2. High priority: add unique `aria-label` values to each card's detail and enter-room buttons.
3. Medium priority: decide whether search filters the full grid or acts as a quick-jump dropdown, then update behavior/copy accordingly.
4. Medium priority: hide readiness options with `0` count or move readiness into a less prominent dropdown.
5. Medium priority: merge category and readiness filters into one cleaner toolbar.
6. Low priority: consider Thai-first subject labels while preserving the science identity.

## Step Health Summary

1. Desktop homepage: healthy, but top hierarchy still pushes labs lower than ideal.
2. Search results: functional and useful, but mental model needs clarification.
3. Chemistry filter: healthy; color and cards align well with subject identity.
4. Mobile homepage: responsive and no overflow, but first action sits too low.
5. Detail entry: healthy; navigation from card to detail page works.

## Evidence Limits

- This audit does not cover logged-in personalization, teacher mode, or AI Tutor interactions.
- This audit does not include automated color contrast measurement or full keyboard traversal.
- The in-app Browser could inspect the page but screenshot capture timed out, so Playwright CLI was used as the screenshot fallback.

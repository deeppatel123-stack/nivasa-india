# QA results — 22 Nov 2026

## Automated checks
- `npm run typecheck` — passed.
- `npm run test` — 3 files, 12 tests passed.
- `npm run build` — passed; vendor chunks split into `react`, `map`, `state`, `icons` and `motion` (no chunk-size warning).

## Production route sweep
- 23 routes checked against `npm run preview` (all primary pages, invalid property id, unknown route).
- No error boundary, no horizontal overflow, no browser console errors.

## Responsive review
- All routes checked at 375px; key routes (home, search, map, details, compare, assistant, owner form) also at 768px and 1440px.
- Fixed a mobile map-page grid overflow by adding `min-w-0` to both map columns.
- No broken credited demo images in tested routes.

## Lighthouse
- Accessibility, Best Practices and SEO scored **1.00** on all 24 audited primary routes after fixes.
- Fixed during review: combobox ARIA semantics, low-contrast text, heading order, map pin target size, and missing `robots.txt`.

## Interaction smoke tests
- Location autocomplete and URL sync (`?q=`, `?radius=`, `?category=`).
- Radius, sort, category and filter interactions, including zero-result and clear-filters paths.
- Save, compare tray, comparison table and dynamic best-value/upfront explanations.
- Map pin ↔ card selection and scroll-into-view.
- Demo assistant suggestion chips and grounded no-match behaviour.
- Auth validation, demo session, profile counts and sign-out.
- Owner form validation and honest "not connected" submit feedback.
- FAQ accordion and contact form validation/no-message-sent feedback.

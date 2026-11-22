# Manual QA checklist

Run `npm run dev:full` (Express + Vite) and verify at 375px, 768px and 1440px.
`npm run dev` also works on its own — the client falls back to local demo data when the API is offline.

## API
- [ ] `GET http://localhost:5000/api/health` → `status: ok`
- [ ] `GET /api/listings` → 19 labelled demo records, `isDemo: true`, `contact: null`
- [ ] `GET /api/listings/demo-nirma-budget-pg` → one demo record; unknown id → 404
- [ ] `GET /api/listings?category=pg&city=Ahmedabad` → filtered demo records
- [ ] Browser network tab shows the client requesting `/api/listings` through the Vite proxy

## Routes
- [ ] `/`, `/explore`, `/search?q=Nirma%20University&radius=5`, `/map`
- [ ] `/property/demo-nirma-gota-pg`, an invalid property id, `/compare`, `/assistant`
- [ ] `/login`, `/register`, `/forgot-password`, `/profile`
- [ ] `/wishlist`, `/recently-viewed`
- [ ] `/owner/dashboard`, `/owner/add-property`, `/owner/listings`
- [ ] `/contact`, `/about`, `/faq`, `/privacy`, `/terms`, unknown route

## Interactions
- [ ] Location autocomplete, keyboard selection, GPS permission denial path, unresolved location message
- [ ] Radius presets, sort, every filter group, clear filters
- [ ] Save/remove favourite, compare up to 4, tray clear and navigation
- [ ] Property gallery, enquiry modal, contact gating, recently viewed tracking
- [ ] Assistant suggestion chips and follow-ups
- [ ] Auth validation, demo session, Google preview message, sign-out
- [ ] Owner form validation and honest "not connected" submit feedback
- [ ] FAQ accordion, contact form feedback

## Quality
- [ ] No console errors or failed critical requests
- [ ] Skeletons and empty states appear correctly
- [ ] No fake phone numbers, owners, prices as market rates or reviews
- [ ] Demo labels visible wherever demo data appears
- [ ] Images credited as illustrative
- [ ] Buttons and inputs have accessible names; focus states visible

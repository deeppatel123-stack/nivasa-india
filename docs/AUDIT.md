# Complete project audit — 23 Nov 2026

Scope: `D:\MERN\Project` at commit `e157d04` (JavaScript MERN conversion).

## 1. Problems identified

### Architecture / structure (critical)
- Single package mixes React and Express dependencies and scripts; no workspace separation.
- Backend imports frontend source: `server/routes/listings.js` → `../../src/features/listings/demoListings.js`. Moving either side breaks the other.
- `server/app.js` resolves `../dist` for production hosting; Vite proxy, `VITE_API_URL` and `.env.example` all hardcode the same topology in four places.
- `docs/CONVENTIONS.md` explicitly forbids editing the shared files that must change.
- No `controllers/`, `services/`, `validators/`, `jobs/` or `utils/` layer on the backend; route handlers contain business logic and data seeding.
- Client has no `services/`, `hooks/`, `layouts/` or `types/` directories; feature helpers are scattered under `components/discovery` and `features/`.

### Data integrity (critical)
- All 19 listings are synthetic (`src/features/listings/demoListings.js`), including invented rents, deposits, coordinates and availability dates. Mongo mode seeds the same fabricated set.
- API failure is silently masked: `src/features/listings/repository.js` falls back to `DEMO_LISTINGS` on *any* error, making `isError` UI branches unreachable.
- Demo labels are asserted unconditionally in API headers/health even if real data were stored.
- `contact: Schema.Types.Mixed` with no validation or verification workflow.
- No source URL, provider ID, fetch timestamp, freshness TTL, moderation state or duplicate detection.

### Real location search (critical)
- `src/features/locations/demoLocations.js` is a hardcoded index of ~37 places; `remoteGeocoder` is a stub returning `unresolved: true`.
- No arbitrary India location search. GPS coordinates are lost on URL round-trip (`useSearchUrlSync.js`).
- Radius is only applied when an origin is resolved; otherwise every listing is shown. `/map` draws a radius circle around a hardcoded Bengaluru point while displaying all-India pins.
- Two radius controls write the same store value but only one syncs the URL.
- URL state covers only `q`, `radius`, `category`; filters/sort live only in localStorage.

### Features that only look functional (high)
- Auth accepts any email + 6-char password and persists an unvalidated session client-side.
- Contact form, owner add-property, manage listings, enquiry modal and password reset are explicit no-op toasts.
- `verifiedOnly` filter and `sort: 'updated'` are no-ops because all demo records have `verification: 'demo'` and `lastUpdated: null`.
- Assistant suggested follow-ups ("increase radius to 20 km", "show all demo listings") cannot change the result set it is given.
- Assistant claims occupancy ranking that the scoring formula does not implement; it echoes parsed budgets/radii without enforcing them.
- Ranking weights (`0.55/0.3/featured*15`, `monthlyExpense/250`) are arbitrary and undisclosed.

### Correctness / robustness (high)
- Client and server filtering are divergent; server query params are never used by the app.
- Server `Number('')` → 0; negative and inverted rent bounds accepted; category case-sensitive, city lowercased.
- No pagination, facets, sort, geo query (`lat/lng/radius`), caching headers or request validation.
- No runtime validation of API payloads; `OCCUPANCY_COUNT[unknown]` → `NaN` → `'—'`.
- Zustand persisted state is not validated on rehydration; corrupted localStorage can throw.
- Mongo connect failure throws at startup with no fallback; cold-start seeding can double-insert.
- Comparison "lowest upfront" mixes whole deposit with per-person recurring cost; refundable-deposit assumption is hardcoded.
- No backend tests; no auth/rate limiting/Helmet; no freshness presentation.

### UI (to be confirmed by the frontend audit agent)
- Known from prior QA: map marker tap targets and heading order were fixed; further issues are being catalogued (icons, overflow, dead controls, alignment, empty/loading states, responsive breakpoints).

## 2. Correction plan

1. **Document reality** — record source research and what can/cannot be integrated (`docs/DATA_SOURCES.md`). Never fabricate listings.
2. **Restructure** — move to `frontend/` and `backend/` with independent `package.json` files and an optional root workspace. Preserve every existing feature; change paths/config in one controlled pass.
3. **Backend architecture** — add `config`, `controllers`, `routes`, `models`, `services`, `middleware`, `validators`, `utils`, `jobs`. Remove demo seeding. Add real geocoding proxy (Photon/Nominatim, cached + rate-limited), geospatial listing queries, ingestion from owner submissions and authorized imports, validation, duplicate detection, verification/freshness computation and honest error responses.
4. **Frontend data layer** — replace silent demo fallback with explicit service errors and honest empty/error states. Use backend geocoding for any Indian location. Remove hardcoded curated-place assumptions from the primary search path.
5. **Frontend structure** — introduce `services/`, `hooks/`, `layouts/`, `utils/`; de-duplicate shared logic; keep reusable UI primitives.
6. **UI pass** — inspect every route at desktop/laptop/tablet/mobile; fix icons, alignment, overflow, dead buttons, modals, image ratios, empty/loading states.
7. **AI / comparison** — rank only genuine fetched records; parse budget/radius/amenity constraints and enforce them; expose incompleteness when fields are missing; remove invented ranking boosts.
8. **Verification** — show real status only when evidence exists; mark everything else `unverified` / `availability unconfirmed` / `information incomplete`; add freshness age and source attribution.
9. **Testing loop** — unit tests for backend services and frontend utilities, API tests, build, browser console/network checks, responsive sweeps; repeat after each batch.
10. **Docs & report** — update README/architecture/conventions/testing and produce a transparent final report of what works, what does not, and what needs credentials.

## 3. Non-negotiable data policy

- No fabricated property, price, coordinate, phone, owner, review, image-of-property or availability.
- Missing values render as **"Not available"**, never inferred.
- Only real, attributable, permitted sources are ingested; provenance is stored per record.
- If a provider is unavailable, show an honest empty/error state — never substitute demo data.

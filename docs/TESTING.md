# Manual QA checklist

Run `npm run dev:full` (Express + Vite) and verify at 375px, 768px, 1280px and 1440px.
The client requires the API; there is no offline demo fallback.

## API

- [ ] `GET /api/health` → `status: ok`, `dataMode: genuine-geographic-records`
- [ ] `GET /api/geocode/suggest?q=IIT%20Bombay` → Photon results with real coordinates
- [ ] `GET /api/geocode/resolve?q=IIT%20Bombay%20Mumbai` → Nominatim result with coordinates/provenance
- [ ] `GET /api/listings?lat=19.1334&lng=72.9133&radiusKm=5` → genuine OSM accommodation records or honest empty result
- [ ] `GET /api/listings/invalid-id` → 404
- [ ] `POST /api/auth/register`, `/api/auth/login`, `GET /api/auth/me` → real token flow
- [ ] `POST /api/contact`, `POST /api/enquiries`, `POST /api/submissions` → persisted records with `storage` label
- [ ] Unauthenticated `/api/submissions` and `/api/enquiries` → 401

## Routes

- [ ] `/`, `/search?q=Nirma%20University&radius=5`, `/explore` redirect, `/map`
- [ ] `/property/:id`, invalid property id, `/compare`, `/assistant`
- [ ] `/login`, `/register`, `/forgot-password`, `/profile`
- [ ] `/wishlist`, `/recently-viewed`
- [ ] `/owner/dashboard`, `/owner/add-property`, `/owner/listings`
- [ ] `/contact`, `/about`, `/faq`, `/privacy`, `/terms`, unknown route

## Interactions

- [ ] Location autocomplete, keyboard selection, GPS permission denial path, unresolved location message
- [ ] Radius, sort, every filter group, clear filters
- [ ] Save/remove favourite, compare up to 4, tray clear and navigation; snapshots survive refresh
- [ ] Map/list linking, pin selection, source attribution
- [ ] Property details: source, verification, availability, missing fields as “Not available”
- [ ] Enquiry form persists a record and shows the returned id/storage; no fake success
- [ ] Assistant suggestion chips enforce radius/budget constraints
- [ ] Auth validation, token persistence, sign-out, profile verification
- [ ] Owner form resolves a real location and submits a pending, unpublished record
- [ ] Contact form persists a message and shows the returned id/storage

## Quality

- [ ] No console errors or failed critical requests
- [ ] Skeletons and honest empty/error states appear correctly
- [ ] No invented phone numbers, owners, prices, reviews or availability
- [ ] Source attribution visible near maps and record metadata
- [ ] Buttons and inputs have accessible names; focus states visible; modal traps focus
- [ ] No horizontal overflow; compare tray does not cover footer content or toasts

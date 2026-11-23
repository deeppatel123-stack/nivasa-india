# QA results — 23 Nov 2026 (real-data rebuild)

## Automated checks

- `npm run test` — **39 tests passed** (14 frontend, 25 backend; Vitest 5.1.1).
- `npm run build` — passed; chunks split into `react`, `map`, `state`, `icons` and app entry.
- No TypeScript files remain in the active `frontend/` or `backend/` trees.
- No demo catalogue, demo geocoder or silent mock fallback remains in application paths.

## API verification (live server)

| Check | Result |
| --- | --- |
| `GET /api/health` | `status: ok`, `dataMode: genuine-geographic-records` |
| `GET /api/geocode/suggest?q=IIT%20Bombay` | Photon results with real coordinates |
| `GET /api/geocode/resolve?q=IIT%20Bombay%20Mumbai` | Nominatim result: `19.1326186, 72.9149702` |
| `GET /api/listings?lat=19.1326&lng=72.9150&radiusKm=5` | 1 genuine OSM record, 0 upstream errors |
| `GET /api/listings/osm:way:195072877` (cold cache) | 200; record re-fetched from Nominatim lookup |
| `GET /api/listings/does-not-exist` | 404 |
| `POST /api/auth/register` / `/login` / `GET /me` | Real token + scrypt password flow; `storage: local-development-file` |
| `POST /api/auth/forgot-password` | `delivery: not-configured`; explicitly says no email was sent |
| `POST /api/contact` | Persisted record with returned ID |
| `POST /api/enquiries` | Persisted record with returned ID |
| `GET /api/submissions` unauthenticated | 401 |
| `POST /api/submissions` authenticated | `status: pending`, `published: false`, returned ID |
| Production CSP | Allows OSM tiles and Google Fonts; no CSP console violations |

## Browser verification (connected Edge via OpenCode Browse)

- Desktop sweep at **1440px** and laptop at **1280px**: all 22 routes rendered with no horizontal overflow, no error boundary and no console errors.
- Tablet at **768px** and mobile at **375px**: 13 representative routes rendered with no horizontal overflow and no console errors.
- `/explore` redirects to `/search`.
- Typeahead: typing `IIT Bombay` returned Photon options; selecting the first produced `/search?...&lat=...&lng=...` and 1 genuine record.
- Radius `0.5 km` produced an honest empty state; restoring `5 km` restored the record.
- Max-rent filter excluded a record with no supplied rent; clearing filters restored it.
- Save and compare persisted full record snapshots; `/wishlist` and `/compare` displayed the same genuine record after navigation.
- Map view rendered OSM tiles and pin/card linking with attribution.
- Enquiry modal submitted to `/api/enquiries` and showed the returned ID, storage mode and an explicit “no email was sent” notice.
- Fixed during QA: location text was incorrectly used as a record keyword filter; property card had an out-of-scope `image` variable; Helmet CSP blocked OSM tiles; deep links failed after backend restart.
- Limitation: the paired browser disconnected during the final register/profile UI check. Register/login/me were verified through the live API and unit tests instead.

## Genuine record counts observed

- IIT Bombay, 5 km: **1**.
- IIT Delhi, 5 km: **1**.
- IIT Madras, 5 km: **1**.
- Nirma University, 5 km: **0** (honest empty state).
- Six city-centre queries at 10 km (Ahmedabad, Mumbai, Delhi, Chennai, Pune, Bengaluru): **5 unique** OSM accommodation records; Delhi returned 0.

Counts are live and source-dependent. There is no fixed catalogue in the product.

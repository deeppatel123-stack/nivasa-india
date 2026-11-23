# Architecture notes

## Workspaces

- `frontend/` — React 19 + Vite client. Vite proxies `/api` to the Express API in development.
- `backend/` — Express 4 API. In production it also serves `frontend/dist`.
- Root `package.json` provides workspace scripts and runs both processes with `dev:full`.

## Layering

### Frontend
- `pages/` — route composition only.
- `components/` — UI primitives, layout, feature components; no direct upstream fetch calls except through services.
- `features/` — domain logic (`listings`, `search`, `pricing`, `ai`, `locations`, `map`, `auth`).
- `services/` — `apiFetch`, geocoding client, auth token storage.
- `store/` — Zustand stores with validated persistence.

Service boundaries:
- `listingRepository` calls `/api/listings`; no demo fallback. Failure surfaces as an error state.
- `geocodingService` calls Photon/Nominatim exclusively through the backend proxy.
- `groundedAssistant` is a deterministic local ranker over the current genuine results; it is not an AI service.
- `mapProvider` is Leaflet + OpenStreetMap tiles with ODbL attribution.

### Backend
- `config/` — environment, optional Mongo connection.
- `routes/` — `/api` endpoint surface.
- `controllers/` — request/response mapping.
- `middleware/` — bearer-token authentication.
- `services/` — geocoding providers, cache/rate limiting, OSM discovery, listing search, auth, messages, submissions.
- `validators/` — request validation.
- `utils/` — errors, geo math, file store, response helpers.

## Search pipeline

1. `LocationSearchBar` queries Photon typeahead through `/api/geocode/suggest`.
2. Selection or free-text submit is resolved to real coordinates through `/api/geocode/resolve` (Nominatim).
3. Coordinates, radius, filters and sort are mirrored into the URL (`q`, `lat`, `lng`, `radius`, `category`).
4. `/api/listings` performs bounded OSM accommodation discovery, caches results, enforces radius/filters/sort server-side and returns provenance.
5. `searchListings()` re-checks the same constraints in the client and ranks by proximity plus data completeness. Missing prices are excluded from price sorts rather than treated as zero.
6. The same result objects feed the grid, map, assistant and comparison.

## Cost model

`calculateEffectiveCost()` separates recurring monthly charges from one-time move-in payments, never counts included food/electricity twice, and returns `null` when a required figure is absent. `formatINR(null)` renders **“Not available”**. Deposits are not described as refundable unless a source explicitly says so.

## State ownership

- Search state: `useSearchStore` (validated rehydration, URL sync).
- Shortlist / comparison / recent trail: `useSavedStore`, `useCompareStore`, `useRecentlyViewedStore`; each stores full record snapshots plus IDs.
- Auth: `useAuthStore` backed by `/api/auth/*` and a bearer token.
- Notifications: `useToastStore`.

## Persistence

- MongoDB is optional for listing records.
- Account, contact, enquiry and owner-submission records use MongoDB when connected, otherwise an explicit `backend/data/*.json` fallback. Every response reports `storage` so the UI can label it.
- The file fallback is real persistence for development; it is not a simulated inbox and never generates listings.

## Safety rules for contributors

- Never add fabricated listings, prices, contacts, owners, reviews or availability.
- Never present a stub as a live integration.
- Never scrape a portal or bypass authentication/anti-bot controls.
- Missing values must remain `null` and render as **“Not available”**.

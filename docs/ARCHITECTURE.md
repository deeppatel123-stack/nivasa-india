# Architecture notes

## Layering

Pages compose feature-agnostic UI primitives and feature services. Feature services are intentionally
small interfaces so a demo implementation can be replaced without rewriting pages:

- `ListingRepository` — returns `Property[]`; Express REST API today with an identical local demo fallback.
- `Geocoder` — resolves arbitrary Indian locations; demo uses a curated index of real places.
- `RentalAssistant` — returns grounded recommendations; demo uses deterministic rules.
- `MapProvider` — selects the map renderer; Leaflet/OSM today, schematic fallback available.

## Search pipeline

1. `LocationSearchBar` resolves text/GPS into `ResolvedLocation` via `demoGeocoder`.
2. `SearchState` (query, radius, filters, sort) is persisted in Zustand and reflected in the URL.
3. `searchListings()` applies filters, haversine radius, cost calculation and scoring.
4. Results feed the list, map and assistant. The same results power comparison cost calculations.

## Cost model

`calculateEffectiveCost()` keeps recurring monthly charges separate from one-time move-in payments and
never double-counts included food/electricity. `perPersonMonthly` divides by occupancy so comparisons
between a single room and a shared PG remain meaningful.

## State ownership

- Search state: `useSearchStore`
- Shortlist: `useSavedStore`
- Comparison (max 4): `useCompareStore`
- Recently viewed: `useRecentlyViewedStore`
- Demo session: `useAuthStore`
- Notifications: `useToastStore`

All are small Zustand stores with narrow selectors to avoid unnecessary renders.

## MERN backend

- `server/app.js` registers `/api/health` and `/api/listings`, then serves `dist/` in production so a single
  Node process hosts the whole app.
- `server/config/db.js` connects to MongoDB only when `MONGODB_URI` is set. When connected,
  `server/models/Listing.js` stores the labelled demo records; an empty collection is seeded from the
  shared `src/features/listings/demoListings.js` module.
- `GET /api/listings` supports `q`, `city`, `category`, `minRent` and `maxRent` query filters and returns a
  plain array for direct compatibility with `createRemoteListingRepository(baseUrl)`.
- Both list and detail responses include `X-Nivasa-Data-Mode` and `X-Nivasa-Data-Notice` headers.
- Vite proxies `/api` to `http://localhost:5000` during development; production uses the Express server directly.

## Safety rules for contributors

See `docs/CONVENTIONS.md` and the data policy in `README.md`. Never add fabricated listing data or
pretend a stub service is live.

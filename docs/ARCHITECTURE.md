# Architecture notes

## Layering

Pages compose feature-agnostic UI primitives and feature services. Feature services are intentionally
small interfaces so a demo implementation can be replaced without rewriting pages:

- `ListingRepository` — returns `Property[]`; demo today, REST/GraphQL tomorrow.
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

## Safety rules for contributors

See `docs/CONVENTIONS.md` and the data policy in `README.md`. Never add fabricated listing data or
pretend a stub service is live.

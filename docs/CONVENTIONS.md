# Nivasa conventions

## Absolute rules

- JavaScript + JSX only (ESM). React 19, Tailwind CSS 3, React Router 7, Zustand, TanStack Query.
- Client code lives in `frontend/src/`; Express code lives in `backend/src/`.
- Use the `@/` alias inside the client. Node ESM imports inside `backend/` include the `.js` extension.
- **Never invent a real property, phone number, owner name, market price, review or availability date.**
- Genuine geographic records may have missing economics; those fields stay `null` and render **“Not available”**.
- All upstream place data carries source name, source URL, fetched timestamp, verification state and quality label.
- No scraping, auth bypass, anti-bot bypass or Terms-of-Service violations.
- Keep layouts responsive at 375px, 768px and 1440px. Use `shell`, `card`, `field-control`, `surface-muted`.
- Use existing UI primitives instead of hand-rolling inputs/buttons.
- Every control must do something real. If a capability is not connected, show an honest unavailable state rather than a decorative button.

## Available primitives

- `@/components/ui/Button` — `Button`, `LinkButton`, `buttonClasses`.
- `@/components/ui/Badge`, `Input`, `Select`, `Checkbox`, `Toggle`, `Modal`, `Skeleton`, `EmptyState`, `SectionHeading`, `ToastViewport`.
- `@/components/common/DataQualityNotice` — use `<DataQualityNotice compact />` where source completeness needs explaining.
- `@/components/common/VerificationBadge`, `PriceDisplay`, `ErrorBoundary`.
- `@/components/property/PropertyCard` — `<PropertyCard property={p} result={maybeResult} layout="grid|list" />`.
- `@/components/search/LocationSearchBar` — remote Photon/Nominatim search, keyboard selection, GPS.
- `@/components/discovery/ActiveFilterChips`, `useListingResults`, `useSearchUrlSync`.
- `@/components/map/MapView` — `<MapView scene={{ center, radiusKm, markers, selectedId, onSelect, showRadius }} />`.
- `@/components/compare/CompareTray` is global; never render it inside a page.
- `@/components/layout/PageShell` — `<PageShell title description eyebrow breadcrumbs actions>children</PageShell>`.

## Data / services

- `useListings()` returns locally cached genuine records only (no demo catalogue).
- `useSearchListings(params)` and `useListing(id)` use TanStack Query against `/api/listings`.
- `geocodingService.suggest/resolve/reverse/status` proxies OSM providers.
- `apiFetch` adds the bearer token and throws `ApiError` with status/details.
- `calculateEffectiveCost`, `formatINR`, `formatDate` live in `@/features/pricing/pricing`.
- `searchListings` returns `{ property, distanceKm, monthlyExpense, perPersonMonthly, firstMonthOutflow, score }`.
- `groundedAssistant.reply(input, { location, radiusKm, results })` ranks only supplied genuine records.
- `haversineKm`, `formatDistance`, `estimateWalkMinutes` live in `@/features/locations/distance`.

## Stores

- `useSearchStore`: `query`, `radiusKm`, `filters`, `sort`, `resolvedLocation`.
- `useSavedStore`: `ids`, `items`, `toggle(id, property)`, `remove`, `clear`.
- `useCompareStore`: `ids`, `items`, `toggle(id, property)`, `MAX_COMPARE = 4`.
- `useRecentlyViewedStore`: `ids`, `items`, `add(id, property)`, `clear`.
- `useToastStore`: `push(message, tone)`, `dismiss`, `toasts`.

## Suggested visual language

Deep ink navy (`#0b161e`), teal (`#148b75`) and saffron (`#ea580c`) on warm off-white (`#f7f8f7`). Rounded 12–20px surfaces, fine borders, soft shadows, generous whitespace, restrained motion. No fake statistics, testimonials or stock photos presented as property photos.

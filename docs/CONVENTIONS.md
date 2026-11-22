# Nivasa frontend conventions (read before writing pages)

## Absolute rules
- TypeScript strict mode, React 19, Tailwind CSS 3, React Router 7, Zustand, TanStack Query.
- Import with the `@/` alias (e.g. `@/components/ui/Button`).
- **Never invent a real property, phone number, owner name, market price or review.** All listings come from
  `DEMO_LISTINGS` and are flagged `isDemo: true`. Show demo notices where data appears.
- Real place names/coordinates in `DEMO_PLACES` are geographic reference data, not listings.
- Do not modify shared files: `src/App.tsx`, `src/components/**` (except creating a new uniquely named folder),
  `src/features/**`, `src/store/**`, `src/styles/**`, configs, or package.json. Only replace your assigned page files.
- Keep layouts responsive at 375px, 768px and 1440px. Use `shell`, `card`, `field-control`, `surface-muted` helpers.
- Use existing UI primitives instead of hand-rolling inputs/buttons.

## Available primitives
- `@/components/ui/Button` — `Button`, `LinkButton`, `buttonClasses`; variants `primary|secondary|outline|ghost|danger`, sizes `sm|md|lg`.
- `@/components/ui/Badge` — `Badge`, tones `neutral|teal|amber|orange|blue|red|green`.
- `@/components/ui/Input`, `Select`, `Checkbox`, `Toggle`, `Modal`, `Skeleton`, `PropertyCardSkeleton`, `EmptyState`, `SectionHeading`, `ToastViewport`.
- `@/components/common/DemoDisclosure` — `<DemoDisclosure />` or `<DemoDisclosure compact />`.
- `@/components/common/VerificationBadge` — `<VerificationBadge state={property.verification} />`.
- `@/components/common/PriceDisplay`, `@/components/common/ErrorBoundary`.
- `@/components/property/PropertyCard` — `<PropertyCard property={p} result={maybeResult} layout="grid|list" />`.
- `@/components/search/LocationSearchBar` — `<LocationSearchBar variant="hero|compact" disableNavigation onSearched />`.
- `@/components/search/SearchFiltersPanel` — global store-backed filter panel.
- `@/components/map/MapView` — `<MapView scene={{ center, radiusKm, markers, selectedId, onSelect }} />`.
- `@/components/compare/CompareTray` is global; never render it inside a page.
- `@/components/layout/PageShell` — `<PageShell title description eyebrow breadcrumbs actions>children</PageShell>`.

## Data / services
- `useListings()` from `@/features/listings/queries` → `Property[]` (demo repository, async).
- `useListing(id)` → single `Property | null`.
- `Property` shape in `@/features/listings/types` includes `prices: PriceBreakdown`, `location.coordinates`,
  `amenities`, `verification`, `source`, `lastUpdated`, `isDemo`, `contact: null` for demos.
- `calculateEffectiveCost(prices, occupancy)` and `formatINR`, `formatDate` from `@/features/pricing/pricing`.
- `searchListings(listings, state, origin)` from `@/features/search/searchEngine` → `SearchResult[]`
  (`property`, `distanceKm`, `monthlyExpense`, `perPersonMonthly`, `firstMonthOutflow`, `score`).
- `demoGeocoder.suggest(query)` / `.resolve(query)` from `@/features/locations/geocoder`.
- `DEMO_PLACES`, `POPULAR_CITIES`, `POPULAR_UNIVERSITIES`, `POPULAR_TECH_HUBS` from `@/features/locations/demoLocations`.
- `haversineKm`, `formatDistance`, `estimateWalkMinutes` from `@/features/locations/distance`.
- `demoRulesAssistant.reply(input, { location, radiusKm, results })` from `@/features/ai/assistant`.
- `authService` + `useAuthStore` (`user`, `signIn`, `signUp`, `googleSignIn`, `requestPasswordReset`, `signOut`).
  Auth is UI-only and clearly labelled demo.

## Stores
- `useSearchStore`: `query`, `radiusKm`, `filters`, `sort`, `resolvedLocation`, setters.
- `useSavedStore`: `ids`, `toggle`, `remove`, `clear`.
- `useCompareStore`: `ids`, `toggle`, `remove`, `clear`, `MAX_COMPARE = 4`.
- `useRecentlyViewedStore`: `ids`, `add`, `clear`.
- `useToastStore`: `push(message, tone)`, `dismiss`, `toasts`.

## Suggested visual language
Deep ink navy (#0b161e) + teal (#148b75) + saffron (#ea580c) accents on warm off-white (#f7f8f7).
Rounded 12–20px surfaces, fine borders, soft shadows, generous whitespace, restrained motion. No giant gradients, no fake statistics/testimonials.

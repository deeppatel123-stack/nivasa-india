# Nivasa — Pan-India Accommodation Discovery (Frontend Phase)

Nivasa is a modern rental and accommodation discovery experience for India. This repository contains the
**frontend-only** phase: a scalable React/TypeScript application prepared for future backend, maps,
geocoding, AI and verified property-data integrations.

🔗 Repository: https://github.com/deeppatel123-stack/nivasa-india

> **Data integrity notice:** every listing in this build is an explicitly labelled **illustrative demo
> listing**. There are no real properties, real prices, real photographs of listed properties, real phone
> numbers, real owners or real reviews. Demo prices are not market quotes.

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173.

```bash
npm run typecheck   # TypeScript strict check
npm run test        # Vitest unit tests
npm run build       # Production build
npm run preview     # Preview production build
```

Node 20+ is recommended (developed on Node 22).

---

## Product experience

- Landmark-based search: cities, universities, companies, IT parks, localities and GPS "near me".
- Radius presets (1–20 km), sorting and a full filter panel (category, rent, furnishing, gender,
  occupancy, amenities, availability, verification).
- Search results with list/grid views, interactive map discovery and synchronised selection.
- Rich property detail pages with a transparent cost breakdown, demo contact gating, save and compare.
- Side-by-side comparison of up to four properties with occupancy-aware per-person costs and
  first-month outflow.
- Demo AI rental assistant UI with deterministic, clearly labelled local recommendations.
- Wishlist, recently viewed, profile, auth UI, owner dashboard UI, enquiry UI and reviews placeholder.
- About, contact, FAQ, privacy, terms and 404 pages.

---

## Architecture

```
src/
├─ app/                    (routing lives in App.tsx)
├─ components/
│  ├─ ui/                  reusable primitives (Button, Input, Modal, Badge…)
│  ├─ layout/              Navbar, Footer, PageShell
│  ├─ common/              demo disclosure, verification, price display, errors
│  ├─ property/            PropertyCard
│  ├─ search/              location search bar, filter panel
│  ├─ map/                 Leaflet + schematic map renderers
│  ├─ compare/             global comparison tray
│  ├─ discovery/ account/ detail/ owner/ content/  page-specific helpers
├─ features/
│  ├─ listings/            domain types, demo dataset, repository, queries
│  ├─ locations/           place index, geocoder interface, distance helpers
│  ├─ search/              filter/search engine
│  ├─ pricing/             cost calculation + INR formatting
│  ├─ ai/                  assistant interface + demo rules recommender
│  ├─ auth/                UI-only auth service
│  └─ map/                 provider abstraction
├─ store/                  Zustand stores (persisted where useful)
├─ pages/                  route pages
├─ styles/                 Tailwind layers and design tokens
└─ test/                   test setup
```

### Provider boundaries for phase two

| Concern | Current implementation | Future integration point |
| --- | --- | --- |
| Property data | `demoListingRepository` | `createRemoteListingRepository(baseUrl)` in `features/listings/repository.ts` |
| Geocoding | curated real-place index | implement `Geocoder` in `features/locations/geocoder.ts` |
| Maps | Leaflet + OpenStreetMap (or `VITE_MAP_PROVIDER=demo`) | `features/map/provider.ts` |
| AI | `demoRulesAssistant` | implement `RentalAssistant` in `features/ai/assistant.ts` |
| Auth | local demo session | replace `authService` with OAuth/backend calls |
| Owner submissions | UI previews only | connect an owner API and moderation workflow |

No secret keys are required. Copy `.env.example` to `.env` to change optional settings.

---

## Data policy

1. Never invent property listings, contact numbers, owners, reviews or market prices.
2. Demo records are flagged `isDemo: true`, `verification: 'demo'`, `source.type: 'demo'`, and carry a
   visible "Illustrative demo listing — not a real property" label.
3. Photography is generic, royalty-free stock imagery credited as illustrative; it is never presented as
   a photograph of an actual listing.
4. Contact CTAs in demo mode explain that verified contact information appears only after real providers
   or owners are connected.
5. Future data acquisition must use authorised APIs, partnerships, permitted public data or verified
   owner submissions, with source attribution, update timestamps and clear verification states. No scraping.

---

## Testing workflow

After each major change:

```bash
npm run typecheck && npm run test && npm run build
```

Then exercise the app in a browser: every route, search/filter controls, save/compare actions, auth forms,
owner forms, empty states, and 375px / 768px / 1440px layouts. Check the console for errors.

---

## Roadmap (not implemented in this phase)

- Backend APIs, database and authenticated owner workflows.
- Authorised property-provider integrations with verification and freshness tracking.
- Real geocoding and Google Maps / Mapbox provider.
- Real AI recommendation service with explainable rankings.
- Moderated reviews, enquiries, visit scheduling and notification system.
- Full privacy/legal review before public launch.

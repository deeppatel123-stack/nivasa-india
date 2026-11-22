# Nivasa — Pan-India Accommodation Discovery (MERN)

Nivasa is a rental and accommodation discovery experience for India, built with the **MERN stack in JavaScript** — React 19 + Vite on the client, Express + Node on the API, and optional MongoDB persistence.

🔗 Repository: https://github.com/deeppatel123-stack/nivasa-india

> **Data integrity notice:** every listing in this build is an explicitly labelled **illustrative demo
> listing**. There are no real properties, real prices, real photographs of listed properties, real phone
> numbers, real owners or real reviews. Demo prices are not market quotes. Auth, AI, owner submissions and
> contact forms are clearly labelled UI previews.

---

## Quick start

Node 20+ is recommended (developed on Node 22).

```bash
npm install
npm run dev          # React client only — falls back to local demo data (http://localhost:5173)
npm run dev:full     # Express API + Vite client together (API on :5000, client on :5173)
```

Optional MongoDB persistence:

```bash
cp .env.example .env
# set MONGODB_URI=mongodb://127.0.0.1:27017/nivasa
npm run dev:full
```

The API seeds the same labelled demo records into MongoDB on first run. Without `MONGODB_URI`, it serves them from memory — no database required.

### Useful commands

```bash
npm run test         # Vitest unit tests
npm run build        # Production client build
npm run preview      # Preview the production client
npm start            # Express serves /api and the built client from dist/
```

---

## Architecture

```
src/                         React 19 client (JavaScript + JSX)
├─ App.jsx                   route table
├─ components/
│  ├─ ui/                    Button, Input, Modal, Badge, EmptyState…
│  ├─ layout/                Navbar, Footer, PageShell
│  ├─ common/                demo disclosure, verification, price display, errors
│  ├─ property/ search/ map/ compare/
│  └─ discovery/ account/ detail/ owner/ content/  page-specific helpers
├─ features/
│  ├─ listings/              demo dataset, API repository, React Query hooks
│  ├─ locations/             place index, geocoder interface, distance helpers
│  ├─ search/ pricing/ ai/ auth/ map/
│  ├─ store/                 Zustand stores
│  └─ pages/                 19 route pages + 404/forgot-password
└─ test/                     Vitest setup

server/                      Express API (JavaScript, ESM)
├─ index.js                  bootstrap + graceful shutdown
├─ app.js                    middleware, routes, static client hosting
├─ config/db.js              optional Mongoose connection
├─ models/Listing.js         Mongoose listing schema
├─ routes/
│  ├─ health.js              GET /api/health
│  └─ listings.js            GET /api/listings, GET /api/listings/:id
└─ middleware/errorHandler.js
```

### Data flow

1. `useListings()` / `useListing(id)` call `listingRepository` (`features/listings/repository.js`).
2. It requests `/api/listings` (Vite proxies this to Express in development; Express serves it directly in production).
3. If the API is unavailable, the repository falls back to the identical local `DEMO_LISTINGS` module — the UI never invents data.
4. The Express API reads from MongoDB when connected (auto-seeding the labelled demo records if empty), otherwise from the same shared demo module.
5. `searchListings()` applies filters, haversine radius, cost calculation and scoring in the client. The same results power the map, assistant and comparison views.

Every API response carries `X-Nivasa-Data-Mode` and `X-Nivasa-Data-Notice` headers so the demo status is explicit.

### Integration boundaries

| Concern | Current implementation | Future integration point |
| --- | --- | --- |
| Property data | Express `/api/listings` with labelled demo records | verified owner/provider API + moderation |
| Geocoding | curated real-place index | implement `Geocoder` in `features/locations/geocoder.js` |
| Maps | Leaflet + OpenStreetMap (or `VITE_MAP_PROVIDER=demo`) | `features/map/provider.js` |
| AI | `demoRulesAssistant` | implement `RentalAssistant` in `features/ai/assistant.js` |
| Auth | local demo session | replace `authService` with real auth/backend calls |
| Owner submissions | UI previews only | connect an authenticated owner API |

No secret keys are required. See `.env.example` for optional settings.

---

## Data policy

1. Never invent property listings, contact numbers, owners, reviews or market prices.
2. Demo records are flagged `isDemo: true`, `verification: 'demo'`, `source.type: 'demo'`, `contact: null`, `lastUpdated: null` and `rating: null`, with a visible "Illustrative demo listing — not a real property" label.
3. Photography is generic, royalty-free stock imagery credited as illustrative; it is never presented as a photograph of an actual listing.
4. Contact CTAs explain that verified contact information appears only after real providers or owners are connected.
5. Future data acquisition must use authorised APIs, partnerships, permitted public data or verified owner submissions, with source attribution, update timestamps and clear verification states. No scraping.

---

## Testing workflow

After each major change:

```bash
npm run test && npm run build
```

Then exercise the app in a browser: every route, search/filter controls, save/compare actions, auth forms,
owner forms, empty states, and 375px / 768px / 1440px layouts. Check the console for errors and confirm
`/api/health` reports `status: ok`. See `docs/TESTING.md` and `docs/QA_RESULTS.md`.

---

## Roadmap (not implemented)

- Authenticated owner workflows, moderation and verified enquiry delivery.
- Authorised property-provider integrations with freshness tracking.
- Real geocoding and commercial map providers.
- Real AI recommendation service with explainable rankings.
- Moderated reviews, visit scheduling and notifications.
- Full privacy/legal review before public launch.

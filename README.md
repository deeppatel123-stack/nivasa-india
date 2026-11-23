# Nivasa — Pan-India Accommodation Discovery (MERN)

Nivasa is an accommodation **discovery** product for India, built in JavaScript with React 19 + Vite, Express + Node, and optional MongoDB persistence.

It does **not** claim to be a rental marketplace. It resolves any Indian city, locality, landmark, office or address, then shows genuine, attributed accommodation place records from OpenStreetMap near that point. Rent, availability, contact details, photos and reviews are displayed only when a source supplied them; otherwise they read **“Not available”**.

Repository: <https://github.com/deeppatel123-stack/nivasa-india>

---

## Quick start

Node 20+ (developed on Node 22).

```bash
npm install
cp .env.example .env          # optional; see configuration below
npm run dev:full              # API on :5000, client on :5173
```

Client only (the UI requires the API for search, auth and forms):

```bash
npm run dev                   # http://localhost:5173
```

Production:

```bash
npm run build
npm start                     # Express serves /api and frontend/dist
```

### Environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `CLIENT_ORIGIN` | Comma-separated CORS origins | `http://localhost:5173,http://localhost:4173` |
| `MONGODB_URI` | Optional MongoDB persistence | unset (JSON-file fallback) |
| `JWT_SECRET` | Required for signed auth tokens in production | ephemeral dev secret |
| `GEOCODER_USER_AGENT` | Contact-capable User-Agent for Nominatim | `Nivasa/1.0 …` |
| `GEOCODE_MIN_INTERVAL_MS` | Nominatim rate-limit spacing | `1200` |
| `DISCOVERY_CACHE_TTL_MS` | Nearby-discovery cache | `900000` |
| `GOOGLE_MAPS_API_KEY` | Reserved for an authorized Places adapter | unset |

Without `MONGODB_URI`, account, contact, enquiry and owner-submission data is saved to a local JSON file and every response reports `storage: 'local-development-file'`. This is real persistence for development, not a mock inbox or fabricated listing feed. For production, configure MongoDB and a durable `JWT_SECRET`.

---

## Architecture

```text
frontend/                         React 19 client
├─ src/
│  ├─ components/                 UI, layout, search, map, property, account, detail, owner
│  ├─ features/                   listings, search, pricing, geocoding, AI, map, auth
│  ├─ pages/                      route pages
│  ├─ services/                   API, geocoding, auth token
│  ├─ store/                      Zustand stores
│  └─ test/                       Vitest setup
└─ vite.config.js                 /api proxy + chunk splitting

backend/                          Express API
├─ src/
│  ├─ config/                     env + Mongo connection
│  ├─ controllers/                HTTP layer
│  ├─ middleware/                 auth
│  ├─ models/                     Mongoose listing schema
│  ├─ routes/                     /api surface
│  ├─ services/                   geocoding, discovery, listings, submissions, auth, messages
│  ├─ utils/                      cache, rate limiting, file store, errors, geo
│  └─ validators/                 request validation
└─ tests/                         Vitest suites
```

### API surface

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Live status and data mode |
| `GET` | `/api/geocode/suggest` | Photon typeahead via server cache/rate limit |
| `GET` | `/api/geocode/resolve` | Nominatim forward geocoding |
| `GET` | `/api/geocode/reverse` | Nominatim reverse geocoding |
| `GET` | `/api/geocode/status` | Provider configuration and key availability |
| `GET` | `/api/listings` | Genuine records near `lat`,`lng`,`radiusKm` with filters/sort |
| `GET` | `/api/listings/:id` | Single genuine record |
| `POST` | `/api/auth/register` | Real account creation |
| `POST` | `/api/auth/login` | Real password verification |
| `GET` | `/api/auth/me` | Verify token and return user |
| `POST` | `/api/auth/forgot-password` | Honest “email delivery not configured” response |
| `POST` | `/api/contact` | Persist a contact message |
| `POST` | `/api/enquiries` | Persist an enquiry about a genuine record |
| `GET` | `/api/enquiries` | User's enquiries (auth required) |
| `POST` | `/api/submissions` | Owner submission, pending moderation (auth required) |
| `GET` | `/api/submissions` | Current owner's submissions (auth required) |

Every listing response includes provider, source URL, fetched timestamp, verification state, availability and a data-quality label. The API sets `X-Nivasa-*` headers describing the data mode.

### Data flow

1. The user types any location. `LocationSearchBar` calls Photon through `/api/geocode/suggest`.
2. Selecting a result resolves it through Nominatim and stores real coordinates plus provenance.
3. `/api/listings` discovers genuine OSM accommodation POIs inside the real radius, caches them, applies server-side filters/sort and returns attributed records.
4. The client re-checks radius/filters, ranks by proximity and completeness, and renders list/map results.
5. Saved, compared and recently viewed pages persist full record snapshots locally so they never need invented data.

No demo catalogue, no silent mock fallback and no scraping are present. See `docs/DATA_SOURCES.md` for the source investigation and `docs/FINAL_REPORT.md` for implementation status and blockers.

---

## Data policy

1. No fabricated property, price, coordinate, phone, owner, review, image-of-property or availability.
2. Missing values render as **“Not available”**, never inferred.
3. Only attributable, permitted sources are ingested: OSM place data, owner submissions and future authorized feeds.
4. Owner submissions are `pending` / unpublished until a moderation workflow approves them.
5. If a provider is unavailable, the UI shows an honest empty/error state.

---

## Testing

```bash
npm run test              # backend + frontend Vitest suites
npm run test:backend
npm run test:frontend
npm run build
npm run dev:full
```

Browser QA should cover desktop (1440px), laptop (1280px), tablet (768px) and mobile (375px): arbitrary-location search, radius/filter/sort, map/list linking, save/compare/recent, account flows, contact, owner submission and enquiry. Confirm `/api/health` returns `status: ok` and the browser console is free of errors.

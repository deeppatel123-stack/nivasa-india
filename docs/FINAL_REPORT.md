# Nivasa — final implementation report

**Date:** 23 Nov 2026  
**Branch:** `main`  
**Repository:** <https://github.com/deeppatel123-stack/nivasa-india>  
**Status:** real-data discovery product implemented and verified; partner/credential integrations remain blocked by access, not code.

---

## 1. Problems identified

The original app looked like a rental marketplace but was a frontend demo with a thin Express shim:

- **Fabricated inventory:** 19 synthetic listings with invented rents, deposits, coordinates, availability and photos.
- **Silent mock fallback:** any API failure replaced real results with demo records, making error states unreachable.
- **Fake location coverage:** a hardcoded list of ~37 places and a stub geocoder; arbitrary Indian locations were not searchable.
- **Non-functional workflows:** auth, contact, enquiry, owner submission, password reset and “AI” assistant were toasts or deterministic demos.
- **Poor provenance:** no source URL, provider ID, fetch time, verification state or freshness on records.
- **Architectural coupling:** Express imported frontend demo data; configs duplicated paths; no backend layers.
- **Data-quality lies:** `verifiedOnly`, `updated` sort, ratings, reviews and refundable-deposit claims had no evidence.
- **UI/robustness issues:** divergent radius controls, unsanitised map popup HTML, unvalidated persisted state, no focus trap, dead controls and responsive defects.

The full audit is in `docs/AUDIT.md`.

---

## 2. Architecture improvements

- Split the repository into npm workspaces: `frontend/` (React 19 + Vite) and `backend/` (Express 4).
- Backend layers: `config`, `routes`, `controllers`, `middleware`, `models`, `services`, `validators`, `utils`.
- Frontend layers: `pages`, `components`, `features`, `services`, `store`, `test`.
- Replaced the demo repository with a genuine API repository; failures now surface as explicit error states.
- Added a cached, rate-limited geocoding proxy: Photon for typeahead, Nominatim for forward/reverse/lookup.
- Added bounded OSM accommodation discovery with per-record provenance.
- Added Helmet, CORS, JSON limits, rate limiting, centralised errors and honest `X-Nivasa-*` headers.
- Added a CSP that permits OSM tiles and Google Fonts while keeping scripts self-hosted.
- Added optional MongoDB persistence. Without `MONGODB_URI`, account/contact/enquiry/submission records use an explicitly labelled `local-development-file` store; production requires MongoDB or an explicit opt-in.
- Added bearer-token auth with scrypt password hashing and HMAC-signed tokens; production requires `JWT_SECRET`.
- Added validated Zustand rehydration for search state and full-record snapshots for saved/compared/recent items.

Architecture details: `docs/ARCHITECTURE.md`.

---

## 3. UI fixes

- Removed every demo/illustrative catalogue reference from application code and copy.
- Converted the legacy disclosure into a `DataQualityNotice` explaining incomplete genuine records.
- Single radius control now syncs store and URL; `0.5` km is valid end to end.
- Map: Leaflet/OSM only, DOM-text popups, correct marker anchoring, radius shown only when requested, visible attribution and an honest unavailable state in test DOMs.
- Fixed a property-card scope bug (`image` used outside its component) that crashed the results page.
- Fixed the location query being incorrectly sent as a record keyword filter.
- Modal focus trap, focus restore, Escape close and ARIA labelling; toasts moved above the compare tray.
- Rent filters exclude records with no supplied rent; deposits are never assumed refundable.
- Compare limit feedback, honest list/map empty states, real loading and error states.
- Verified no horizontal overflow at 1440px, 1280px, 768px and 375px.

---

## 4. Features implemented

| Feature | Status |
| --- | --- |
| Any Indian city/locality/landmark/office/address typeahead | Live via Photon proxy |
| Forward/reverse geocoding and GPS | Live via Nominatim/browser geolocation |
| Real radius search and distance display | Live with haversine math, server + client enforcement |
| Map and list results | Live with Leaflet/OSM and linked selection |
| Filters, sort, URL share state | Live; missing-price records are excluded from price constraints |
| Source provenance and freshness | Live per record: provider, URL, licence, fetched time |
| Save / compare / recently viewed | Live with full record snapshots |
| Grounded recommendations | Live deterministic ranker over current genuine results; no AI service claimed |
| Account register/login/me/sign-out | Live API flow with bearer tokens |
| Password reset | Honest status endpoint; explicitly no email sent |
| Contact messages | Live persisted records with returned IDs |
| Enquiries | Live persisted records with returned IDs; honest no-notification notice |
| Owner submissions | Auth-required, `pending`, unpublished, listed back to owner |
| Content/legal/FAQ pages | Rewritten around the real product and current blockers |

---

## 5. Data sources investigated

| Source | Outcome |
| --- | --- |
| 99acres | `robots.txt` returned HTTP 403; no public API. Requires commercial agreement. |
| Magicbricks | Robots disallow listing/API paths; no public API. Do not scrape. |
| NoBroker | Robots disallow API/listing/search paths. Do not scrape. |
| Housing.com, OLX India, Zolo, Stanza Living | No documented public listing API; terms restrict automated collection. |
| Google Places API (New) | Would need billing-enabled key; yields places/contact/photos, not rent or availability. |
| Nominatim (OSMF) | Live integration: max 1 req/s, valid User-Agent, cache and attribution required. |
| Photon (komoot/OSM) | Live integration: typeahead through cached server proxy. |
| OSM tiles/data | Live map and genuine place records; ODbL attribution shown. |
| Open datasets | No reliable property-level rent/availability records with coordinates. |

Full findings: `docs/DATA_SOURCES.md`.

---

## 6. Actual integrations completed

- **Photon** — `/api/geocode/suggest`.
- **Nominatim** — `/api/geocode/resolve`, `/api/geocode/reverse`, `/api/listings` bounded discovery and cold deep-link lookup.
- **OpenStreetMap tiles** — Leaflet map with required attribution.
- **MongoDB driver** — implemented but inactive because no `MONGODB_URI` was supplied.
- **Local JSON persistence** — active, labelled, development-only fallback for accounts/messages/submissions.
- **Auth** — scrypt hashing and HMAC-signed bearer tokens; ephemeral dev secret unless `JWT_SECRET` is set.
- **Email** — not integrated; endpoint reports `delivery: 'not-configured'`.

No scraping, anti-bot bypass, auth bypass or partner ToS violation was used.

---

## 7. Genuine record count

There is no fixed catalogue. Records are discovered live from OSM around the resolved coordinates.

Observed during final QA:

- IIT Bombay, 5 km: **1** genuine record.
- IIT Delhi, 5 km: **1**.
- IIT Madras, 5 km: **1**.
- Nirma University, 5 km: **0** — rendered as an honest empty state.
- Ahmedabad, Mumbai, Chennai, Pune, Bengaluru at 10 km: **1 each**; Delhi: **0** → **5 unique** OSM accommodation records across six city queries.

These are geographic accommodation place records, not verified rental offers. Rent, deposit, contact, availability, photos and reviews remain **“Not available”** unless a source supplies them.

---

## 8. Features needing API access or credentials

1. **Partner listing feeds** — 99acres, Magicbricks, NoBroker, Housing.com, OLX, Zolo, Stanza Living. Needed for genuine rents, inventory and availability.
2. **Google Places API key** with billing — would enrich place identity, phone and photos; still would not provide rent/availability.
3. **MongoDB URI** — required for durable production persistence.
4. **`JWT_SECRET`** — required for stable production sessions.
5. **Email transport** — required before any reset/notification email can truthfully be sent.
6. **Moderation workflow/admin UI** — owner submissions are safely pending/unpublished; approval tooling would make them publishable.

---

## 9. Tests and results

- `npm run test` — **39 passed** (14 frontend, 25 backend).
- `npm run build` — passed.
- Live API smoke checks — health, Photon suggest, Nominatim resolve, OSM listings, detail by ID, auth register/me, contact, enquiry, submissions, 401 guard and forgot-password status all passed.
- Browser QA — 22 routes at desktop/laptop widths and 13 representative routes at tablet/mobile widths; no overflow, no console errors, no error boundaries.
- Interaction QA — typeahead selection, URL coordinate round-trip, radius, rent filter, clear filters, save, compare, map pins/tiles and enquiry submission all passed.
- Detailed evidence: `docs/QA_RESULTS.md`.

---

## 10. Blockers

- No lawful free source of genuine Indian rental listing records exists without partnership; OSM coverage is sparse and economically incomplete.
- No partner API credentials or written authorization.
- No `GOOGLE_MAPS_API_KEY`.
- No `MONGODB_URI`.
- No email delivery configured.
- The paired browser disconnected during the final register/profile UI check; those flows were verified at API and unit-test level instead.

The product is therefore honest about what it is: a pan-Indian, attributed accommodation **discovery** product with real geocoding and genuine geographic records — not a fabricated rental marketplace.

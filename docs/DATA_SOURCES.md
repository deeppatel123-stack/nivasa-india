# Real property data sources — investigation (23 Nov 2026)

## Method
Direct checks of official documentation and robots policies. No scraping was performed and no authentication/anti-bot controls were bypassed.

## Findings

| Source | Access reality | Usable for genuine listings? |
| --- | --- | --- |
| 99acres | `robots.txt` request returned HTTP 403; no public developer API documented. Commercial/partner access would need a formal agreement. | No, without authorization. |
| Magicbricks | `robots.txt` disallows `/property/`, `/propertyDetails/`, `/property-for-rent/Hostel-*`, `/property-agent-details` for generic crawlers; no public listing API. | No. Do not scrape. |
| NoBroker | `robots.txt` disallows `/api/v1/`, `/api/v2/`… `/property/listing/`, `/search-hs`; no public listing API. | No. Do not scrape. |
| Housing.com / OLX India / Zolo / Stanza Living | No documented public listing API; terms restrict automated collection. Individual PG/hostel sites likewise. | No, without partnership. |
| Google Places API (New) | Official API; requires enabled **billing** and an API key or OAuth token. SKUs include Text Search, Nearby Search, Place Details, Photos, Contact Data; per-request field masks and quotas apply. Can return place name, address, coordinates, phone (billed Contact SKU), photos (billed) and ratings. | Partially: useful for discovering *places* and attributed contact data, but **does not provide rental price, deposit, availability or room inventory**. Not a substitute for listing data. |
| Nominatim (OSMF) | Free, but strict usage policy: **max 1 request/second**, valid User-Agent/Referer, visible OSM attribution, ODbL share-alike, caching required, **autocomplete and bulk geocoding prohibited**, service may be changed/withdrawn. | Yes, for low-volume, user-triggered forward/reverse geocoding behind a caching proxy with attribution. Not for autocomplete. |
| Photon (komoot, OSM) | Free typeahead geocoder (`/api/?q=…`, `/reverse?…`), OpenStreetMap data, GeoJSON. Terms allow project use but "extensive usage will be throttled"; availability not guaranteed. | Yes, for search-as-you-type place resolution behind a caching proxy, with OSM attribution. |
| OpenStreetMap tiles/data | Open data under ODbL; free tile endpoints are governed by the OSM tile usage policy; attribution required. | Map display with attribution; not property listings. |
| Open datasets (data.gov.in, Kaggle, academic) | May contain housing/census aggregates; no reliable property-level rental records with source, price, availability and coordinates suitable for a live discovery product. | No for live listings. |

## Conclusion

1. **No free, lawful source of genuine Indian rental listing records exists** for this product. The portals either block automated access or require commercial partnership.
2. **Geocoding any Indian location is achievable** with Photon (typeahead) and/or Nominatim (forward/reverse), subject to their policies. Both must be proxied, cached, rate-limited and attributed by the backend.
3. **Google Places can be integrated** if a billing-enabled API key is supplied, but it yields place/contact/photo data — not rents or availability. It cannot fabricate the missing listing economics.
4. **Genuine listing records can only come from** authorized provider feeds, formal partnerships, or direct owner/property-manager submissions with verification and moderation.
5. Therefore the implementation must:
   - ship a real geocoding service now;
   - provide validated ingestion endpoints for owner submissions and authorized imports with full provenance;
   - provide adapters for Google Places and partner feeds that activate only with credentials;
   - show honest empty states when no genuine records exist;
   - **never** replace a failed integration with sample listings.

## Required credentials for further integration
- `GOOGLE_MAPS_API_KEY` — billing-enabled Google Cloud project, Places API (New) enabled.
- Partner API credentials — negotiated separately with each portal/provider; terms and rate limits contract-specific.
- Owner submissions — no credentials, but require real users and moderation workflow.

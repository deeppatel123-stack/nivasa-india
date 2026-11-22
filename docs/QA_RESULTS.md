# QA results — 22 Nov 2026 (MERN + JavaScript conversion)

## Automated checks
- `npm run test` — 3 files, 12 tests passed (Vitest 5.1.1).
- `npm run build` — passed; vendor chunks split into `react`, `map`, `state`, `icons` and `motion` (no chunk-size warning).
- `npm audit` / `npm audit --omit=dev` — 0 vulnerabilities.
- No TypeScript files or configs remain in `src/`, `server/` or the project root.

## API verification
- `GET /api/health` → `status: ok`, `dataMode: demo-memory` when no `MONGODB_URI` is configured.
- `GET /api/listings` → 19 records, all `isDemo: true`, `verification: 'demo'`, `contact: null`.
- `GET /api/listings/demo-nirma-budget-pg` → correct labelled demo record.
- `GET /api/listings/does-not-exist` → 404 with demo notice.
- `GET /api/listings?category=pg&city=Ahmedabad` → 3 filtered demo records.
- Response headers include `X-Nivasa-Data-Mode` and an ASCII-safe `X-Nivasa-Data-Notice`.

## Browser verification
- Used the connected Edge browser through OpenCode Browse.
- `/search?q=Nirma%20University&radius=5` rendered "Stays near Nirma University" with demo disclosures and no console errors.
- Captured network traffic confirmed `GET /api/listings` through the Vite proxy returned 200 from Express (`x-powered-by: Express`, `x-nivasa-data-mode: demo-memory`).
- No horizontal overflow on the checked search page.

## Conversion notes
- All 59 `.tsx` files became `.jsx` and all 28 `.ts` files became `.js` using TypeScript's emitter with `jsx: preserve`; runtime behaviour and JSX readability were retained.
- `vite.config.ts` → `vite.config.js` (ESM-safe `__dirname` replacement) and `tailwind.config.ts` → `tailwind.config.js`.
- `index.html` now loads `/src/main.jsx`.
- Added the Express/MongoDB API, optional `.env` configuration, `dev:full` and production `start` scripts.
- Frontend queries now use the API repository with a graceful in-memory demo fallback.

import { asyncHandler } from '../utils/asyncHandler.js';
import { getListing, searchListings } from '../services/listingService.js';

function canViewDiagnostics(req) {
  return req.user?.role === 'admin';
}

function sanitizeMeta(meta, req) {
  if (canViewDiagnostics(req)) return meta;
  const { diagnostics, ...safe } = meta || {};
  return safe;
}

export const searchListingsController = asyncHandler(async (req, res) => {
  const result = await searchListings(req.query);
  res.set('Cache-Control', 'private, max-age=60');
  res.set('X-Nivasa-Data-Mode', 'genuine-geographic-records');
  if (result?.meta?.note) res.set('X-Nivasa-Data-Notice', result.meta.note);
  if (result?.meta?.attribution) res.set('X-Nivasa-Attribution', result.meta.attribution);
  return res.json({ ...result, meta: sanitizeMeta(result.meta, req) });
});

export const getListingController = asyncHandler(async (req, res) => {
  const listing = await getListing(String(req.params.id));
  res.set('Cache-Control', 'private, max-age=60');
  res.set('X-Nivasa-Data-Mode', listing.isDemo ? 'demo' : 'genuine-geographic-records');
  return res.json(listing);
});

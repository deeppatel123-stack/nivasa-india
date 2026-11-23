import { asyncHandler } from '../utils/asyncHandler.js';
import { getListing, searchListings } from '../services/listingService.js';

export const searchListingsController = asyncHandler(async (req, res) => {
  const result = await searchListings(req.query);
  res.set('Cache-Control', 'private, max-age=60');
  res.set('X-Nivasa-Data-Mode', 'genuine-geographic-records');
  res.set('X-Nivasa-Data-Notice', result.meta.note);
  res.set('X-Nivasa-Attribution', result.meta.attribution);
  return res.json(result);
});

export const getListingController = asyncHandler(async (req, res) => {
  const listing = await getListing(String(req.params.id));
  res.set('Cache-Control', 'private, max-age=60');
  res.set('X-Nivasa-Data-Mode', listing.isDemo ? 'demo' : 'genuine-geographic-records');
  return res.json(listing);
});

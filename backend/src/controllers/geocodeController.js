import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/errors.js';
import { geocoderStatus, resolvePlace, reverseGeocode, suggestPlaces } from '../services/geocoding/index.js';
import { isValidCoordinate } from '../utils/geo.js';

export const suggestPlacesController = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (query.length < 2) return res.json({ items: [], provider: 'none', available: true, indiaOnly: true, diagnostics: { query } });
  const result = await suggestPlaces(query, Math.min(Number(req.query.limit) || 6, 10));
  return res.json(result);
});

export const resolvePlaceController = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) throw badRequest('A location query is required.');
  const result = await resolvePlace(query);
  return res.json(result);
});

export const reverseGeocodeController = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!isValidCoordinate(lat, lng)) throw badRequest('Valid latitude and longitude are required.');
  return res.json(await reverseGeocode(lat, lng));
});

export const geocoderStatusController = asyncHandler(async (_req, res) => {
  return res.json(geocoderStatus());
});

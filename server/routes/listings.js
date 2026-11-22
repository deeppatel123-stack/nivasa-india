import { Router } from 'express';
import { dbState } from '../config/db.js';
import { Listing } from '../models/Listing.js';
import { DEMO_LISTINGS } from '../../src/features/listings/demoListings.js';

const router = Router();

const DEMO_NOTICE =
  'Illustrative demo listings only — not real properties, prices, photographs, contacts or reviews.';

function filterListings(listings, query) {
  const term = (query.q || '').trim().toLowerCase();
  const category = (query.category || '').trim();
  const city = (query.city || '').trim().toLowerCase();
  const minRent = Number(query.minRent);
  const maxRent = Number(query.maxRent);

  return listings.filter((listing) => {
    if (category && listing.category !== category) return false;
    if (city && listing.location.city.toLowerCase() !== city) return false;
    if (Number.isFinite(minRent) && query.minRent !== undefined && listing.prices.rent < minRent) return false;
    if (Number.isFinite(maxRent) && query.maxRent !== undefined && listing.prices.rent > maxRent) return false;
    if (term) {
      const haystack = [
        listing.title,
        listing.description,
        listing.location.label,
        listing.location.city,
        listing.location.state,
        listing.landmark,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

function toApiListing(document) {
  const plain = typeof document.toObject === 'function' ? document.toObject() : { ...document };
  delete plain._id;
  delete plain.__v;
  return plain;
}

async function loadListings() {
  if (!dbState.connected) return DEMO_LISTINGS;

  const count = await Listing.countDocuments();
  if (count === 0) {
    await Listing.insertMany(DEMO_LISTINGS);
    console.info('[db] Seeded labelled demo listings into MongoDB.');
  }
  const documents = await Listing.find({}).lean();
  return documents.map(toApiListing);
}

/** GET /api/listings — always returns labelled demo records, never invented data. */
router.get('/', async (req, res, next) => {
  try {
    const listings = filterListings(await loadListings(), req.query);
    res.set('X-Nivasa-Data-Mode', dbState.connected ? 'mongodb' : 'demo-memory');
    res.set('X-Nivasa-Data-Notice', 'Illustrative demo listings only - not real properties, prices, photos, contacts or reviews.');
    res.json(listings);
  } catch (error) {
    next(error);
  }
});

/** GET /api/listings/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const listings = await loadListings();
    const listing = listings.find((item) => item.id === req.params.id || item.slug === req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found', notice: DEMO_NOTICE });
      return;
    }
    res.set('X-Nivasa-Data-Mode', dbState.connected ? 'mongodb' : 'demo-memory');
    res.json(toApiListing(listing));
  } catch (error) {
    next(error);
  }
});

export default router;

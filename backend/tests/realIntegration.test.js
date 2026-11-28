import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { connectDB } from '../src/config/db.js';
import { suggestPlaces, resolvePlace } from '../src/services/geocoding/index.js';
import { discoverAccommodation } from '../src/services/discoveryService.js';
import { Listing } from '../src/models/Listing.js';

const hasGoogle = Boolean(env.googleMapsKey);
const hasMongo = Boolean(env.mongoUri);
const maybe = (cond) => (cond ? it : it.skip);

describe('Phase 2 real integration (runs only with credentials/services)', () => {
  maybe(hasGoogle)('Google Places Text Search (New) returns India results', async () => {
    const result = await suggestPlaces('Powai Mumbai', 3);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].countryCode).toBe('IN');
  });

  maybe(hasGoogle)('Google Geocoding/resolve returns coordinates', async () => {
    const result = await resolvePlace('LJ University Ahmedabad');
    expect(result.coordinates.lat).toBeTypeOf('number');
    expect(result.coordinates.lng).toBeTypeOf('number');
    expect(result.countryCode).toBe('IN');
  });

  maybe(hasGoogle)('Google Nearby Search (New) finds accommodation businesses', async () => {
    const result = await discoverAccommodation({ center: { lat: 23.0225, lng: 72.5714 }, radiusKm: 5 });
    expect(result.diagnostics.providers.some((p) => p.name === 'google_places_nearby')).toBe(true);
  });

  it('Photon/Nominatim fallback path is exercised in mocked tests; live public endpoint smoke test is optional', async () => {
    // Deterministic CI-safe assertion: status reports fallback providers.
    const result = await suggestPlaces('zzzz-unlikely-place-zzzz', 3);
    expect(result.indiaOnly).toBe(true);
    expect(Array.isArray(result.diagnostics.providers)).toBe(true);
  });

  maybe(hasMongo)('MongoDB connects, stores GeoJSON Point, creates 2dsphere index, and runs $near', async () => {
    await connectDB();
    const indexes = await Listing.collection.indexes();
    expect(indexes.some((idx) => idx.key?.location === '2dsphere')).toBe(true);

    const externalId = `test:phase2:${Date.now()}`;
    await Listing.updateOne(
      { externalId },
      {
        $set: {
          externalId,
          provider: 'owner_submission',
          recordType: 'rental_listing',
          title: 'Integration Test Listing',
          slug: externalId,
          category: 'pg',
          address: { label: 'Test', city: 'Ahmedabad', state: 'Gujarat', country: 'India', postcode: '380051' },
          coordinates: { lat: 23.0225, lng: 72.5714 },
          location: { type: 'Point', coordinates: [72.5714, 23.0225] },
          prices: { rent: 10000, deposit: 10000, maintenance: null, electricity: null, food: null, brokerage: null, other: null, currency: 'INR' },
          source: { name: 'integration-test', url: '', licence: 'test', fetchedAt: new Date() },
          verification: 'verified',
          isDemo: false,
        },
      },
      { upsert: true }
    );

    const found = await Listing.find({
      location: { $near: { $geometry: { type: 'Point', coordinates: [72.5714, 23.0225] }, $maxDistance: 2000 } },
      externalId,
    }).lean();
    expect(found.length).toBeGreaterThan(0);
    expect(found[0].location.coordinates).toEqual([72.5714, 23.0225]);

    await Listing.deleteOne({ externalId });
    await mongoose.disconnect();
  });
});

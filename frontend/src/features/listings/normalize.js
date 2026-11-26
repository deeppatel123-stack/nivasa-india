const numericOrNull = (value) => (Number.isFinite(Number(value)) && value !== null && value !== '' ? Number(value) : null);

/** Map an API record into the view model used by the UI. Missing data stays missing. */
export function normaliseListing(record) {
  if (!record || !record.externalId) return null;
  const coordinates = record.coordinates || {};
  const address = record.address || {};
  const prices = record.prices || {};
  const source = record.source || {};
  return {
    id: record.externalId,
    slug: record.slug || record.externalId,
    title: record.title || 'Accommodation name not available',
    category: record.category || 'other',
    description: record.description || '',
    location: {
      label: address.label || 'Address not available',
      city: address.city || '',
      state: address.state || '',
      coordinates: {
        lat: numericOrNull(coordinates.lat),
        lng: numericOrNull(coordinates.lng),
      },
    },
    landmark: null,
    prices: {
      rent: numericOrNull(prices.rent),
      deposit: numericOrNull(prices.deposit),
      maintenance: numericOrNull(prices.maintenance),
      electricity: numericOrNull(prices.electricity),
      food: numericOrNull(prices.food),
      brokerage: numericOrNull(prices.brokerage),
      other: numericOrNull(prices.other),
      electricityIncluded: Boolean(prices.electricityIncluded),
      foodIncluded: Boolean(prices.foodIncluded),
    },
    occupancy: record.occupancy || null,
    furnishing: record.furnishing || null,
    genderPreference: record.genderPreference || null,
    amenities: Array.isArray(record.amenities) ? record.amenities : [],
    rules: Array.isArray(record.rules) ? record.rules : [],
    images: Array.isArray(record.images) ? record.images : [],
    availableFrom: record.availableFrom || null,
    areaSqft: numericOrNull(record.areaSqft),
    contact: record.contact || null,
    verification: record.verification || 'unverified',
    availability: record.availability || 'unconfirmed',
    quality: record.quality || 'information_incomplete',
    recordType: record.recordType || (record.isDemo ? 'demo_listing' : (Number.isFinite(Number(prices.rent)) ? 'rental_listing' : 'accommodation_business')),
    origin: record.provider || 'unknown',
    source: {
      name: source.name || 'Source not available',
      type: source.type || record.provider || 'unknown',
      url: source.url || '',
      licence: source.licence || '',
      fetchedAt: source.fetchedAt || null,
    },
    lastUpdated: source.fetchedAt || record.updatedAt || null,
    distanceKm: numericOrNull(record.distanceKm),
    isDemo: Boolean(record.isDemo),
    featured: false,
    rating: null,
    reviewCount: 0,
  };
}

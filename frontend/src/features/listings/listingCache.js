const records = new Map();
const listeners = new Set();

function readPersisted(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    return parsed?.state?.items || {};
  } catch {
    return {};
  }
}

/** Rehydrate snapshots saved by wishlist/compare/recently-viewed so those pages work offline. */
for (const key of ['nivasa.saved', 'nivasa.compare', 'nivasa.recently-viewed']) {
  const items = readPersisted(key);
  Object.values(items).forEach((item) => {
    if (item?.id) records.set(item.id, item);
  });
}

export function rememberListing(listing) {
  if (!listing?.id) return;
  records.set(listing.id, listing);
  listeners.forEach((listener) => listener(listing));
}

export function rememberListings(listings = []) {
  listings.forEach(rememberListing);
}

export function getCachedListing(id) {
  return records.get(id) || null;
}

export function listCachedListings() {
  return Array.from(records.values());
}

export function clearListingCache() {
  records.clear();
}

export function subscribeToCache(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const EMPTY_FILTERS = {
    categories: [],
    minRent: null,
    maxRent: null,
    furnishing: [],
    gender: [],
    occupancy: [],
    amenities: [],
    availableFrom: null,
    verifiedOnly: false,
};
export const DEFAULT_SEARCH_STATE = {
    query: '',
    radiusKm: 5,
    filters: EMPTY_FILTERS,
    sort: 'recommended',
};
export const SORT_LABELS = {
    recommended: 'Recommended',
    distance: 'Distance: nearest first',
    price_low: 'Price: low to high',
    price_high: 'Price: high to low',
    updated: 'Recently updated',
};

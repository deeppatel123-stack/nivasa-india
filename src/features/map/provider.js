function configuredProvider() {
    const value = import.meta.env.VITE_MAP_PROVIDER;
    return value === 'demo' ? 'demo' : 'osm';
}
/** Provider selection boundary: swap in Google Maps / Mapbox here later. */
export const mapProvider = configuredProvider();
export const MAP_ATTRIBUTION = '© OpenStreetMap contributors · Tiles by OpenStreetMap Foundation';

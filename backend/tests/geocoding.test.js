import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env.js", () => ({
  env: { geocoderProvider: "photon", geocodeCacheTtlMs: 1000, geocodeMinIntervalMs: 0, googleMapsKey: "", googlePlacesBaseUrl: "https://places.googleapis.com/v1", googleGeocodeBaseUrl: "https://maps.googleapis.com/maps/api/geocode" },
}));
const getCached = vi.fn(() => null);
const setCached = vi.fn();
vi.mock("../src/services/cacheService.js", () => ({ getCached, setCached }));
const photonSuggest = vi.fn();
const nominatimSearch = vi.fn();
const nominatimReverse = vi.fn();
vi.mock("../src/services/geocoding/providers.js", () => ({ photonSuggest, nominatimSearch, nominatimReverse }));
const googleTextSearch = vi.fn();
const googleGeocode = vi.fn();
const googleStatus = vi.fn(() => ({ configured: false, keyEnv: "GOOGLE_MAPS_API_KEY" }));
vi.mock("../src/services/geocoding/googlePlaces.js", () => ({ googleTextSearch, googleGeocode, googleStatus }));

const { suggestPlaces, resolvePlace, reverseGeocode, geocoderStatus } = await import("../src/services/geocoding/index.js");

describe("India-first geocoding", () => {
  beforeEach(() => {
    getCached.mockReset(); getCached.mockReturnValue(null); setCached.mockReset();
    photonSuggest.mockReset(); nominatimSearch.mockReset(); nominatimReverse.mockReset();
  });

  it("filters out foreign suggestions", async () => {
    photonSuggest.mockResolvedValue([
      { id: "1", label: "Ahmedabad, Gujarat, India", city: "Ahmedabad", state: "Gujarat", country: "India", countryCode: "IN", coordinates: { lat: 23.02, lng: 72.57 }, provider: "photon" },
      { id: "2", label: "Ahmedabad, Pakistan", country: "Pakistan", countryCode: "PK", coordinates: { lat: 35.2, lng: 74.2 }, provider: "photon" },
    ]);
    const result = await suggestPlaces("Ahmedabad");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].countryCode).toBe("IN");
  });

  it("rejects resolve when only foreign or no India match", async () => {
    nominatimSearch.mockResolvedValue([]);
    photonSuggest.mockResolvedValue([{ id: "x", label: "London, UK", country: "UK", countryCode: "GB", coordinates: { lat: 51.5, lng: -0.1 } }]);
    await expect(resolvePlace("London")).rejects.toThrow(/India/);
  });

  it("includes provider diagnostics in status and suggestion responses", async () => {
    photonSuggest.mockResolvedValue([]);
    nominatimSearch.mockResolvedValue([]);
    const result = await suggestPlaces("Unknown Place");
    expect(result.diagnostics.providers.length).toBeGreaterThan(0);
    expect(geocoderStatus().google.configured).toBe(false);
  });

  it("rejects reverse geocode outside India", async () => {
    await expect(reverseGeocode(51.5074, -0.1278)).rejects.toThrow(/India/);
    expect(nominatimReverse).not.toHaveBeenCalled();
  });
});

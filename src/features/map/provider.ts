import type { Coordinates } from '@/features/listings/types';

export interface MapMarkerModel {
  id: string;
  coordinates: Coordinates;
  label: string;
  priceLabel: string;
  isActive: boolean;
}

export interface MapSceneModel {
  center: Coordinates;
  radiusKm: number;
  markers: MapMarkerModel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export type MapProviderName = 'osm' | 'demo';

function configuredProvider(): MapProviderName {
  const value = import.meta.env.VITE_MAP_PROVIDER;
  return value === 'demo' ? 'demo' : 'osm';
}

/** Provider selection boundary: swap in Google Maps / Mapbox here later. */
export const mapProvider: MapProviderName = configuredProvider();

export const MAP_ATTRIBUTION =
  '© OpenStreetMap contributors · Tiles by OpenStreetMap Foundation';

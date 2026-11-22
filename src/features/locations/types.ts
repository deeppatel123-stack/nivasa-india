import type { Coordinates } from '@/features/listings/types';

export type PlaceType = 'city' | 'university' | 'college' | 'company' | 'tech_park' | 'locality' | 'landmark';

export interface Place {
  id: string;
  name: string;
  city: string;
  state: string;
  type: PlaceType;
  coordinates: Coordinates;
  aliases?: string[];
  /** Short context line shown in autocomplete, e.g. "Ahmedabad, Gujarat". */
  context: string;
}

export interface ResolvedLocation {
  query: string;
  place: Place | null;
  coordinates: Coordinates | null;
  /** True when the text could not be resolved by the current demo geocoder. */
  unresolved: boolean;
  source: 'index' | 'gps' | 'none';
}

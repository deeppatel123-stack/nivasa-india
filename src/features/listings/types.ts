export type Coordinates = { lat: number; lng: number };

export type PropertyCategory =
  | 'pg'
  | 'hostel'
  | 'private_room'
  | 'shared_room'
  | 'flat_1bhk'
  | 'flat_2bhk'
  | 'flat_3bhk'
  | 'co_living'
  | 'other';

export type Occupancy = 'single' | 'double' | 'triple' | 'four_plus';
export type Furnishing = 'unfurnished' | 'semi_furnished' | 'fully_furnished';
export type GenderPreference = 'boys' | 'girls' | 'co_ed' | 'any';
export type VerificationState = 'verified' | 'unverified' | 'demo';
export type ListingOrigin = 'owner' | 'provider' | 'demo';

export type AmenityKey =
  | 'wifi'
  | 'ac'
  | 'attached_bathroom'
  | 'food'
  | 'parking'
  | 'laundry'
  | 'security'
  | 'power_backup'
  | 'housekeeping'
  | 'study_room'
  | 'gym'
  | 'balcony'
  | 'refrigerator'
  | 'washing_machine'
  | 'cctv'
  | 'lift'
  | 'ro_water'
  | 'pet_friendly';

export interface PriceBreakdown {
  /** Monthly base rent in INR. For shared rooms this is the full room rent. */
  rent: number;
  /** One-time refundable security deposit in INR. */
  deposit: number;
  /** Monthly maintenance in INR. */
  maintenance: number;
  /** Monthly electricity estimate in INR. */
  electricity: number;
  /** Monthly food / mess charges in INR. */
  food: number;
  /** One-time brokerage in INR. */
  brokerage: number;
  /** Any other monthly charges in INR. */
  other: number;
  /** Whether electricity is already included in rent. */
  electricityIncluded: boolean;
  /** Whether food is already included in rent. */
  foodIncluded: boolean;
}

export interface ImageAsset {
  url: string;
  alt: string;
  /** Credit shown in the UI. Demo imagery is always labelled illustrative. */
  credit: string;
  isIllustrative: boolean;
}

export interface ListingSource {
  name: string;
  url?: string;
  type: 'owner' | 'partner' | 'public' | 'demo';
}

export interface PropertyLocation {
  label: string;
  city: string;
  state: string;
  address?: string;
  coordinates: Coordinates;
}

/**
 * Contact details are intentionally absent from demo listings. A real contact is
 * only rendered when a verified owner/provider source supplies one.
 */
export interface ContactInfo {
  displayName: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  verified: boolean;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  category: PropertyCategory;
  description: string;
  location: PropertyLocation;
  /** A real, well-known nearby landmark used only as a geographic reference. */
  landmark?: string;
  prices: PriceBreakdown;
  occupancy: Occupancy;
  furnishing: Furnishing;
  genderPreference: GenderPreference;
  amenities: AmenityKey[];
  rules: string[];
  images: ImageAsset[];
  availableFrom: string | null;
  areaSqft?: number;
  contact: ContactInfo | null;
  verification: VerificationState;
  origin: ListingOrigin;
  source: ListingSource;
  /** ISO date, or null when no verified update date exists. */
  lastUpdated: string | null;
  /** All frontend-phase listings are explicitly marked as demonstration data. */
  isDemo: boolean;
  featured: boolean;
  /** Null until real, moderated reviews are connected. */
  rating: number | null;
  reviewCount: number;
}

export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  pg: 'Paying Guest',
  hostel: 'Hostel',
  private_room: 'Private room',
  shared_room: 'Shared room',
  flat_1bhk: '1 BHK flat',
  flat_2bhk: '2 BHK flat',
  flat_3bhk: '3 BHK flat',
  co_living: 'Co-living',
  other: 'Other stay',
};

export const AMENITY_LABELS: Record<AmenityKey, string> = {
  wifi: 'Wi-Fi',
  ac: 'Air conditioning',
  attached_bathroom: 'Attached bathroom',
  food: 'Food / mess',
  parking: 'Parking',
  laundry: 'Laundry',
  security: 'Security',
  power_backup: 'Power backup',
  housekeeping: 'Housekeeping',
  study_room: 'Study room',
  gym: 'Gym',
  balcony: 'Balcony',
  refrigerator: 'Refrigerator',
  washing_machine: 'Washing machine',
  cctv: 'CCTV',
  lift: 'Lift',
  ro_water: 'RO water',
  pet_friendly: 'Pet friendly',
};

export const OCCUPANCY_LABELS: Record<Occupancy, string> = {
  single: 'Single occupancy',
  double: 'Double sharing',
  triple: 'Triple sharing',
  four_plus: '4+ sharing',
};

export const FURNISHING_LABELS: Record<Furnishing, string> = {
  unfurnished: 'Unfurnished',
  semi_furnished: 'Semi-furnished',
  fully_furnished: 'Fully furnished',
};

export const GENDER_LABELS: Record<GenderPreference, string> = {
  boys: 'Boys only',
  girls: 'Girls only',
  co_ed: 'Co-ed',
  any: 'No preference',
};

export const VERIFICATION_LABELS: Record<VerificationState, string> = {
  verified: 'Verified listing',
  unverified: 'Unverified listing',
  demo: 'Illustrative demo',
};

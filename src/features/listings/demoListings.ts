import { demoImageSet } from './demoImages';
import type {
  AmenityKey,
  Furnishing,
  GenderPreference,
  Occupancy,
  PriceBreakdown,
  Property,
  PropertyCategory,
} from './types';

interface DemoSeed {
  id: string;
  title: string;
  category: PropertyCategory;
  description: string;
  city: string;
  state: string;
  locality: string;
  landmark?: string;
  lat: number;
  lng: number;
  rent: number;
  deposit: number;
  maintenance?: number;
  electricity?: number;
  food?: number;
  brokerage?: number;
  other?: number;
  electricityIncluded?: boolean;
  foodIncluded?: boolean;
  occupancy: Occupancy;
  furnishing: Furnishing;
  gender: GenderPreference;
  amenities: AmenityKey[];
  rules: string[];
  availableFrom?: string;
  areaSqft?: number;
  imageStart: number;
  featured?: boolean;
}

const DEMO_NOTICE =
  'Illustrative demonstration listing created to preview the product experience. This is not a real property, and the price shown is not a market quote.';

function prices(seed: DemoSeed): PriceBreakdown {
  return {
    rent: seed.rent,
    deposit: seed.deposit,
    maintenance: seed.maintenance ?? 0,
    electricity: seed.electricity ?? 0,
    food: seed.food ?? 0,
    brokerage: seed.brokerage ?? 0,
    other: seed.other ?? 0,
    electricityIncluded: seed.electricityIncluded ?? false,
    foodIncluded: seed.foodIncluded ?? false,
  };
}

function toListing(seed: DemoSeed): Property {
  return {
    id: seed.id,
    slug: seed.id,
    title: seed.title,
    category: seed.category,
    description: `${DEMO_NOTICE}\n\n${seed.description}`,
    location: {
      label: seed.locality,
      city: seed.city,
      state: seed.state,
      coordinates: { lat: seed.lat, lng: seed.lng },
    },
    landmark: seed.landmark,
    prices: prices(seed),
    occupancy: seed.occupancy,
    furnishing: seed.furnishing,
    genderPreference: seed.gender,
    amenities: seed.amenities,
    rules: seed.rules,
    images: demoImageSet(seed.imageStart),
    availableFrom: seed.availableFrom ?? null,
    areaSqft: seed.areaSqft,
    contact: null,
    verification: 'demo',
    origin: 'demo',
    source: { name: 'Nivasa demo dataset', type: 'demo' },
    lastUpdated: null,
    isDemo: true,
    featured: seed.featured ?? false,
    rating: null,
    reviewCount: 0,
  };
}

const SEEDS: DemoSeed[] = [
  {
    id: 'demo-nirma-gota-pg',
    title: 'Gota Campus Walk PG',
    category: 'pg',
    description: 'A sample boys PG layout near the SG Highway corridor, shown to demonstrate distance, sharing and food filters.',
    city: 'Ahmedabad', state: 'Gujarat', locality: 'Gota, Ahmedabad', landmark: 'Nirma University',
    lat: 22.7624, lng: 72.3181, rent: 6500, deposit: 5000, food: 2000, electricity: 400,
    occupancy: 'double', furnishing: 'fully_furnished', gender: 'boys',
    amenities: ['wifi', 'ac', 'attached_bathroom', 'food', 'laundry', 'security', 'power_backup', 'study_room', 'housekeeping'],
    rules: ['No smoking', 'Visitors until 9 PM', 'College ID required'], availableFrom: '2026-12-01', imageStart: 0, featured: true,
  },
  {
    id: 'demo-nirma-girls-pg',
    title: 'SG Highway Girls PG',
    category: 'pg',
    description: 'A sample girls PG configuration used to demonstrate gender preference and attached-bathroom filtering.',
    city: 'Ahmedabad', state: 'Gujarat', locality: 'SG Highway, Ahmedabad', landmark: 'Nirma University',
    lat: 22.7701, lng: 72.3412, rent: 7200, deposit: 8000, food: 2200, maintenance: 300,
    occupancy: 'double', furnishing: 'semi_furnished', gender: 'girls',
    amenities: ['wifi', 'attached_bathroom', 'food', 'laundry', 'security', 'cctv', 'ro_water', 'housekeeping'],
    rules: ['No male visitors inside', 'Silence after 10 PM'], availableFrom: '2026-12-15', imageStart: 3,
  },
  {
    id: 'demo-nirma-shared-flat',
    title: 'Tragad Shared 2 BHK Flat',
    category: 'flat_2bhk',
    description: 'A sample shared flat layout used to demonstrate per-person cost calculations for rental apartments.',
    city: 'Ahmedabad', state: 'Gujarat', locality: 'Tragad, Ahmedabad', landmark: 'Nirma University',
    lat: 22.7582, lng: 72.2964, rent: 15500, deposit: 30000, maintenance: 1500, electricity: 1200, brokerage: 5000,
    occupancy: 'triple', furnishing: 'semi_furnished', gender: 'any',
    amenities: ['wifi', 'parking', 'balcony', 'washing_machine', 'refrigerator', 'lift'],
    rules: ['No subletting', '1-month notice'], imageStart: 6, areaSqft: 980,
  },
  {
    id: 'demo-powai-private-room',
    title: 'Powai Private Studio Room',
    category: 'private_room',
    description: 'A sample private room near Powai used to demonstrate single-occupancy and furnished-room discovery.',
    city: 'Mumbai', state: 'Maharashtra', locality: 'Powai, Mumbai', landmark: 'IIT Bombay',
    lat: 19.1218, lng: 72.9088, rent: 14500, deposit: 29000, maintenance: 1200, electricity: 900,
    occupancy: 'single', furnishing: 'fully_furnished', gender: 'any',
    amenities: ['wifi', 'ac', 'attached_bathroom', 'parking', 'laundry', 'security', 'gym', 'housekeeping', 'lift'],
    rules: ['No smoking', 'Deposit refundable after 30-day notice'], availableFrom: '2026-12-05', imageStart: 9, featured: true, areaSqft: 320,
  },
  {
    id: 'demo-andheri-coliving',
    title: 'Andheri West Co-living Demo',
    category: 'co_living',
    description: 'A sample co-living layout used to demonstrate community amenities and all-inclusive pricing states.',
    city: 'Mumbai', state: 'Maharashtra', locality: 'Andheri West, Mumbai', landmark: 'Andheri West',
    lat: 19.1136, lng: 72.8697, rent: 16500, deposit: 16500, foodIncluded: true, electricityIncluded: true, other: 1500,
    occupancy: 'single', furnishing: 'fully_furnished', gender: 'co_ed',
    amenities: ['wifi', 'ac', 'food', 'laundry', 'security', 'gym', 'housekeeping', 'cctv', 'study_room'],
    rules: ['ID verification mandatory', 'No parties'], imageStart: 12,
  },
  {
    id: 'demo-electronics-city-pg',
    title: 'Electronic City Tech PG',
    category: 'pg',
    description: 'A sample working-professional PG used to demonstrate office-adjacent search and AC filtering.',
    city: 'Bengaluru', state: 'Karnataka', locality: 'Electronic City, Bengaluru', landmark: 'Infosys Electronic City',
    lat: 12.842, lng: 77.6712, rent: 7800, deposit: 10000, food: 2500, electricity: 600,
    occupancy: 'double', furnishing: 'fully_furnished', gender: 'boys',
    amenities: ['wifi', 'ac', 'food', 'laundry', 'security', 'power_backup', 'housekeeping', 'cctv'],
    rules: ['No smoking', 'Visitors until 10 PM'], imageStart: 2, featured: true,
  },
  {
    id: 'demo-whitefield-flat',
    title: 'Whitefield Shared 2 BHK Flat',
    category: 'flat_2bhk',
    description: 'A sample shared apartment used to demonstrate maintenance, deposit and brokerage comparison.',
    city: 'Bengaluru', state: 'Karnataka', locality: 'Whitefield, Bengaluru', landmark: 'Whitefield IT Corridor',
    lat: 12.9698, lng: 77.7499, rent: 22000, deposit: 66000, maintenance: 2500, electricity: 1800, brokerage: 11000,
    occupancy: 'double', furnishing: 'semi_furnished', gender: 'any',
    amenities: ['wifi', 'parking', 'balcony', 'washing_machine', 'refrigerator', 'lift', 'security', 'power_backup'],
    rules: ['12-month minimum lease', 'No pets'], imageStart: 5, areaSqft: 1120,
  },
  {
    id: 'demo-hinjewadi-hostel',
    title: 'Hinjewadi IT Park Hostel',
    category: 'hostel',
    description: 'A sample budget hostel used to demonstrate four-plus occupancy and lowest-cost sorting.',
    city: 'Pune', state: 'Maharashtra', locality: 'Hinjewadi, Pune', landmark: 'Hinjewadi IT Park',
    lat: 18.5921, lng: 73.7423, rent: 4800, deposit: 2400, food: 1800, electricityIncluded: true,
    occupancy: 'four_plus', furnishing: 'semi_furnished', gender: 'boys',
    amenities: ['wifi', 'food', 'laundry', 'security', 'power_backup', 'study_room', 'ro_water'],
    rules: ['No outsiders in rooms', 'Mess timings fixed'], imageStart: 7,
  },
  {
    id: 'demo-symbiosis-girls-pg',
    title: 'Symbiosis Campus Girls PG',
    category: 'pg',
    description: 'A sample girls PG near Symbiosis used to demonstrate campus-adjacent filtering.',
    city: 'Pune', state: 'Maharashtra', locality: 'Viman Nagar, Pune', landmark: 'Symbiosis International University',
    lat: 18.5379, lng: 73.8298, rent: 8200, deposit: 12000, food: 2200, electricity: 500,
    occupancy: 'double', furnishing: 'fully_furnished', gender: 'girls',
    amenities: ['wifi', 'ac', 'attached_bathroom', 'food', 'laundry', 'security', 'cctv', 'housekeeping'],
    rules: ['No late-night visitors', 'College ID required'], imageStart: 10,
  },
  {
    id: 'demo-gachibowli-coliving',
    title: 'Gachibowli Co-living Studio',
    category: 'co_living',
    description: 'A sample co-living studio used to demonstrate single-occupancy premium inventory.',
    city: 'Hyderabad', state: 'Telangana', locality: 'Gachibowli, Hyderabad', landmark: 'HITEC City',
    lat: 17.4399, lng: 78.3489, rent: 17500, deposit: 17500, maintenance: 1500, electricity: 1200, foodIncluded: true,
    occupancy: 'single', furnishing: 'fully_furnished', gender: 'co_ed',
    amenities: ['wifi', 'ac', 'food', 'parking', 'laundry', 'security', 'gym', 'cctv', 'housekeeping', 'lift'],
    rules: ['No smoking', 'Quiet hours after 10 PM'], imageStart: 13, featured: true,
  },
  {
    id: 'demo-du-north-room',
    title: 'North Campus Private Room',
    category: 'private_room',
    description: 'A sample private room near DU North Campus used to demonstrate student budget filtering.',
    city: 'Delhi', state: 'Delhi', locality: 'Vijay Nagar, Delhi', landmark: 'Delhi University North Campus',
    lat: 28.7271, lng: 77.1791, rent: 9500, deposit: 15000, electricity: 700, food: 2000,
    occupancy: 'single', furnishing: 'semi_furnished', gender: 'girls',
    amenities: ['wifi', 'ac', 'attached_bathroom', 'food', 'laundry', 'security', 'ro_water'],
    rules: ['No male visitors inside', 'No pets'], imageStart: 1,
  },
  {
    id: 'demo-cyber-city-studio',
    title: 'Cyber City Private Studio',
    category: 'private_room',
    description: 'A sample private studio near Cyber City used to demonstrate professionally located rooms.',
    city: 'Gurugram', state: 'Haryana', locality: 'DLF Phase 3, Gurugram', landmark: 'Cyber City Gurugram',
    lat: 28.6302, lng: 77.0451, rent: 18000, deposit: 36000, maintenance: 2200, electricity: 1500, brokerage: 9000,
    occupancy: 'single', furnishing: 'fully_furnished', gender: 'any',
    amenities: ['wifi', 'ac', 'attached_bathroom', 'parking', 'laundry', 'security', 'gym', 'lift', 'cctv'],
    rules: ['12-month lease', 'No smoking'], imageStart: 4,
  },
  {
    id: 'demo-iit-madras-hostel',
    title: 'IIT Madras students cells',
    category: 'hostel',
    description: 'A sample student hostel layout used to demonstrate hostel-specific filters.',
    city: 'Chennai', state: 'Tamil Nadu', locality: 'Velachery, Chennai', landmark: 'IIT Madras',
    lat: 13.0213, lng: 80.2445, rent: 4200, deposit: 2000, food: 1600, electricity: 300,
    occupancy: 'four_plus', furnishing: 'semi_furnished', gender: 'boys',
    amenities: ['wifi', 'food', 'laundry', 'security', 'study_room', 'ro_water', 'power_backup'],
    rules: ['No smoking', 'Fixed mess schedule'], imageStart: 8,
  },
  {
    id: 'demo-vit-vellore-pg',
    title: 'VIT Vellore Gateway PG',
    category: 'pg',
    description: 'A sample campus PG used to demonstrate university-level search results.',
    city: 'Vellore', state: 'Tamil Nadu', locality: 'Katpadi, Vellore', landmark: 'VIT Vellore',
    lat: 12.9762, lng: 79.1631, rent: 5600, deposit: 6000, food: 1900, electricity: 350,
    occupancy: 'double', furnishing: 'semi_furnished', gender: 'boys',
    amenities: ['wifi', 'attached_bathroom', 'food', 'laundry', 'security', 'power_backup', 'housekeeping'],
    rules: ['No late entry after 11 PM', 'College ID required'], imageStart: 11,
  },
  {
    id: 'demo-indore-1bhk',
    title: 'Indore Student 1 BHK Flat',
    category: 'flat_1bhk',
    description: 'A sample 1 BHK layout used to demonstrate independent-living search.',
    city: 'Indore', state: 'Madhya Pradesh', locality: 'Palasia, Indore', landmark: 'Indore',
    lat: 22.7196, lng: 75.8577, rent: 9000, deposit: 18000, maintenance: 1000, electricity: 800, brokerage: 4500,
    occupancy: 'single', furnishing: 'semi_furnished', gender: 'any',
    amenities: ['wifi', 'parking', 'balcony', 'washing_machine', 'refrigerator', 'ro_water'],
    rules: ['No subletting', '1-month notice'], imageStart: 14, areaSqft: 540,
  },
  {
    id: 'demo-jaipur-shared-room',
    title: 'Jaipur Shared Room Demo',
    category: 'shared_room',
    description: 'A sample shared room used to demonstrate the shared-room category and per-person pricing.',
    city: 'Jaipur', state: 'Rajasthan', locality: 'Malviya Nagar, Jaipur', landmark: 'Jaipur',
    lat: 26.8681, lng: 75.8117, rent: 5200, deposit: 4000, food: 1700, electricity: 400,
    occupancy: 'triple', furnishing: 'semi_furnished', gender: 'co_ed',
    amenities: ['wifi', 'food', 'laundry', 'security', 'power_backup', 'cctv'],
    rules: ['No smoking', 'Visitors until 9 PM'], imageStart: 2,
  },
  {
    id: 'demo-kolkata-pg',
    title: 'Salt Lake Sector V PG',
    category: 'pg',
    description: 'A sample tech-corridor PG used to demonstrate wide geographic coverage.',
    city: 'Kolkata', state: 'West Bengal', locality: 'Salt Lake Sector V, Kolkata', landmark: 'Kolkata',
    lat: 22.5703, lng: 88.4244, rent: 6200, deposit: 7000, food: 2000, electricity: 450,
    occupancy: 'double', furnishing: 'fully_furnished', gender: 'boys',
    amenities: ['wifi', 'ac', 'food', 'laundry', 'security', 'power_backup', 'housekeeping'],
    rules: ['No outsiders', 'No smoking'], imageStart: 6,
  },
  {
    id: 'demo-noida-coliving',
    title: 'Noida Tech Corridor Co-living',
    category: 'co_living',
    description: 'A sample co-living property used to demonstrate NCR search coverage.',
    city: 'Noida', state: 'Uttar Pradesh', locality: 'Sector 62, Noida', landmark: 'Noida IT Corridor',
    lat: 28.509, lng: 77.398, rent: 13500, deposit: 13500, maintenance: 1200, electricityIncluded: true, food: 2500,
    occupancy: 'double', furnishing: 'fully_furnished', gender: 'co_ed',
    amenities: ['wifi', 'ac', 'food', 'laundry', 'security', 'gym', 'cctv', 'housekeeping', 'lift'],
    rules: ['ID verification mandatory', 'No parties'], imageStart: 9,
  },
];

/** All listings in this phase are demonstration data, clearly flagged as such. */
export const DEMO_LISTINGS: Property[] = SEEDS.map(toListing);

import mongoose from 'mongoose';

const { Schema } = mongoose;

const coordinatesSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

const locationSchema = new Schema(
  {
    label: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: { type: coordinatesSchema, required: true },
  },
  { _id: false },
);

const pricesSchema = new Schema(
  {
    rent: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    maintenance: { type: Number, default: 0 },
    electricity: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    brokerage: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    electricityIncluded: { type: Boolean, default: false },
    foodIncluded: { type: Boolean, default: false },
  },
  { _id: false },
);

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    credit: { type: String, default: '' },
    isIllustrative: { type: Boolean, default: true },
  },
  { _id: false },
);

const sourceSchema = new Schema(
  {
    name: { type: String, default: 'Nivasa demo dataset' },
    type: { type: String, default: 'demo' },
  },
  { _id: false },
);

const listingSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    location: { type: locationSchema, required: true },
    landmark: { type: String, default: '' },
    prices: { type: pricesSchema, required: true },
    occupancy: { type: String, default: 'any' },
    furnishing: { type: String, default: 'unfurnished' },
    genderPreference: { type: String, default: 'any' },
    amenities: { type: [String], default: [] },
    rules: { type: [String], default: [] },
    images: { type: [imageSchema], default: [] },
    availableFrom: { type: String, default: null },
    areaSqft: { type: Number, default: null },
    // Demo listings must never carry real contact details, reviews or dates.
    contact: { type: Schema.Types.Mixed, default: null },
    verification: { type: String, default: 'demo' },
    origin: { type: String, default: 'demo' },
    source: { type: sourceSchema, default: () => ({ name: 'Nivasa demo dataset', type: 'demo' }) },
    lastUpdated: { type: String, default: null },
    isDemo: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: null },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: false, versionKey: false },
);

export const Listing = mongoose.model('Listing', listingSchema);

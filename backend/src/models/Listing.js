import mongoose from 'mongoose';

const { Schema } = mongoose;

const coordinatesSchema = new Schema(
  { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  { _id: false },
);

const addressSchema = new Schema(
  {
    label: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    postcode: { type: String, default: '' },
  },
  { _id: false },
);

/** All price fields are nullable: "Not available" is the only honest default. */
const priceSchema = new Schema(
  {
    rent: { type: Number, default: null },
    deposit: { type: Number, default: null },
    maintenance: { type: Number, default: null },
    electricity: { type: Number, default: null },
    food: { type: Number, default: null },
    brokerage: { type: Number, default: null },
    other: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
  },
  { _id: false },
);

const sourceSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, default: '' },
    licence: { type: String, default: '' },
    fetchedAt: { type: Date, required: true },
  },
  { _id: false },
);

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    credit: { type: String, default: '' },
    isIllustrative: { type: Boolean, default: false },
  },
  { _id: false },
);

const contactSchema = new Schema(
  {
    phone: { type: String, default: null },
    email: { type: String, default: null },
    whatsapp: { type: String, default: null },
    verified: { type: Boolean, default: false },
  },
  { _id: false },
);

const listingSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true, index: true },
    provider: {
      type: String,
      required: true,
      enum: ['osm_nominatim', 'google_places', 'owner_submission', 'authorized_import', 'demo_seed'],
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    category: { type: String, default: 'other', index: true },
    description: { type: String, default: '' },
    address: { type: addressSchema, required: true },
    coordinates: { type: coordinatesSchema, required: true },
    prices: { type: priceSchema, required: true },
    occupancy: { type: String, default: null },
    amenities: { type: [String], default: [] },
    images: { type: [imageSchema], default: [] },
    contact: { type: contactSchema, default: () => ({}) },
    source: { type: sourceSchema, required: true },
    verification: {
      type: String,
      enum: ['unverified', 'verified', 'demo'],
      default: 'unverified',
    },
    availability: {
      type: String,
      enum: ['unconfirmed', 'available', 'unavailable'],
      default: 'unconfirmed',
    },
    quality: {
      type: String,
      enum: ['information_incomplete', 'complete'],
      default: 'information_incomplete',
    },
    tags: { type: [String], default: [] },
    isDemo: { type: Boolean, default: false },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

listingSchema.index({ 'address.city': 1, category: 1 });

export const Listing = mongoose.model('Listing', listingSchema);

import { badRequest } from '../utils/errors.js';
import { isValidCoordinate } from '../utils/geo.js';
import { rejectUrls } from './fields.js';

const CATEGORIES = new Set(['pg', 'hostel', 'private_room', 'shared_room', 'flat_1bhk', 'flat_2bhk', 'flat_3bhk', 'co_living', 'other']);
const PHONE = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const text = (value, field, max = 160) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || trimmed.length > max) throw badRequest(`${field} is required and must be under ${max} characters.`);
  return trimmed;
};

const amount = (value, field) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw badRequest(`${field} must be a non-negative number.`);
  return number;
};

export function validateSubmission(body = {}) {
  const coordinates = {
    lat: Number(body.coordinates?.lat),
    lng: Number(body.coordinates?.lng),
  };
  if (!isValidCoordinate(coordinates.lat, coordinates.lng)) {
    throw badRequest('Valid latitude and longitude are required.');
  }
  if (!CATEGORIES.has(body.category)) throw badRequest('A valid accommodation category is required.');
  if (body.consent !== true) {
    throw badRequest('The owner must confirm they are authorised to submit this listing.');
  }

  const phone = String(body.contact?.phone ?? '').trim();
  const email = String(body.contact?.email ?? '').trim();
  if (!PHONE.test(phone) && !EMAIL.test(email)) {
    throw badRequest('A valid Indian mobile number or email address is required.');
  }

  return {
    title: rejectUrls(text(body.title, 'Property name', 120), 'Property name'),
    category: body.category,
    description: rejectUrls(String(body.description ?? '').trim().slice(0, 2000), 'Description'),
    address: {
      label: rejectUrls(text(body.address?.label, 'Address'), 'Address'),
      city: text(body.address?.city, 'City', 80),
      state: text(body.address?.state, 'State', 80),
      country: 'India',
      postcode: String(body.address?.postcode ?? '').trim().slice(0, 12),
    },
    coordinates,
    prices: {
      rent: amount(body.prices?.rent, 'Monthly rent'),
      deposit: amount(body.prices?.deposit, 'Security deposit'),
      maintenance: amount(body.prices?.maintenance, 'Maintenance'),
      electricity: amount(body.prices?.electricity, 'Electricity'),
      food: amount(body.prices?.food, 'Food'),
      brokerage: amount(body.prices?.brokerage, 'Brokerage'),
      other: amount(body.prices?.other, 'Other charges'),
      currency: 'INR',
    },
    occupancy: body.occupancy || null,
    amenities: Array.isArray(body.amenities) ? body.amenities.filter((item) => typeof item === 'string') : [],
    contact: { phone: PHONE.test(phone) ? phone : null, email: EMAIL.test(email) ? email : null, whatsapp: null, verified: false },
  };
}

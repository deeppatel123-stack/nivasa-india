import { describe, expect, it } from 'vitest';
import { validateSubmission } from '../src/validators/submissionValidator.js';

const validBody = () => ({
  title: 'Test House',
  category: 'pg',
  address: { label: 'Test Street, Pune', city: 'Pune', state: 'Maharashtra' },
  coordinates: { lat: 18.52, lng: 73.86 },
  prices: { rent: 9000, deposit: 18000 },
  contact: { phone: '9876543210', email: '' },
  consent: true,
});

describe('submission validation', () => {
  it('accepts an authorised Indian submission', () => {
    const result = validateSubmission(validBody());
    expect(result.prices.rent).toBe(9000);
    expect(result.contact.phone).toBe('9876543210');
  });

  it('requires owner authorisation consent', () => {
    expect(() => validateSubmission({ ...validBody(), consent: false })).toThrow(/authorised/);
  });

  it('rejects invalid coordinates', () => {
    expect(() => validateSubmission({ ...validBody(), coordinates: { lat: 200, lng: 0 } })).toThrow(/latitude/);
  });

  it('rejects a submission without valid contact details', () => {
    expect(() => validateSubmission({ ...validBody(), contact: { phone: '123', email: 'bad' } })).toThrow(/mobile/);
  });

  it('rejects a negative price', () => {
    expect(() => validateSubmission({ ...validBody(), prices: { rent: -1 } })).toThrow(/non-negative/);
  });
});

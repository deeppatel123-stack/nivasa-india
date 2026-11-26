import { describe, expect, it } from 'vitest';
import {
  boundingBox, haversineKm, isValidCoordinate, isWithinIndiaBounds, normaliseText, validateIndiaLocation,
} from '../src/utils/geo.js';

describe('geo utilities', () => {
  it('measures distance between real coordinates', () => {
    const distance = haversineKm({ lat: 23.0225, lng: 72.5714 }, { lat: 19.076, lng: 72.8777 });
    expect(distance).toBeGreaterThan(430);
    expect(distance).toBeLessThan(450);
  });

  it('returns null for incomplete coordinates', () => {
    expect(haversineKm({ lat: 23, lng: 72 }, null)).toBeNull();
  });

  it('builds a bounded viewbox', () => {
    const [west, north, east, south] = boundingBox({ lat: 23.02, lng: 72.57 }, 5);
    expect(west).toBeLessThan(72.57);
    expect(east).toBeGreaterThan(72.57);
    expect(north).toBeGreaterThan(23.02);
    expect(south).toBeLessThan(23.02);
  });

  it('validates coordinates and normalises text', () => {
    expect(isValidCoordinate(23, 72)).toBe(true);
    expect(isValidCoordinate(95, 72)).toBe(false);
    expect(normaliseText('  PG-Accommodation, Pune! ')).toBe('pg accommodation pune');
  });

  it('validates India bounds and rejects foreign coordinates', () => {
    expect(isWithinIndiaBounds(23.02, 72.57)).toBe(true);
    expect(isWithinIndiaBounds(51.5074, -0.1278)).toBe(false); // London
    expect(isWithinIndiaBounds(40.7128, -74.006)).toBe(false); // NYC
  });

  it('validates India location metadata', () => {
    expect(validateIndiaLocation({ coordinates: { lat: 23.02, lng: 72.57 }, countryCode: 'IN' }).ok).toBe(true);
    expect(validateIndiaLocation({ coordinates: { lat: 23.02, lng: 72.57 }, country: 'India' }).ok).toBe(true);
    expect(validateIndiaLocation({ coordinates: { lat: 51.5074, lng: -0.1278 }, countryCode: 'GB' }).ok).toBe(false);
    expect(validateIndiaLocation({ coordinates: { lat: 23.02, lng: 72.57 }, countryCode: 'PK' }).ok).toBe(false);
    expect(validateIndiaLocation({ coordinates: { lat: 23.02, lng: 72.57 } }).ok).toBe(true); // inside bounds
  });
});

import { describe, expect, it } from 'vitest';
import { boundingBox, haversineKm, isValidCoordinate, normaliseText } from '../src/utils/geo.js';

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
});

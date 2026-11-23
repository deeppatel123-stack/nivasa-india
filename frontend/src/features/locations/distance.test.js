import { describe, expect, it } from 'vitest';
import { estimateWalkMinutes, formatDistance, haversineKm } from './distance';
describe('haversineKm', () => {
    it('returns zero for identical coordinates', () => {
        expect(haversineKm({ lat: 22.7756, lng: 72.3056 }, { lat: 22.7756, lng: 72.3056 })).toBeCloseTo(0, 6);
    });
    it('approximates a known short city distance', () => {
        const distance = haversineKm({ lat: 22.7756, lng: 72.3056 }, { lat: 22.7618, lng: 72.3157 });
        expect(distance).toBeGreaterThan(1);
        expect(distance).toBeLessThan(3);
    });
});
describe('display helpers', () => {
    it('formats sub-kilometre distances in metres', () => {
        expect(formatDistance(0.65)).toBe('650 m');
        expect(formatDistance(2.45)).toBe('2.5 km');
    });
    it('estimates walking time', () => {
        expect(estimateWalkMinutes(1.5)).toBe(20);
    });
});

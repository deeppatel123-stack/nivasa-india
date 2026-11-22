import { describe, expect, it } from 'vitest';
import { calculateEffectiveCost, formatINR } from './pricing';
const base = {
    rent: 7000,
    deposit: 10000,
    maintenance: 300,
    electricity: 500,
    food: 2000,
    brokerage: 2000,
    other: 300,
    electricityIncluded: false,
    foodIncluded: false,
};
describe('calculateEffectiveCost', () => {
    it('adds recurring charges and separates one-time payments', () => {
        const result = calculateEffectiveCost(base, 'single');
        expect(result.monthlyExpense).toBe(10100);
        expect(result.upfront).toBe(12000);
        expect(result.firstMonthOutflow).toBe(22100);
        expect(result.perPersonMonthly).toBe(10100);
    });
    it('does not double-count included electricity and food', () => {
        const result = calculateEffectiveCost({ ...base, electricityIncluded: true, foodIncluded: true }, 'double');
        expect(result.monthlyExpense).toBe(7600);
        expect(result.perPersonMonthly).toBe(3800);
        expect(result.includedNote).toEqual(['Electricity included', 'Food included']);
    });
    it('matches the product example when there is no maintenance charge', () => {
        const result = calculateEffectiveCost({ ...base, maintenance: 0 }, 'single');
        expect(result.monthlyExpense).toBe(9800);
    });
    it('formats Indian currency', () => {
        expect(formatINR(9800)).toBe('₹9,800');
    });
});

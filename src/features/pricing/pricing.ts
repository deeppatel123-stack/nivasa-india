import type { Occupancy, PriceBreakdown } from '@/features/listings/types';

const OCCUPANCY_COUNT: Record<Occupancy, number> = {
  single: 1,
  double: 2,
  triple: 3,
  four_plus: 4,
};

export interface EffectiveCost {
  /** Sum of all recurring monthly charges, without double-counting included items. */
  monthlyExpense: number;
  /** One-time payments at move-in. */
  upfront: number;
  /** First-month outflow including recurring charges and one-time payments. */
  firstMonthOutflow: number;
  /** Monthly cost divided by the number of occupants. */
  perPersonMonthly: number;
  includedNote: string[];
}

/**
 * Calculates a comparable monthly cost. Included services are never counted twice,
 * and one-time payments are kept separate from recurring monthly costs.
 */
export function calculateEffectiveCost(
  prices: PriceBreakdown,
  occupancy: Occupancy,
): EffectiveCost {
  const electricity = prices.electricityIncluded ? 0 : prices.electricity;
  const food = prices.foodIncluded ? 0 : prices.food;
  const monthlyExpense =
    prices.rent + prices.maintenance + electricity + food + prices.other;
  const upfront = prices.deposit + prices.brokerage;
  const count = OCCUPANCY_COUNT[occupancy];
  const includedNote: string[] = [];
  if (prices.electricityIncluded) includedNote.push('Electricity included');
  if (prices.foodIncluded) includedNote.push('Food included');

  return {
    monthlyExpense,
    upfront,
    firstMonthOutflow: monthlyExpense + upfront,
    perPersonMonthly: Math.round(monthlyExpense / count),
    includedNote,
  };
}

export function formatINR(value: number, compact = false): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(value);
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'Not available';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

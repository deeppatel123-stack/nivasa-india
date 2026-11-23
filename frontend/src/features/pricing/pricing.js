const OCCUPANCY_COUNT = {
  single: 1,
  double: 2,
  triple: 3,
  four_plus: 4,
};

const finite = (value) => (Number.isFinite(value) ? value : null);
const sum = (values) => {
  const numbers = values.filter((value) => Number.isFinite(value));
  return numbers.length ? numbers.reduce((total, value) => total + value, 0) : null;
};

/**
 * Calculates a comparable monthly cost from fields actually supplied by a source.
 * Unknown fields are never treated as zero; the result is null when essential
 * information is missing, and the UI renders "Not available".
 */
export function calculateEffectiveCost(prices = {}, occupancy) {
  const electricity = prices.electricityIncluded ? 0 : finite(prices.electricity);
  const food = prices.foodIncluded ? 0 : finite(prices.food);
  const monthlyExpense = sum([finite(prices.rent), finite(prices.maintenance), electricity, food, finite(prices.other)]);
  const upfront = sum([finite(prices.deposit), finite(prices.brokerage)]);
  const count = OCCUPANCY_COUNT[occupancy] ?? null;
  const includedNote = [];
  if (prices.electricityIncluded) includedNote.push('Electricity included');
  if (prices.foodIncluded) includedNote.push('Food included');
  return {
    monthlyExpense,
    upfront,
    firstMonthOutflow: monthlyExpense === null || upfront === null ? null : monthlyExpense + upfront,
    perPersonMonthly: monthlyExpense === null || !count ? null : Math.round(monthlyExpense / count),
    includedNote,
    hasCompletePricing: monthlyExpense !== null && upfront !== null && Boolean(count),
  };
}

export function formatINR(value, compact = false) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return 'Not available';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(Number(value));
}

export function formatDate(iso) {
  if (!iso) return 'Not available';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

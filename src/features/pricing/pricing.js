const OCCUPANCY_COUNT = {
    single: 1,
    double: 2,
    triple: 3,
    four_plus: 4,
};
/**
 * Calculates a comparable monthly cost. Included services are never counted twice,
 * and one-time payments are kept separate from recurring monthly costs.
 */
export function calculateEffectiveCost(prices, occupancy) {
    const electricity = prices.electricityIncluded ? 0 : prices.electricity;
    const food = prices.foodIncluded ? 0 : prices.food;
    const monthlyExpense = prices.rent + prices.maintenance + electricity + food + prices.other;
    const upfront = prices.deposit + prices.brokerage;
    const count = OCCUPANCY_COUNT[occupancy];
    const includedNote = [];
    if (prices.electricityIncluded)
        includedNote.push('Electricity included');
    if (prices.foodIncluded)
        includedNote.push('Food included');
    return {
        monthlyExpense,
        upfront,
        firstMonthOutflow: monthlyExpense + upfront,
        perPersonMonthly: Math.round(monthlyExpense / count),
        includedNote,
    };
}
export function formatINR(value, compact = false) {
    if (!Number.isFinite(value))
        return '—';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        notation: compact ? 'compact' : 'standard',
    }).format(value);
}
export function formatDate(iso) {
    if (!iso)
        return 'Not available';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime()))
        return 'Not available';
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

import { Badge } from '@/components/ui/Badge';
import { OCCUPANCY_LABELS } from '@/features/listings/types';
import { calculateEffectiveCost, formatINR } from '@/features/pricing/pricing';
/** Transparent cost view built only from amounts supplied by the source record. */
export function PriceBreakdownPanel({ prices = {}, occupancy }) {
    const cost = calculateEffectiveCost(prices, occupancy);
    const rows = [
        { label: 'Base rent', value: prices.rent, cadence: 'per month' },
        { label: 'Security deposit', value: prices.deposit, cadence: 'one-time' },
        { label: 'Maintenance', value: prices.maintenance, cadence: 'per month' },
        {
            label: 'Electricity',
            value: prices.electricity,
            cadence: 'per month',
            included: prices.electricityIncluded,
            note: prices.electricityIncluded ? 'Not added to the total below' : undefined,
        },
        {
            label: 'Food / mess',
            value: prices.food,
            cadence: 'per month',
            included: prices.foodIncluded,
            note: prices.foodIncluded ? 'Not added to the total below' : undefined,
        },
        { label: 'Brokerage', value: prices.brokerage, cadence: 'one-time' },
        { label: 'Other charges', value: prices.other, cadence: 'per month' },
    ];
    const occupancyLabel = OCCUPANCY_LABELS[occupancy]?.toLowerCase() || 'occupancy not available';
    return (<div className="space-y-5">
      <dl className="divide-y divide-ink-100">
        {rows.map((row) => (<div key={row.label} className="flex items-start justify-between gap-3 py-2.5">
            <dt className="text-xs text-ink-600">
              <span className="block font-medium text-ink-800">{row.label}</span>
              <span className="block text-[10px] text-ink-400">{row.cadence}</span>
              {row.included && (<span className="mt-1 block text-[10px] font-semibold text-amber-800">Included in rent</span>)}
              {row.note && <span className="mt-0.5 block text-[10px] text-ink-400">{row.note}</span>}
            </dt>
            <dd className={row.included ? 'shrink-0 text-xs font-semibold text-ink-400 line-through' : 'shrink-0 text-xs font-semibold text-ink-900'}>
              {formatINR(row.value)}
            </dd>
          </div>))}
      </dl>

      <div className="space-y-2 rounded-xl bg-ink-50/70 p-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-semibold text-ink-700">Monthly expense</span>
          <span className="font-display text-lg font-extrabold text-ink-950">{formatINR(cost.monthlyExpense)}</span>
        </div>
        <p className="text-[10px] leading-relaxed text-ink-500">
          Recurring amounts from the record. Included food and electricity are not added again.
        </p>
        <div className="flex items-baseline justify-between gap-3 border-t border-ink-200 pt-2.5">
          <span className="text-xs font-semibold text-ink-700">Per person / month</span>
          <span className="font-display text-base font-bold text-teal-700">{formatINR(cost.perPersonMonthly)}</span>
        </div>
        <p className="text-[10px] text-ink-500">Based on {occupancyLabel}.</p>
        <div className="flex items-baseline justify-between gap-3 border-t border-ink-200 pt-2.5">
          <span className="text-xs font-semibold text-ink-700">First-month outflow</span>
          <span className="font-display text-base font-bold text-saffron-700">{formatINR(cost.firstMonthOutflow)}</span>
        </div>
        <p className="text-[10px] text-ink-500">Monthly expense plus the one-time amounts listed above.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {cost.includedNote.length ? (cost.includedNote.map((note) => (<Badge key={note} tone="teal">{note}</Badge>))) : (<Badge tone="neutral">No included services flagged</Badge>)}
      </div>
      <p className="text-[10px] leading-relaxed text-ink-400">
        Amounts come from the source record. Missing values are shown as Not available.
      </p>
    </div>);
}

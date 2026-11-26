import { formatINR } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
export function PriceDisplay({ rent, perPerson, monthlyExpense, size = 'md', className }) {
    const hasRent = typeof rent === 'number' && Number.isFinite(rent);
    return (<div className={cn(className)}>
      <div className="flex items-baseline gap-1">
        <span className={cn('font-display font-extrabold tracking-tight', hasRent ? 'text-ink-950' : 'text-ink-600', size === 'sm' && 'text-lg', size === 'md' && 'text-xl', size === 'lg' && 'text-3xl')}>
          {hasRent ? formatINR(rent) : 'Price not available'}
        </span>
        {hasRent && <span className="text-xs font-medium text-ink-500">/ month</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
        {hasRent && typeof perPerson === 'number' && Number.isFinite(perPerson) && <span>{formatINR(perPerson)} per person / mo</span>}
        {hasRent && typeof monthlyExpense === 'number' && Number.isFinite(monthlyExpense) && monthlyExpense !== rent && (<span className="font-medium text-ink-700">All-in {formatINR(monthlyExpense)}/mo</span>)}
        {!hasRent && <span>Contact/source verification needed</span>}
      </div>
    </div>);
}

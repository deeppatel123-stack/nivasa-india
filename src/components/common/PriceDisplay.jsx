import { formatINR } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
export function PriceDisplay({ rent, perPerson, monthlyExpense, size = 'md', className, }) {
    return (<div className={cn(className)}>
      <div className="flex items-baseline gap-1">
        <span className={cn('font-display font-extrabold tracking-tight text-ink-950', size === 'sm' && 'text-lg', size === 'md' && 'text-xl', size === 'lg' && 'text-3xl')}>
          {formatINR(rent)}
        </span>
        <span className="text-xs font-medium text-ink-500">/ month</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
        {perPerson !== undefined && <span>{formatINR(perPerson)} per person / mo</span>}
        {monthlyExpense !== undefined && monthlyExpense !== rent && (<span className="font-medium text-ink-700">Est. all-in {formatINR(monthlyExpense)}/mo</span>)}
      </div>
    </div>);
}

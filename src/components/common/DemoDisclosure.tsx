import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DemoDisclosure({ compact = false, className }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800', className)}>
        <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Demo listing · not a real property
      </span>
    );
  }
  return (
    <div className={cn('demo-strip', className)} role="note">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">Frontend demo data.</strong> Every listing here is clearly labelled as
        illustrative. There are no real properties, prices, photographs or contact details in this phase.
      </span>
    </div>
  );
}

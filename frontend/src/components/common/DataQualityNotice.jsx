import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared notice explaining that genuine records may have incomplete source data. */
export function DataQualityNotice({ compact = false, className }) {
  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800', className)}>
        <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Unverified data
      </span>
    );
  }
  return (
    <div className={cn('notice-strip', className)} role="note">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">Live records may be incomplete; demo records are labeled.</strong>{' '}
        Nivasa shows attributed live place records where available. Rent, availability and contact
        details appear only when a source supplies them; otherwise they read “Not available”.
        Any development/testing record is marked <strong>DEMO DATA</strong> and is never a verified property.
      </span>
    </div>
  );
}

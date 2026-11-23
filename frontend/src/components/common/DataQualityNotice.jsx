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
        <strong className="font-semibold">Genuine records, incomplete information.</strong>{' '}
        Nivasa shows OpenStreetMap-sourced places with attribution for every record. Rent,
        availability and contact details appear only when the source supplies them; otherwise
        they read “Not available”. Treat unverified fields as a starting point, not a quote.
      </span>
    </div>
  );
}

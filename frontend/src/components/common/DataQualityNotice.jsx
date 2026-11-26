import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Notice for incomplete listing information shown to users. */
export function DataQualityNotice({ compact = false, className }) {
  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800', className)}>
        <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Some details unavailable
      </span>
    );
  }
  return (
    <div className={cn('notice-strip', className)} role="note">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">Some listing details may be unavailable.</strong>{' '}
        Rent, availability, photos, and contact information are shown only when provided. Missing details appear as “Not available”.
      </span>
    </div>
  );
}

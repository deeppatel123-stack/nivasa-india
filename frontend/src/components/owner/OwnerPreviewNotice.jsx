import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
/** Explains how owner submissions are stored and reviewed. */
export function OwnerPreviewNotice({ className }) {
    return (<div role="note" className={cn('flex items-start gap-2.5 rounded-xl border border-teal-200 bg-teal-50/80 px-3.5 py-3 text-xs leading-relaxed text-teal-950', className)}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden/>
      <p>
        <strong className="font-semibold">Submissions are saved to the server.</strong> Records are tied to your
        account and reviewed before publication. Until moderation is complete they are pending and not shown as
        verified listings.
      </p>
    </div>);
}

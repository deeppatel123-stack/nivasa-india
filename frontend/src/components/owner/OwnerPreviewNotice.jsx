import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OwnerPreviewNotice({ className }) {
  return (
    <div role="note" className={cn('flex items-start gap-2.5 rounded-xl border border-teal-200 bg-teal-50/80 px-3.5 py-3 text-xs leading-relaxed text-teal-950', className)}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
      <p>
        <strong className="font-semibold">Submissions are reviewed before publishing.</strong> Your listing details are saved to your account and will be reviewed before appearing publicly.
      </p>
    </div>
  );
}

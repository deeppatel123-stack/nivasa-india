import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Stands apart from the global demo-data disclosure: this is about owner input. */
export function OwnerPreviewNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-teal-200 bg-teal-50/80 px-3.5 py-3 text-xs leading-relaxed text-teal-950',
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
      <p>
        <strong className="font-semibold">Owner tools are UI previews — no data is submitted.</strong> Anything you
        enter stays on this page. There is no backend, no publishing and no owner inventory in this phase.
      </p>
    </div>
  );
}

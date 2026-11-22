import { useId, useState, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FaqEntry {
  question: string;
  answer: ReactNode;
}

/**
 * Button-controlled accordion: each question is a real button with
 * aria-expanded / aria-controls, and every panel stays in the DOM so the
 * relationship remains valid while a panel is closed.
 */
export function FaqAccordion({
  items,
  defaultOpenIndex = 0,
  className,
}: {
  items: FaqEntry[];
  defaultOpenIndex?: number | null;
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <div className={cn('card divide-y divide-ink-100 overflow-hidden', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${rawId}-q-${index}`;
        const panelId = `${rawId}-a-${index}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-ink-50/70 sm:px-5"
              >
                <span className={cn('text-sm font-semibold leading-snug', isOpen ? 'text-ink-950' : 'text-ink-800')}>
                  {item.question}
                </span>
                <span
                  className={cn(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition',
                    isOpen ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-ink-200 text-ink-500',
                  )}
                  aria-hidden
                >
                  {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="space-y-2 px-4 pb-5 text-sm leading-relaxed text-ink-600 sm:px-5"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'neutral' | 'teal' | 'amber' | 'orange' | 'blue' | 'red' | 'green';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700',
  teal: 'bg-teal-50 text-teal-800 ring-1 ring-teal-200',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  orange: 'bg-orange-50 text-orange-800 ring-1 ring-orange-200',
  blue: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200',
  red: 'bg-red-50 text-red-800 ring-1 ring-red-200',
  green: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

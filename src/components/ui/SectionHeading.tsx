import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  actionTo,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>}
        {children}
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-800 transition hover:text-teal-700">
          {actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

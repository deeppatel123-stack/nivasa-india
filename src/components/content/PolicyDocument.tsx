import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

/** Shared framing for the two draft policy documents. */
export function DraftPolicyBanner({ title }: { title: string }) {
  return (
    <aside className="demo-strip !px-4 !py-3.5 sm:!px-5" aria-label="Draft status">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="amber">DRAFT</Badge>
          <strong className="text-sm font-semibold text-amber-950">{title}</strong>
        </div>
        <p>
          This is a draft written for a frontend demonstration. It is not a published legal policy, has not been legally
          reviewed, and creates no rights or obligations. No real personal data is collected and no live service is
          offered in this build. A reviewed document would replace this page before any production launch.
        </p>
      </div>
    </aside>
  );
}

export function PolicySection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="card scroll-mt-24 p-5 sm:p-6" aria-labelledby={`${id}-heading`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-xs font-bold text-ink-500">
          {String(number).padStart(2, '0')}
        </span>
        <h2 id={`${id}-heading`} className="font-display text-lg font-bold tracking-tight text-ink-950 sm:text-xl">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-3 pl-0 text-sm leading-relaxed text-ink-600 sm:pl-11">{children}</div>
    </section>
  );
}

export function PolicyList({ children }: { children: ReactNode }) {
  return <ul className="ml-5 list-disc space-y-2 marker:text-teal-600">{children}</ul>;
}

export function PolicyFooterNav({ current }: { current: 'privacy' | 'terms' }) {
  return (
    <nav
      className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-ink-100 bg-white px-5 py-4 text-sm"
      aria-label="Related documents"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">Related</span>
      {current === 'privacy' ? (
        <>
          <Link className="font-medium text-teal-700 hover:underline" to="/terms">
            Draft terms of use
          </Link>
          <Link className="font-medium text-teal-700 hover:underline" to="/faq">
            FAQ
          </Link>
        </>
      ) : (
        <>
          <Link className="font-medium text-teal-700 hover:underline" to="/privacy">
            Draft privacy policy
          </Link>
          <Link className="font-medium text-teal-700 hover:underline" to="/faq">
            FAQ
          </Link>
        </>
      )}
      <Link className="font-medium text-teal-700 hover:underline" to="/contact">
        Contact page (channels not connected yet)
      </Link>
    </nav>
  );
}

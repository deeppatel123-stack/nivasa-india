import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Logo } from '@/components/layout/Navbar';

const HIGHLIGHTS = [
  'Search real places across Indian cities and localities',
  'Save and compare options in one place',
  'Clear details with honest availability information',
];

export function AuthLayout({ eyebrow, title, description, children, footer, backTo, backLabel }) {
  return (
    <div className="bg-canvas">
      <div className="shell grid min-h-[calc(100vh-4rem)] items-stretch gap-8 py-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <section
          aria-label="About Nivasa"
          className="relative hidden overflow-hidden rounded-3xl bg-ink-950 p-10 text-white shadow-lift lg:flex lg:flex-col lg:justify-between"
        >
          <div className="grid-fade pointer-events-none absolute inset-0 opacity-50" aria-hidden />
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" aria-hidden />
          <div>
            <Logo light />
            <p className="mt-10 max-w-md font-display text-3xl font-extrabold leading-snug tracking-tight text-balance">
              Find your next place with confidence.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Nivasa helps you explore stays near the places that matter to you, with clear information and simple tools.
            </p>
            <ul className="mt-8 space-y-3.5">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/85">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-500/20 text-teal-300" aria-hidden>
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[11px] leading-relaxed text-white/55">
            Map and place data are provided by OpenStreetMap contributors.
          </p>
        </section>

        <section aria-label={title} className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
            {backTo && (
              <Link to={backTo} className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition hover:text-teal-700">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                {backLabel || 'Back'}
              </Link>
            )}
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>}
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 border-t border-ink-100 pt-5 text-center text-xs text-ink-500">{footer}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { DemoDisclosure } from '@/components/common/DemoDisclosure';
import { Logo } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/Badge';
const HIGHLIGHTS = [
    'Indicative monthly costs, not guessed totals',
    'Compare up to four demo stays side by side',
    'Save and revisit shortlisted places in one view',
];
/**
 * Original split-screen shell shared by the three auth pages.
 * The dark panel is decorative branding only; it contains no offers or claims.
 */
export function AuthLayout({ eyebrow, title, description, children, footer, backTo, backLabel, }) {
    return (<div className="bg-canvas">
      <div className="shell grid min-h-[calc(100vh-4rem)] items-stretch gap-8 py-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <section aria-label="About this Nivasa prototype" className="relative hidden overflow-hidden rounded-3xl bg-ink-950 p-10 text-white shadow-lift lg:flex lg:flex-col lg:justify-between">
          <div className="grid-fade pointer-events-none absolute inset-0 opacity-50" aria-hidden/>
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" aria-hidden/>
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-saffron-500/10 blur-3xl" aria-hidden/>

          <div className="relative flex items-center justify-between gap-3">
            <Logo light/>
            <Badge tone="amber">Prototype · Phase 1</Badge>
          </div>

          <div className="relative max-w-lg py-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Find your fit</p>
            <h2 className="font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-[42px]">
              A calmer way to shortlist your next stay.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65">
              Explore paying guest stays, hostels and flats across Indian cities with straightforward costs and a
              side-by-side comparison view.
            </p>

            <svg viewBox="0 0 420 300" className="mx-auto my-8 w-full max-w-[340px]" fill="none" aria-hidden>
              <circle cx="210" cy="148" r="118" stroke="rgba(255,255,255,0.10)"/>
              <circle cx="210" cy="148" r="86" stroke="rgba(255,255,255,0.08)"/>
              <path d="M64 224h292" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
              <path d="M120 224V136l90-64 90 64v88" stroke="rgba(255,255,255,0.85)" strokeWidth="2.4" strokeLinejoin="round"/>
              <path d="M172 224v-58h76v58" stroke="#3ecaa9" strokeWidth="2.4" strokeLinejoin="round"/>
              <path d="M148 166h124" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
              <path d="M95 224v-45h17v45M308 224v-58h17v58" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
              <circle cx="298" cy="82" r="15" fill="#f97316" fillOpacity="0.85"/>
            </svg>

            <ul className="space-y-3" aria-label="What this prototype offers">
              {HIGHLIGHTS.map((item) => (<li key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-500/15 text-teal-300">
                    <Check className="h-3 w-3" aria-hidden/>
                  </span>
                  {item}
                </li>))}
            </ul>
          </div>

          <div className="relative border-t border-white/10 pt-5 text-xs leading-relaxed text-white/50">
            Nivasa is a frontend prototype. No bookings, payments, contact details or real listings are available.
          </div>
        </section>

        <section className="flex flex-col justify-center" aria-label="Account access">
          <div className="mx-auto w-full max-w-[480px]">
            <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
              <Logo />
              <Badge tone="amber">Demo only</Badge>
            </div>

            <div className="card p-6 shadow-lift sm:p-9">
              <div className="mb-5">
                {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>}
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">{title}</h1>
                {description && <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>}
              </div>

              <DemoDisclosure className="mb-6"/>
              {children}
            </div>

            {footer && <div className="mt-6 text-center text-sm text-ink-600">{footer}</div>}

            {backTo && backLabel && (<Link to={backTo} className="mt-5 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-500 transition hover:text-ink-900">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden/>
                {backLabel}
              </Link>)}
          </div>
        </section>
      </div>
    </div>);
}

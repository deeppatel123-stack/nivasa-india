import { ArrowRight, BadgeCheck, Compass, Heart, MapPin, Route, Scale, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Search a location',
    description: 'Enter a city, locality, landmark, office, or address anywhere in India to start your search.',
  },
  {
    number: '02',
    icon: SlidersHorizontal,
    title: 'Set radius and filters',
    description: 'Choose how far you want to look and narrow results by stay type and preferences.',
  },
  {
    number: '03',
    icon: Route,
    title: 'Check distance and details',
    description: 'See how far each place is from your chosen location and review the details available for it.',
  },
  {
    number: '04',
    icon: Scale,
    title: 'Compare and shortlist',
    description: 'Compare places side by side, save favorites, and come back to them when you are ready.',
  },
];

const FEATURES = [
  {
    icon: MapPin,
    title: 'Location-first search',
    description: 'Find places near the area that matters to you, whether it is a campus, office, or neighborhood.',
  },
  {
    icon: Compass,
    title: 'Map and list views',
    description: 'Explore results on a map or in a list to understand both location and details at a glance.',
  },
  {
    icon: Scale,
    title: 'Easy comparison',
    description: 'Compare places by distance, price, and available details to make a confident choice.',
  },
  {
    icon: Heart,
    title: 'Save for later',
    description: 'Keep a shortlist of places you like so you can revisit them anytime.',
  },
  {
    icon: BadgeCheck,
    title: 'Clear information',
    description: 'We show details clearly and mark missing information as “Not available” instead of guessing.',
  },
  {
    icon: ShieldCheck,
    title: 'Simple for owners',
    description: 'Property owners can create an account, submit listings, and track their review status.',
  },
];

export function AboutPage() {
  return (
    <PageShell
      eyebrow="About Nivasa"
      title="A clearer way to find a place to stay in India"
      description="Nivasa helps students and working professionals search by location, compare options, and make informed decisions with clear information."
      breadcrumbs={[{ label: 'About' }]}
      actions={<LinkButton to="/search" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>Start searching</LinkButton>}
    >
      <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]" aria-labelledby="mission-heading">
        <div className="card p-6 sm:p-8">
          <Badge tone="teal" icon={<Compass className="h-3 w-3" aria-hidden />}>Our mission</Badge>
          <h2 id="mission-heading" className="mt-4 font-display text-2xl font-extrabold leading-snug tracking-tight text-ink-950 sm:text-3xl">
            Finding a place should feel simple and clear.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            Searching for accommodation can be stressful when information is scattered or unclear. Nivasa brings search, distance, comparison, and saved places into one simple experience.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            Start from the place you need to be, explore nearby options, and see the details that matter. When something is missing, we show it clearly so you can decide with confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/faq" className="text-sm font-semibold text-teal-700 hover:underline">Read the FAQ</Link>
            <span className="text-ink-300" aria-hidden>·</span>
            <Link to="/contact" className="text-sm font-semibold text-teal-700 hover:underline">Contact us</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-ink-900 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Who it’s for</p>
          <h3 className="mt-3 font-display text-xl font-bold">Built for everyday moves</h3>
          <ul className="mt-5 space-y-4 text-sm leading-relaxed text-white/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" aria-hidden />
              <span>Students looking near colleges, universities, or coaching centers.</span>
            </li>
            <li className="flex gap-3">
              <Compass className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" aria-hidden />
              <span>Professionals searching near offices, business hubs, or transit points.</span>
            </li>
            <li className="flex gap-3">
              <Heart className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" aria-hidden />
              <span>Anyone who wants to compare options and keep a clear shortlist.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading eyebrow="How it works" title="Find a place in four steps" description="A simple flow from search to shortlist." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="card flex flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="font-display text-lg font-extrabold text-ink-400">{step.number}</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading eyebrow="Features" title="Everything you need to decide" description="Tools designed to make your search clear and manageable." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-ink-100 bg-white p-5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-50 text-ink-700">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-4 text-sm font-bold text-ink-900">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12 overflow-hidden rounded-3xl bg-ink-900 px-6 py-8 text-white sm:px-9" aria-labelledby="cta-heading">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Ready to start?</p>
            <h2 id="cta-heading" className="mt-2 font-display text-2xl font-extrabold tracking-tight">
              Find a place near where you need to be.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Search by location, compare options, and save your favorites.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <LinkButton to="/search" variant="secondary">Start searching</LinkButton>
            <LinkButton to="/contact" variant="outline">Contact us</LinkButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

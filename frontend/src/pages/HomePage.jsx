import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Building2,
  ClipboardCheck,
  Compass,
  Home,
  KeyRound,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
} from 'lucide-react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LocationSearchBar } from '@/components/search/LocationSearchBar';
import { buttonClasses } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useListings } from '@/features/listings/queries';
import { CATEGORY_LABELS } from '@/features/listings/types';
import { cn } from '@/lib/utils';

const STAY_TYPES = [
  { category: 'pg', icon: Home, description: 'Managed rooms with meals and housekeeping.' },
  { category: 'hostel', icon: BedDouble, description: 'Budget dorms and beds for students.' },
  { category: 'private_room', icon: KeyRound, description: 'A room of your own with flexible terms.' },
  { category: 'shared_room', icon: Users, description: 'Share costs without giving up your own space.' },
  { category: 'flat_1bhk', icon: Building2, description: 'Independent living for a focused routine.' },
  { category: 'co_living', icon: Users, description: 'Furnished homes with community amenities.' },
];

const SEARCH_EXAMPLES = ['Mumbai', 'Bengaluru', 'Pune', 'Delhi'];

function StepCard({ number, icon: Icon, title, body }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-950 text-teal-300">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-display text-2xl font-extrabold text-ink-400">{number}</span>
      </div>
      <h3 className="mt-4 font-display text-sm font-bold text-ink-950">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{body}</p>
    </div>
  );
}

function TrustCard({ icon: Icon, title, body }) {
  return (
    <div className="card p-5 sm:p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-sm font-bold text-ink-950">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{body}</p>
    </div>
  );
}

export function HomePage() {
  const { data: listings } = useListings();
  const recent = listings.slice(0, 3);

  return (
    <div>
      <section className="relative border-b border-ink-100 bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0 grid-fade opacity-[0.06]" aria-hidden />
        <div className="shell relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-teal-200">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Search any Indian city, locality, landmark or address
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[56px]">
              Find your next place to stay, <span className="text-teal-300">with clarity.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              Search any location across India and discover places to stay nearby. Compare options, check distances, and save the ones you like.
            </p>
            <div className="mt-8 max-w-3xl">
              <LocationSearchBar variant="hero" />
            </div>
            <p className="mt-3 pl-1 text-[11px] leading-relaxed text-white/50">
              Search by city, locality, landmark, or address anywhere in India.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-lift backdrop-blur-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Try a search</p>
                  <p className="mt-1 text-sm font-semibold text-white">Anywhere in India</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-teal-200">
                  <Compass className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <ul className="mt-5 space-y-2">
                {SEARCH_EXAMPLES.map((place) => (
                  <li key={place} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3.5 py-2.5">
                    <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-white">
                      <MapPin className="h-4 w-4 shrink-0 text-saffron-400" aria-hidden />
                      <span className="truncate">{place}</span>
                    </span>
                    <Link to={`/search?q=${encodeURIComponent(place)}&radius=5`} className="shrink-0 text-[11px] font-semibold text-teal-200 hover:text-white">
                      Search
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/60">
                Type any Indian location into the search field or use your current position.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-muted border-y border-ink-100 py-14 sm:py-16">
        <div className="shell">
          <SectionHeading
            eyebrow="Explore by stay type"
            title="Find the stay that fits you"
            description="Choose a stay type to start your search."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STAY_TYPES.map(({ category, icon: Icon, description }) => (
              <Link
                key={category}
                to={`/search?category=${category}`}
                className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift"
              >
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-950 text-teal-300 transition', 'group-hover:bg-teal-700 group-hover:text-white')}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-bold text-ink-950">{CATEGORY_LABELS[category]}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-ink-500">{description}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
                    Browse <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-14 sm:py-16">
        <SectionHeading
          eyebrow="Recently discovered"
          title="Places near your searches"
          description="Places appear here after you search a location."
          actionLabel="Start a search"
          actionTo="/explore"
        />
        {recent.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Start exploring"
            description="Search for a city, locality, landmark or address to find places to stay nearby."
            action={<Link to="/explore" className={buttonClasses('primary', 'md')}>Find stays near a location</Link>}
          />
        )}
      </section>

      <section className="shell py-14 sm:py-16">
        <SectionHeading eyebrow="How it works" title="Four simple steps" description="From search to shortlist, everything is clear and easy." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StepCard number="01" icon={Search} title="Search any place" body="Search a city, campus, office, locality, landmark or full address." />
          <StepCard number="02" icon={SlidersHorizontal} title="Set radius & filters" body="Choose how far to look, then narrow by category and preferences." />
          <StepCard number="03" icon={Scale} title="Compare options" body="Compare places side by side to find the right fit." />
          <StepCard number="04" icon={ClipboardCheck} title="Save & revisit" body="Save places you like and come back to them anytime." />
        </div>
      </section>

      <section className="surface-muted border-y border-ink-100 py-14 sm:py-16">
        <div className="shell grid gap-5 lg:grid-cols-2">
          <div className="card p-6 sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-saffron-50 text-saffron-600">
              <Compass className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-extrabold text-ink-950">Smart recommendations</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Get suggestions based on your search results and preferences to help you decide faster.
            </p>
            <Link to="/assistant" className={buttonClasses('outline', 'sm', false, 'mt-5')}>
              Get recommendations <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="card p-6 sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Wallet className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-extrabold text-ink-950">Compare clearly</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              See rent, deposit, and other costs side by side. Missing details are clearly marked as unavailable.
            </p>
            <Link to="/compare" className={buttonClasses('outline', 'sm', false, 'mt-5')}>
              Compare places <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="shell py-14 sm:py-16">
        <SectionHeading eyebrow="Why Nivasa" title="Built for clear decisions" description="Simple tools that help you find the right place without confusion." />
        <div className="grid gap-4 lg:grid-cols-3">
          <TrustCard icon={BadgeCheck} title="Clear information" body="Important details are shown clearly, and anything missing is marked as unavailable." />
          <TrustCard icon={ShieldCheck} title="Honest listings" body="We show only the information available for each place — no guesses or made-up details." />
          <TrustCard icon={MapPin} title="Location-first search" body="Start from where you need to be and find places nearby across India." />
        </div>
      </section>

      <section className="shell pb-20 pt-2">
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 grid-fade opacity-[0.06]" aria-hidden />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">For property owners</p>
              <h2 className="mt-2 max-w-2xl font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                List your property on Nivasa
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
                Add your property details, location, and pricing to reach people looking for a place to stay.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/owner/add-property" className={buttonClasses('secondary', 'md')}>
                List a property <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/owner/dashboard" className={buttonClasses('ghost', 'md', false, 'text-white hover:bg-white/10 hover:text-white')}>
                Owner dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Building2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Home,
  KeyRound,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DemoDisclosure } from '@/components/common/DemoDisclosure';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LocationSearchBar } from '@/components/search/LocationSearchBar';
import { buttonClasses } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { useListings } from '@/features/listings/queries';
import { CATEGORY_LABELS, type PropertyCategory } from '@/features/listings/types';
import {
  POPULAR_CITIES,
  POPULAR_TECH_HUBS,
  POPULAR_UNIVERSITIES,
} from '@/features/locations/demoLocations';
import type { Place, PlaceType } from '@/features/locations/types';
import { cn } from '@/lib/utils';

const PLACE_ICONS: Record<PlaceType, LucideIcon> = {
  city: MapPin,
  university: GraduationCap,
  college: GraduationCap,
  company: Building2,
  tech_park: Building2,
  locality: MapPin,
  landmark: MapPin,
};

const STAY_TYPES: Array<{ category: PropertyCategory; icon: LucideIcon; description: string }> = [
  { category: 'pg', icon: Home, description: 'Managed rooms with meals and housekeeping.' },
  { category: 'hostel', icon: BedDouble, description: 'Budget dorms and beds for campus life.' },
  { category: 'private_room', icon: KeyRound, description: 'A room of your own with flexible terms.' },
  { category: 'shared_room', icon: Users, description: 'Share costs without giving up your own space.' },
  { category: 'flat_1bhk', icon: Building2, description: 'Independent living for a focused routine.' },
  { category: 'co_living', icon: Sparkles, description: 'Furnished homes with community amenities.' },
];

const NEARBY_PLACES: Place[] = [
  ...POPULAR_UNIVERSITIES.slice(0, 2),
  ...POPULAR_TECH_HUBS.slice(0, 2),
];

function PlacePill({ place }: { place: Place }) {
  const Icon = PLACE_ICONS[place.type];
  return (
    <Link
      to={`/search?q=${encodeURIComponent(place.name)}&radius=5`}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-soft transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-800"
    >
      <Icon className="h-3.5 w-3.5 text-teal-600" aria-hidden />
      {place.name}
    </Link>
  );
}

function ShortcutGroup({
  title,
  icon: Icon,
  places,
}: {
  title: string;
  icon: LucideIcon;
  places: Place[];
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-700">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="font-display text-sm font-bold text-ink-900">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {places.map((place) => (
          <PlacePill key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  body,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  body: string;
}) {
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

function TrustCard({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="card p-5 sm:p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-sm font-bold text-ink-950">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{body}</p>
      {children}
    </div>
  );
}

export function HomePage() {
  const { data: listings, isLoading } = useListings();

  const featured = useMemo(() => {
    const all = listings ?? [];
    const flagged = all.filter((listing) => listing.featured);
    return (flagged.length ? flagged : all).slice(0, 3);
  }, [listings]);

  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-ink-100 bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0 grid-fade opacity-[0.06]" aria-hidden />
        <div className="shell relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-teal-200">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Built for students & working professionals in India
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[56px]">
              Find Your Perfect Stay, <span className="text-teal-300">Wherever Life Takes You.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              Discover PGs, hostels, private rooms and rental homes near your college,
              workplace or anywhere in India — with clear, all-in monthly costs instead
              of guesswork.
            </p>
            <div className="mt-8 max-w-3xl">
              <LocationSearchBar variant="hero" />
            </div>
            <p className="mt-3 pl-1 text-[11px] leading-relaxed text-white/50">
              Search uses a curated index of real Indian places. Listings in this phase are
              illustrative demo data.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-lift backdrop-blur-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">
                    Places you can search today
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">Real landmarks, demo index</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-teal-200">
                  <Compass className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <ul className="mt-5 space-y-2">
                {POPULAR_CITIES.slice(0, 4).map((place) => (
                  <li
                    key={place.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3.5 py-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-white">
                      <MapPin className="h-4 w-4 shrink-0 text-saffron-400" aria-hidden />
                      <span className="truncate">{place.name}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-white/50">{place.state}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/60">
                Names and coordinates come from a curated geographic index. No real
                property, rent or contact detail is attached to them in this demo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-place shortcuts */}
      <section className="shell py-10 sm:py-12">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Shortcuts</p>
            <h2 className="mt-1 font-display text-xl font-extrabold text-ink-950 sm:text-2xl">
              Start from a place you already know
            </h2>
          </div>
          <p className="text-xs text-ink-500">Real places from the demo index · listings are illustrative</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <ShortcutGroup title="Cities" icon={MapPin} places={POPULAR_CITIES} />
          <ShortcutGroup title="Universities" icon={GraduationCap} places={POPULAR_UNIVERSITIES} />
          <ShortcutGroup title="IT hubs & offices" icon={Building2} places={POPULAR_TECH_HUBS} />
        </div>
      </section>

      {/* Accommodation types */}
      <section className="surface-muted border-y border-ink-100 py-14 sm:py-16">
        <div className="shell">
          <SectionHeading
            eyebrow="Explore by stay type"
            title="Different stays, different kinds of freedom"
            description="Pick the kind of home you need. Each card opens the search with that accommodation type pre-selected."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STAY_TYPES.map(({ category, icon: Icon, description }) => (
              <Link
                key={category}
                to={`/explore?category=${category}`}
                className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift"
              >
                <span
                  className={cn(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-950 text-teal-300 transition',
                    'group-hover:bg-teal-700 group-hover:text-white',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-bold text-ink-950">
                    {CATEGORY_LABELS[category]}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-ink-500">{description}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
                    Browse this type
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured demo strip */}
      <section className="shell py-14 sm:py-16">
        <SectionHeading
          eyebrow="Featured demo stays"
          title="A preview of the listing experience"
          description="These cards show how distance, occupancy and all-in cost appear in search. Every one is clearly labelled illustration, not a real property."
          actionLabel="Browse all demo stays"
          actionTo="/explore"
        />
        <DemoDisclosure className="mb-6" />
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* Nearby discovery */}
      <section className="surface-muted border-y border-ink-100 py-14 sm:py-16">
        <div className="shell">
          <SectionHeading
            eyebrow="Nearby discovery"
            title="Search from a landmark, not just a city"
            description="Pick a campus or tech park and see which illustrative stays sit within your chosen radius."
            actionLabel="Open map search"
            actionTo="/map"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NEARBY_PLACES.map((place) => {
              const Icon = PLACE_ICONS[place.type];
              return (
                <div key={place.id} className="card flex flex-col p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-sm font-bold text-ink-950">{place.name}</h3>
                  <p className="mt-1 text-xs text-ink-500">{place.context}</p>
                  <Link
                    to={`/search?q=${encodeURIComponent(place.name)}&radius=5`}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 transition hover:gap-2.5"
                  >
                    See stays nearby
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-ink-500">
            Place names and coordinates are real geographic reference points. The stays shown
            beside them are illustrative demo listings, not available homes.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="shell py-14 sm:py-16">
        <SectionHeading
          eyebrow="How it works"
          title="Four steps from search to shortlist"
          description="A simple, transparent flow — even while the catalogue is still a demo."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StepCard
            number="01"
            icon={Search}
            title="Pick a real place"
            body="Search a city, campus, office or locality from the curated location index."
          />
          <StepCard
            number="02"
            icon={SlidersHorizontal}
            title="Set radius & filters"
            body="Choose how far to look, then narrow by rent, furnishing, occupancy and amenities."
          />
          <StepCard
            number="03"
            icon={Scale}
            title="Compare all-in cost"
            body="See recurring monthly expense, per-person cost and one-time move-in payments apart."
          />
          <StepCard
            number="04"
            icon={ClipboardCheck}
            title="Save & revisit"
            body="Shortlist demo stays and compare up to four side by side. No contact details are shared."
          />
        </div>
      </section>

      {/* AI + price comparison intros */}
      <section className="surface-muted border-y border-ink-100 py-14 sm:py-16">
        <div className="shell grid gap-5 lg:grid-cols-2">
          <div className="card p-6 sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-saffron-50 text-saffron-600">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-extrabold text-ink-950">
              Recommendations you can question
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              The demo assistant uses simple rules over the same illustrative listings you can
              browse. It explains why something was suggested and never invents a property,
              price or review. A live AI service can be connected later without changing the flow.
            </p>
            <Link to="/assistant" className={buttonClasses('outline', 'sm', false, 'mt-5')}>
              Try the demo assistant
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="card p-6 sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Wallet className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-extrabold text-ink-950">
              Compare what you'll really pay
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Rent is only part of the story. We separate deposit, brokerage, maintenance, food
              and electricity, keep included services from being counted twice, and show a
              per-person monthly figure for shared homes.
            </p>
            <Link to="/compare" className={buttonClasses('outline', 'sm', false, 'mt-5')}>
              See how comparison works
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & verification */}
      <section className="shell py-14 sm:py-16">
        <SectionHeading
          eyebrow="Trust & verification"
          title="Honest labels, no invented proof"
          description="We would rather show you what we don't know than fill the gaps with fiction."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <TrustCard
            icon={BadgeCheck}
            title="Clear listing states"
            body="Cards state whether a listing is verified, unverified or illustrative. In this phase every listing is a demo."
          >
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Examples of verification labels">
              <VerificationBadge state="verified" />
              <VerificationBadge state="unverified" />
              <VerificationBadge state="demo" />
            </div>
            <p className="mt-2 text-[11px] text-ink-400">
              Examples of supported labels — not claims about any real property.
            </p>
          </TrustCard>
          <TrustCard
            icon={ShieldCheck}
            title="No invented contacts or reviews"
            body="Demo listings carry no owner name, phone number or review. Ratings stay empty until real, moderated feedback exists."
          />
          <TrustCard
            icon={MapPin}
            title="Real places, separate from listings"
            body="City, campus and office coordinates are geographic reference data only. They help measure distance; they are not property addresses."
          />
        </div>
        <DemoDisclosure className="mt-6" />
      </section>

      {/* Owner CTA */}
      <section className="shell pb-20 pt-2">
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 grid-fade opacity-[0.06]" aria-hidden />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">For property owners</p>
              <h2 className="mt-2 max-w-2xl font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Bring real inventory to Nivasa when verification is live.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
                Owner tools are shown as a demo workflow today. No property, owner identity,
                rent or contact detail is collected in this phase.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/owner/add-property" className={buttonClasses('secondary', 'md')}>
                Explore owner tools
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/owner/dashboard"
                className={buttonClasses('ghost', 'md', false, 'text-white hover:bg-white/10 hover:text-white')}
              >
                Owner dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

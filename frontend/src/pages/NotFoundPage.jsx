import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Home, Map, Search, SearchX } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Button, LinkButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SectionHeading } from '@/components/ui/SectionHeading';

const NEXT_STOPS = [
  { to: '/', label: 'Home', detail: 'Start from the beginning', icon: Home },
  { to: '/search', label: 'Search places', detail: 'Find stays near a location', icon: Search },
  { to: '/map', label: 'Map search', detail: 'Explore on the map', icon: Map },
  { to: '/faq', label: 'Help & FAQ', detail: 'Answers to common questions', icon: Compass },
];

const EXAMPLES = ['Ahmedabad', 'Mumbai', 'Bengaluru'];

export function NotFoundPage() {
  const navigate = useNavigate();
  const [query, setQueryInput] = useState('');

  function startSearch(value) {
    const trimmed = value.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    startSearch(query);
  }

  return (
    <PageShell
      eyebrow="404 · Page not found"
      title="That page isn't here"
      description="The link may be outdated or the address may be incorrect. Let’s help you find what you need."
      breadcrumbs={[{ label: 'Page not found' }]}
      actions={
        <>
          <LinkButton to="/" leftIcon={<Home className="h-4 w-4" aria-hidden />}>Go home</LinkButton>
          <LinkButton to="/search" variant="outline" leftIcon={<Search className="h-4 w-4" aria-hidden />}>Search places</LinkButton>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.8fr)]">
        <section className="card relative overflow-hidden p-6 sm:p-9" aria-labelledby="not-found-heading">
          <div className="pointer-events-none absolute -right-6 -top-8 select-none font-display text-[9rem] font-extrabold leading-none text-ink-50 sm:text-[12rem]" aria-hidden>
            404
          </div>
          <div className="relative">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
              <SearchX className="h-6 w-6" aria-hidden />
            </span>
            <h2 id="not-found-heading" className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink-950">
              Looking for a place to stay?
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-500">
              Search for a city, locality, landmark, or address in India to find nearby places.
            </p>
            <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start" onSubmit={handleSubmit} role="search">
              <Input id="not-found-search" label="Search location" placeholder="Try a city, campus, or landmark" value={query} onChange={(event) => setQueryInput(event.target.value)} leftIcon={<Search className="h-4 w-4" aria-hidden />} containerClassName="flex-1" />
              <Button type="submit" variant="secondary" className="shrink-0 sm:mt-[25px]" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
                Search
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-500">
              <span>Examples:</span>
              {EXAMPLES.map((place) => (
                <button key={place} type="button" onClick={() => startSearch(place)} className="rounded-full border border-ink-200 bg-white px-3 py-1.5 font-medium text-ink-700 transition hover:border-teal-300 hover:text-teal-700">
                  {place}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeading title="Useful links" description="Get back on track." />
          <ul className="divide-y divide-ink-100">
            {NEXT_STOPS.map((stop) => {
              const Icon = stop.icon;
              return (
                <li key={stop.to}>
                  <Link to={stop.to} className="group flex items-center gap-3 py-3 transition hover:text-teal-700">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-600 group-hover:bg-teal-50 group-hover:text-teal-700">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink-800 group-hover:text-teal-700">{stop.label}</span>
                      <span className="block text-xs text-ink-500">{stop.detail}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-300" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-500">
        Need help? <Link to="/faq" className="font-semibold text-teal-700 hover:underline">Read the FAQ</Link> or <Link to="/contact" className="font-semibold text-teal-700 hover:underline">contact us</Link>.
      </p>
    </PageShell>
  );
}

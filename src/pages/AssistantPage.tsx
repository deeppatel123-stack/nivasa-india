import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Images, Info, MapPin, Send, Sparkles } from 'lucide-react';
import { DemoDisclosure } from '@/components/common/DemoDisclosure';
import { PageShell } from '@/components/layout/PageShell';
import { LocationSearchBar } from '@/components/search/LocationSearchBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { demoRulesAssistant } from '@/features/ai/assistant';
import { useListings } from '@/features/listings/queries';
import { CATEGORY_LABELS, type Property } from '@/features/listings/types';
import { formatDistance } from '@/features/locations/distance';
import { demoGeocoder } from '@/features/locations/geocoder';
import { calculateEffectiveCost, formatINR } from '@/features/pricing/pricing';
import { countActiveFilters, searchListings, type SearchResult } from '@/features/search/searchEngine';
import type { SearchState } from '@/features/search/types';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/useSearchStore';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  caveats?: string[];
  followUps?: string[];
  recommendations?: { ids: string[]; results: SearchResult[] };
}

const SUGGESTIONS = [
  'Find the best PG near Nirma University under ₹8,000',
  'Show affordable hostels within 3 km',
  'Which properties include food and Wi-Fi?',
  'Which demo option has the lowest deposit?',
];

const FALLBACK_CAVEATS = [
  'Demo recommendations — AI service not connected.',
  'Results are illustrative listings, not real properties or market quotes.',
];

function RecommendationCards({
  ids,
  listings,
  results,
}: {
  ids: string[];
  listings: Property[];
  results: SearchResult[];
}) {
  const items = ids
    .map((id) => ({
      property: listings.find((listing) => listing.id === id),
      result: results.find((result) => result.property.id === id),
    }))
    .filter((entry): entry is { property: Property; result: SearchResult | undefined } => Boolean(entry.property));

  if (!items.length) return null;

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="Illustrative demo recommendations">
      {items.map(({ property, result }) => {
        const image = property.images[0];
        const cost = calculateEffectiveCost(property.prices, property.occupancy);
        return (
          <article key={property.id} className="rounded-xl border border-ink-100 bg-white p-2.5">
            <div className="flex gap-3">
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                {image ? (
                  <img src={image.url} alt={image.alt} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-ink-400">
                    <Images className="h-4 w-4" aria-hidden />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/property/${property.id}`}
                    className="line-clamp-2 text-xs font-bold leading-snug text-ink-900 transition hover:text-teal-700"
                  >
                    {property.title}
                  </Link>
                  <span className="shrink-0 text-xs font-extrabold text-ink-950">{formatINR(property.prices.rent)}</span>
                </div>
                <p className="mt-1 truncate text-[10px] text-ink-500">
                  {property.location.label}, {property.location.city}
                  {result?.distanceKm !== null && result?.distanceKm !== undefined
                    ? ` · ~${formatDistance(result.distanceKm)}`
                    : ''}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <Badge tone="blue">{CATEGORY_LABELS[property.category]}</Badge>
                  <Badge tone="neutral">{formatINR(cost.perPersonMonthly)}/person</Badge>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-amber-800">Illustrative image · demo listing, not a real property</p>
          </article>
        );
      })}
    </div>
  );
}

export function AssistantPage() {
  const { data: listings, isLoading: listingsLoading } = useListings();
  const query = useSearchStore((state) => state.query);
  const radiusKm = useSearchStore((state) => state.radiusKm);
  const resolvedLocation = useSearchStore((state) => state.resolvedLocation);
  const filters = useSearchStore((state) => state.filters);
  const sort = useSearchStore((state) => state.sort);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: 'Ask about the illustrative demo catalogue. I rank local demo results using distance, total monthly expense and occupancy — no AI service is connected.',
      caveats: FALLBACK_CAVEATS,
    },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);
  const logRef = useRef<HTMLDivElement>(null);

  const listingsReady = Boolean(listings && listings.length > 0);
  const searchState = useMemo<SearchState>(
    () => ({ query, radiusKm, filters, sort }),
    [query, radiusKm, filters, sort],
  );
  const activeFilters = useMemo(() => countActiveFilters(searchState), [searchState]);

  const contextLabel = resolvedLocation?.place?.name ?? resolvedLocation?.query ?? query ?? 'No location set';
  const assistantLocation = resolvedLocation?.unresolved
    ? undefined
    : resolvedLocation?.place?.name ?? resolvedLocation?.query ?? query ?? undefined;

  useEffect(() => {
    const node = logRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || busy || !listingsReady) return;

    setBusy(true);
    setDraft('');
    const userId = nextId.current++;
    setMessages((current) => [...current, { id: userId, role: 'user', text: trimmed }]);

    try {
      // A place named in the question is resolved locally when no store location is set.
      const questionPlace = resolvedLocation?.coordinates ? null : demoGeocoder.suggest(trimmed, 1)[0] ?? null;
      const origin = resolvedLocation?.coordinates ?? questionPlace?.coordinates ?? null;
      const results = searchListings(listings ?? [], searchState, origin);
      // Brief delay makes the loading state perceptible; the recommender itself is local.
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 350);
      });
      const reply = await demoRulesAssistant.reply(trimmed, {
        location: assistantLocation ?? questionPlace?.name ?? undefined,
        radiusKm,
        results,
      });
      const replyId = nextId.current++;
      setMessages((current) => [
        ...current,
        {
          id: replyId,
          role: 'assistant',
          text: reply.text,
          caveats: reply.caveats,
          followUps: reply.followUps,
          recommendations: { ids: reply.recommendationIds, results },
        },
      ]);
    } catch {
      const errorId = nextId.current++;
      setMessages((current) => [
        ...current,
        {
          id: errorId,
          role: 'assistant',
          text: 'The local demo recommender could not complete that question. Try another prompt or refresh the demo catalogue.',
          caveats: FALLBACK_CAVEATS,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(draft);
  };

  return (
    <PageShell
      eyebrow="Guided discovery"
      title="Ask the demo assistant"
      description="A rules-based helper for exploring illustrative listings. It uses the same local search results as Explore — there is no AI service or real inventory behind it."
      breadcrumbs={[{ label: 'Explore', to: '/explore' }, { label: 'Assistant' }]}
    >
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="card p-4 sm:p-5" aria-labelledby="assistant-context-heading">
            <h2 id="assistant-context-heading" className="font-display text-base font-bold text-ink-950">
              Search context
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">
              Answers use these saved demo filters. Nothing is sent to a server.
            </p>
            <div className="mt-4">
              <LocationSearchBar variant="compact" disableNavigation />
            </div>
            <dl className="mt-4 space-y-2 border-t border-ink-100 pt-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-ink-500">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> Location
                </dt>
                <dd className="max-w-[160px] text-right font-semibold text-ink-800">{contextLabel}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-ink-500">Radius</dt>
                <dd className="font-semibold text-ink-800">Within {radiusKm} km</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-ink-500">Active filters</dt>
                <dd className="font-semibold text-ink-800">{activeFilters}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-ink-500">Demo catalogue</dt>
                <dd className="text-right font-semibold text-ink-800">
                  {listingsLoading ? 'Loading…' : listingsReady ? `${listings?.length} listings` : 'Unavailable'}
                </dd>
              </div>
            </dl>
            {resolvedLocation?.unresolved && (
              <p className="demo-strip mt-3" role="note">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>That place is not in the demo index. Questions will use filters and budget hints only.</span>
              </p>
            )}
          </section>

          <section className="card p-4 sm:p-5" aria-labelledby="assistant-suggestions-heading">
            <h2 id="assistant-suggestions-heading" className="font-display text-base font-bold text-ink-950">
              Try asking
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-left"
                  onClick={() => void ask(suggestion)}
                  disabled={busy || !listingsReady}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-ink-400">Chips run the same local recommender as the message box.</p>
          </section>

          <section className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-teal-700">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="mt-3 font-display text-sm font-bold text-teal-900">How this works</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-teal-800">
              Deterministic rules rank demo listings by distance, total monthly expense and occupancy. No model is
              called and no real property data is used.
            </p>
          </section>

          <DemoDisclosure />
        </aside>

        <section className="card flex min-h-[560px] flex-col overflow-hidden lg:h-[calc(100vh-220px)] lg:max-h-[760px]" aria-label="Demo assistant chat">
          <header className="flex items-center gap-3 border-b border-ink-100 px-4 py-3 sm:px-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-900 text-white">
              <Bot className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-bold text-ink-950">Nivasa demo assistant</h2>
              <p className="truncate text-[11px] text-ink-500">Rules-based · grounded in demo listings</p>
            </div>
            <Badge tone="amber">Demo</Badge>
          </header>

          <div className="demo-strip rounded-none border-x-0 border-t-0" role="note">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              <strong className="font-semibold">Demo recommendations — AI service not connected.</strong>{' '}
              Replies are generated locally from the demo catalogue. Each answer below repeats the recommender’s
              own caveats.
            </span>
          </div>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Assistant conversation"
            className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
          >
            {messages.map((message) => (
              <div key={message.id} className={cn('flex gap-2.5', message.role === 'user' && 'justify-end')}>
                {message.role === 'assistant' && (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <Bot className="h-4 w-4" aria-hidden />
                  </span>
                )}
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%]',
                    message.role === 'user' ? 'bg-ink-900 text-white' : 'surface-muted text-ink-700',
                  )}
                >
                  <p
                    className={cn(
                      'mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em]',
                      message.role === 'user' ? 'text-white/60' : 'text-teal-700',
                    )}
                  >
                    {message.role === 'user' ? 'You' : 'Assistant · demo rules'}
                  </p>
                  <p className="whitespace-pre-line">{message.text}</p>

                  {message.caveats && message.caveats.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-ink-200/70 pt-2.5">
                      {message.caveats.map((caveat) => (
                        <li key={caveat} className="flex items-start gap-1.5 text-[11px] leading-snug text-amber-800">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                          {caveat}
                        </li>
                      ))}
                    </ul>
                  )}

                  {message.recommendations && listings && (
                    <RecommendationCards
                      ids={message.recommendations.ids}
                      listings={listings}
                      results={message.recommendations.results}
                    />
                  )}

                  {message.followUps && message.followUps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink-200/70 pt-2.5">
                      {message.followUps.map((followUp) => (
                        <Button
                          key={followUp}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void ask(followUp)}
                          disabled={busy || !listingsReady}
                        >
                          {followUp}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex gap-2.5" role="status" aria-label="Assistant is preparing a demo reply">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <Bot className="h-4 w-4" aria-hidden />
                </span>
                <div className="surface-muted rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">Assistant · demo rules</p>
                  <div className="mt-2 flex gap-1" aria-hidden>
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-2 w-2 animate-pulse rounded-full bg-teal-500"
                        style={{ animationDelay: `${dot * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-ink-100 bg-white px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-end gap-2">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about demo stays…"
                aria-label="Message the demo assistant"
                containerClassName="min-w-0 flex-1"
                disabled={busy || !listingsReady}
              />
              <Button
                type="submit"
                variant="secondary"
                loading={busy}
                disabled={!draft.trim() || !listingsReady}
                aria-label="Send message"
                leftIcon={<Send className="h-4 w-4" aria-hidden />}
              >
                Send
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-ink-400">
              Answers use illustrative listings only. Nothing you type is sent to a server or an AI provider.
            </p>
          </form>
        </section>
      </div>
    </PageShell>
  );
}

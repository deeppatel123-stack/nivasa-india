import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Images, Info, MapPin, Send, Sparkles } from 'lucide-react';
import { DataQualityNotice } from '@/components/common/DataQualityNotice';
import { useListingResults } from '@/components/discovery/useListingResults';
import { PageShell } from '@/components/layout/PageShell';
import { LocationSearchBar } from '@/components/search/LocationSearchBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { groundedAssistant } from '@/features/ai/assistant';
import { CATEGORY_LABELS } from '@/features/listings/types';
import { formatDistance } from '@/features/locations/distance';
import { calculateEffectiveCost, formatINR } from '@/features/pricing/pricing';
import { countActiveFilters } from '@/features/search/searchEngine';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/useSearchStore';

const SUGGESTIONS = [
  'Show the closest places',
  'Which places include Wi-Fi?',
  'Which one has the lowest deposit?',
  'Show places within 3 km',
];

function RecommendationCards({ ids, results }) {
  const items = ids
    .map((id) => results.find((result) => result.property.id === id))
    .filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="Recommended places">
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
                  <span className="grid h-full w-full place-items-center text-ink-400"><Images className="h-4 w-4" aria-hidden /></span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/property/${property.id}`} className="line-clamp-2 text-xs font-bold leading-snug text-ink-900 transition hover:text-teal-700">
                    {property.title}
                  </Link>
                  <span className="shrink-0 text-xs font-extrabold text-ink-950">{formatINR(property.prices.rent)}</span>
                </div>
                <p className="mt-1 truncate text-[10px] text-ink-500">
                  {property.location.label}, {property.location.city}
                  {result?.distanceKm != null ? ` · ~${formatDistance(result.distanceKm)}` : ''}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <Badge tone="blue">{CATEGORY_LABELS[property.category] || 'Other'}</Badge>
                  <Badge tone="neutral">{formatINR(cost.perPersonMonthly)}/person</Badge>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function AssistantPage() {
  const { results, isLoading, hasCoordinates } = useListingResults();
  const query = useSearchStore((state) => state.query);
  const radiusKm = useSearchStore((state) => state.radiusKm);
  const resolvedLocation = useSearchStore((state) => state.resolvedLocation);
  const filters = useSearchStore((state) => state.filters);
  const sort = useSearchStore((state) => state.sort);
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      text: 'I can help you compare places from your current search. Ask about distance, price, or amenities, and I’ll suggest options based on the results you see.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);
  const logRef = useRef(null);

  const searchState = useMemo(() => ({ query, radiusKm, filters, sort }), [query, radiusKm, filters, sort]);
  const activeFilters = useMemo(() => countActiveFilters(searchState), [searchState]);
  const contextLabel = resolvedLocation?.label || resolvedLocation?.query || query || 'No location set';
  const listingsReady = results.length > 0;

  useEffect(() => {
    const node = logRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  const ask = async (question) => {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setDraft('');
    const userId = nextId.current++;
    setMessages((current) => [...current, { id: userId, role: 'user', text: trimmed }]);
    try {
      const reply = await groundedAssistant.reply(trimmed, {
        location: contextLabel === 'No location set' ? null : contextLabel,
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
          followUps: reply.followUps,
          recommendations: { ids: reply.recommendationIds, results },
        },
      ]);
    } catch {
      const errorId = nextId.current++;
      setMessages((current) => [
        ...current,
        { id: errorId, role: 'assistant', text: 'I could not answer that right now. Please try again.' },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      eyebrow="Recommendations"
      title="Get help choosing a place"
      description="Ask questions about your current search results and get suggestions based on distance, price, and available details."
      breadcrumbs={[{ label: 'Explore', to: '/explore' }, { label: 'Recommendations' }]}
    >
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="card p-4 sm:p-5" aria-labelledby="assistant-context-heading">
            <h2 id="assistant-context-heading" className="font-display text-base font-bold text-ink-950">Search context</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">Suggestions are based on the places in your current search.</p>
            <div className="mt-4"><LocationSearchBar variant="compact" disableNavigation /></div>
            <dl className="mt-4 space-y-2 border-t border-ink-100 pt-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-ink-500"><MapPin className="h-3.5 w-3.5" aria-hidden /> Location</dt>
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
                <dt className="text-ink-500">Places found</dt>
                <dd className="text-right font-semibold text-ink-800">
                  {isLoading ? 'Loading…' : listingsReady ? `${results.length} places` : 'None yet'}
                </dd>
              </div>
            </dl>
            {!hasCoordinates && (
              <p className="notice-strip mt-3" role="note">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>Search a location first to get recommendations.</span>
              </p>
            )}
          </section>

          <section className="card p-4 sm:p-5" aria-labelledby="assistant-suggestions-heading">
            <h2 id="assistant-suggestions-heading" className="font-display text-base font-bold text-ink-950">Try asking</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Button key={suggestion} type="button" variant="outline" size="sm" className="text-left" onClick={() => void ask(suggestion)} disabled={busy || !listingsReady}>
                  {suggestion}
                </Button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-teal-700"><Sparkles className="h-4 w-4" aria-hidden /></span>
            <h2 className="mt-3 font-display text-sm font-bold text-teal-900">How it helps</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-teal-800">
              Recommendations are based on the places in your current search. Always confirm important details like price and availability before deciding.
            </p>
          </section>

          <DataQualityNotice />
        </aside>

        <section className="card flex min-h-[560px] flex-col overflow-hidden lg:h-[calc(100vh-220px)] lg:max-h-[760px]" aria-label="Nivasa recommendations">
          <header className="flex items-center gap-3 border-b border-ink-100 px-4 py-3 sm:px-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-900 text-white"><Bot className="h-4 w-4" aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-bold text-ink-950">Recommendations</h2>
              <p className="truncate text-[11px] text-ink-500">Based on your current search results</p>
            </div>
            <Badge tone="teal">Helpful</Badge>
          </header>

          <div ref={logRef} role="log" aria-live="polite" aria-label="Recommendation conversation" className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex gap-2.5', message.role === 'user' && 'justify-end')}>
                {message.role === 'assistant' && (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Bot className="h-4 w-4" aria-hidden /></span>
                )}
                <div className={cn('max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%]', message.role === 'user' ? 'bg-ink-900 text-white' : 'surface-muted text-ink-700')}>
                  <p className={cn('mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em]', message.role === 'user' ? 'text-white/60' : 'text-teal-700')}>
                    {message.role === 'user' ? 'You' : 'Nivasa'}
                  </p>
                  <p className="whitespace-pre-line">{message.text}</p>
                  {message.recommendations && <RecommendationCards ids={message.recommendations.ids} results={message.recommendations.results} />}
                  {message.followUps?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink-200/70 pt-2.5">
                      {message.followUps.map((followUp) => (
                        <Button key={followUp} type="button" size="sm" variant="outline" onClick={() => void ask(followUp)} disabled={busy}>
                          {followUp}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-2.5" role="status" aria-label="Preparing recommendations">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Bot className="h-4 w-4" aria-hidden /></span>
                <div className="surface-muted rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">Nivasa</p>
                  <div className="mt-2 flex gap-1" aria-hidden>{[0, 1, 2].map((dot) => <span key={dot} className="h-2 w-2 animate-pulse rounded-full bg-teal-500" style={{ animationDelay: `${dot * 150}ms` }} />)}</div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); void ask(draft); }} className="border-t border-ink-100 bg-white px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-end gap-2">
              <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about places in your search..." aria-label="Ask for recommendations" containerClassName="min-w-0 flex-1" disabled={busy || !listingsReady} />
              <Button type="submit" variant="secondary" loading={busy} disabled={!draft.trim() || !listingsReady} aria-label="Send message" leftIcon={<Send className="h-4 w-4" aria-hidden />}>Send</Button>
            </div>
            <p className="mt-2 text-[11px] text-ink-400">Suggestions are based on your current search results. Confirm important details before deciding.</p>
          </form>
        </section>
      </div>
    </PageShell>
  );
}

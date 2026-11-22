import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Info, Minus, Scale, Trophy, Wallet, X } from 'lucide-react';
import { DemoDisclosure } from '@/components/common/DemoDisclosure';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useListings } from '@/features/listings/queries';
import { AMENITY_LABELS, CATEGORY_LABELS, FURNISHING_LABELS, OCCUPANCY_LABELS, } from '@/features/listings/types';
import { formatDistance, haversineKm } from '@/features/locations/distance';
import { calculateEffectiveCost, formatDate, formatINR, } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
import { MAX_COMPARE, useCompareStore } from '@/store/useCompareStore';
import { useSearchStore } from '@/store/useSearchStore';
function Cell({ children, highlighted, badge, muted, }) {
    return (<td className={cn('border-b border-l border-ink-100 px-3 py-3 align-top text-sm', muted ? 'text-ink-400' : 'text-ink-800', highlighted && 'bg-teal-50/70')}>
      <div className="flex flex-wrap items-center gap-2">{children}{badge && <Badge tone="green">{badge}</Badge>}</div>
    </td>);
}
function ComparisonRow({ label, hint, children, }) {
    return (<tr>
      <th scope="row" className="sticky left-0 z-10 border-b border-ink-100 bg-white px-4 py-3 text-left align-top text-xs font-semibold text-ink-700">
        {label}
        {hint && <span className="mt-1 block text-[10px] font-normal leading-snug text-ink-400">{hint}</span>}
      </th>
      {children}
    </tr>);
}
export function ComparePage() {
    const { ids, remove, clear } = useCompareStore();
    const { data: listings, isLoading } = useListings();
    const resolvedLocation = useSearchStore((state) => state.resolvedLocation);
    const compared = useMemo(() => {
        if (!listings)
            return [];
        return ids
            .map((id) => listings.find((item) => item.id === id))
            .filter((item) => Boolean(item))
            .slice(0, MAX_COMPARE);
    }, [ids, listings]);
    const costs = useMemo(() => {
        const map = new Map();
        compared.forEach((property) => map.set(property.id, calculateEffectiveCost(property.prices, property.occupancy)));
        return map;
    }, [compared]);
    const analysis = useMemo(() => {
        if (!compared.length)
            return null;
        const bestValue = Math.min(...compared.map((property) => costs.get(property.id)?.perPersonMonthly ?? Infinity));
        const lowestUpfront = Math.min(...compared.map((property) => costs.get(property.id)?.upfront ?? Infinity));
        return {
            bestValue,
            lowestUpfront,
            bestValueIds: new Set(compared.filter((property) => costs.get(property.id)?.perPersonMonthly === bestValue).map((property) => property.id)),
            lowestUpfrontIds: new Set(compared.filter((property) => costs.get(property.id)?.upfront === lowestUpfront).map((property) => property.id)),
        };
    }, [compared, costs]);
    const amenityKeys = useMemo(() => {
        const keys = new Set();
        compared.forEach((property) => property.amenities.forEach((amenity) => keys.add(amenity)));
        return Array.from(keys).sort((a, b) => AMENITY_LABELS[a].localeCompare(AMENITY_LABELS[b]));
    }, [compared]);
    const bestNames = analysis
        ? compared.filter((property) => analysis.bestValueIds.has(property.id)).map((property) => property.title)
        : [];
    const upfrontNames = analysis
        ? compared.filter((property) => analysis.lowestUpfrontIds.has(property.id)).map((property) => property.title)
        : [];
    const bestExplanation = analysis
        ? `${bestNames.join(' and ')} ${bestNames.length > 1 ? 'tie for the' : 'has the'} lowest estimated monthly cost per person (${formatINR(analysis.bestValue)}). The calculation divides the all-in monthly expense by the listed occupancy, so shared and single rooms are compared fairly; included food and electricity are never counted twice.`
        : '';
    const upfrontExplanation = analysis
        ? `Lowest one-time move-in payment: ${formatINR(analysis.lowestUpfront)} for ${upfrontNames.join(' and ')} (refundable deposit + brokerage). First-month recurring charges are shown separately below.`
        : '';
    const includedSummary = compared
        .map((property) => {
        const notes = costs.get(property.id)?.includedNote ?? [];
        return `${property.title}: ${notes.length ? notes.join(' and ').toLowerCase() : 'no food or electricity marked included'}`;
    })
        .join(' · ');
    const distanceFor = (property) => {
        const coordinates = resolvedLocation?.coordinates;
        if (!coordinates)
            return 'Set a location';
        return `~${formatDistance(haversineKm(coordinates, property.location.coordinates))}`;
    };
    const noSelection = ids.length === 0;
    return (<PageShell eyebrow="Side-by-side review" title="Compare demo listings" description="Review up to four illustrative listings using the same cost rules as search. Every figure below is demo data, not a market quote." breadcrumbs={[{ label: 'Explore', to: '/explore' }, { label: 'Compare' }]} actions={compared.length ? <Button variant="outline" size="sm" onClick={clear} leftIcon={<X className="h-4 w-4" aria-hidden/>}>Clear all</Button> : undefined}>
      {isLoading && ids.length > 0 ? (<div className="card space-y-4 p-5" role="status" aria-label="Loading comparison">
          <Skeleton className="h-6 w-1/3"/>
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-2/3"/>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-32 w-full"/>
            <Skeleton className="h-32 w-full"/>
          </div>
          <span className="sr-only">Loading illustrative comparison data…</span>
        </div>) : !compared.length ? (<EmptyState icon={Scale} title={noSelection ? 'Nothing to compare yet' : 'Comparison unavailable'} description={noSelection
                ? 'Save up to four demo listings, then return here to compare rent, all-in monthly cost, upfront payments, amenities and location context.'
                : 'The saved comparison ids are no longer present in the demo catalogue. Clear them and choose fresh illustrative listings.'} action={<LinkButton to="/explore">Explore demo listings</LinkButton>} secondary={noSelection ? undefined : <Button variant="outline" onClick={clear}>Clear saved comparison</Button>}/>) : (<>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card p-4 sm:p-5" aria-labelledby="compare-best-heading">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <Trophy className="h-4 w-4" aria-hidden/>
                </span>
                <h2 id="compare-best-heading" className="font-display text-base font-bold text-ink-950">
                  Best value, highlighted below
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{bestExplanation}</p>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-800">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden/>
                <span>Included services: {includedSummary}</span>
              </p>
            </section>

            <section className="card p-4 sm:p-5" aria-labelledby="compare-upfront-heading">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <Wallet className="h-4 w-4" aria-hidden/>
                </span>
                <h2 id="compare-upfront-heading" className="font-display text-base font-bold text-ink-950">
                  Lowest upfront, highlighted below
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{upfrontExplanation}</p>
              <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
                Deposits are illustrative values and are treated as refundable only for this comparison.
                A low upfront cost does not necessarily mean a lower monthly expense.
              </p>
            </section>
          </div>

          <DemoDisclosure compact className="my-4"/>

          <div className="card overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-ink-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink-500">
                Scroll sideways on small screens to see every selected listing.
              </p>
              <Button variant="ghost" size="sm" onClick={clear} leftIcon={<X className="h-3.5 w-3.5" aria-hidden/>}>
                Clear all
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left">
                <caption className="sr-only">
                  Side-by-side comparison of up to four illustrative rental listings, including costs, amenities and verification
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="sticky left-0 z-20 w-44 border-b border-ink-100 bg-white px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">
                      Factor
                    </th>
                    {compared.map((property) => (<th key={property.id} scope="col" className="min-w-[210px] border-b border-l border-ink-100 p-3 align-top">
                        <div className="flex items-start gap-2">
                          <Link to={`/property/${property.id}`} className="shrink-0 overflow-hidden rounded-lg bg-ink-100">
                            {property.images[0] ? (<img src={property.images[0].url} alt="" loading="lazy" className="h-12 w-16 object-cover"/>) : (<span className="grid h-12 w-16 place-items-center text-[10px] text-ink-400">No image</span>)}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link to={`/property/${property.id}`} className="block text-xs font-bold leading-snug text-ink-900 transition hover:text-teal-700">
                              {property.title}
                            </Link>
                            <p className="mt-1 text-[10px] text-ink-500">{CATEGORY_LABELS[property.category]}</p>
                          </div>
                          <button type="button" onClick={() => remove(property.id)} aria-label={`Remove ${property.title} from comparison`} className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-ink-900">
                            <X className="h-3.5 w-3.5" aria-hidden/>
                          </button>
                        </div>
                        <p className="mt-2 text-[10px] text-amber-700">Illustrative image · demo listing</p>
                      </th>))}
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow label="Base rent" hint="per month">
                    {compared.map((property) => <Cell key={property.id}>{formatINR(property.prices.rent)}</Cell>)}
                  </ComparisonRow>
                  <ComparisonRow label="Security deposit" hint="one-time, assumed refundable">
                    {compared.map((property) => <Cell key={property.id}>{formatINR(property.prices.deposit)}</Cell>)}
                  </ComparisonRow>
                  <ComparisonRow label="Maintenance" hint="per month">
                    {compared.map((property) => <Cell key={property.id}>{formatINR(property.prices.maintenance)}</Cell>)}
                  </ComparisonRow>
                  <ComparisonRow label="Electricity" hint="per month unless included in rent">
                    {compared.map((property) => (<Cell key={property.id} muted={property.prices.electricityIncluded}>
                        <span className={property.prices.electricityIncluded ? 'line-through' : undefined}>
                          {formatINR(property.prices.electricity)}
                        </span>
                        {property.prices.electricityIncluded && <Badge tone="amber">Included in rent</Badge>}
                      </Cell>))}
                  </ComparisonRow>
                  <ComparisonRow label="Food" hint="per month unless included in rent">
                    {compared.map((property) => (<Cell key={property.id} muted={property.prices.foodIncluded}>
                        <span className={property.prices.foodIncluded ? 'line-through' : undefined}>
                          {formatINR(property.prices.food)}
                        </span>
                        {property.prices.foodIncluded && <Badge tone="amber">Included in rent</Badge>}
                      </Cell>))}
                  </ComparisonRow>
                  <ComparisonRow label="Brokerage" hint="one-time">
                    {compared.map((property) => <Cell key={property.id}>{formatINR(property.prices.brokerage)}</Cell>)}
                  </ComparisonRow>
                  <ComparisonRow label="Other charges" hint="per month">
                    {compared.map((property) => <Cell key={property.id}>{formatINR(property.prices.other)}</Cell>)}
                  </ComparisonRow>
                  <ComparisonRow label="Estimated total monthly expense" hint="recurring charges; included services not double-counted">
                    {compared.map((property) => (<Cell key={property.id}>
                        <span className="font-semibold">{formatINR(costs.get(property.id)?.monthlyExpense ?? 0)}</span>
                      </Cell>))}
                  </ComparisonRow>
                  <ComparisonRow label="Per-person monthly cost" hint="monthly expense ÷ occupancy">
                    {compared.map((property) => (<Cell key={property.id} highlighted={analysis?.bestValueIds.has(property.id)} badge={analysis?.bestValueIds.has(property.id) ? 'Best value' : undefined}>
                        <span className="font-semibold text-teal-800">{formatINR(costs.get(property.id)?.perPersonMonthly ?? 0)}</span>
                        <span className="text-[10px] text-ink-500">{OCCUPANCY_LABELS[property.occupancy]}</span>
                      </Cell>))}
                  </ComparisonRow>
                  <ComparisonRow label="One-time move-in payments" hint="deposit + brokerage">
                    {compared.map((property) => (<Cell key={property.id} highlighted={analysis?.lowestUpfrontIds.has(property.id)} badge={analysis?.lowestUpfrontIds.has(property.id) ? 'Lowest upfront' : undefined}>
                        <span className="font-semibold">{formatINR(costs.get(property.id)?.upfront ?? 0)}</span>
                      </Cell>))}
                  </ComparisonRow>
                  <ComparisonRow label="First-month outflow" hint="monthly expense + one-time payments">
                    {compared.map((property) => (<Cell key={property.id}>
                        <span className="font-semibold">{formatINR(costs.get(property.id)?.firstMonthOutflow ?? 0)}</span>
                      </Cell>))}
                  </ComparisonRow>
                  <ComparisonRow label="Distance" hint="approx. straight-line from stored location">
                    {compared.map((property) => (<Cell key={property.id} muted={!resolvedLocation?.coordinates}>
                        {distanceFor(property)}
                      </Cell>))}
                  </ComparisonRow>
                  <ComparisonRow label="Occupancy">
                    {compared.map((property) => <Cell key={property.id}>{OCCUPANCY_LABELS[property.occupancy]}</Cell>)}
                  </ComparisonRow>
                  <ComparisonRow label="Furnishing">
                    {compared.map((property) => <Cell key={property.id}>{FURNISHING_LABELS[property.furnishing]}</Cell>)}
                  </ComparisonRow>

                  <tr>
                    <th scope="colgroup" colSpan={compared.length + 1} className="border-y border-ink-100 bg-ink-50/70 px-4 py-2 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">
                      Amenities (illustrative)
                    </th>
                  </tr>
                  {amenityKeys.map((key) => (<ComparisonRow key={key} label={AMENITY_LABELS[key]}>
                      {compared.map((property) => {
                    const available = property.amenities.includes(key);
                    return (<Cell key={property.id} muted={!available}>
                            {available ? (<Check className="h-4 w-4 text-teal-600" aria-hidden/>) : (<Minus className="h-4 w-4" aria-hidden/>)}
                            <span className="sr-only">{available ? 'Available' : 'Not listed'}</span>
                          </Cell>);
                })}
                    </ComparisonRow>))}

                  <ComparisonRow label="Verification">
                    {compared.map((property) => (<Cell key={property.id}><VerificationBadge state={property.verification}/></Cell>))}
                  </ComparisonRow>
                  <ComparisonRow label="Source">
                    {compared.map((property) => (<Cell key={property.id}>
                        <span>{property.source.name}</span>
                        <span className="text-[10px] text-ink-400">type: {property.source.type}</span>
                      </Cell>))}
                  </ComparisonRow>
                  <ComparisonRow label="Last updated" hint="no verified date for demo records">
                    {compared.map((property) => <Cell key={property.id}>{formatDate(property.lastUpdated)}</Cell>)}
                  </ComparisonRow>
                </tbody>
              </table>
            </div>
            <div className="border-t border-ink-100 px-4 py-3">
              <DemoDisclosure compact/>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
                Distances use stored demo coordinates and are straight-line estimates, not routes. Amenities and
                rules are illustrative; no verified owner data is connected.
              </p>
            </div>
          </div>
        </>)}
    </PageShell>);
}

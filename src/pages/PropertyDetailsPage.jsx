import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BedDouble, CalendarDays, Check, Heart, Info, MapPin, MessageSquare, Scale, Search, ShieldCheck, StarOff, Users, X, } from 'lucide-react';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { DetailPageSkeleton } from '@/components/detail/DetailPageSkeleton';
import { EnquiryModal } from '@/components/detail/EnquiryModal';
import { PriceBreakdownPanel } from '@/components/detail/PriceBreakdownPanel';
import { PropertyGallery } from '@/components/detail/PropertyGallery';
import { PageShell } from '@/components/layout/PageShell';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { useListing, useListings } from '@/features/listings/queries';
import { AMENITY_LABELS, CATEGORY_LABELS, FURNISHING_LABELS, GENDER_LABELS, OCCUPANCY_LABELS, } from '@/features/listings/types';
import { formatDistance, haversineKm } from '@/features/locations/distance';
import { formatDate } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
import { MAX_COMPARE, useCompareStore } from '@/store/useCompareStore';
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import { useSavedStore } from '@/store/useSavedStore';
import { useSearchStore } from '@/store/useSearchStore';
import { useToastStore } from '@/store/useToastStore';
export function PropertyDetailsPage() {
    const { id } = useParams();
    const { data: property, isLoading, isError } = useListing(id);
    const { data: allListings, isLoading: relatedLoading } = useListings();
    const resolvedLocation = useSearchStore((state) => state.resolvedLocation);
    const savedIds = useSavedStore((state) => state.ids);
    const toggleSaved = useSavedStore((state) => state.toggle);
    const compareIds = useCompareStore((state) => state.ids);
    const toggleCompare = useCompareStore((state) => state.toggle);
    const addRecentlyViewed = useRecentlyViewedStore((state) => state.add);
    const pushToast = useToastStore((state) => state.push);
    const [enquiryOpen, setEnquiryOpen] = useState(false);
    const detailId = property?.id;
    useEffect(() => {
        if (detailId)
            addRecentlyViewed(detailId);
    }, [detailId, addRecentlyViewed]);
    const saved = Boolean(id && savedIds.includes(id));
    const inCompare = Boolean(id && compareIds.includes(id));
    const verifiedContact = property?.contact?.verified ? property.contact : null;
    const descriptionParts = useMemo(() => {
        if (!property)
            return { notice: null, body: '' };
        const paragraphs = property.description
            .split(/\n\s*\n/)
            .map((part) => part.trim())
            .filter(Boolean);
        const first = paragraphs[0] ?? '';
        const noticeIsDemo = first.startsWith('Illustrative demonstration listing');
        return {
            notice: noticeIsDemo ? first : null,
            body: (noticeIsDemo ? paragraphs.slice(1) : paragraphs).join('\n\n'),
        };
    }, [property]);
    const approximateDistance = useMemo(() => {
        if (!property || !resolvedLocation?.coordinates)
            return null;
        return haversineKm(resolvedLocation.coordinates, property.location.coordinates);
    }, [property, resolvedLocation]);
    const locationLabel = resolvedLocation?.place?.name ?? resolvedLocation?.query ?? 'your selected location';
    const related = useMemo(() => {
        if (!property || !allListings)
            return [];
        const ranked = allListings
            .filter((item) => item.id !== property.id)
            .map((item) => ({
            item,
            rank: (item.category === property.category ? 4 : 0) +
                (item.location.city === property.location.city ? 2 : 0) +
                (item.landmark && item.landmark === property.landmark ? 1 : 0),
        }))
            .sort((a, b) => b.rank - a.rank || a.item.title.localeCompare(b.item.title));
        const seen = new Set();
        return ranked
            .map((entry) => entry.item)
            .filter((item) => {
            if (seen.has(item.id))
                return false;
            seen.add(item.id);
            return true;
        })
            .slice(0, 3);
    }, [allListings, property]);
    const onSave = () => {
        if (!id)
            return;
        toggleSaved(id);
        pushToast(saved ? 'Removed from your saved list.' : 'Saved to your shortlist.', 'success');
    };
    const onCompare = () => {
        if (!id)
            return;
        const added = toggleCompare(id);
        if (!added && !inCompare) {
            pushToast(`You can compare up to ${MAX_COMPARE} properties. Remove one first.`, 'warning');
            return;
        }
        pushToast(added ? 'Added to comparison.' : 'Removed from comparison.', 'success');
    };
    return (<PageShell eyebrow={property ? CATEGORY_LABELS[property.category] : 'Property details'} title={property ? property.title : isLoading ? 'Loading property details' : 'Listing unavailable'} description={property
            ? `${property.location.label}, ${property.location.city}, ${property.location.state}`
            : isLoading
                ? 'Fetching the illustrative demo listing…'
                : 'The requested demo listing could not be found.'} breadcrumbs={property
            ? [{ label: 'Explore', to: '/explore' }, { label: property.title }]
            : [{ label: 'Explore', to: '/explore' }]} actions={property ? (<>
            <Button variant={saved ? 'secondary' : 'outline'} size="sm" onClick={onSave} aria-pressed={saved} leftIcon={<Heart className={cn('h-4 w-4', saved && 'fill-saffron-500')} aria-hidden/>}>
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant={inCompare ? 'primary' : 'outline'} size="sm" onClick={onCompare} aria-pressed={inCompare} leftIcon={<Scale className="h-4 w-4" aria-hidden/>}>
              {inCompare ? 'In compare' : 'Compare'}
            </Button>
          </>) : undefined}>
      {isLoading ? (<DetailPageSkeleton />) : !property ? (<EmptyState icon={Search} title={isError ? 'Could not load listing' : 'Listing not found'} description="This id is not part of the illustrative demo catalogue. Explore the available demo listings instead — no real properties are hidden here." action={<LinkButton to="/explore">Explore demo listings</LinkButton>} secondary={<LinkButton to="/" variant="outline">Back to home</LinkButton>}/>) : (<>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <section className="card overflow-hidden" aria-label="Illustrative photo gallery">
                <PropertyGallery property={property}/>
              </section>

              <section className="card p-5 sm:p-6" aria-label="Listing overview">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="blue">{CATEGORY_LABELS[property.category]}</Badge>
                  <VerificationBadge state={property.verification}/>
                  <Badge tone="neutral">{GENDER_LABELS[property.genderPreference]}</Badge>
                  {property.featured && <Badge tone="orange">Featured demo</Badge>}
                </div>
                <h2 className="mt-3 font-display text-xl font-bold text-ink-950">{property.title}</h2>
                <div className="mt-4 grid gap-2 text-xs text-ink-500 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-teal-700" aria-hidden/>
                    Source: <span className="font-semibold text-ink-800">{property.source.name}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-teal-700" aria-hidden/>
                    Last updated: <span className="font-semibold text-ink-800">{formatDate(property.lastUpdated)}</span>
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-ink-400">
                  Source type: {property.source.type} · Origin: {property.origin}. Demo records have no verified update date.
                </p>
              </section>

              <section className="card p-5 sm:p-6" aria-labelledby="details-location-heading">
                <h2 id="details-location-heading" className="font-display text-lg font-bold text-ink-950">
                  Location
                </h2>
                <div className="mt-4 flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <MapPin className="h-4 w-4" aria-hidden/>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{property.location.label}</p>
                    <p className="text-xs text-ink-500">
                      {property.location.city}, {property.location.state}
                    </p>
                    {property.location.address && (<p className="mt-1 text-xs text-ink-500">{property.location.address}</p>)}
                    {property.landmark && (<p className="mt-1 text-xs text-ink-400">
                        Reference landmark: {property.landmark} (geographic reference only)
                      </p>)}
                  </div>
                </div>
                <div className="mt-4 rounded-xl surface-muted p-3.5 text-xs leading-relaxed text-ink-600">
                  {approximateDistance !== null ? (<p>
                      Approximately <strong className="text-ink-900">{formatDistance(approximateDistance)}</strong>{' '}
                      in a straight line from {locationLabel}. This is an estimate from demo coordinates, not a
                      walking or driving route.
                    </p>) : (<p>
                      Set a location on{' '}
                      <Link to="/explore" className="font-semibold text-teal-700 hover:underline">Explore</Link> to see
                      an approximate straight-line distance from this demo listing.
                    </p>)}
                </div>
              </section>

              <section className="card p-5 sm:p-6" aria-labelledby="details-amenities-heading">
                <div className="flex items-center justify-between gap-3">
                  <h2 id="details-amenities-heading" className="font-display text-lg font-bold text-ink-950">
                    Amenities
                  </h2>
                  <Badge tone="neutral">{property.amenities.length} listed</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {Object.entries(AMENITY_LABELS).map(([key, label]) => {
                const available = property.amenities.includes(key);
                return (<div key={key} className={cn('flex items-center gap-2 rounded-xl px-3 py-2 text-xs', available ? 'bg-teal-50/70 text-teal-900' : 'surface-muted text-ink-400')}>
                        {available ? (<Check className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden/>) : (<X className="h-3.5 w-3.5 shrink-0" aria-hidden/>)}
                        <span className="min-w-0">{label}</span>
                        <span className="sr-only">{available ? 'available' : 'not listed'}</span>
                      </div>);
            })}
                </div>
                <p className="mt-3 text-[11px] text-ink-400">
                  Only amenities explicitly present in the demo record are marked available.
                </p>
              </section>

              <section className="card p-5 sm:p-6" aria-labelledby="details-room-heading">
                <h2 id="details-room-heading" className="font-display text-lg font-bold text-ink-950">
                  Room &amp; occupancy
                </h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">Occupancy</dt>
                    <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink-800">
                      <BedDouble className="h-4 w-4 text-teal-700" aria-hidden/>
                      {OCCUPANCY_LABELS[property.occupancy]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">Furnishing</dt>
                    <dd className="mt-1.5 text-sm font-semibold text-ink-800">
                      {FURNISHING_LABELS[property.furnishing]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">Guest preference</dt>
                    <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink-800">
                      <Users className="h-4 w-4 text-teal-700" aria-hidden/>
                      {GENDER_LABELS[property.genderPreference]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">Area</dt>
                    <dd className="mt-1.5 text-sm font-semibold text-ink-800">
                      {property.areaSqft ? `${property.areaSqft} sq ft (demo value)` : 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">Available from</dt>
                    <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink-800">
                      <CalendarDays className="h-4 w-4 text-teal-700" aria-hidden/>
                      {property.availableFrom ? formatDate(property.availableFrom) : 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">Verification</dt>
                    <dd className="mt-1.5"><VerificationBadge state={property.verification}/></dd>
                  </div>
                </dl>
              </section>

              <section className="card p-5 sm:p-6" aria-labelledby="details-rules-heading">
                <h2 id="details-rules-heading" className="font-display text-lg font-bold text-ink-950">
                  House rules
                </h2>
                {property.rules.length ? (<ul className="mt-4 space-y-2">
                    {property.rules.map((rule) => (<li key={rule} className="flex items-start gap-2 text-sm text-ink-700">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden/>
                        {rule}
                      </li>))}
                  </ul>) : (<p className="mt-3 text-sm text-ink-500">No demo rules were provided for this listing.</p>)}
                <p className="mt-3 text-[11px] text-ink-400">Illustrative rules only — they are not enforceable terms.</p>
              </section>

              <section className="card p-5 sm:p-6" aria-labelledby="details-description-heading">
                <h2 id="details-description-heading" className="font-display text-lg font-bold text-ink-950">
                  About this listing
                </h2>
                {descriptionParts.notice && (<div className="demo-strip mt-4" role="note">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden/>
                    <span>{descriptionParts.notice}</span>
                  </div>)}
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-600">
                  {descriptionParts.body
                ? descriptionParts.body.split(/\n\s*\n/).map((paragraph, index) => (<p key={index}>{paragraph}</p>))
                : null}
                </div>
              </section>

              <section className="card p-5 sm:p-6" aria-labelledby="details-reviews-heading">
                <div className="flex items-center justify-between gap-3">
                  <h2 id="details-reviews-heading" className="font-display text-lg font-bold text-ink-950">
                    Reviews
                  </h2>
                  <Badge tone="neutral">No reviews</Badge>
                </div>
                <div className="mt-4 rounded-xl surface-muted p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                    <StarOff className="h-4 w-4 text-ink-500" aria-hidden/>
                    No verified reviews yet
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-500">
                    Reviews appear here only after verified stays and moderation. Demo listings have no ratings or
                    testimonials.
                  </p>
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <section className="card p-5" aria-labelledby="details-price-heading">
                <div className="flex items-center justify-between gap-2">
                  <h2 id="details-price-heading" className="font-display text-base font-bold text-ink-950">
                    Price breakdown
                  </h2>
                  <Badge tone="amber">Demo values</Badge>
                </div>
                <div className="mt-4">
                  <PriceBreakdownPanel prices={property.prices} occupancy={property.occupancy}/>
                </div>
              </section>

              <section className="card p-5" aria-labelledby="details-contact-heading">
                <h2 id="details-contact-heading" className="font-display text-base font-bold text-ink-950">
                  Contact
                </h2>
                {verifiedContact ? (<dl className="mt-3 space-y-1.5 text-xs text-ink-700">
                    <div><dt className="inline font-semibold">Name:</dt> <dd className="inline">{verifiedContact.displayName}</dd></div>
                    {verifiedContact.phone && (<div><dt className="inline font-semibold">Phone:</dt> <dd className="inline">{verifiedContact.phone}</dd></div>)}
                    {verifiedContact.whatsapp && (<div><dt className="inline font-semibold">WhatsApp:</dt> <dd className="inline">{verifiedContact.whatsapp}</dd></div>)}
                    {verifiedContact.email && (<div><dt className="inline font-semibold">Email:</dt> <dd className="inline">{verifiedContact.email}</dd></div>)}
                  </dl>) : (<div className="demo-strip mt-3" role="note">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden/>
                    <span>
                      <strong className="font-semibold">Contact details unavailable.</strong> Verified owner/provider
                      data is not connected in this demo, so no phone number, owner name or email is shown and
                      enquiries are not delivered to anyone.
                    </span>
                  </div>)}
                <Button variant="secondary" fullWidth className="mt-4" onClick={() => setEnquiryOpen(true)} leftIcon={<MessageSquare className="h-4 w-4" aria-hidden/>}>
                  Open demo enquiry form
                </Button>
                <p className="mt-2 text-[11px] text-ink-400">
                  The form is a local UI preview only — submitting does not send a message.
                </p>
              </section>
            </aside>
          </div>

          <section className="mt-10" aria-label="Related demo listings">
            <SectionHeading eyebrow="More demo inventory" title="Related illustrative listings" description="Ranked by category, city and reference landmark. Every card below is demo data, not a real property." actionLabel="Explore all" actionTo="/explore"/>
            {relatedLoading ? (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((item) => <PropertyCardSkeleton key={item}/>)}
              </div>) : related.length ? (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => <PropertyCard key={item.id} property={item}/>)}
              </div>) : (<EmptyState icon={Search} title="No related demo listings" description="There are no other illustrative listings to show in this category right now." action={<LinkButton to="/explore" variant="outline">Browse the demo catalogue</LinkButton>}/>)}
          </section>

          <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} propertyTitle={property.title}/>
        </>)}
    </PageShell>);
}

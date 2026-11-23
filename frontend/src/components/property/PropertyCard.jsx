import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BedDouble, Heart, Images, MapPin, Scale, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DataQualityNotice } from '@/components/common/DataQualityNotice';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { CATEGORY_LABELS, OCCUPANCY_LABELS } from '@/features/listings/types';
import { formatDistance } from '@/features/locations/distance';
import { calculateEffectiveCost, formatDate } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
import { useCompareStore, MAX_COMPARE } from '@/store/useCompareStore';
import { useSavedStore } from '@/store/useSavedStore';
import { useToastStore } from '@/store/useToastStore';
const PRIMARY_AMENITIES = ['wifi', 'ac', 'attached_bathroom', 'food', 'parking', 'laundry', 'security', 'power_backup'];
function ImageArea({ property }) {
    const [failed, setFailed] = useState(false);
    const image = property.images[0];
    if (!image || failed) {
        return (<div className="grid h-full w-full place-items-center bg-ink-100 text-ink-400">
        <div className="text-center">
          <Images className="mx-auto h-7 w-7" aria-hidden/>
          <p className="mt-2 text-[11px]">Property photo not available</p>
        </div>
      </div>);
    }
    return (<>
      <img src={image.url} alt={image.alt} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"/>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/70 to-transparent px-3 pb-2.5 pt-8">
        <p className="text-[10px] font-medium text-white/80">
          {image.credit ? `Photo credit: ${image.credit}` : 'Source-supplied image'}
        </p>
      </div>
    </>);
}
export function PropertyCard({ property, result, layout = 'grid', }) {
    const saved = useSavedStore((state) => state.ids.includes(property.id));
    const toggleSaved = useSavedStore((state) => state.toggle);
    const compareIds = useCompareStore((state) => state.ids);
    const toggleCompare = useCompareStore((state) => state.toggle);
    const pushToast = useToastStore((state) => state.push);
    const inCompare = compareIds.includes(property.id);
    const cost = calculateEffectiveCost(property.prices, property.occupancy);
    const primaryAmenities = PRIMARY_AMENITIES.filter((amenity) => property.amenities.includes(amenity)).slice(0, 4);
    const onSave = () => {
        toggleSaved(property.id, property);
        pushToast(saved ? 'Removed from your saved list.' : 'Saved to your shortlist.', 'success');
    };
    const onCompare = () => {
        if (!inCompare && compareIds.length >= MAX_COMPARE) {
            pushToast(`You can compare up to ${MAX_COMPARE} properties. Remove one first.`, 'warning');
            return;
        }
        toggleCompare(property.id, property);
        pushToast(inCompare ? 'Removed from comparison.' : 'Added to comparison.', 'success');
    };
    return (<article className={cn('card group flex overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-lift', layout === 'list' ? 'flex-col sm:flex-row' : 'flex-col')}>
      <div className={cn('relative shrink-0 overflow-hidden bg-ink-100', layout === 'list' ? 'h-52 sm:h-auto sm:w-72' : 'h-48')}>
        <ImageArea property={property}/>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <VerificationBadge state={property.verification}/>
          <div className="flex gap-1.5">
            <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save property'} className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-ink-700 shadow-soft transition hover:text-saffron-600">
              <Heart className={cn('h-4 w-4', saved && 'fill-saffron-500 text-saffron-600')} aria-hidden/>
            </button>
            <button type="button" onClick={onCompare} aria-pressed={inCompare} aria-label={inCompare ? 'Remove from comparison' : 'Add to comparison'} className={cn('grid h-8 w-8 place-items-center rounded-full shadow-soft transition', inCompare ? 'bg-ink-900 text-white' : 'bg-white/95 text-ink-700 hover:text-ink-950')}>
              <Scale className="h-4 w-4" aria-hidden/>
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{CATEGORY_LABELS[property.category]}</Badge>
              {result?.distanceKm !== null && result?.distanceKm !== undefined && (<Badge tone="neutral">{formatDistance(result.distanceKm)} away</Badge>)}
            </div>
            <Link to={`/property/${property.id}`} className="mt-2 block font-display text-[17px] font-bold leading-snug text-ink-950 transition hover:text-teal-700">
              {property.title}
            </Link>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden/>
              <span className="truncate">
                {property.location.label}, {property.location.city}
              </span>
            </p>
          </div>
          <PriceDisplay rent={property.prices.rent} perPerson={cost.perPersonMonthly} className="shrink-0 text-right"/>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg bg-ink-50 px-2 py-1 text-[11px] font-medium text-ink-700">
            <BedDouble className="h-3 w-3" aria-hidden/>
            {OCCUPANCY_LABELS[property.occupancy] || 'Occupancy not available'}
          </span>
          {primaryAmenities.map((amenity) => (<span key={amenity} className="rounded-lg bg-ink-50 px-2 py-1 text-[11px] font-medium capitalize text-ink-600">
              {amenity === 'wifi' ? 'Wi-Fi' : amenity === 'ac' ? 'AC' : amenity.replace(/_/g, ' ')}
            </span>))}
        </div>

        <div className="mt-auto pt-4">
          <DataQualityNotice compact/>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-ink-100 pt-3">
            <p className="flex items-center gap-1.5 text-[11px] text-ink-500">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden/>
              Source: {property.source?.name || 'Not available'} · Updated: {property.lastUpdated ? formatDate(property.lastUpdated) : 'Not available'}
            </p>
            <Link to={`/property/${property.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 transition hover:gap-2">
              View details <ArrowUpRight className="h-3.5 w-3.5" aria-hidden/>
            </Link>
          </div>
        </div>
      </div>
    </article>);
}

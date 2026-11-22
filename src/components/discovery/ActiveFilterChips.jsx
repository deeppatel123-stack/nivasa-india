import { X } from 'lucide-react';
import { AMENITY_LABELS, CATEGORY_LABELS, FURNISHING_LABELS, GENDER_LABELS, OCCUPANCY_LABELS, } from '@/features/listings/types';
import { formatINR } from '@/features/pricing/pricing';
import { useSearchStore } from '@/store/useSearchStore';
function without(values, value) {
    return values.filter((item) => item !== value);
}
/** Removable summary of every active store-backed filter. */
export function ActiveFilterChips() {
    const filters = useSearchStore((state) => state.filters);
    const patchFilters = useSearchStore((state) => state.patchFilters);
    const resetFilters = useSearchStore((state) => state.resetFilters);
    const chips = [];
    filters.categories.forEach((value) => chips.push({
        key: `category-${value}`,
        label: CATEGORY_LABELS[value],
        remove: () => patchFilters({ categories: without(filters.categories, value) }),
    }));
    filters.furnishing.forEach((value) => chips.push({
        key: `furnishing-${value}`,
        label: FURNISHING_LABELS[value],
        remove: () => patchFilters({ furnishing: without(filters.furnishing, value) }),
    }));
    filters.gender.forEach((value) => chips.push({
        key: `gender-${value}`,
        label: GENDER_LABELS[value],
        remove: () => patchFilters({ gender: without(filters.gender, value) }),
    }));
    filters.occupancy.forEach((value) => chips.push({
        key: `occupancy-${value}`,
        label: OCCUPANCY_LABELS[value],
        remove: () => patchFilters({ occupancy: without(filters.occupancy, value) }),
    }));
    filters.amenities.forEach((value) => chips.push({
        key: `amenity-${value}`,
        label: AMENITY_LABELS[value] ?? value.replace(/_/g, ' '),
        remove: () => patchFilters({ amenities: without(filters.amenities, value) }),
    }));
    if (filters.minRent !== null) {
        chips.push({
            key: 'min-rent',
            label: `Min ${formatINR(filters.minRent)}`,
            remove: () => patchFilters({ minRent: null }),
        });
    }
    if (filters.maxRent !== null) {
        chips.push({
            key: 'max-rent',
            label: `Max ${formatINR(filters.maxRent)}`,
            remove: () => patchFilters({ maxRent: null }),
        });
    }
    if (filters.availableFrom) {
        chips.push({
            key: 'available-from',
            label: `From ${filters.availableFrom}`,
            remove: () => patchFilters({ availableFrom: null }),
        });
    }
    if (filters.verifiedOnly) {
        chips.push({
            key: 'verified-only',
            label: 'Verified only',
            remove: () => patchFilters({ verifiedOnly: false }),
        });
    }
    if (!chips.length)
        return null;
    return (<div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">Active</span>
      {chips.map((chip) => (<button key={chip.key} type="button" onClick={chip.remove} aria-label={`Remove filter: ${chip.label}`} className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800 transition hover:bg-teal-100">
          {chip.label}
          <X className="h-3 w-3" aria-hidden/>
        </button>))}
      <button type="button" onClick={resetFilters} className="text-[11px] font-semibold text-ink-500 underline-offset-2 transition hover:text-ink-900 hover:underline">
        Clear all
      </button>
    </div>);
}

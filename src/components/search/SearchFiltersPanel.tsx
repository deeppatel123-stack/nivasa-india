import type { ReactNode } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import {
  AMENITY_LABELS,
  CATEGORY_LABELS,
  FURNISHING_LABELS,
  GENDER_LABELS,
  OCCUPANCY_LABELS,
  type AmenityKey,
  type Furnishing,
  type GenderPreference,
  type Occupancy,
  type PropertyCategory,
} from '@/features/listings/types';
import { countActiveFilters } from '@/features/search/searchEngine';
import type { SearchState } from '@/features/search/types';
import { useSearchStore } from '@/store/useSearchStore';

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as [PropertyCategory, string][];
const FURNISHING_OPTIONS = Object.entries(FURNISHING_LABELS) as [Furnishing, string][];
const GENDER_OPTIONS = Object.entries(GENDER_LABELS) as [GenderPreference, string][];
const OCCUPANCY_OPTIONS = Object.entries(OCCUPANCY_LABELS) as [Occupancy, string][];
const AMENITY_OPTIONS: AmenityKey[] = ['wifi', 'ac', 'attached_bathroom', 'food', 'parking', 'laundry', 'security', 'power_backup'];

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function SearchFiltersPanel({ compact = false }: { compact?: boolean }) {
  const { filters, patchFilters, resetFilters, ...rest } = useSearchStore();
  const activeCount = countActiveFilters({ filters, ...rest } as SearchState);

  return (
    <div className={compact ? 'space-y-5' : 'space-y-5'}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-ink-600" aria-hidden />
          <h2 className="font-display text-sm font-bold text-ink-900">Filters</h2>
          {activeCount > 0 && <Badge tone="teal">{activeCount} active</Badge>}
        </div>
        <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={resetFilters}>
          Clear
        </Button>
      </div>

      <FilterGroup title="Accommodation type">
        <div className="grid grid-cols-1 gap-0.5">
          {CATEGORY_OPTIONS.map(([value, label]) => (
            <Checkbox
              key={value}
              label={label}
              checked={filters.categories.includes(value)}
              onChange={() => patchFilters({ categories: toggleValue(filters.categories, value) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Monthly rent">
        <div className="grid grid-cols-2 gap-2">
          <Input
            aria-label="Minimum monthly rent"
            type="number"
            min={0}
            placeholder="Min ₹"
            value={filters.minRent ?? ''}
            onChange={(event) => patchFilters({ minRent: event.target.value ? Number(event.target.value) : null })}
          />
          <Input
            aria-label="Maximum monthly rent"
            type="number"
            min={0}
            placeholder="Max ₹"
            value={filters.maxRent ?? ''}
            onChange={(event) => patchFilters({ maxRent: event.target.value ? Number(event.target.value) : null })}
          />
        </div>
        <p className="mt-2 text-[11px] text-ink-400">Demo prices are illustrative, not market quotes.</p>
      </FilterGroup>

      <FilterGroup title="Furnishing">
        <div className="grid grid-cols-1 gap-0.5">
          {FURNISHING_OPTIONS.map(([value, label]) => (
            <Checkbox
              key={value}
              label={label}
              checked={filters.furnishing.includes(value)}
              onChange={() => patchFilters({ furnishing: toggleValue(filters.furnishing, value) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Gender preference">
        <div className="grid grid-cols-1 gap-0.5">
          {GENDER_OPTIONS.map(([value, label]) => (
            <Checkbox
              key={value}
              label={label}
              checked={filters.gender.includes(value)}
              onChange={() => patchFilters({ gender: toggleValue(filters.gender, value) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Occupancy">
        <div className="grid grid-cols-1 gap-0.5">
          {OCCUPANCY_OPTIONS.map(([value, label]) => (
            <Checkbox
              key={value}
              label={label}
              checked={filters.occupancy.includes(value)}
              onChange={() => patchFilters({ occupancy: toggleValue(filters.occupancy, value) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Amenities">
        <div className="grid grid-cols-1 gap-0.5">
          {AMENITY_OPTIONS.map((amenity) => (
            <Checkbox
              key={amenity}
              label={AMENITY_LABELS[amenity]}
              checked={filters.amenities.includes(amenity)}
              onChange={() => patchFilters({ amenities: toggleValue(filters.amenities, amenity) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <Input
          type="date"
          label="Available from"
          value={filters.availableFrom ?? ''}
          onChange={(event) => patchFilters({ availableFrom: event.target.value || null })}
        />
      </FilterGroup>

      <FilterGroup title="Listing quality">
        <Toggle
          checked={filters.verifiedOnly}
          onChange={(verifiedOnly) => patchFilters({ verifiedOnly })}
          label="Verified listings only"
          description="No demo listings match this in the frontend phase"
        />
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-ink-100 pt-4 first:border-0 first:pt-0">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-ink-600">{title}</h3>
      {children}
    </section>
  );
}

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, GraduationCap, Landmark, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { demoGeocoder } from '@/features/locations/geocoder';
import type { Place, PlaceType, ResolvedLocation } from '@/features/locations/types';
import type { RadiusKm } from '@/features/search/types';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/useSearchStore';
import { useToastStore } from '@/store/useToastStore';

const PLACE_ICONS: Record<PlaceType, typeof MapPin> = {
  city: MapPin,
  university: GraduationCap,
  college: GraduationCap,
  company: Building2,
  tech_park: Building2,
  locality: MapPin,
  landmark: Landmark,
};

export function LocationSearchBar({
  variant = 'hero',
  disableNavigation = false,
  onSearched,
  className,
}: {
  variant?: 'hero' | 'compact';
  disableNavigation?: boolean;
  onSearched?: (resolved: ResolvedLocation) => void;
  className?: string;
}) {
  const navigate = useNavigate();
  const pushToast = useToastStore((state) => state.push);
  const { query, radiusKm, resolvedLocation, setQuery, setResolvedLocation, setRadius } = useSearchStore();
  const [text, setText] = useState(query);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [locating, setLocating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => demoGeocoder.suggest(text, 7), [text]);

  useEffect(() => {
    setText(query);
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const commit = (resolved: ResolvedLocation, shouldNavigate = true) => {
    setQuery(resolved.query);
    setResolvedLocation(resolved);
    setText(resolved.query);
    setOpen(false);
    onSearched?.(resolved);
    if (shouldNavigate && !disableNavigation) {
      navigate(`/search?q=${encodeURIComponent(resolved.query)}&radius=${resolved.place || resolved.coordinates ? radiusKm : 5}`);
    }
  };

  const pickPlace = (place: Place) => {
    commit({
      query: place.name,
      place,
      coordinates: place.coordinates,
      unresolved: false,
      source: 'index',
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      pushToast('Enter a city, college, company, locality or landmark to search.', 'warning');
      return;
    }
    const resolved = demoGeocoder.resolve(text);
    if (resolved.unresolved) {
      pushToast('This location is not in the demo index. Connect a geocoder to search anywhere in India.', 'warning');
      setQuery(text);
      setResolvedLocation(resolved);
      onSearched?.(resolved);
      return;
    }
    commit(resolved);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      pushToast('Geolocation is not supported by this browser.', 'warning');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        commit({
          query: 'Current location',
          place: null,
          coordinates: { lat: position.coords.latitude, lng: position.coords.longitude },
          unresolved: false,
          source: 'gps',
        });
        pushToast('Using your current location for this search.', 'success');
      },
      () => {
        setLocating(false);
        pushToast('Location permission was denied. You can search by place name instead.', 'warning');
      },
      { timeout: 10000 },
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const isHero = variant === 'hero';
  const selectedLabel = resolvedLocation?.source === 'gps' ? 'Using current location' : query;

  return (
    <div className={cn('w-full', className)} ref={wrapperRef}>
      <form
        onSubmit={onSubmit}
        className={cn(
          'relative flex flex-col gap-2 rounded-2xl border border-ink-100 bg-white p-2 shadow-lift sm:flex-row sm:items-center',
          isHero ? 'sm:p-2.5' : 'shadow-soft',
        )}
      >
        <div className="relative flex min-w-0 flex-1 items-center gap-2.5 px-2.5">
          <Search className="h-[18px] w-[18px] shrink-0 text-teal-600" aria-hidden />
          <input
            type="search"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search city, college, office, locality or landmark"
            aria-label="Search location"
            aria-autocomplete="list"
            aria-expanded={open && suggestions.length > 0}
            className={cn(
              'min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none',
              isHero && 'sm:py-3 sm:text-[15px]',
            )}
          />
          {text && (
            <button
              type="button"
              onClick={() => {
                setText('');
                setQuery('');
                setResolvedLocation(null);
                setOpen(false);
              }}
              aria-label="Clear search"
              className="grid h-7 w-7 place-items-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {open && suggestions.length > 0 && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 max-h-72 overflow-auto rounded-2xl border border-ink-100 bg-white p-1.5 shadow-lift"
            >
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                Matching places in the demo index
              </p>
              {suggestions.map((place, index) => {
                const Icon = PLACE_ICONS[place.type];
                return (
                  <button
                    key={place.id}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => pickPlace(place)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                      index === activeIndex ? 'bg-ink-50' : 'hover:bg-ink-50',
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-teal-700 ring-1 ring-ink-100">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-900">{place.name}</span>
                      <span className="block truncate text-xs capitalize text-ink-500">
                        {place.type.replace('_', ' ')} · {place.context}
                      </span>
                    </span>
                    {index === activeIndex && <Check className="h-4 w-4 text-teal-600" aria-hidden />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden h-8 w-px bg-ink-100 sm:block" />

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-ink-600 transition hover:bg-ink-50 hover:text-ink-900 disabled:opacity-60"
        >
          <LocateFixed className={cn('h-4 w-4', locating && 'animate-pulse')} aria-hidden />
          {locating ? 'Locating…' : 'Near me'}
        </button>

        <div className="hidden h-8 w-px bg-ink-100 sm:block" />

        <div className="w-full sm:w-40">
          <Select
            aria-label="Search radius in kilometres"
            value={String(radiusKm)}
            onChange={(event) => setRadius(Number(event.target.value) as RadiusKm)}
            options={[1, 2, 5, 10, 20].map((value) => ({ value: String(value), label: `Within ${value} km` }))}
            className="h-11 py-0 text-xs"
          />
        </div>

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Search stays
        </Button>
      </form>
      {selectedLabel && !open && (
        <p className="mt-2 px-2 text-[11px] text-ink-400">
          Selected: <span className="font-medium text-ink-600">{selectedLabel}</span>
        </p>
      )}
    </div>
  );
}

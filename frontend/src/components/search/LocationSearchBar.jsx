import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { geocodingService } from '@/services/geocodingService';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/useSearchStore';
import { useToastStore } from '@/store/useToastStore';

const RADIUS_OPTIONS = [0.5, 1, 2, 5, 10, 20, 50];

export function LocationSearchBar({ variant = 'hero', disableNavigation = false, onSearched, className }) {
  const navigate = useNavigate();
  const pushToast = useToastStore((state) => state.push);
  const { query, radiusKm, resolvedLocation, setQuery, setResolvedLocation, setRadius } = useSearchStore();
  const [text, setText] = useState(query);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const wrapperRef = useRef(null);
  const listboxId = useId();

  useEffect(() => setText(query), [query]);

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      geocodingService
        .suggest(trimmed, controller.signal)
        .then((result) => setSuggestions(result.items || []))
        .catch((error) => {
          if (error.name !== 'AbortError') setSuggestions([]);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const navigateTo = (location) => {
    if (disableNavigation) return;
    const params = new URLSearchParams({ q: location.query || location.label || '', radius: String(radiusKm) });
    if (Number.isFinite(location.coordinates?.lat) && Number.isFinite(location.coordinates?.lng)) {
      params.set('lat', String(location.coordinates.lat));
      params.set('lng', String(location.coordinates.lng));
    }
    navigate(`/search?${params.toString()}`);
  };

  const commit = (location, shouldNavigate = true) => {
    const normalised = {
      ...location,
      country: location.country || 'India',
      countryCode: location.countryCode || 'IN',
      rawQuery: location.query || text.trim(),
    };
    if (String(normalised.countryCode).toUpperCase() !== 'IN') {
      pushToast('Nivasa currently supports locations within India only.', 'warning');
      return;
    }
    setQuery(normalised.query || normalised.label || text.trim());
    setResolvedLocation(normalised);
    setText(normalised.query || normalised.label || text.trim());
    setOpen(false);
    onSearched?.(normalised);
    if (shouldNavigate) navigateTo(normalised);
  };

  const pickPlace = (place, index = 0) => {
    commit({
      query: place.name || place.label,
      id: place.placeId || place.id,
      placeId: place.placeId || place.id,
      name: place.name,
      label: place.label,
      formattedAddress: place.formattedAddress || place.label,
      locality: place.locality,
      district: place.district,
      city: place.city,
      state: place.state,
      country: place.country || 'India',
      countryCode: place.countryCode || 'IN',
      postcode: place.postcode,
      category: place.category,
      coordinates: place.coordinates,
      provider: place.provider,
      sourceUrl: place.sourceUrl,
      source: 'geocoder',
    });
    setActiveIndex(index);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const raw = text.trim();
    if (!raw) {
      pushToast('Enter an Indian city, locality, landmark, PIN code or full address to search.', 'warning');
      return;
    }
    if (open && suggestions[activeIndex]) {
      pickPlace(suggestions[activeIndex], activeIndex);
      return;
    }
    setSearching(true);
    try {
      const place = await geocodingService.resolve(raw);
      commit({
        query: raw,
        id: place.placeId || place.id,
        placeId: place.placeId || place.id,
        name: place.name,
        label: place.label,
        formattedAddress: place.formattedAddress || place.label,
        locality: place.locality,
        district: place.district,
        city: place.city,
        state: place.state,
        country: place.country || 'India',
        countryCode: place.countryCode || 'IN',
        postcode: place.postcode,
        category: place.category,
        coordinates: place.coordinates,
        provider: place.provider,
        sourceUrl: place.sourceUrl,
        source: 'geocoder',
      });
    } catch (error) {
      const alternatives = error?.details?.alternatives || error?.details?.items;
      if (Array.isArray(alternatives) && alternatives.length) {
        setSuggestions(alternatives);
        setOpen(true);
        pushToast(error.message || 'Multiple Indian locations match. Please select the correct one.', 'info');
      } else {
        setResolvedLocation(null);
        pushToast(
          error.message || 'No India location found. Try a city, locality, landmark, PIN code or full address in India.',
          'warning',
        );
      }
    } finally {
      setSearching(false);
    }
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
        const coordinates = { lat: position.coords.latitude, lng: position.coords.longitude };
        geocodingService
          .reverse(coordinates.lat, coordinates.lng)
          .then((place) => {
            commit({
              query: place.label || 'Current location',
              id: place.placeId || place.id,
              placeId: place.placeId || place.id,
              name: place.name,
              label: place.label || 'Current location',
              formattedAddress: place.formattedAddress || place.label,
              locality: place.locality,
              district: place.district,
              city: place.city,
              state: place.state,
              country: 'India',
              countryCode: 'IN',
              postcode: place.postcode,
              category: place.category,
              coordinates,
              provider: place.provider,
              sourceUrl: place.sourceUrl,
              source: 'gps',
            });
            pushToast('Using your current location in India for this search.', 'success');
          })
          .catch((error) => {
            setResolvedLocation(null);
            pushToast(
              error?.message || 'Current location is outside supported Indian locations or could not be validated.',
              'warning',
            );
          });
      },
      () => {
        setLocating(false);
        pushToast('Location permission was denied. You can search by place name instead.', 'warning');
      },
      { timeout: 10000 },
    );
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Escape') {
      setOpen(false);
    } else if (event.key === 'Enter' && open && suggestions[activeIndex]) {
      event.preventDefault();
      pickPlace(suggestions[activeIndex], activeIndex);
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
            placeholder="Search city, locality, landmark, office or address"
            aria-label="Search any location in India"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={open && suggestions.length > 0}
            aria-activedescendant={open && suggestions.length > 0 ? `${listboxId}-option-${activeIndex}` : undefined}
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
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 max-h-72 overflow-auto rounded-2xl border border-ink-100 bg-white p-1.5 shadow-lift"
            >
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                India locations
              </p>
              {suggestions.map((place, index) => {
                const subtitle = [place.locality || place.district, place.city, place.state, 'India']
                  .filter(Boolean)
                  .filter((value, i, arr) => arr.indexOf(value) === i)
                  .join(', ');
                return (
                  <button
                    key={place.placeId || place.id}
                    id={`${listboxId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => pickPlace(place, index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                      index === activeIndex ? 'bg-ink-50' : 'hover:bg-ink-50',
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-teal-700 ring-1 ring-ink-100">
                      <MapPin className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-900">
                        {place.name || place.label}
                      </span>
                      <span className="block truncate text-xs text-ink-500">{subtitle || place.formattedAddress || place.label}</span>
                      {place.category && (
                        <span className="mt-0.5 inline-flex rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-500">
                          {String(place.category).replace(/_/g, ' ')}
                        </span>
                      )}
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
            onChange={(event) => {
              setRadius(Number(event.target.value));
              if (resolvedLocation && !disableNavigation) navigateTo(resolvedLocation);
            }}
            options={RADIUS_OPTIONS.map((value) => ({ value: String(value), label: `Within ${value} km` }))}
            className="h-11 py-0 text-xs"
          />
        </div>

        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={searching}>
          {searching ? 'Searching…' : 'Search stays'}
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

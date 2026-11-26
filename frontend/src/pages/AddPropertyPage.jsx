import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Home, Image as ImageIcon, IndianRupee, Info, LayoutGrid, LockKeyhole, MapPin, ReceiptText, Search, Send, ShieldCheck, Wifi, } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { OwnerPreviewNotice } from '@/components/owner/OwnerPreviewNotice';
import { Button, LinkButton } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { apiFetch } from '@/services/api';
import { geocodingService } from '@/services/geocodingService';
import { AMENITY_LABELS, CATEGORY_LABELS, OCCUPANCY_LABELS } from '@/features/listings/types';
import { calculateEffectiveCost, formatINR } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

const PHONE_PATTERN = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INITIAL_FORM = {
    title: '',
    description: '',
    category: '',
    occupancy: '',
    label: '',
    city: '',
    state: '',
    postcode: '',
    rent: '',
    deposit: '',
    maintenance: '',
    electricity: '',
    food: '',
    brokerage: '',
    other: '',
    phone: '',
    email: '',
    amenities: [],
    consent: false,
};
const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const OCCUPANCY_OPTIONS = Object.entries(OCCUPANCY_LABELS).map(([value, label]) => ({ value, label }));
const STEPS = [
    {
        key: 'basics',
        label: 'Basics',
        short: 'Details & category',
        icon: Home,
        fields: ['title', 'description', 'category', 'occupancy'],
    },
    {
        key: 'location',
        label: 'Location & price',
        short: 'Mapped address & charges',
        icon: MapPin,
        fields: ['location', 'label', 'city', 'state', 'rent', 'deposit'],
    },
    {
        key: 'details',
        label: 'Details & photos',
        short: 'Amenities & photo availability',
        icon: Wifi,
        fields: [],
    },
    {
        key: 'final',
        label: 'Review & submit',
        short: 'Contact & confirmation',
        icon: ShieldCheck,
        fields: ['phone', 'email', 'consent'],
    },
];
const REQUIRED_FIELDS = STEPS.flatMap((step) => step.fields);

/** Absent country is checked against a broad Indian bounding box; an explicit country must be India. */
function isIndianPlace(place) {
    const lat = Number(place?.coordinates?.lat);
    const lng = Number(place?.coordinates?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng))
        return false;
    if (place.country && !/^india$/i.test(place.country.trim()))
        return false;
    if (!place.country && (lat < 6 || lat > 37 || lng < 68 || lng > 97))
        return false;
    return true;
}
function toAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
}
function amountError(value, required) {
    const trimmed = String(value ?? '').trim();
    if (!trimmed)
        return required ? 'Enter an amount (use 0 if there is none).' : undefined;
    const amount = Number(trimmed);
    if (!Number.isFinite(amount) || amount < 0)
        return 'Use 0 or a positive amount.';
    return undefined;
}
function validateField(key, form, place) {
    switch (key) {
        case 'title':
            return form.title.trim().length >= 8 ? undefined : 'Use at least 8 characters.';
        case 'description':
            return form.description.trim().length >= 20 ? undefined : 'Use at least 20 characters.';
        case 'category':
            return form.category ? undefined : 'Choose a property category.';
        case 'occupancy':
            return form.occupancy ? undefined : 'Choose an occupancy type.';
        case 'location':
            if (!place)
                return 'Search for and select a mapped Indian location.';
            if (!isIndianPlace(place))
                return 'Select a place in India. Locations outside India cannot be submitted.';
            return undefined;
        case 'label':
            return form.label.trim() ? undefined : 'Choose a place to fill the address from the map.';
        case 'city':
            return form.city.trim() ? undefined : 'The selected place needs a city. Choose a more specific place.';
        case 'state':
            return form.state.trim() ? undefined : 'The selected place needs a state. Choose a more specific place.';
        case 'rent': {
            const rent = Number(form.rent);
            return form.rent.trim() && Number.isFinite(rent) && rent > 0 ? undefined : 'Enter a rent greater than 0.';
        }
        case 'deposit':
            return amountError(form.deposit, true);
        case 'maintenance':
        case 'electricity':
        case 'food':
        case 'brokerage':
        case 'other':
            return amountError(form[key], false);
        case 'phone':
            if (!form.phone.trim() && !form.email.trim())
                return 'Enter a phone number or an email address.';
            if (form.phone.trim() && !PHONE_PATTERN.test(form.phone.trim()))
                return 'Enter a valid Indian mobile number.';
            return undefined;
        case 'email':
            if (!form.phone.trim() && !form.email.trim())
                return 'Enter a phone number or an email address.';
            if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim()))
                return 'Enter a valid email address.';
            return undefined;
        case 'consent':
            return form.consent ? undefined : 'Confirm that you are authorised to submit this listing.';
        default:
            return undefined;
    }
}
function FormSection({ icon: Icon, title, description, children }) {
    return (<fieldset className="card p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
          <Icon className="h-4 w-4" aria-hidden/>
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-ink-900">{title}</h2>
          {description && <p className="mt-1 text-xs leading-relaxed text-ink-500">{description}</p>}
        </div>
      </div>
      {children}
    </fieldset>);
}
function Receipt({ result, onReset }) {
    const statusLabel = result.status === 'pending' ? 'Pending moderation' : result.status === 'Not available' ? 'Not available' : String(result.status);
    return (<div className="mx-auto max-w-2xl">
      <div className="card p-6 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <CheckCircle2 className="h-6 w-6" aria-hidden/>
        </span>
        <h2 className="mt-5 font-display text-xl font-extrabold text-ink-950">Submission received</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {result.message || 'Your record was saved. It is pending moderation and is not published.'}
        </p>
        <dl className="mt-6 grid gap-4 rounded-xl bg-surface-muted p-4 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-ink-500">Reference</dt>
            <dd className="mt-0.5 break-all font-semibold text-ink-900">{result.id}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Status</dt>
            <dd className="mt-0.5 font-semibold text-ink-900">{statusLabel}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Published</dt>
            <dd className="mt-0.5 font-semibold text-ink-900">{result.published}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-ink-500">
          Your listing will be reviewed before it appears publicly. Make sure your contact details are accurate so interested people can reach you.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton to="/owner/listings" variant="secondary" leftIcon={<ReceiptText className="h-4 w-4"/>}>
            View my submissions
          </LinkButton>
          <Button type="button" variant="outline" onClick={onReset}>
            Submit another property
          </Button>
        </div>
      </div>
    </div>);
}
export function AddPropertyPage() {
    const user = useAuthStore((state) => state.user);
    const pushToast = useToastStore((state) => state.push);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [stepIndex, setStepIndex] = useState(0);
    const [locationQuery, setLocationQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [resolving, setResolving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitResult, setSubmitResult] = useState(null);
    const formTopRef = useRef(null);

    useEffect(() => {
        if (user)
            setForm((previous) => ({
                ...previous,
                email: previous.email || user.email || '',
                phone: previous.phone || user.phone || '',
            }));
    }, [user]);

    useEffect(() => {
        const query = locationQuery.trim();
        if (query.length < 3 || selectedPlace) {
            setSuggestions([]);
            return undefined;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => {
            geocodingService
                .suggest(query, controller.signal)
                .then((result) => setSuggestions((result.items || []).filter(isIndianPlace).slice(0, 6)))
                .catch(() => setSuggestions([]));
        }, 250);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [locationQuery, selectedPlace]);

    function setField(key, value) {
        setForm((previous) => ({ ...previous, [key]: value }));
        setErrors((previous) => {
            if (!previous[key])
                return previous;
            const next = { ...previous };
            delete next[key];
            return next;
        });
    }
    function goToStep(index) {
        setStepIndex(index);
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function applyPlace(place) {
        if (!isIndianPlace(place)) {
            setLocationError('That place is not in India. Choose an Indian locality, city or address.');
            return;
        }
        setSelectedPlace(place);
        setForm((previous) => ({
            ...previous,
            label: String(place.label || place.name || '').slice(0, 160),
            city: String(place.city || '').slice(0, 80),
            state: String(place.state || '').slice(0, 80),
            postcode: String(place.postcode || '').slice(0, 12),
        }));
        setLocationQuery(place.label || place.name || '');
        setSuggestions([]);
        setLocationError('');
        setErrors((previous) => {
            const next = { ...previous };
            ['location', 'label', 'city', 'state', 'postcode'].forEach((key) => delete next[key]);
            return next;
        });
    }
    function clearLocation() {
        setSelectedPlace(null);
        setLocationQuery('');
        setSuggestions([]);
        setLocationError('');
        setForm((previous) => ({ ...previous, label: '', city: '', state: '', postcode: '' }));
    }
    async function resolveQuery(raw = locationQuery) {
        const query = raw.trim();
        if (query.length < 3) {
            setLocationError('Enter at least 3 characters to resolve a location.');
            return;
        }
        setResolving(true);
        setLocationError('');
        try {
            const place = await geocodingService.resolve(query);
            applyPlace(place);
        } catch (error) {
            setLocationError(error.message || 'This location could not be resolved. Try a different search.');
        } finally {
            setResolving(false);
        }
    }
    function handleLocationKeyDown(event) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveSuggestion((index) => Math.min(index + 1, suggestions.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveSuggestion((index) => Math.max(index - 1, 0));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (suggestions.length)
                applyPlace(suggestions[activeSuggestion]);
            else
                resolveQuery();
        }
    }
    function handleContinue() {
        const nextErrors = {};
        for (const key of STEPS[stepIndex].fields) {
            const message = validateField(key, form, selectedPlace);
            if (message)
                nextErrors[key] = message;
        }
        if (Object.keys(nextErrors).length > 0) {
            setErrors((previous) => ({ ...previous, ...nextErrors }));
            pushToast('Complete the highlighted fields to continue.', 'warning');
            return;
        }
        setErrors((previous) => {
            const next = { ...previous };
            for (const key of STEPS[stepIndex].fields)
                delete next[key];
            return next;
        });
        goToStep(stepIndex + 1);
    }
    function resetForm() {
        setForm(INITIAL_FORM);
        setErrors({});
        setStepIndex(0);
        setLocationQuery('');
        setSuggestions([]);
        setSelectedPlace(null);
        setLocationError('');
        setSubmitError('');
        setSubmitResult(null);
    }
    async function handleSubmit(event) {
        event.preventDefault();
        const allErrors = {};
        for (const key of REQUIRED_FIELDS) {
            const message = validateField(key, form, selectedPlace);
            if (message)
                allErrors[key] = message;
        }
        setErrors(allErrors);
        if (Object.keys(allErrors).length > 0) {
            const firstInvalidStep = STEPS.findIndex((step) => step.fields.some((key) => allErrors[key]));
            if (firstInvalidStep >= 0)
                setStepIndex(firstInvalidStep);
            pushToast('Complete the highlighted fields before submitting.', 'warning');
            return;
        }
        setSubmitting(true);
        setSubmitError('');
        try {
            const payload = {
                title: form.title.trim(),
                category: form.category,
                description: form.description.trim(),
                address: {
                    label: form.label.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    postcode: form.postcode.trim(),
                },
                coordinates: {
                    lat: selectedPlace.coordinates.lat,
                    lng: selectedPlace.coordinates.lng,
                },
                prices: {
                    rent: toAmount(form.rent),
                    deposit: toAmount(form.deposit),
                    maintenance: toAmount(form.maintenance),
                    electricity: toAmount(form.electricity),
                    food: toAmount(form.food),
                    brokerage: toAmount(form.brokerage),
                    other: toAmount(form.other),
                },
                occupancy: form.occupancy,
                amenities: form.amenities,
                contact: { phone: form.phone.trim(), email: form.email.trim() },
                consent: true,
            };
            const result = await apiFetch('/submissions', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const record = result?.record || {};
            setSubmitResult({
                id: record.id ?? record.externalId ?? 'Not available',
                status: record.status ?? 'Pending review',
                published: typeof record.published === 'boolean' ? (record.published ? 'Published' : 'Not published') : 'Not published',
                message: result?.message || '',
            });
            pushToast('Submission received. It is pending moderation and not published.', 'success');
        } catch (error) {
            setSubmitError(error.message || 'The submission could not be saved. Please try again.');
            pushToast('Submission failed. Review the error and try again.', 'warning');
        } finally {
            setSubmitting(false);
        }
    }

    if (!user) {
        return (<PageShell eyebrow="Owner tools" title="Add property" description="Add your property details and submit it for review." breadcrumbs={[{ label: 'Owner dashboard', to: '/owner/dashboard' }, { label: 'Add property' }]}>
          <div className="mx-auto max-w-2xl">
            <EmptyState icon={LockKeyhole} title="Log in to list a property" description="Sign in to submit your property details. Your listing will be reviewed before it appears publicly." action={<LinkButton to="/login" state={{ from: '/owner/add-property' }} leftIcon={<LockKeyhole className="h-4 w-4"/>}>
                  Log in
                </LinkButton>} secondary={<LinkButton to="/owner/dashboard" variant="outline">
                  Owner dashboard
                </LinkButton>}/>
          </div>
        </PageShell>);
    }

    const completedCount = REQUIRED_FIELDS.filter((key) => !validateField(key, form, selectedPlace)).length;
    const progressPercent = Math.round((completedCount / REQUIRED_FIELDS.length) * 100);
    const errorCount = Object.keys(errors).length;
    const isLastStep = stepIndex === STEPS.length - 1;
    const estimate = calculateEffectiveCost({
        rent: toAmount(form.rent),
        deposit: toAmount(form.deposit),
        maintenance: toAmount(form.maintenance),
        electricity: toAmount(form.electricity),
        food: toAmount(form.food),
        brokerage: toAmount(form.brokerage),
        other: toAmount(form.other),
    }, form.occupancy || 'single');
    const toggleAmenity = (key) => {
        setField('amenities', form.amenities.includes(key) ? form.amenities.filter((item) => item !== key) : [...form.amenities, key]);
    };

    return (<PageShell eyebrow="Owner tools" title="Add property" description="Add your property details, location, and pricing. Your listing will be reviewed before it goes live." breadcrumbs={[
            { label: 'Owner dashboard', to: '/owner/dashboard' },
            { label: 'Add property' },
        ]} actions={<LinkButton to="/owner/dashboard" variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4"/>}>
          Dashboard
        </LinkButton>}>
      <div className="space-y-6">
        <OwnerNav />
        <OwnerPreviewNotice />

        {submitResult ? (<Receipt result={submitResult} onReset={resetForm}/>) : (<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div ref={formTopRef} className="min-w-0 scroll-mt-24">
            <div className="card mb-4 p-4 lg:hidden">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-ink-600">Form progress</span>
                <span className="text-teal-700">{progressPercent}%</span>
              </div>
              <div role="progressbar" aria-label="Form completion" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progressPercent}%` }}/>
              </div>
              <p className="mt-2 text-[11px] text-ink-500">
                Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].label}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Add property submission form">
              {errorCount > 0 && (<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  {errorCount} field{errorCount === 1 ? '' : 's'} need attention. Review the highlighted entries below.
                </div>)}
              {submitError && (<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  Submission failed: {submitError}
                </div>)}

              {stepIndex === 0 && (<div className="space-y-5">
                  <FormSection icon={Home} title="Basic details" description="Use a clear title and describe only what you know about the property.">
                    <div className="grid gap-4">
                      <Input label="Listing title" placeholder="e.g. Furnished room near the tech park" hint="At least 8 characters. Do not use a price or phone number in the title." value={form.title} onChange={(event) => setField('title', event.target.value)} error={errors.title} maxLength={90}/>
                      <div>
                        <label htmlFor="listing-description" className="field-label">
                          Short description
                        </label>
                        <textarea id="listing-description" className={cn('field-control min-h-[110px] resize-y', errors.description && 'border-red-400 focus:ring-red-500/15')} value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Describe the room, building and what is included." aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'listing-description-error' : undefined}/>
                        {errors.description ? (<p id="listing-description-error" role="alert" className="mt-1.5 text-xs text-red-600">
                            {errors.description}
                          </p>) : (<p className="mt-1.5 text-xs text-ink-500">At least 20 characters.</p>)}
                      </div>
                    </div>
                  </FormSection>

                  <FormSection icon={LayoutGrid} title="Category" description="Pick the closest match for this accommodation.">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Select label="Property category" options={CATEGORY_OPTIONS} placeholder="Select a category" value={form.category} aria-invalid={Boolean(errors.category)} onChange={(event) => setField('category', event.target.value)}/>
                        {errors.category && (<p role="alert" className="mt-1.5 text-xs text-red-600">
                            {errors.category}
                          </p>)}
                      </div>
                      <div>
                        <Select label="Occupancy" options={OCCUPANCY_OPTIONS} placeholder="Select occupancy" value={form.occupancy} aria-invalid={Boolean(errors.occupancy)} onChange={(event) => setField('occupancy', event.target.value)}/>
                        {errors.occupancy && (<p role="alert" className="mt-1.5 text-xs text-red-600">
                            {errors.occupancy}
                          </p>)}
                      </div>
                    </div>
                  </FormSection>
                </div>)}

              {stepIndex === 1 && (<div className="space-y-5">
                  <FormSection icon={MapPin} title="Mapped location" description="Search for a real Indian place. Coordinates are taken only from the selected geocoder result.">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input type="search" value={locationQuery} onChange={(event) => {
                            setLocationQuery(event.target.value);
                            setSelectedPlace(null);
                            setForm((previous) => ({ ...previous, label: '', city: '', state: '', postcode: '' }));
                            setActiveSuggestion(0);
                            setErrors((previous) => {
                                const next = { ...previous };
                                ['location', 'label', 'city', 'state', 'postcode'].forEach((key) => delete next[key]);
                                return next;
                            });
                        }} onKeyDown={handleLocationKeyDown} placeholder="City, locality, landmark or address in India" aria-label="Search for an Indian location" role="combobox" aria-expanded={suggestions.length > 0} aria-controls="location-suggestions" aria-autocomplete="list" className="field-control min-w-0 flex-1"/>
                      <Button type="button" variant="secondary" onClick={() => resolveQuery()} disabled={resolving} loading={resolving} leftIcon={<Search className="h-4 w-4"/>}>
                        Resolve location
                      </Button>
                    </div>
                    {suggestions.length > 0 && (<div id="location-suggestions" role="listbox" aria-label="Location suggestions" className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-ink-100 bg-white p-1.5 shadow-soft">
                        {suggestions.map((place, index) => (<button key={place.id || `${place.label}-${index}`} type="button" role="option" aria-selected={index === activeSuggestion} onMouseEnter={() => setActiveSuggestion(index)} onClick={() => applyPlace(place)} className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition', index === activeSuggestion ? 'bg-ink-50 text-ink-900' : 'text-ink-600 hover:bg-ink-50')}>
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden/>
                            <span className="min-w-0">
                              <span className="block truncate font-semibold">{place.name || place.label}</span>
                              <span className="block truncate text-[11px] text-ink-500">{place.label}</span>
                            </span>
                          </button>))}
                      </div>)}
                    {locationError && (<p role="alert" className="mt-2 text-xs text-red-600">{locationError}</p>)}
                    {errors.location && (<p role="alert" className="mt-2 text-xs text-red-600">{errors.location}</p>)}

                    {selectedPlace && (<div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/60 p-4 text-xs text-teal-950">
                      <p className="flex items-center gap-2 font-semibold">
                        <Check className="h-4 w-4" aria-hidden/>
                        Location confirmed
                      </p>
                      <p className="mt-2 font-mono text-[11px] text-teal-900">
                        {selectedPlace.coordinates.lat}, {selectedPlace.coordinates.lng}
                      </p>
                      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={clearLocation}>
                        Change location
                      </Button>
                    </div>)}

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Input label="Address label" value={form.label} maxLength={160} onChange={(event) => setField('label', event.target.value)} error={errors.label} containerClassName="sm:col-span-2" hint="Filled from the selected place. Correct it if the geocoder label is incomplete."/>
                      <Input label="City" value={form.city} maxLength={80} onChange={(event) => setField('city', event.target.value)} error={errors.city}/>
                      <Input label="State" value={form.state} maxLength={80} onChange={(event) => setField('state', event.target.value)} error={errors.state}/>
                      <Input label="Postcode (optional)" value={form.postcode} maxLength={12} onChange={(event) => setField('postcode', event.target.value)} error={errors.postcode}/>
                    </div>
                  </FormSection>

                  <FormSection icon={ReceiptText} title="Price breakdown" description="Supply the amounts you actually charge. Enter 0 where an amount does not apply.">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Monthly rent (INR)" type="number" min="0" inputMode="numeric" leftIcon={<IndianRupee className="h-4 w-4" aria-hidden/>} placeholder="0" value={form.rent} onChange={(event) => setField('rent', event.target.value)} error={errors.rent}/>
                      <Input label="Security deposit (INR)" type="number" min="0" inputMode="numeric" leftIcon={<IndianRupee className="h-4 w-4" aria-hidden/>} placeholder="0" value={form.deposit} onChange={(event) => setField('deposit', event.target.value)} error={errors.deposit} hint="One-time amount."/>
                      <Input label="Maintenance (INR / month)" type="number" min="0" inputMode="numeric" leftIcon={<IndianRupee className="h-4 w-4" aria-hidden/>} placeholder="0" value={form.maintenance} onChange={(event) => setField('maintenance', event.target.value)} error={errors.maintenance}/>
                      <Input label="Electricity (INR / month)" type="number" min="0" inputMode="numeric" leftIcon={<IndianRupee className="h-4 w-4" aria-hidden/>} placeholder="0" value={form.electricity} onChange={(event) => setField('electricity', event.target.value)} error={errors.electricity}/>
                      <Input label="Food / mess (INR / month)" type="number" min="0" inputMode="numeric" leftIcon={<IndianRupee className="h-4 w-4" aria-hidden/>} placeholder="0" value={form.food} onChange={(event) => setField('food', event.target.value)} error={errors.food}/>
                      <Input label="Brokerage (INR, one time)" type="number" min="0" inputMode="numeric" leftIcon={<IndianRupee className="h-4 w-4" aria-hidden/>} placeholder="0" value={form.brokerage} onChange={(event) => setField('brokerage', event.target.value)} error={errors.brokerage}/>
                      <Input label="Other charges (INR / month)" type="number" min="0" inputMode="numeric" leftIcon={<IndianRupee className="h-4 w-4" aria-hidden/>} placeholder="0" value={form.other} onChange={(event) => setField('other', event.target.value)} error={errors.other} containerClassName="sm:col-span-2"/>
                    </div>
                    <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
                      <p className="flex items-center gap-2 text-xs font-semibold text-teal-900">
                        <ReceiptText className="h-4 w-4" aria-hidden/>
                        Calculated from your inputs
                      </p>
                      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
                        <div>
                          <p className="text-ink-500">Monthly total</p>
                          <p className="mt-0.5 font-display text-base font-bold text-ink-900">{formatINR(estimate.monthlyExpense)}</p>
                        </div>
                        <div>
                          <p className="text-ink-500">Upfront at move-in</p>
                          <p className="mt-0.5 font-display text-base font-bold text-ink-900">{formatINR(estimate.upfront)}</p>
                        </div>
                        <div>
                          <p className="text-ink-500">First month total</p>
                          <p className="mt-0.5 font-display text-base font-bold text-ink-900">{formatINR(estimate.firstMonthOutflow)}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-[11px] text-ink-500">
                        Calculated locally from the values above. This is not a market quote.
                      </p>
                    </div>
                  </FormSection>
                </div>)}

              {stepIndex === 2 && (<div className="space-y-5">
                  <FormSection icon={Wifi} title="Amenities" description="Select only the amenities that are genuinely available. Every option is optional.">
                    <div className="grid gap-x-5 gap-y-1 sm:grid-cols-2">
                      {Object.keys(AMENITY_LABELS).map((key) => (<Checkbox key={key} checked={form.amenities.includes(key)} onChange={() => toggleAmenity(key)} label={AMENITY_LABELS[key]}/>))}
                    </div>
                  </FormSection>

                  <FormSection icon={ImageIcon} title="Photos" description="Photo attachments are not part of this submission.">
                    <div role="note" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-3 text-xs leading-relaxed text-amber-900">
                      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden/>
                      <p>
                        Photo upload is unavailable until authorised storage is connected. No photos can be attached
                        to this submission, and no photo picker is shown.
                      </p>
                    </div>
                  </FormSection>
                </div>)}

              {stepIndex === 3 && (<div className="space-y-5">
                  <FormSection icon={Send} title="Contact details" description="Supply a real contact channel for this submission. At least one is required.">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Indian mobile number" type="tel" autoComplete="tel" placeholder="9876543210" value={form.phone} onChange={(event) => setField('phone', event.target.value)} error={errors.phone}/>
                      <Input label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(event) => setField('email', event.target.value)} error={errors.email}/>
                    </div>
                  </FormSection>

                  <FormSection icon={ShieldCheck} title="Review & confirm" description="Check what will be sent before submitting.">
                    <dl className="grid gap-3 rounded-xl bg-surface-muted p-4 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-ink-500">Title</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">{form.title.trim() || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Category</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">{form.category ? CATEGORY_LABELS[form.category] : 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Location</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">
                          {form.label.trim() || 'Not provided'}
                          {selectedPlace && <span className="mt-0.5 block font-normal text-ink-500">
                            Coordinates: {selectedPlace.coordinates.lat}, {selectedPlace.coordinates.lng}
                          </span>}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Monthly rent</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">
                          {toAmount(form.rent) > 0 ? formatINR(toAmount(form.rent)) : 'Not provided'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Contact</dt>
                        <dd className="mt-0.5 break-all font-semibold text-ink-800">
                          {[form.phone.trim(), form.email.trim()].filter(Boolean).join(' · ') || 'Not provided'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Amenities</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">
                          {form.amenities.length ? form.amenities.map((key) => AMENITY_LABELS[key]).join(', ') : 'None selected'}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-5">
                      <Checkbox checked={form.consent} onChange={(checked) => setField('consent', checked)} label="I am authorised to submit this listing and confirm the details are accurate" description="The record is saved to the API and reviewed before publication."/>
                      {errors.consent && (<p role="alert" className="mt-1.5 text-xs text-red-600">
                          {errors.consent}
                        </p>)}
                    </div>
                  </FormSection>
                </div>)}

              <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => goToStep(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0} leftIcon={<ArrowLeft className="h-4 w-4"/>}>
                  Back
                </Button>
                <div className="flex flex-wrap gap-2">
                  {isLastStep ? (<Button type="submit" variant="secondary" loading={submitting} leftIcon={<Send className="h-4 w-4"/>}>
                      Submit property
                    </Button>) : (<Button type="button" variant="primary" rightIcon={<ArrowRight className="h-4 w-4"/>} onClick={handleContinue}>
                      Continue
                    </Button>)}
                </div>
              </div>
            </form>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Form progress and steps">
            <div className="card hidden p-5 lg:block">
              <div className="flex items-center justify-between">
                <p className="field-label mb-0">Form progress</p>
                <span className="text-xs font-bold text-teal-700">{progressPercent}%</span>
              </div>
              <div role="progressbar" aria-label="Form completion" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progressPercent}%` }}/>
              </div>
              <p className="mt-2 text-xs text-ink-500">
                {completedCount} of {REQUIRED_FIELDS.length} required fields complete
              </p>
              <ol className="mt-5 space-y-2">
                {STEPS.map((step, index) => {
            const complete = step.fields.length > 0 && step.fields.every((key) => !validateField(key, form, selectedPlace));
            const Icon = step.icon;
            return (<li key={step.key}>
                      <button type="button" onClick={() => goToStep(index)} aria-current={index === stepIndex ? 'step' : undefined} className={cn('flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition', index === stepIndex
                    ? 'border-teal-300 bg-teal-50/70'
                    : 'border-transparent hover:bg-ink-50')}>
                        <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold', complete
                    ? 'bg-teal-600 text-white'
                    : index === stepIndex
                        ? 'bg-ink-900 text-white'
                        : 'bg-ink-100 text-ink-600')}>
                          {complete ? <Check className="h-3.5 w-3.5" aria-hidden/> : index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
                            <Icon className="h-3.5 w-3.5 text-ink-400" aria-hidden/>
                            {step.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-ink-500">
                            {step.short}
                          </span>
                        </span>
                      </button>
                    </li>);
        })}
              </ol>
              <p className="mt-5 border-t border-ink-100 pt-4 text-[11px] leading-relaxed text-ink-500">
                Progress is local to this page. Reloading clears every field.
              </p>
            </div>
          </aside>
        </div>)}
      </div>
    </PageShell>);
}

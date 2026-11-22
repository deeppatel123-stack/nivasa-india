import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CloudUpload,
  Home,
  Image as ImageIcon,
  IndianRupee,
  LayoutGrid,
  MapPin,
  ReceiptText,
  Save,
  ScrollText,
  Send,
  ShieldCheck,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { OwnerPreviewNotice } from '@/components/owner/OwnerPreviewNotice';
import { Button, LinkButton } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
import { calculateEffectiveCost, formatINR } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/useToastStore';

const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone call', hint: 'A verified number would be shown to enquirers.' },
  { value: 'whatsapp', label: 'WhatsApp', hint: 'A consented WhatsApp number would be shown.' },
  { value: 'email', label: 'Email', hint: 'A verified email address would be shown.' },
  { value: 'in_app', label: 'In-app messages (when available)', hint: 'No direct contact details are displayed.' },
] as const;

type ContactMethod = (typeof CONTACT_METHODS)[number]['value'];

interface FormState {
  title: string;
  description: string;
  category: PropertyCategory | '';
  occupancy: Occupancy | '';
  furnishing: Furnishing | '';
  genderPreference: GenderPreference | '';
  locality: string;
  city: string;
  state: string;
  address: string;
  landmark: string;
  rent: string;
  deposit: string;
  maintenance: string;
  electricity: string;
  food: string;
  brokerage: string;
  other: string;
  electricityIncluded: boolean;
  foodIncluded: boolean;
  amenities: AmenityKey[];
  rules: string[];
  customRules: string;
  availableFrom: string;
  contactMethod: ContactMethod | '';
  displayName: string;
  consent: boolean;
}

type FieldKey = keyof FormState;
type FormErrors = Partial<Record<FieldKey, string>>;

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  category: '',
  occupancy: '',
  furnishing: '',
  genderPreference: '',
  locality: '',
  city: '',
  state: '',
  address: '',
  landmark: '',
  rent: '',
  deposit: '',
  maintenance: '',
  electricity: '',
  food: '',
  brokerage: '',
  other: '',
  electricityIncluded: false,
  foodIncluded: false,
  amenities: [],
  rules: [],
  customRules: '',
  availableFrom: '',
  contactMethod: '',
  displayName: '',
  consent: false,
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const OCCUPANCY_OPTIONS = Object.entries(OCCUPANCY_LABELS).map(([value, label]) => ({ value, label }));
const FURNISHING_OPTIONS = Object.entries(FURNISHING_LABELS).map(([value, label]) => ({ value, label }));
const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label }));

const STEPS: Array<{ key: string; label: string; short: string; icon: LucideIcon; fields: FieldKey[] }> = [
  {
    key: 'basics',
    label: 'Basics',
    short: 'Details & category',
    icon: Home,
    fields: ['title', 'description', 'category', 'occupancy', 'furnishing', 'genderPreference'],
  },
  {
    key: 'location',
    label: 'Location & price',
    short: 'Address & charges',
    icon: MapPin,
    fields: ['locality', 'city', 'state', 'rent', 'deposit'],
  },
  {
    key: 'details',
    label: 'Details & photos',
    short: 'Amenities & rules',
    icon: Wifi,
    fields: [],
  },
  {
    key: 'final',
    label: 'Final touches',
    short: 'Availability & contact',
    icon: ShieldCheck,
    fields: ['availableFrom', 'contactMethod', 'displayName', 'consent'],
  },
];

const REQUIRED_FIELDS: FieldKey[] = STEPS.flatMap((step) => step.fields);
const RULE_PRESETS = ['No smoking indoors', 'No overnight guests', 'Quiet hours after 10 PM', 'Pets need approval'];
const PHOTO_PLACEHOLDERS = ['Exterior / building', 'Room view', 'Shared area'];

function toAmount(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function amountError(value: string, required: boolean): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'Enter an amount (use 0 if there is none).' : undefined;
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount < 0) return 'Use 0 or a positive amount.';
  return undefined;
}

function validateField(key: FieldKey, form: FormState): string | undefined {
  switch (key) {
    case 'title':
      return form.title.trim().length >= 8 ? undefined : 'Use at least 8 characters.';
    case 'description':
      return form.description.trim().length >= 20 ? undefined : 'Use at least 20 characters.';
    case 'category':
      return form.category ? undefined : 'Choose a property category.';
    case 'occupancy':
      return form.occupancy ? undefined : 'Choose an occupancy type.';
    case 'furnishing':
      return form.furnishing ? undefined : 'Choose a furnishing level.';
    case 'genderPreference':
      return form.genderPreference ? undefined : 'Choose a preference.';
    case 'locality':
      return form.locality.trim() ? undefined : 'Enter a locality or neighbourhood.';
    case 'city':
      return form.city.trim() ? undefined : 'Enter a city.';
    case 'state':
      return form.state.trim() ? undefined : 'Enter a state.';
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
    case 'availableFrom':
      return form.availableFrom ? undefined : 'Choose an availability date.';
    case 'contactMethod':
      return form.contactMethod ? undefined : 'Choose a preferred contact method.';
    case 'displayName':
      return form.displayName.trim() ? undefined : 'Enter the name to display in this preview.';
    case 'consent':
      return form.consent ? undefined : 'Confirm that this is only a preview.';
    default:
      return undefined;
  }
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="card p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-ink-900">{title}</h2>
          {description && <p className="mt-1 text-xs leading-relaxed text-ink-500">{description}</p>}
        </div>
      </div>
      {children}
    </fieldset>
  );
}

export function AddPropertyPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [stepIndex, setStepIndex] = useState(0);
  const formTopRef = useRef<HTMLDivElement>(null);
  const pushToast = useToastStore((state) => state.push);

  function setField<K extends FieldKey>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function goToStep(index: number) {
    setStepIndex(index);
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleContinue() {
    const nextErrors: FormErrors = {};
    for (const key of STEPS[stepIndex].fields) {
      const message = validateField(key, form);
      if (message) nextErrors[key] = message;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors((previous) => ({ ...previous, ...nextErrors }));
      pushToast('Please complete the highlighted fields to continue.', 'warning');
      return;
    }
    setErrors((previous) => {
      const next = { ...previous };
      for (const key of STEPS[stepIndex].fields) delete next[key];
      return next;
    });
    goToStep(stepIndex + 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const allErrors: FormErrors = {};
    for (const key of REQUIRED_FIELDS) {
      const message = validateField(key, form);
      if (message) allErrors[key] = message;
    }
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      const firstInvalidStep = STEPS.findIndex((step) => step.fields.some((key) => allErrors[key]));
      if (firstInvalidStep >= 0) setStepIndex(firstInvalidStep);
      pushToast('Please complete the highlighted fields before previewing submission.', 'warning');
      return;
    }
    // Deliberately no persistence: this is a UI preview only.
    pushToast('Preview submitted — no backend is connected, so nothing was saved.', 'info');
  }

  const completedCount = REQUIRED_FIELDS.filter((key) => !validateField(key, form)).length;
  const progressPercent = Math.round((completedCount / REQUIRED_FIELDS.length) * 100);
  const errorCount = Object.keys(errors).length;
  const isLastStep = stepIndex === STEPS.length - 1;

  const estimate = calculateEffectiveCost(
    {
      rent: toAmount(form.rent),
      deposit: toAmount(form.deposit),
      maintenance: toAmount(form.maintenance),
      electricity: toAmount(form.electricity),
      food: toAmount(form.food),
      brokerage: toAmount(form.brokerage),
      other: toAmount(form.other),
      electricityIncluded: form.electricityIncluded,
      foodIncluded: form.foodIncluded,
    },
    form.occupancy || 'single',
  );

  const toggleAmenity = (key: AmenityKey) => {
    setField(
      'amenities',
      form.amenities.includes(key) ? form.amenities.filter((item) => item !== key) : [...form.amenities, key],
    );
  };

  const toggleRule = (rule: string) => {
    setField('rules', form.rules.includes(rule) ? form.rules.filter((item) => item !== rule) : [...form.rules, rule]);
  };

  return (
    <PageShell
      eyebrow="Owner tools"
      title="Add property"
      description="Preview the listing form and the details a real submission would require."
      breadcrumbs={[
        { label: 'Owner tools', to: '/owner/dashboard' },
        { label: 'Add property' },
      ]}
      actions={
        <LinkButton to="/owner/dashboard" variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Dashboard
        </LinkButton>
      }
      showDemoNote={false}
    >
      <div className="space-y-6">
        <OwnerNav />
        <OwnerPreviewNotice />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div ref={formTopRef} className="min-w-0 scroll-mt-24">
            <div className="card mb-4 p-4 lg:hidden">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-ink-600">Form progress</span>
                <span className="text-teal-700">{progressPercent}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Form completion"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100"
              >
                <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-ink-500">
                Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].label}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Add property preview form">
              {errorCount > 0 && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  {errorCount} field{errorCount === 1 ? '' : 's'} need attention. Review the highlighted entries below.
                </div>
              )}

              {stepIndex === 0 && (
                <div className="space-y-5">
                  <FormSection
                    icon={Home}
                    title="Basic details"
                    description="Use a clear, factual title and describe what a visitor would actually see."
                  >
                    <div className="grid gap-4">
                      <Input
                        label="Listing title"
                        placeholder="e.g. Furnished room near the tech park"
                        hint="At least 8 characters. Do not use a price or phone number in the title."
                        value={form.title}
                        onChange={(event) => setField('title', event.target.value)}
                        error={errors.title}
                        maxLength={90}
                      />
                      <div>
                        <label htmlFor="listing-description" className="field-label">
                          Short description
                        </label>
                        <textarea
                          id="listing-description"
                          className={cn('field-control min-h-[110px] resize-y', errors.description && 'border-red-400 focus:ring-red-500/15')}
                          value={form.description}
                          onChange={(event) => setField('description', event.target.value)}
                          placeholder="Describe the room, building and what is included."
                          aria-invalid={Boolean(errors.description)}
                          aria-describedby={errors.description ? 'listing-description-error' : undefined}
                        />
                        {errors.description ? (
                          <p id="listing-description-error" role="alert" className="mt-1.5 text-xs text-red-600">
                            {errors.description}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-xs text-ink-500">At least 20 characters. This text stays on this page.</p>
                        )}
                      </div>
                    </div>
                  </FormSection>

                  <FormSection icon={LayoutGrid} title="Category" description="Pick the closest match and the room setup.">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Select
                          label="Property category"
                          options={CATEGORY_OPTIONS}
                          placeholder="Select a category"
                          value={form.category}
                          aria-invalid={Boolean(errors.category)}
                          onChange={(event) => setField('category', event.target.value as FormState['category'])}
                        />
                        {errors.category && (
                          <p role="alert" className="mt-1.5 text-xs text-red-600">
                            {errors.category}
                          </p>
                        )}
                      </div>
                      <div>
                        <Select
                          label="Occupancy"
                          options={OCCUPANCY_OPTIONS}
                          placeholder="Select occupancy"
                          value={form.occupancy}
                          aria-invalid={Boolean(errors.occupancy)}
                          onChange={(event) => setField('occupancy', event.target.value as FormState['occupancy'])}
                        />
                        {errors.occupancy && (
                          <p role="alert" className="mt-1.5 text-xs text-red-600">
                            {errors.occupancy}
                          </p>
                        )}
                      </div>
                      <div>
                        <Select
                          label="Furnishing"
                          options={FURNISHING_OPTIONS}
                          placeholder="Select furnishing"
                          value={form.furnishing}
                          aria-invalid={Boolean(errors.furnishing)}
                          onChange={(event) => setField('furnishing', event.target.value as FormState['furnishing'])}
                        />
                        {errors.furnishing && (
                          <p role="alert" className="mt-1.5 text-xs text-red-600">
                            {errors.furnishing}
                          </p>
                        )}
                      </div>
                      <div>
                        <Select
                          label="Gender preference"
                          options={GENDER_OPTIONS}
                          placeholder="Select a preference"
                          value={form.genderPreference}
                          aria-invalid={Boolean(errors.genderPreference)}
                          onChange={(event) =>
                            setField('genderPreference', event.target.value as FormState['genderPreference'])
                          }
                        />
                        {errors.genderPreference && (
                          <p role="alert" className="mt-1.5 text-xs text-red-600">
                            {errors.genderPreference}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] text-ink-500">
                      Selections here are only used to preview the form layout; no listing is created.
                    </p>
                  </FormSection>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="space-y-5">
                  <FormSection
                    icon={MapPin}
                    title="Location"
                    description="A real listing will need a precise, verifiable address — not just a city."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Locality / neighbourhood"
                        placeholder="e.g. Electronic City Phase 1"
                        value={form.locality}
                        onChange={(event) => setField('locality', event.target.value)}
                        error={errors.locality}
                      />
                      <Input
                        label="City"
                        placeholder="e.g. Bengaluru"
                        value={form.city}
                        onChange={(event) => setField('city', event.target.value)}
                        error={errors.city}
                      />
                      <Input
                        label="State"
                        placeholder="e.g. Karnataka"
                        value={form.state}
                        onChange={(event) => setField('state', event.target.value)}
                        error={errors.state}
                      />
                      <Input
                        label="Nearby landmark (optional)"
                        placeholder="A well-known public landmark"
                        value={form.landmark}
                        onChange={(event) => setField('landmark', event.target.value)}
                      />
                      <Input
                        label="Address line (optional)"
                        placeholder="Street, building and floor"
                        value={form.address}
                        onChange={(event) => setField('address', event.target.value)}
                        containerClassName="sm:col-span-2"
                        hint="Do not enter real personal address details in this preview."
                      />
                    </div>
                  </FormSection>

                  <FormSection
                    icon={ReceiptText}
                    title="Pricing breakdown"
                    description="Keep one-time payments separate from recurring monthly charges."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Monthly rent (INR)"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        leftIcon={<IndianRupee className="h-4 w-4" aria-hidden />}
                        placeholder="0"
                        value={form.rent}
                        onChange={(event) => setField('rent', event.target.value)}
                        error={errors.rent}
                      />
                      <Input
                        label="Refundable deposit (INR)"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        leftIcon={<IndianRupee className="h-4 w-4" aria-hidden />}
                        placeholder="0"
                        value={form.deposit}
                        onChange={(event) => setField('deposit', event.target.value)}
                        error={errors.deposit}
                        hint="One-time, refundable amount."
                      />
                      <Input
                        label="Maintenance (INR / month)"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        leftIcon={<IndianRupee className="h-4 w-4" aria-hidden />}
                        placeholder="0"
                        value={form.maintenance}
                        onChange={(event) => setField('maintenance', event.target.value)}
                        error={errors.maintenance}
                      />
                      <Input
                        label="Electricity (INR / month)"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        leftIcon={<IndianRupee className="h-4 w-4" aria-hidden />}
                        placeholder="0"
                        disabled={form.electricityIncluded}
                        value={form.electricity}
                        onChange={(event) => setField('electricity', event.target.value)}
                        error={errors.electricity}
                      />
                      <Input
                        label="Food / mess (INR / month)"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        leftIcon={<IndianRupee className="h-4 w-4" aria-hidden />}
                        placeholder="0"
                        disabled={form.foodIncluded}
                        value={form.food}
                        onChange={(event) => setField('food', event.target.value)}
                        error={errors.food}
                      />
                      <Input
                        label="Brokerage (INR, one time)"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        leftIcon={<IndianRupee className="h-4 w-4" aria-hidden />}
                        placeholder="0"
                        value={form.brokerage}
                        onChange={(event) => setField('brokerage', event.target.value)}
                        error={errors.brokerage}
                      />
                      <Input
                        label="Other charges (INR / month)"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        leftIcon={<IndianRupee className="h-4 w-4" aria-hidden />}
                        placeholder="0"
                        value={form.other}
                        onChange={(event) => setField('other', event.target.value)}
                        error={errors.other}
                        containerClassName="sm:col-span-2"
                      />
                    </div>
                    <div className="mt-5 space-y-3 rounded-xl border border-ink-100 bg-white p-4">
                      <Toggle
                        checked={form.electricityIncluded}
                        onChange={(checked) => setField('electricityIncluded', checked)}
                        label="Electricity included in rent"
                        description="When on, electricity is not counted a second time in the preview total."
                      />
                      <div className="hairline" />
                      <Toggle
                        checked={form.foodIncluded}
                        onChange={(checked) => setField('foodIncluded', checked)}
                        label="Food included in rent"
                        description="When on, food charges are not counted a second time in the preview total."
                      />
                    </div>
                    <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
                      <p className="flex items-center gap-2 text-xs font-semibold text-teal-900">
                        <ReceiptText className="h-4 w-4" aria-hidden />
                        Illustrative totals from your inputs
                      </p>
                      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
                        <div>
                          <p className="text-ink-500">Monthly total</p>
                          <p className="mt-0.5 font-display text-base font-bold text-ink-900">
                            {formatINR(estimate.monthlyExpense)}
                          </p>
                        </div>
                        <div>
                          <p className="text-ink-500">Upfront at move-in</p>
                          <p className="mt-0.5 font-display text-base font-bold text-ink-900">
                            {formatINR(estimate.upfront)}
                          </p>
                        </div>
                        <div>
                          <p className="text-ink-500">First month total</p>
                          <p className="mt-0.5 font-display text-base font-bold text-ink-900">
                            {formatINR(estimate.firstMonthOutflow)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-[11px] text-ink-500">
                        Calculated locally from the values above. This is not a market quote and is not submitted.
                      </p>
                    </div>
                  </FormSection>
                </div>
              )}

              {stepIndex === 2 && (
                <div className="space-y-5">
                  <FormSection
                    icon={Wifi}
                    title="Amenities"
                    description="Select what is genuinely available. Every option is optional in this preview."
                  >
                    <div className="grid gap-x-5 gap-y-1 sm:grid-cols-2">
                      {(Object.keys(AMENITY_LABELS) as AmenityKey[]).map((key) => (
                        <Checkbox
                          key={key}
                          checked={form.amenities.includes(key)}
                          onChange={() => toggleAmenity(key)}
                          label={AMENITY_LABELS[key]}
                        />
                      ))}
                    </div>
                  </FormSection>

                  <FormSection
                    icon={ImageIcon}
                    title="Photos"
                    description="Illustrative placeholders only — there is no file picker connected to a backend."
                  >
                    <div className="rounded-2xl border-2 border-dashed border-ink-200 bg-surface-muted p-5 text-center">
                      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-teal-700 shadow-soft">
                        <CloudUpload className="h-5 w-5" aria-hidden />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-ink-800">Photo preview area</p>
                      <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-ink-500">
                        Images shown here are illustrative placeholders. No upload occurs and no file leaves this browser.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        leftIcon={<CloudUpload className="h-3.5 w-3.5" />}
                        onClick={() => pushToast('Photo upload is not connected — no image was selected or stored.', 'info')}
                      >
                        Choose photos (preview)
                      </Button>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {PHOTO_PLACEHOLDERS.map((label) => (
                          <div key={label} className="overflow-hidden rounded-xl border border-ink-100 bg-white text-left">
                            <div className="grid aspect-[4/3] place-items-center bg-ink-50 text-ink-300">
                              <ImageIcon className="h-8 w-8" aria-hidden />
                            </div>
                            <p className="px-3 py-2 text-[11px] text-ink-500">{label} · illustrative placeholder</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-[11px] font-semibold text-amber-800">
                        Illustrative only — these are not uploaded images and are not property photographs.
                      </p>
                    </div>
                  </FormSection>

                  <FormSection icon={ScrollText} title="House rules" description="Rules are optional in this preview.">
                    <div className="grid gap-x-5 gap-y-1 sm:grid-cols-2">
                      {RULE_PRESETS.map((rule) => (
                        <Checkbox
                          key={rule}
                          checked={form.rules.includes(rule)}
                          onChange={() => toggleRule(rule)}
                          label={rule}
                        />
                      ))}
                    </div>
                    <div className="mt-4">
                      <label htmlFor="custom-rules" className="field-label">
                        Additional rules (optional)
                      </label>
                      <textarea
                        id="custom-rules"
                        rows={3}
                        className="field-control resize-y"
                        value={form.customRules}
                        onChange={(event) => setField('customRules', event.target.value)}
                        placeholder="Add any other agreed house rules."
                      />
                    </div>
                  </FormSection>
                </div>
              )}

              {stepIndex === 3 && (
                <div className="space-y-5">
                  <FormSection
                    icon={CalendarDays}
                    title="Availability"
                    description="A tentative date is enough for this preview; nothing is published."
                  >
                    <Input
                      label="Available from"
                      type="date"
                      value={form.availableFrom}
                      onChange={(event) => setField('availableFrom', event.target.value)}
                      error={errors.availableFrom}
                      hint="Use an approximate date if you are still deciding."
                    />
                  </FormSection>

                  <fieldset className="card p-5 sm:p-6" aria-describedby={errors.contactMethod ? 'contact-method-error' : undefined}>
                    <legend className="sr-only">Contact preference</legend>
                    <div className="mb-4 flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
                        <Send className="h-4 w-4" aria-hidden />
                      </span>
                      <div>
                        <h2 className="font-display text-base font-bold text-ink-900">Contact preference</h2>
                        <p className="mt-1 text-xs leading-relaxed text-ink-500">
                          Choose a channel for a future verified listing. Do not enter real contact details here.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {CONTACT_METHODS.map((method) => (
                        <label
                          key={method.value}
                          className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition',
                            form.contactMethod === method.value
                              ? 'border-teal-500 bg-teal-50/70'
                              : 'border-ink-200 bg-white hover:border-ink-300',
                          )}
                        >
                          <input
                            type="radio"
                            name="contact-method"
                            value={method.value}
                            checked={form.contactMethod === method.value}
                            onChange={() => setField('contactMethod', method.value)}
                            className="mt-0.5 h-4 w-4 accent-teal-600"
                          />
                          <span>
                            <span className="block text-sm font-medium text-ink-800">{method.label}</span>
                            <span className="mt-0.5 block text-xs text-ink-500">{method.hint}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.contactMethod && (
                      <p id="contact-method-error" role="alert" className="mt-2 text-xs text-red-600">
                        {errors.contactMethod}
                      </p>
                    )}
                    <div className="mt-4 sm:max-w-sm">
                      <Input
                        label="Display name"
                        placeholder="Name to show when connected"
                        value={form.displayName}
                        onChange={(event) => setField('displayName', event.target.value)}
                        error={errors.displayName}
                        hint="Not stored, published or sent anywhere."
                      />
                    </div>
                  </fieldset>

                  <FormSection
                    icon={ShieldCheck}
                    title="Review & confirm"
                    description="A snapshot of what you entered. Nothing below is saved."
                  >
                    <dl className="grid gap-3 rounded-xl bg-surface-muted p-4 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-ink-500">Title</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">{form.title.trim() || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Category</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">
                          {form.category ? CATEGORY_LABELS[form.category] : 'Not provided'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Location</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">
                          {[form.locality.trim(), form.city.trim()].filter(Boolean).join(', ') || 'Not provided'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Monthly rent</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">
                          {toAmount(form.rent) > 0 ? formatINR(toAmount(form.rent)) : 'Not provided'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Available from</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">{form.availableFrom || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Contact preference</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">
                          {CONTACT_METHODS.find((method) => method.value === form.contactMethod)?.label ?? 'Not provided'}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-5">
                      <Checkbox
                        checked={form.consent}
                        onChange={(checked) => setField('consent', checked)}
                        label="I understand this is a UI preview"
                        description="Submitting will not create a listing, upload photos or send my details anywhere."
                      />
                      {errors.consent && (
                        <p role="alert" className="mt-1.5 text-xs text-red-600">
                          {errors.consent}
                        </p>
                      )}
                    </div>
                  </FormSection>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goToStep(Math.max(0, stepIndex - 1))}
                  disabled={stepIndex === 0}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<Save className="h-4 w-4" />}
                    onClick={() => pushToast('Draft saving is not connected — nothing was stored.', 'info')}
                  >
                    Save draft (preview)
                  </Button>
                  {isLastStep ? (
                    <Button type="submit" variant="secondary" leftIcon={<Send className="h-4 w-4" />}>
                      Submit preview
                    </Button>
                  ) : (
                    <Button type="button" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={handleContinue}>
                      Continue
                    </Button>
                  )}
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
              <div
                role="progressbar"
                aria-label="Form completion"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100"
              >
                <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="mt-2 text-xs text-ink-500">
                {completedCount} of {REQUIRED_FIELDS.length} required fields complete
              </p>
              <ol className="mt-5 space-y-2">
                {STEPS.map((step, index) => {
                  const complete = step.fields.length > 0 && step.fields.every((key) => !validateField(key, form));
                  const Icon = step.icon;
                  return (
                    <li key={step.key}>
                      <button
                        type="button"
                        onClick={() => goToStep(index)}
                        aria-current={index === stepIndex ? 'step' : undefined}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                          index === stepIndex
                            ? 'border-teal-300 bg-teal-50/70'
                            : 'border-transparent hover:bg-ink-50',
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold',
                            complete
                              ? 'bg-teal-600 text-white'
                              : index === stepIndex
                                ? 'bg-ink-900 text-white'
                                : 'bg-ink-100 text-ink-600',
                          )}
                        >
                          {complete ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
                            <Icon className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                            {step.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-ink-500">
                            {step.fields.length === 0 ? 'Optional details' : step.short}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-5 border-t border-ink-100 pt-4 text-[11px] leading-relaxed text-ink-500">
                Progress is local to this page. Reloading clears every field.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

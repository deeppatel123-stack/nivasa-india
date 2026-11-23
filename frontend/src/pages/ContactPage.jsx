import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Inbox,
  Info,
  MessageSquareText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/services/api';
import { formatStorageMode } from '@/services/storageMode';
import { useToastStore } from '@/store/useToastStore';

const INITIAL_VALUES = { name: '', email: '', subject: '', context: '', message: '' };
const FIELD_ORDER = ['name', 'email', 'subject', 'message'];
const MAX_MESSAGE = 1200;

const SUBJECT_OPTIONS = [
  { value: 'search', label: 'Search, filters or map question' },
  { value: 'data', label: 'Listing record correction' },
  { value: 'owner', label: 'Owner submission question' },
  { value: 'bug', label: 'Report a problem or broken page' },
  { value: 'privacy', label: 'Privacy or data rights question' },
  { value: 'other', label: 'Something else' },
];

const SELF_SERVICE_LINKS = [
  { to: '/faq', label: 'Frequently asked questions', detail: 'Search, sources, privacy and known gaps', icon: MessageSquareText },
  { to: '/assistant', label: 'Ask the assistant', detail: 'Rules-based help using your current results', icon: Sparkles },
  { to: '/search', label: 'Run a location search', detail: 'Try the live geocoding flow', icon: Search },
  { to: '/privacy', label: 'Draft privacy policy', detail: 'What this app and the API store', icon: ShieldCheck },
  { to: '/terms', label: 'Draft terms of use', detail: 'How records and messages are handled', icon: Info },
];

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter a name with at least 2 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.subject) errors.subject = 'Choose the topic that fits best.';
  if (values.message.trim().length < 20) errors.message = 'Write at least 20 characters so the request is clear.';
  if (values.message.length > MAX_MESSAGE) errors.message = `Keep the message under ${MAX_MESSAGE} characters.`;
  return errors;
}

export function ContactPage() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const pushToast = useToastStore((state) => state.push);

  function update(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstInvalid) document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setSubmitting(true);
    setResult(null);
    try {
      const payload = await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject,
          context: values.context.trim(),
          message: values.message.trim(),
        }),
      });
      setResult({
        state: 'success',
        recordId: payload?.record?.id || 'Not available',
        storage: formatStorageMode(payload?.storage),
        message: payload?.message || 'Your message was stored.',
      });
      pushToast('Message received and stored by the API.', 'success');
    } catch (error) {
      const message = error?.message || 'Could not send your message. Please try again.';
      setResult({ state: 'error', message });
      pushToast(message, 'warning');
    } finally {
      setSubmitting(false);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (<PageShell eyebrow="Contact" title="Contact Nivasa" description="Send a message through the Nivasa API. Each submission is stored with a reference id and a reported persistence mode." breadcrumbs={[{ label: 'Contact' }]} actions={<Badge tone="teal">Messages stored via API</Badge>}>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
      <section className="card p-5 sm:p-7" aria-labelledby="contact-form-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="contact-form-heading" className="font-display text-xl font-bold text-ink-950">
              Send a message
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              Required fields are checked here, then the message is submitted to the API. Email delivery is not
              configured, so no confirmation message is sent.
            </p>
          </div>
          <Badge tone="neutral">API submission</Badge>
        </div>

        {errorCount > 0 && (<div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden/>
            <span>
              {errorCount === 1 ? 'One field needs attention.' : `${errorCount} fields need attention.`} Check the
              highlighted fields below.
            </span>
          </div>)}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input id="contact-name" label="Your name" placeholder="How should we address you?" value={values.name} onChange={(event) => update('name', event.target.value)} error={errors.name} autoComplete="name" disabled={submitting}/>
            <Input id="contact-email" label="Email address" type="email" placeholder="Enter your email address" value={values.email} onChange={(event) => update('email', event.target.value)} error={errors.email} hint="Used for the record only; no email is sent." autoComplete="email" disabled={submitting}/>
          </div>

          <Select id="contact-subject" label="Subject category" placeholder="Choose a topic" options={SUBJECT_OPTIONS} value={values.subject} onChange={(event) => update('subject', event.target.value)} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} className={cn(errors.subject && 'border-red-400 focus:ring-red-500/15')} disabled={submitting}/>
          {errors.subject && (<p id="contact-subject-error" className="-mt-3.5 text-xs text-red-600">
              {errors.subject}
            </p>)}

          <Input id="contact-context" label="City, page or record title (optional)" placeholder="e.g. a search results page near a campus" value={values.context} onChange={(event) => update('context', event.target.value)} hint="Context helps route the message to the right topic." disabled={submitting}/>

          <div className="w-full">
            <label htmlFor="contact-message" className="field-label">Message</label>
            <textarea id="contact-message" className={cn('field-control min-h-[150px] resize-y', errors.message && 'border-red-400 focus:ring-red-500/15')} placeholder="Describe what you were trying to do and what you expected to happen…" value={values.message} onChange={(event) => update('message', event.target.value)} maxLength={MAX_MESSAGE} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-hint'} disabled={submitting}/>
            <div className="mt-1.5 flex items-start justify-between gap-3">
              {errors.message ? (<p id="contact-message-error" className="text-xs text-red-600">
                  {errors.message}
                </p>) : (<p id="contact-message-hint" className="text-xs text-ink-500">
                  Please do not include sensitive personal or financial details.
                </p>)}
              <span className="shrink-0 text-[11px] tabular-nums text-ink-400">
                {values.message.length}/{MAX_MESSAGE}
              </span>
            </div>
          </div>

          <div className="hairline pt-5">
            <Button type="submit" variant="secondary" loading={submitting} leftIcon={<Send className="h-4 w-4" aria-hidden/>}>
              {submitting ? 'Sending…' : 'Send message'}
            </Button>

            {result?.state === 'success' && (<div role="status" aria-live="polite" className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-3 text-xs leading-relaxed text-teal-900">
                <p className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden/>
                  Message received
                </p>
                <p className="mt-1.5">{result.message}</p>
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold">Record id</dt>
                    <dd className="break-all font-mono text-[11px]">{result.recordId}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Storage mode</dt>
                    <dd>{result.storage}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-[11px] text-teal-800">No email notification was sent.</p>
              </div>)}

            {result?.state === 'error' && (<div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden/>
                <span>{result.message}</span>
              </div>)}
          </div>
        </form>
      </section>

      <div className="space-y-5">
        <section className="card p-5 sm:p-6" aria-labelledby="self-service-heading">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Inbox className="h-4 w-4" aria-hidden/>
            </span>
            <div>
              <h2 id="self-service-heading" className="text-sm font-bold text-ink-900">Useful right now</h2>
              <p className="text-xs text-ink-500">Answers without waiting for a reply</p>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-ink-100">
            {SELF_SERVICE_LINKS.map((link) => {
              const Icon = link.icon;
              return (<li key={link.to}>
                  <Link to={link.to} className="group flex items-start gap-3 py-3 transition hover:text-teal-700">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400 group-hover:text-teal-600" aria-hidden/>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink-800 group-hover:text-teal-700">{link.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{link.detail}</span>
                    </span>
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" aria-hidden/>
                  </Link>
                </li>);
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6" aria-labelledby="limits-heading">
          <div className="flex flex-wrap items-center gap-2">
            <Info className="h-4 w-4 text-amber-700" aria-hidden/>
            <h2 id="limits-heading" className="text-sm font-bold text-ink-900">Current limits</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-600">
            Messages are stored in MongoDB when configured, otherwise in a local development file. No email, phone or
            messaging channel is published here, and no delivery notification is generated.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              { label: 'Partner APIs', detail: 'No partner listing feeds are connected.' },
              { label: 'Google Places', detail: 'No billing-enabled Google Places key is configured.' },
              { label: 'Email delivery', detail: 'No mail service is configured for replies or resets.' },
              { label: 'Paid data', detail: 'No paid listing data is purchased or resold.' },
            ].map((item) => (<li key={item.label} className="rounded-xl border border-amber-200/80 bg-white/80 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink-800">{item.label}</span>
                  <Badge tone="amber">Not available</Badge>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">{item.detail}</p>
              </li>))}
          </ul>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="faq-legal-heading">
          <h2 id="faq-legal-heading" className="text-sm font-bold text-ink-900">FAQ & policies</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
            Both policies are drafts describing the current build and will need review before any commercial launch.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/faq" className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:border-teal-300 hover:text-teal-700">Read the FAQ</Link>
            <Link to="/privacy" className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:border-teal-300 hover:text-teal-700">Privacy (draft)</Link>
            <Link to="/terms" className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:border-teal-300 hover:text-teal-700">Terms (draft)</Link>
          </div>
        </section>
      </div>
    </div>

    <section className="mt-10" aria-labelledby="contact-expectations-heading">
      <SectionHeading eyebrow="What to expect" title="What happens after you press send" description="The submission is validated, stored by the API, and returned with a reference id."/>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: '1. Local validation', text: 'Required fields, email format and message length are checked in this browser tab.' },
          { title: '2. API storage', text: 'The message is posted to /contact and saved in MongoDB or a local development file.' },
          { title: '3. Visible receipt', text: 'The stored record id and persistence mode are shown here. No email or phone notification is generated.' },
        ].map((item) => (<div key={item.title} className="surface-muted rounded-2xl border border-ink-100 p-5">
            <h3 className="text-sm font-bold text-ink-900">{item.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">{item.text}</p>
          </div>))}
      </div>
    </section>
  </PageShell>);
}

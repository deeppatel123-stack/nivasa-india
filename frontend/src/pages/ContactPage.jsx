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
} from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/services/api';
import { useToastStore } from '@/store/useToastStore';

const INITIAL_VALUES = { name: '', email: '', subject: '', context: '', message: '' };
const FIELD_ORDER = ['name', 'email', 'subject', 'message'];
const MAX_MESSAGE = 1200;

const SUBJECT_OPTIONS = [
  { value: 'search', label: 'Search or map question' },
  { value: 'data', label: 'Listing information correction' },
  { value: 'owner', label: 'Owner/listing question' },
  { value: 'bug', label: 'Report a problem' },
  { value: 'privacy', label: 'Privacy question' },
  { value: 'other', label: 'Something else' },
];

const SELF_SERVICE_LINKS = [
  { to: '/faq', label: 'Frequently asked questions', detail: 'Answers to common questions', icon: MessageSquareText },
  { to: '/search', label: 'Search for a place', detail: 'Find stays near any location', icon: Search },
  { to: '/privacy', label: 'Privacy policy', detail: 'How your data is handled', icon: ShieldCheck },
  { to: '/terms', label: 'Terms of use', detail: 'Using Nivasa', icon: Info },
];

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter a name with at least 2 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.subject) errors.subject = 'Choose a topic.';
  if (values.message.trim().length < 20) errors.message = 'Write at least 20 characters so we can understand your request.';
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
      setResult({ state: 'success', message: payload?.message || 'Your message was received.' });
      pushToast('Message sent successfully.', 'success');
      setValues(INITIAL_VALUES);
    } catch (error) {
      const message = error?.message || 'Could not send your message. Please try again.';
      setResult({ state: 'error', message });
      pushToast(message, 'warning');
    } finally {
      setSubmitting(false);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <PageShell
      eyebrow="Contact"
      title="Contact Nivasa"
      description="Have a question or need help? Send us a message."
      breadcrumbs={[{ label: 'Contact' }]}
      actions={<Badge tone="teal">We’re here to help</Badge>}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
        <section className="card p-5 sm:p-7" aria-labelledby="contact-form-heading">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="contact-form-heading" className="font-display text-xl font-bold text-ink-950">Send a message</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                Fill in the form below and we’ll receive your message.
              </p>
            </div>
          </div>

          {errorCount > 0 && (
            <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{errorCount === 1 ? 'One field needs attention.' : `${errorCount} fields need attention.`} Please check the highlighted fields.</span>
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input id="contact-name" label="Your name" placeholder="How should we address you?" value={values.name} onChange={(event) => update('name', event.target.value)} error={errors.name} autoComplete="name" disabled={submitting} />
              <Input id="contact-email" label="Email address" type="email" placeholder="Enter your email address" value={values.email} onChange={(event) => update('email', event.target.value)} error={errors.email} autoComplete="email" disabled={submitting} />
            </div>

            <Select id="contact-subject" label="Subject" placeholder="Choose a topic" options={SUBJECT_OPTIONS} value={values.subject} onChange={(event) => update('subject', event.target.value)} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} className={cn(errors.subject && 'border-red-400 focus:ring-red-500/15')} disabled={submitting} />
            {errors.subject && <p id="contact-subject-error" className="-mt-3.5 text-xs text-red-600">{errors.subject}</p>}

            <Input id="contact-context" label="Related page or location (optional)" placeholder="e.g. Search results near Pune" value={values.context} onChange={(event) => update('context', event.target.value)} disabled={submitting} />

            <div className="w-full">
              <label htmlFor="contact-message" className="field-label">Message</label>
              <textarea id="contact-message" className={cn('field-control min-h-[150px] resize-y', errors.message && 'border-red-400 focus:ring-red-500/15')} placeholder="Tell us how we can help..." value={values.message} onChange={(event) => update('message', event.target.value)} maxLength={MAX_MESSAGE} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-hint'} disabled={submitting} />
              <div className="mt-1.5 flex items-start justify-between gap-3">
                {errors.message ? <p id="contact-message-error" className="text-xs text-red-600">{errors.message}</p> : <p id="contact-message-hint" className="text-xs text-ink-500">Please do not include sensitive personal or financial details.</p>}
                <span className="shrink-0 text-[11px] tabular-nums text-ink-400">{values.message.length}/{MAX_MESSAGE}</span>
              </div>
            </div>

            <div className="hairline pt-5">
              <Button type="submit" variant="secondary" loading={submitting} leftIcon={<Send className="h-4 w-4" aria-hidden />}>
                {submitting ? 'Sending…' : 'Send message'}
              </Button>

              {result?.state === 'success' && (
                <div role="status" aria-live="polite" className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-3 text-xs leading-relaxed text-teal-900">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                    Message received
                  </p>
                  <p className="mt-1.5">{result.message}</p>
                </div>
              )}

              {result?.state === 'error' && (
                <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{result.message}</span>
                </div>
              )}
            </div>
          </form>
        </section>

        <div className="space-y-5">
          <section className="card p-5 sm:p-6" aria-labelledby="self-service-heading">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <Inbox className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 id="self-service-heading" className="text-sm font-bold text-ink-900">Helpful links</h2>
                <p className="text-xs text-ink-500">Find answers quickly</p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-ink-100">
              {SELF_SERVICE_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.to}>
                    <Link to={link.to} className="group flex items-start gap-3 py-3 transition hover:text-teal-700">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400 group-hover:text-teal-600" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink-800 group-hover:text-teal-700">{link.label}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{link.detail}</span>
                      </span>
                      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="faq-legal-heading">
            <h2 id="faq-legal-heading" className="text-sm font-bold text-ink-900">Policies</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
              Learn more about how Nivasa works and how your data is handled.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/faq" className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:border-teal-300 hover:text-teal-700">FAQ</Link>
              <Link to="/privacy" className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:border-teal-300 hover:text-teal-700">Privacy</Link>
              <Link to="/terms" className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:border-teal-300 hover:text-teal-700">Terms</Link>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="contact-expectations-heading">
        <SectionHeading eyebrow="What to expect" title="After you send a message" description="We keep the process simple and transparent." />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: '1. Check your details', text: 'We validate your form so your message is clear and complete.' },
            { title: '2. Message received', text: 'Your message is sent to Nivasa and stored securely.' },
            { title: '3. Next steps', text: 'Use the FAQ and help pages for quick answers while we review your message.' },
          ].map((item) => (
            <div key={item.title} className="surface-muted rounded-2xl border border-ink-100 p-5">
              <h3 className="text-sm font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

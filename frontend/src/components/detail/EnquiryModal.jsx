import { useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { apiFetch } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
const EMPTY_FORM = { name: '', email: '', phone: '', message: '' };
/**
 * Sends an enquiry through the API. The receipt comes from the server response;
 * nothing is claimed as delivered until that response is received.
 */
export function EnquiryModal({ open, onClose, propertyTitle, listingId }) {
    const user = useAuthStore((state) => state.user);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [receipt, setReceipt] = useState(null);

    useEffect(() => {
        if (!open)
            return;
        setForm({
            ...EMPTY_FORM,
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        setErrors({});
        setError(null);
        setReceipt(null);
    }, [open, user?.name, user?.email, user?.phone]);

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
    async function onSubmit(event) {
        event.preventDefault();
        if (!listingId) {
            setError('No listing id is available for this record.');
            return;
        }
        const nextErrors = {};
        if (!form.name.trim())
            nextErrors.name = 'Enter your name.';
        if (!EMAIL_PATTERN.test(form.email.trim()))
            nextErrors.email = 'Enter a valid email address.';
        if (form.phone.trim() && !PHONE_PATTERN.test(form.phone.trim()))
            nextErrors.phone = 'Enter a valid Indian mobile number.';
        if (form.message.trim().length < 10)
            nextErrors.message = 'Write at least 10 characters.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length)
            return;
        setSubmitting(true);
        setError(null);
        try {
            const result = await apiFetch('/enquiries', {
                method: 'POST',
                body: JSON.stringify({
                    listingId,
                    listingTitle: propertyTitle,
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    message: form.message.trim(),
                }),
            });
            const record = result?.record || {};
            setReceipt({
                id: record.id ?? 'Not available',
                storage: result?.storage ?? record.persistence ?? record.storage ?? 'Not available',
                message: result?.message || '',
            });
        } catch (submitError) {
            setError(submitError.message || 'The enquiry could not be sent. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }
    return (<Modal open={open} onClose={onClose} title="Enquire about this property" description={`Send a message about “${propertyTitle || 'this listing'}”.`} size="md" footer={<div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>}>
      {receipt ? (<div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4" role="status">
          <p className="flex items-center gap-2 text-sm font-semibold text-teal-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden/>
            Enquiry sent
          </p>
          {receipt.message && <p className="mt-2 text-xs leading-relaxed text-teal-900">{receipt.message}</p>}
          <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-teal-800/70">Enquiry ID</dt>
              <dd className="mt-0.5 break-all font-semibold text-teal-950">{receipt.id}</dd>
            </div>
            <div>
              <dt className="text-teal-800/70">Storage mode</dt>
              <dd className="mt-0.5 break-all font-semibold text-teal-950">{receipt.storage}</dd>
            </div>
          </dl>
        </div>) : (<form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label="Your name" value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Your full name" autoComplete="name" error={errors.name}/>
          <Input label="Email address" type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder="you@example.com" autoComplete="email" error={errors.email}/>
          <Input label="Phone (optional)" type="tel" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="9876543210" autoComplete="tel" error={errors.phone}/>
          <div>
            <label htmlFor="enquiry-message" className="field-label">Message</label>
            <textarea id="enquiry-message" className={errors.message ? 'field-control min-h-[110px] resize-y border-red-400 focus:ring-red-500/15' : 'field-control min-h-[110px] resize-y'} value={form.message} onChange={(event) => setField('message', event.target.value)} placeholder="What would you like to know about this property?" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'enquiry-message-error' : undefined}/>
            {errors.message && (<p id="enquiry-message-error" role="alert" className="mt-1.5 text-xs text-red-600">
                {errors.message}
              </p>)}
          </div>
          {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
          <Button type="submit" variant="secondary" fullWidth loading={submitting} leftIcon={<Send className="h-4 w-4"/>}>
            Send enquiry
          </Button>
        </form>)}
    </Modal>);
}

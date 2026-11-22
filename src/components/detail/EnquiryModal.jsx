import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DemoDisclosure } from '@/components/common/DemoDisclosure';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/store/useToastStore';
/**
 * UI-only enquiry form. It never transmits data: demo listings have no
 * verified owner/provider contact to receive a message.
 */
export function EnquiryModal({ open, onClose, propertyTitle, }) {
    const pushToast = useToastStore((state) => state.push);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        if (open)
            return;
        setName('');
        setEmail('');
        setMessage('');
        setError(null);
        setSubmitted(false);
    }, [open]);
    const onSubmit = (event) => {
        event.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) {
            setError('Please add your name, an email address and a short message.');
            return;
        }
        setError(null);
        setSubmitted(true);
        pushToast('Demo enquiry only — nothing was sent. Verified owner/provider contact data is not connected.', 'info');
    };
    return (<Modal open={open} onClose={onClose} title="Demo enquiry" description={`Illustrative form for “${propertyTitle}”`} size="md" footer={<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-ink-500">No message leaves this browser in the demo phase.</p>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>}>
      {submitted ? (<div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4" role="status">
          <p className="flex items-center gap-2 text-sm font-semibold text-teal-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden/>
            Demo enquiry preview complete
          </p>
          <p className="mt-2 text-xs leading-relaxed text-teal-900">
            Your text stayed in this session. Nothing was sent to an owner, provider or server because verified
            contact data is not connected in this phase.
          </p>
        </div>) : (<form onSubmit={onSubmit} className="space-y-4" noValidate>
          <DemoDisclosure compact/>
          <Input label="Your name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter a name for this demo form" autoComplete="name"/>
          <Input label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email"/>
          <div>
            <label htmlFor="demo-enquiry-message" className="field-label">Message</label>
            <textarea id="demo-enquiry-message" className="field-control min-h-[110px] resize-y" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What would you like to know? (demo only)"/>
          </div>
          {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
          <Button type="submit" variant="secondary" fullWidth>Preview demo enquiry</Button>
        </form>)}
    </Modal>);
}

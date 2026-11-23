import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;

  useEffect(() => {
    if (!open)
      return undefined;
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const focusableItems = () => Array.from(dialog?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])
      .filter((element) => element.getAttribute('aria-hidden') !== 'true');

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab')
        return;
      const items = focusableItems();
      if (!items.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!dialog?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      }
      else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    (focusableItems()[0] ?? dialog)?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused))
        previouslyFocused.focus();
    };
  }, [open]);

  if (!open)
    return null;
  return (<div className="fixed inset-0 z-[1000] flex items-end justify-center p-0 sm:items-center sm:p-6">
    <button type="button" aria-label="Close dialog" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]"/>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-describedby={description ? descriptionId : undefined} tabIndex={-1} className={cn('relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-lift sm:rounded-3xl', size === 'sm' && 'sm:max-w-md', size === 'md' && 'sm:max-w-xl', size === 'lg' && 'sm:max-w-3xl')}>
      <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4 sm:px-6">
        <div>
          {title && <h2 id={titleId} className="font-display text-lg font-bold text-ink-900">{title}</h2>}
          {description && <p id={descriptionId} className="mt-1 text-xs text-ink-500">{description}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900">
          <X className="h-4 w-4"/>
        </button>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer && <div className="border-t border-ink-100 px-5 py-4 sm:px-6">{footer}</div>}
    </div>
  </div>);
}

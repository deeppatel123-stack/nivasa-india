import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[1100] flex w-[min(92vw,360px)] flex-col gap-2" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'warning' ? AlertTriangle : Info;
        return (
          <div key={toast.id} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-lift animate-fade-up">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
            <p className="flex-1 text-xs leading-relaxed text-ink-700">{toast.message}</p>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="text-ink-400 hover:text-ink-700">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

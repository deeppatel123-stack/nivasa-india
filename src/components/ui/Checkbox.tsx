import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-1.5 text-sm transition hover:text-ink-950',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span
        className={cn(
          'mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition',
          checked ? 'border-teal-600 bg-teal-600 text-white' : 'border-ink-300 bg-white',
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0">
        <span className="block font-medium leading-tight text-ink-800">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-500">{description}</span>}
      </span>
    </label>
  );
}

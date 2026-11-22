import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, options, placeholder, className, id, ...props },
  ref,
) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
        </label>
      )}
      <div className="relative">
        <select ref={ref} id={selectId} className={cn('field-control appearance-none pr-10', className)} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
});

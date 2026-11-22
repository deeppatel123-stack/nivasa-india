import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightSlot, containerClassName, className, id, ...props },
  ref,
) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('field-control', Boolean(leftIcon) && 'pl-10', Boolean(rightSlot) && 'pr-11', error && 'border-red-400 focus:ring-red-500/15', className)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

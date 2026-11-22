import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-ink-900 text-white hover:bg-ink-800 shadow-soft',
  secondary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-soft',
  outline: 'border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-sm gap-2',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false,
  className?: string,
): string {
  return cn(
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, fullWidth, loading, leftIcon, rightIcon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={buttonClasses(variant, size, fullWidth, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});

export interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  leftIcon,
  rightIcon,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, fullWidth, className)} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}

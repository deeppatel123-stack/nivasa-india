import { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/Input';

type PasswordInputProps = Omit<InputProps, 'type' | 'rightSlot'> & {
  /** Used only to make the visibility toggle label specific to the field. */
  visibilityLabel?: string;
};

/** Password field with an accessible, focus-preserving visibility toggle. */
export function PasswordInput({ id, label = 'Password', visibilityLabel = 'password', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = () => {
    setVisible((current) => !current);
    inputRef.current?.focus();
  };

  return (
    <Input
      {...props}
      ref={inputRef}
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={toggle}
          aria-label={`${visible ? 'Hide' : 'Show'} ${visibilityLabel}`}
          aria-pressed={visible}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      }
    />
  );
}

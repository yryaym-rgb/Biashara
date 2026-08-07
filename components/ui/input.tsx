import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface FieldWrapperProps {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrapper({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: FieldWrapperProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <label htmlFor={id} className="text-[15px] font-semibold text-ink">
          {label}
          {required ? (
            <span className="text-danger" aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const fieldBaseStyles = cn(
  'w-full rounded-button border border-border bg-bg px-4 text-[15px] text-ink',
  'placeholder:text-muted',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, label, hint, error, required, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    const input = (
      <input
        ref={ref}
        id={inputId}
        className={cn(
          fieldBaseStyles,
          'h-[46px]',
          error && 'border-danger',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        required={required}
        {...props}
      />
    );

    if (!label && !hint && !error) {
      return input;
    }

    return (
      <FieldWrapper
        id={inputId}
        label={label}
        hint={hint}
        error={error}
        required={required}
      >
        {input}
      </FieldWrapper>
    );
  },
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, hint, error, required, rows = 4, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const hintId = hint ? `${textareaId}-hint` : undefined;

    const textarea = (
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          fieldBaseStyles,
          'min-h-[46px] py-3',
          error && 'border-danger',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        required={required}
        {...props}
      />
    );

    if (!label && !hint && !error) {
      return textarea;
    }

    return (
      <FieldWrapper
        id={textareaId}
        label={label}
        hint={hint}
        error={error}
        required={required}
      >
        {textarea}
      </FieldWrapper>
    );
  },
);

Textarea.displayName = 'Textarea';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      id,
      label,
      hint,
      error,
      required,
      options,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;

    const select = (
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            fieldBaseStyles,
            'h-[46px] appearance-none pr-10',
            error && 'border-danger',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          required={required}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
    );

    if (!label && !hint && !error) {
      return select;
    }

    return (
      <FieldWrapper
        id={selectId}
        label={label}
        hint={hint}
        error={error}
        required={required}
      >
        {select}
      </FieldWrapper>
    );
  },
);

Select.displayName = 'Select';

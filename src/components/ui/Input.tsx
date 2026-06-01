import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-bold uppercase tracking-[.4px]"
            style={{ color: 'var(--muted)' }}
          >
            {label}
            {required && <span className="ml-0.5" style={{ color: 'var(--red)' }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full rounded-[7px] outline-none transition-colors',
            'border focus:border-[var(--accent)]',
            error ? 'border-[var(--red)]' : 'border-[var(--border)]',
            className,
          )}
          style={{ background: 'var(--surface2)', color: 'var(--text)', fontSize: '12px', padding: '7px 10px' }}
          {...props}
        />
        {hint && <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{hint}</p>}
        {error && (
          <p id={`${inputId}-error`} className="text-[10px]" style={{ color: 'var(--red)' }} role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

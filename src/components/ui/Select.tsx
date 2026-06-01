import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, required, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[11px] font-bold uppercase tracking-[.4px]"
            style={{ color: 'var(--muted)' }}
          >
            {label}
            {required && <span className="ml-0.5" style={{ color: 'var(--red)' }}>*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-required={required}
            aria-describedby={error ? `${selectId}-error` : undefined}
            className={cn(
              'w-full rounded-[7px] outline-none transition-colors appearance-none cursor-pointer',
              'border focus:border-[var(--accent)]',
              error ? 'border-[var(--red)]' : 'border-[var(--border)]',
              className,
            )}
            style={{ background: 'var(--surface2)', color: 'var(--text)', fontSize: '12px', padding: '7px 28px 7px 10px' }}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--muted)' }}
          />
        </div>
        {hint && <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{hint}</p>}
        {error && (
          <p id={`${selectId}-error`} className="text-[10px]" style={{ color: 'var(--red)' }} role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'

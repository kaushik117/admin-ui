import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  showCount?: boolean
  rows?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, showCount, maxLength, rows = 4, className, id, value, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className="text-[11px] font-bold uppercase tracking-[.4px]"
              style={{ color: 'var(--muted)' }}
            >
              {label}
              {required && <span className="ml-0.5" style={{ color: 'var(--red)' }}>*</span>}
            </label>
            {showCount && maxLength !== undefined && (
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-required={required}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full rounded-[7px] outline-none transition-colors resize-y',
            'border focus:border-[var(--accent)]',
            error ? 'border-[var(--red)]' : 'border-[var(--border)]',
            className,
          )}
          style={{ background: 'var(--surface2)', color: 'var(--text)', fontSize: '12px', lineHeight: '1.5', padding: '7px 10px' }}
          {...props}
        />
        {hint && <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{hint}</p>}
        {error && (
          <p id={`${textareaId}-error`} className="text-[10px]" style={{ color: 'var(--red)' }} role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

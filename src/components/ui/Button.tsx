import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
  icon?: ReactNode
}

const variantStyles = {
  primary: 'bg-[var(--accent)] text-white border border-transparent hover:opacity-[0.85]',
  ghost:   'bg-transparent text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--surface2)]',
  danger:  'bg-[rgba(239,68,68,0.1)] text-[var(--red)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.18)]',
}

const sizeStyle: Record<'sm' | 'md', CSSProperties> = {
  sm: { padding: '3px 8px',  fontSize: '10px', gap: '4px' },
  md: { padding: '6px 12px', fontSize: '12px', gap: '5px' },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, icon, children, className, style, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      style={{ ...sizeStyle[size], ...style }}
      className={cn(
        'inline-flex items-center justify-center rounded-[6px] font-semibold transition-all outline-none cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
        variantStyles[variant],
        (disabled ?? loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'

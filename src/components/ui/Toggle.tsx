import { cn } from '@/utils/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  id?: string
}

export function Toggle({ checked, onChange, label, disabled, id }: ToggleProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      {/* toggle-pill: 32×18px, 9px radius, matches prototype */}
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => { if (!disabled) onChange(!checked) }}
        className="relative outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1"
        style={{
          width: '32px',
          height: '18px',
          borderRadius: '9px',
          border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
          background: checked ? 'var(--accent)' : 'var(--surface3)',
          transition: 'background .2s, border-color .2s',
          flexShrink: 0,
        }}
      >
        {/* knob: 12×12px */}
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '16px' : '2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,.2)',
            transition: 'left .2s',
          }}
        />
      </button>
      {label && (
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{label}</span>
      )}
    </label>
  )
}

import { cn } from '@/utils/cn'
import type { SessionStatus } from '@/types/api'

type BadgeStatus = SessionStatus | 'active' | 'inactive' | 'INACTIVE'

interface BadgeProps {
  status: BadgeStatus
  className?: string
}

const config: Record<string, { label: string; cls: string }> = {
  ACTIVE:   { label: 'Active',   cls: 'bg-[color-mix(in_srgb,var(--green)_15%,transparent)] text-[var(--green)]' },
  active:   { label: 'Active',   cls: 'bg-[color-mix(in_srgb,var(--green)_15%,transparent)] text-[var(--green)]' },
  CLOSED:   { label: 'Closed',   cls: 'bg-[color-mix(in_srgb,var(--muted)_15%,transparent)] text-[var(--muted)]' },
  EXPIRED:  { label: 'Expired',  cls: 'bg-[color-mix(in_srgb,var(--yellow)_15%,transparent)] text-[var(--yellow)]' },
  INACTIVE: { label: 'Inactive', cls: 'bg-[color-mix(in_srgb,var(--muted)_15%,transparent)] text-[var(--muted)]' },
  inactive: { label: 'Inactive', cls: 'bg-[color-mix(in_srgb,var(--muted)_15%,transparent)] text-[var(--muted)]' },
}

export function Badge({ status, className }: BadgeProps) {
  const { label, cls } = config[status] ?? config['inactive']
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full uppercase tracking-wide',
        cls,
        className,
      )}
      style={{ padding: '2px 7px', fontSize: '10px', fontWeight: 700 }}
    >
      {label}
    </span>
  )
}

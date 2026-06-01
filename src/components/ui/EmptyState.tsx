import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {icon && (
        <div className="w-10 h-10 flex items-center justify-center opacity-40" style={{ color: 'var(--muted)' }}>
          {icon}
        </div>
      )}
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{title}</p>
      {description && (
        <p className="text-xs max-w-sm" style={{ color: 'var(--muted)' }}>{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 px-3 py-1.5 text-xs rounded-[var(--radius)] font-medium text-white hover:opacity-85 transition-opacity"
          style={{ background: 'var(--accent)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

import { memo } from 'react'

interface PriorityBadgeProps {
  priority: number
}

export const PriorityBadge = memo(function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white shrink-0"
      style={{ background: 'var(--accent)' }}
      title={`Priority ${priority}`}
    >
      {priority}
    </span>
  )
})

import { memo } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  valueColor?: string
}

export const StatCard = memo(function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  valueColor,
}: StatCardProps) {
  return (
    <div
      className="rounded-[var(--radius)] border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
        padding: '14px',
      }}
    >
      <div
        className="text-[10px] uppercase font-medium"
        style={{ color: 'var(--muted)', letterSpacing: '.4px' }}
      >
        {label}
      </div>
      <div
        className="font-bold"
        style={{ fontSize: '22px', margin: '5px 0 2px', color: valueColor ?? 'var(--text)' }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="text-[10px]"
          style={{ color: deltaPositive === false ? 'var(--red)' : 'var(--green)' }}
        >
          {delta}
        </div>
      )}
    </div>
  )
})

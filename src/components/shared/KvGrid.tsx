import type { ReactNode } from 'react'

interface KvItem {
  key: string
  value: ReactNode
  colour?: 'green' | 'red' | 'blue' | 'yellow'
}

interface KvGridProps {
  title: string
  icon?: string
  items: KvItem[]
}

const colourMap: Record<string, string> = {
  green:  'var(--green)',
  red:    'var(--red)',
  blue:   'var(--accent)',
  yellow: 'var(--yellow)',
}

export function KvGrid({ title, icon, items }: KvGridProps) {
  return (
    <div
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px',
      }}
    >
      <h5
        style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--accent)',
          textTransform: 'uppercase',
          letterSpacing: '.4px',
          marginBottom: '9px',
        }}
      >
        {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
        {title}
      </h5>

      {items.map((item) => (
        <div
          key={item.key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '5px',
            fontSize: '11px',
          }}
        >
          <span style={{ color: 'var(--muted)' }}>{item.key}</span>
          <span
            style={{
              fontWeight: 600,
              textAlign: 'right',
              maxWidth: '130px',
              wordBreak: 'break-all',
              color: item.colour ? colourMap[item.colour] : 'var(--text)',
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

interface TableSkeletonProps {
  columns?: number
  rows?: number
}

export function TableSkeleton({ columns = 6, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse" role="status" aria-label="Loading table">
      {/* Header row */}
      <div
        className="flex gap-4 px-4 h-10 items-center"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-2 rounded flex-1"
            style={{ background: 'var(--surface3)' }}
          />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-4 h-12 items-center"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-3 rounded flex-1"
              style={{ background: 'var(--surface2)', maxWidth: j === 0 ? '120px' : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

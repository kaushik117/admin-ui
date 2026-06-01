export function PageSkeleton() {
  return (
    <div className="p-7 flex flex-col gap-6 animate-pulse" role="status" aria-label="Loading page">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 rounded-[var(--radius)]" style={{ background: 'var(--surface3)' }} />
        <div className="h-7 w-32 rounded-[var(--radius)]" style={{ background: 'var(--surface3)' }} />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-[var(--radius)]"
            style={{ background: 'var(--surface3)' }}
          />
        ))}
      </div>
      {/* Table placeholder */}
      <div
        className="rounded-[var(--radius)]"
        style={{ background: 'var(--surface3)', height: 240 }}
      />
    </div>
  )
}

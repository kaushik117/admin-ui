import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState'
import { cn } from '@/utils/cn'

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  width?: string
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (row: T) => string | number
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string | undefined
}

function SkeletonRows({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} aria-hidden="true">
          {Array.from({ length: colCount }).map((_, j) => (
            <td key={j} style={{ padding: '10px' }}>
              <div
                className="h-3 rounded animate-pulse"
                style={{ background: 'var(--surface3)', width: j === 0 ? '60%' : '80%' }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function DataTable<T extends object>({
  columns,
  data,
  loading,
  emptyMessage = 'No data found',
  keyExtractor,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto w-full" role={loading ? 'status' : undefined} aria-label={loading ? 'Loading table' : undefined}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className={cn('text-left font-bold uppercase text-[10px]', col.className)}
                style={{ padding: '9px 10px', width: col.width, color: 'var(--muted)', letterSpacing: '.4px' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows colCount={columns.length} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-colors hover:bg-[var(--surface2)]',
                  onRowClick && 'cursor-pointer',
                  rowClassName?.(row),
                )}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {columns.map((col, i) => (
                  <td
                    key={i}
                    className={col.className}
                    style={{ padding: '10px', color: 'var(--text)', verticalAlign: 'middle' }}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as unknown as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

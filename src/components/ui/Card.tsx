import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md'
}

const paddingMap = { sm: '16px', md: '18px' }

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn('rounded-[var(--radius)] border', className)}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
        padding: paddingMap[padding],
      }}
    >
      {children}
    </div>
  )
}

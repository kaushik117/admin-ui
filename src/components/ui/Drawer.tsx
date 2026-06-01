import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface DrawerProps {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right'
  children: ReactNode
  width?: number | string
}

export function Drawer({ open, onClose, side = 'left', children, width = 280 }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const w = typeof width === 'number' ? `${width}px` : width

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          [side]: 0,
          zIndex: 41,
          width: w,
          background: 'var(--surface)',
          borderRight: side === 'left' ? '1px solid var(--border)' : undefined,
          borderLeft: side === 'right' ? '1px solid var(--border)' : undefined,
          transform: open
            ? 'translateX(0)'
            : side === 'left'
              ? 'translateX(-100%)'
              : 'translateX(100%)',
          transition: 'transform 0.2s ease',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </>,
    document.body,
  )
}

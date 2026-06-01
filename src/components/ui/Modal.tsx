import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeWidths = { sm: 'max-w-[400px]', md: 'max-w-[560px]', lg: 'max-w-[720px]' }

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    } else {
      const prev = triggerRef.current as HTMLElement | null
      prev?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative flex flex-col w-[94vw] overflow-hidden',
          'max-h-[88vh] rounded-[12px]',
          sizeWidths[size],
        )}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 40px rgba(0,0,0,.5)',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header — padding: 16px 20px */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
        >
          <h2
            id="modal-title"
            style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}
          >
            {title}
          </h2>
          {/* Close button: 28×28, surface2 bg, border */}
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="flex items-center justify-center rounded-[6px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] hover:text-[var(--text)]"
            style={{
              width: 28,
              height: 28,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body — padding: 20px */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
          {children}
        </div>

        {/* Footer — padding: 14px 20px, gap: 8px */}
        {footer && (
          <div
            className="flex items-center justify-end shrink-0"
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border)',
              gap: '8px',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

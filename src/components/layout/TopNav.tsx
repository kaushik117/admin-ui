import { useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useThemeStore } from '@/store/themeStore'
import type { PingResponse } from '@/types/api'
import { cn } from '@/utils/cn'

interface TopNavProps {
  onMenuClick?: () => void
}

export function TopNav({ onMenuClick }: TopNavProps = {}) {
  const { theme, toggle } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()

  const isChat  = location.pathname.startsWith('/chat')
  const isAdmin = location.pathname.startsWith('/admin')

  const { data: ping, isError } = useQuery({
    queryKey: ['ping'],
    queryFn: () => apiClient.get<PingResponse>('/api/v1/ping').then((r) => r.data),
    refetchInterval: 30_000,
    retry: false,
  })

  const isUp = !isError && ping?.status === 'UP'

  return (
    <header
      className="flex items-center shrink-0 border-b z-10"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        height: '52px',
        padding: '0 20px',
        gap: '8px',
        boxShadow: 'var(--shadow)',
        transition: 'background var(--transition), border-color var(--transition)',
      }}
    >
      {/* Logo — matches .logo */}
      <div
        className="select-none"
        style={{ fontWeight: 800, fontSize: '17px', color: 'var(--accent)', letterSpacing: '-.4px' }}
      >
        k2p<span style={{ color: 'var(--muted)', fontWeight: 500 }}>bot</span>
      </div>

      {/* Hamburger — admin sidebar toggle on tablet */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="xl:hidden flex items-center justify-center border rounded-[6px] transition-colors"
          style={{
            width: 32,
            height: 32,
            background: 'var(--surface2)',
            borderColor: 'var(--border)',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontSize: 16,
            marginLeft: '8px',
          }}
        >
          ☰
        </button>
      )}

      {/* Nav tabs — matches .nav-tabs / .nav-tab */}
      <nav style={{ display: 'flex', gap: '4px', marginLeft: '24px' }}>
        {[
          { label: '💬 Chat',  path: '/chat',  active: isChat },
          { label: '⚙️ Admin', path: '/admin', active: isAdmin },
        ].map(({ label, path, active }) => (
          <button
            key={path}
            onClick={() => { void navigate(path) }}
            className={cn(
              'cursor-pointer border-none transition-all',
              !active && 'hover:text-[var(--text)]',
            )}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--muted)',
            }}
            onMouseEnter={(e) => {
              if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'
            }}
            onMouseLeave={(e) => {
              if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ marginLeft: 'auto' }} />

      {/* Right items — matches .nav-right (gap: 14px) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

        {/* Status pill — matches .status-pill */}
        <div
          className="hidden lg:flex items-center"
          style={{
            gap: '6px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '11px',
            color: 'var(--muted)',
          }}
        >
          {/* dot — matches .dot-green */}
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isUp ? 'var(--green)' : 'var(--red)',
              flexShrink: 0,
              display: 'inline-block',
            }}
          />
          localhost:8080
        </div>

        {/* Theme toggle — matches .theme-toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="flex items-center cursor-pointer border-none transition-all"
          style={{
            gap: '6px',
            padding: '5px 10px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            fontSize: '12px',
            color: 'var(--muted)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.borderColor = 'var(--accent)'
            el.style.color = 'var(--text)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.borderColor = 'var(--border)'
            el.style.color = 'var(--muted)'
          }}
        >
          {/* theme-icon — matches .theme-icon { font-size: 14px } */}
          <span style={{ fontSize: '14px' }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span className="hidden lg:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>

        {/* Avatar — matches .avatar */}
        <div
          className="select-none"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          KP
        </div>
      </div>
    </header>
  )
}

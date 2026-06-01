import { useQuery } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import { assistantsApi } from '@/api/admin/assistants'
import { useChatStore } from '@/store/chatStore'
import { cn } from '@/utils/cn'

interface SessionEntry {
  id: string
  assistantCode: string
  createdAt: string
}

interface Props {
  sessions: SessionEntry[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
}

export function SessionSidebar({ sessions, activeSessionId, onSelectSession }: Props) {
  const { assistantCode, setAssistant, newSession } = useChatStore()

  const { data: assistants = [] } = useQuery({
    queryKey: ['assistants', 'active'],
    queryFn: () => assistantsApi.list({ active: true }),
    staleTime: 60_000,
  })

  return (
    <div
      className="flex flex-col h-full border-r"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Assistant selector */}
      <div className="border-b" style={{ padding: '10px 12px', borderColor: 'var(--border)' }}>
        <label
          className="block uppercase"
          style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '3px', letterSpacing: '.5px', fontWeight: 700 }}
        >
          Assistant
        </label>
        <select
          className="w-full appearance-none outline-none transition-colors focus:border-[var(--accent)]"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            borderRadius: '6px',
            padding: '6px 8px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
          value={assistantCode}
          onChange={(e) => setAssistant(e.target.value)}
        >
          <option value="">Select assistant…</option>
          {assistants.map((a) => (
            <option key={a.assistantCode} value={a.assistantCode}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions header */}
      <div
        className="flex items-center justify-between border-b"
        style={{ padding: '10px 12px', borderColor: 'var(--border)' }}
      >
        <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          Sessions
        </h3>
        <button
          className="flex items-center gap-1 transition-opacity hover:opacity-85"
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: assistantCode ? 'pointer' : 'not-allowed',
            opacity: assistantCode ? 1 : 0.4,
          }}
          onClick={() => { if (assistantCode) newSession() }}
          disabled={!assistantCode}
        >
          + New
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '6px' }}>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
            <MessageSquare size={24} style={{ color: 'var(--muted)' }} />
            <p style={{ fontSize: '10px', color: 'var(--muted)' }}>No sessions yet</p>
          </div>
        ) : (
          sessions.map((s) => {
            const active = activeSessionId === s.id
            return (
              <button
                key={s.id}
                className={cn(
                  'w-full flex flex-col text-left transition-colors',
                  !active && 'hover:bg-[var(--surface2)]',
                )}
                style={{
                  padding: '9px 10px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  background: active ? 'var(--surface3)' : undefined,
                }}
                onClick={() => onSelectSession(s.id)}
              >
                <span
                  className="truncate"
                  style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}
                >
                  {s.id}
                </span>
                <div className="flex items-center gap-1" style={{ marginTop: '2px' }}>
                  <span
                    className="rounded"
                    style={{ fontSize: '9px', padding: '1px 5px', fontWeight: 700, background: 'rgba(34,197,94,.15)', color: 'var(--green)' }}
                  >
                    ACTIVE
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{s.assistantCode}</span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

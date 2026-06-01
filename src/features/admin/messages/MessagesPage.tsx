import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { sessionsApi } from '@/api/sessions'
import { formatDate, truncate } from '@/utils/formatters'
import type { MessageDto } from '@/types/api'
import type { Column } from '@/components/ui/DataTable'

const roleCfg: Record<string, { label: string; style: React.CSSProperties }> = {
  USER: {
    label: 'User',
    style: {
      background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
      color: 'var(--accent)',
    },
  },
  ASSISTANT: {
    label: 'Assistant',
    style: {
      background: 'color-mix(in srgb, var(--green) 12%, transparent)',
      color: 'var(--green)',
    },
  },
  SYSTEM: {
    label: 'System',
    style: {
      background: 'color-mix(in srgb, var(--muted) 12%, transparent)',
      color: 'var(--muted)',
    },
  },
}

function RoleBadge({ role }: { role?: string | null }) {
  const cfg = roleCfg[role?.toUpperCase() ?? ''] ?? roleCfg['SYSTEM']
  return (
    <span
      style={{
        ...cfg.style,
        fontSize: '10px',
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: '10px',
        textTransform: 'uppercase',
        letterSpacing: '.4px',
        display: 'inline-block',
      }}
    >
      {cfg.label}
    </span>
  )
}

function CodeCell({ value }: { value?: string | null }) {
  if (!value) return <span style={{ color: 'var(--muted)' }}>—</span>
  return (
    <code style={{ color: 'var(--text)' }}>
      {truncate(value, 28)}
    </code>
  )
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams()

  const [sessionIdInput, setSessionIdInput] = useState(searchParams.get('sessionId') ?? '')
  const [limitInput, setLimitInput] = useState('50')
  const [activeSessionId, setActiveSessionId] = useState(searchParams.get('sessionId') ?? '')
  const [activeLimit, setActiveLimit] = useState(50)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['session-messages', activeSessionId, activeLimit],
    queryFn: () => sessionsApi.getMessages(activeSessionId, activeLimit),
    enabled: !!activeSessionId,
    staleTime: 30_000,
  })

  function handleLoad() {
    const limit = parseInt(limitInput, 10)
    setActiveSessionId(sessionIdInput.trim())
    setActiveLimit(isNaN(limit) || limit < 1 ? 50 : Math.min(limit, 500))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLoad()
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
    fontSize: '12px',
    padding: '6px 10px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '6px',
    outline: 'none',
  }

  const columns: Column<MessageDto>[] = [
    {
      header: 'Message ID',
      accessor: (row) => <CodeCell value={row.messageId} />,
      width: '220px',
    },
    {
      header: 'Role',
      accessor: (row) => <RoleBadge role={row.role} />,
      width: '90px',
    },
    {
      header: 'Content',
      accessor: (row) => (
        <span
          title={row.content ?? undefined}
          style={{ color: row.content ? 'var(--text)' : 'var(--muted)', lineHeight: '1.4' }}
        >
          {row.content ? truncate(row.content, 100) : '—'}
        </span>
      ),
    },
    {
      header: 'Model',
      accessor: (row) => (
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
          {row.selectedModel ?? '—'}
        </span>
      ),
      width: '160px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Citations',
      accessor: (row) => (
        <span style={{ color: row.hasCitations ? 'var(--green)' : 'var(--muted)' }}>
          {row.hasCitations ? '✓' : '—'}
        </span>
      ),
      width: '80px',
    },
    {
      header: 'Finish',
      accessor: (row) => (
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
          {row.finishReason ?? '—'}
        </span>
      ),
      width: '90px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
          {formatDate(row.timestamp)}
        </span>
      ),
      width: '160px',
      className: 'hidden lg:table-cell',
    },
  ]

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          Message History
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Browse and inspect all messages within a chat session.
        </p>
      </div>

      {/* Session loader card */}
      <div
        className="rounded-[var(--radius)] border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
          padding: '16px 18px',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--muted)',
            letterSpacing: '.4px',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          Load Session
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {/* Session ID */}
          <div className="flex flex-col gap-1 flex-1" style={{ minWidth: '240px' }}>
            <label
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '.4px',
              }}
            >
              Session ID
            </label>
            <input
              value={sessionIdInput}
              onChange={(e) => setSessionIdInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter session ID…"
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>

          {/* Limit */}
          <div className="flex flex-col gap-1">
            <label
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '.4px',
              }}
            >
              Limit
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ ...inputStyle, width: '80px' }}
            />
          </div>

          <Button onClick={handleLoad} loading={isFetching}>
            Load
          </Button>
        </div>
      </div>

      {/* Messages table card */}
      {(activeSessionId || data) && (
        <div
          className="rounded-[var(--radius)] border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
            padding: '18px',
          }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between flex-wrap gap-2"
            style={{ marginBottom: '14px' }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📨 Messages
              {data?.sessionId && (
                <code
                  style={{
                    fontSize: '11px',
                    fontWeight: 400,
                    color: 'var(--muted)',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {data.sessionId}
                </code>
              )}
            </span>
            <div className="flex items-center gap-3">
              {data && (
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {data.messages.length} message{data.messages.length !== 1 ? 's' : ''}
                  {data.page?.nextCursor && ' · more available'}
                </span>
              )}
              {data && (
                <Button size="sm" variant="ghost" onClick={() => refetch()} loading={isFetching}>
                  Refresh
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable<MessageDto>
              columns={columns}
              data={data?.messages ?? []}
              loading={isLoading && isFetching}
              emptyMessage="No messages found for this session."
              keyExtractor={(row) => row.messageId ?? row.timestamp ?? Math.random().toString()}
            />
          </div>

          {/* Next cursor hint */}
          {data?.page?.nextCursor && (
            <div
              style={{
                marginTop: '12px',
                fontSize: '11px',
                color: 'var(--muted)',
                textAlign: 'center',
              }}
            >
              More messages available — increase the limit to load more.
            </div>
          )}
        </div>
      )}
    </>
  )
}

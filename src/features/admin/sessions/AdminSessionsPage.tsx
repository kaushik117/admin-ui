import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useAdminSessions, useCloseSession, useDeleteSession } from './hooks/useAdminSessions'
import { useAssistants } from '@/features/admin/assistants/hooks/useAssistants'
import { formatDate, truncate } from '@/utils/formatters'
import type { AdminSessionSummary, SessionStatus } from '@/types/api'
import type { Column } from '@/components/ui/DataTable'

function CodeCell({ value }: { value?: string | null }) {
  if (!value) return <span style={{ color: 'var(--muted)' }}>—</span>
  return (
    <code style={{ color: 'var(--text)' }}>
      {value}
    </code>
  )
}

export default function AdminSessionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Draft filter state (applied on "Apply Filters" click)
  const [draftTenantId, setDraftTenantId] = useState(searchParams.get('tenantId') ?? '')
  const [draftUserId, setDraftUserId] = useState(searchParams.get('userId') ?? '')
  const [draftAssistantCode, setDraftAssistantCode] = useState(searchParams.get('assistantCode') ?? '')
  const [draftStatus, setDraftStatus] = useState(searchParams.get('status') ?? '')
  const [draftFrom, setDraftFrom] = useState(searchParams.get('from') ?? '')
  const [draftTo, setDraftTo] = useState(searchParams.get('to') ?? '')

  // Active (applied) filter state — derived from URL params
  const activeParams = {
    tenantId: searchParams.get('tenantId') || undefined,
    userId: searchParams.get('userId') || undefined,
    assistantCode: searchParams.get('assistantCode') || undefined,
    status: (searchParams.get('status') as SessionStatus) || undefined,
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
  }

  const { data: sessions, isLoading } = useAdminSessions(activeParams)
  const { data: assistants } = useAssistants({ active: undefined })
  const closeSession = useCloseSession()
  const deleteSession = useDeleteSession()

  const [closeTarget, setCloseTarget] = useState<AdminSessionSummary | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<AdminSessionSummary | undefined>()

  function handleApplyFilters() {
    const params: Record<string, string> = {}
    if (draftTenantId) params.tenantId = draftTenantId
    if (draftUserId) params.userId = draftUserId
    if (draftAssistantCode) params.assistantCode = draftAssistantCode
    if (draftStatus) params.status = draftStatus
    if (draftFrom) params.from = draftFrom
    if (draftTo) params.to = draftTo
    setSearchParams(params, { replace: true })
  }

  function handleClearFilters() {
    setDraftTenantId('')
    setDraftUserId('')
    setDraftAssistantCode('')
    setDraftStatus('')
    setDraftFrom('')
    setDraftTo('')
    setSearchParams({}, { replace: true })
  }

  function handleCloseConfirm() {
    if (!closeTarget?.sessionId) return
    closeSession.mutate(closeTarget.sessionId, {
      onSuccess: () => setCloseTarget(undefined),
    })
  }

  function handleDeleteConfirm() {
    if (!deleteTarget?.sessionId) return
    deleteSession.mutate(deleteTarget.sessionId, {
      onSuccess: () => setDeleteTarget(undefined),
    })
  }

  const inputStyle = {
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

  const columns: Column<AdminSessionSummary>[] = [
    {
      header: 'Session ID',
      accessor: (row) => <CodeCell value={row.sessionId} />,
      width: '200px',
    },
    {
      header: 'Title',
      accessor: (row) => (
        <span
          title={row.title ?? undefined}
          style={{ color: row.title ? 'var(--text)' : 'var(--muted)' }}
        >
          {row.title ? truncate(row.title, 40) : '—'}
        </span>
      ),
    },
    {
      header: 'Assistant',
      accessor: (row) => <CodeCell value={row.assistantCode} />,
      width: '140px',
    },
    {
      header: 'User',
      accessor: (row) => (
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>{row.userId ?? '—'}</span>
      ),
      width: '130px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Tenant',
      accessor: (row) => (
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>{row.tenantId ?? '—'}</span>
      ),
      width: '110px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Status',
      accessor: (row) => <Badge status={row.status ?? 'ACTIVE'} />,
      width: '90px',
    },
    {
      header: 'Messages',
      accessor: (row) => (
        <span style={{ color: 'var(--text)', fontWeight: 600 }}>
          {row.messageCount ?? '—'}
        </span>
      ),
      width: '80px',
    },
    {
      header: 'Last Message',
      accessor: (row) => (
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
          {formatDate(row.lastMessageAt)}
        </span>
      ),
      width: '160px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Actions',
      width: '200px',
      accessor: (row) => (
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/admin/messages?sessionId=${row.sessionId ?? ''}`)}
          >
            Messages
          </Button>
          {row.status !== 'CLOSED' && row.status !== 'EXPIRED' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCloseTarget(row)}
              loading={closeSession.isPending && closeTarget?.sessionId === row.sessionId}
            >
              Close
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteTarget(row)}
            loading={deleteSession.isPending && deleteTarget?.sessionId === row.sessionId}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const hasActiveFilters = Object.values(activeParams).some(Boolean)

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>Sessions</h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Search, inspect, close, and delete chat sessions across all users and tenants.
        </p>
      </div>

      {/* Filter card */}
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
          Filters
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          {/* Tenant ID */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
              Tenant ID
            </label>
            <input
              value={draftTenantId}
              onChange={(e) => setDraftTenantId(e.target.value)}
              placeholder="e.g. default"
              style={{ ...inputStyle, width: '150px' }}
            />
          </div>

          {/* User ID */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
              User ID
            </label>
            <input
              value={draftUserId}
              onChange={(e) => setDraftUserId(e.target.value)}
              placeholder="e.g. user-123"
              style={{ ...inputStyle, width: '150px' }}
            />
          </div>

          {/* Assistant Code */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
              Assistant
            </label>
            <select
              value={draftAssistantCode}
              onChange={(e) => setDraftAssistantCode(e.target.value)}
              style={{ ...inputStyle, width: '160px', cursor: 'pointer' }}
            >
              <option value="">All Assistants</option>
              {assistants?.map((a) => (
                <option key={a.assistantCode} value={a.assistantCode}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
              Status
            </label>
            <select
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
              style={{ ...inputStyle, width: '130px', cursor: 'pointer' }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
              From
            </label>
            <input
              type="date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
              To
            </label>
            <input
              type="date"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sessions table card */}
      <div
        className="rounded-[var(--radius)] border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
          padding: '18px',
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: '14px' }}
        >
          <span
            style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            💬 Sessions
            {hasActiveFilters && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                Filtered
              </span>
            )}
          </span>
          {sessions && (
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <DataTable<AdminSessionSummary>
            columns={columns}
            data={sessions ?? []}
            loading={isLoading}
            emptyMessage="No sessions match your filters. Try adjusting the filter criteria above."
            keyExtractor={(row) => row.sessionId ?? ''}
          />
        </div>
      </div>

      {/* Close confirmation */}
      <ConfirmModal
        open={!!closeTarget}
        onClose={() => setCloseTarget(undefined)}
        onConfirm={handleCloseConfirm}
        title="Close session?"
        message={`Session "${closeTarget?.sessionId}" will be marked as CLOSED. No further messages can be appended.`}
        confirmLabel="Close Session"
        loading={closeSession.isPending}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={handleDeleteConfirm}
        title="Delete session permanently?"
        message={`Session "${deleteTarget?.sessionId}" and all its messages will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteSession.isPending}
      />
    </>
  )
}

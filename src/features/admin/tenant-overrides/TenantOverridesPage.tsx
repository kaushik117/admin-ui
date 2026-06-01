import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { TenantOverrideForm } from './TenantOverrideForm'
import { useTenantOverrides, useDeleteTenantOverride } from './hooks/useTenantOverrides'
import { useAssistants } from '@/features/admin/assistants/hooks/useAssistants'
import { formatDate } from '@/utils/formatters'
import type { TenantOverrideDto } from '@/types/api'
import type { Column } from '@/components/ui/DataTable'

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  MODEL_ROUTE:    { bg: 'rgba(91,110,245,.12)',  color: 'var(--accent)' },
  RAG_POLICY:     { bg: 'rgba(34,197,94,.12)',   color: 'var(--green)' },
  MEMORY_POLICY:  { bg: 'rgba(245,158,11,.12)',  color: 'var(--yellow)' },
  TOOL_POLICY:    { bg: 'rgba(91,110,245,.12)',  color: 'var(--accent2)' },
  SAFETY_POLICY:  { bg: 'rgba(239,68,68,.12)',   color: 'var(--red)' },
  RESPONSE_POLICY:{ bg: 'rgba(91,110,245,.12)',  color: 'var(--accent)' },
}

const SELECT_STYLE: React.CSSProperties = {
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '5px 9px',
  color: 'var(--text)',
  fontSize: '12px',
  outline: 'none',
}

export default function TenantOverridesPage() {
  const [tenantFilter, setTenantFilter] = useState('')
  const [assistantFilter, setAssistantFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TenantOverrideDto | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<TenantOverrideDto | undefined>()

  const { data: overrides, isLoading } = useTenantOverrides({
    tenantId: tenantFilter || undefined,
    assistantCode: assistantFilter || undefined,
  })
  const { data: assistants } = useAssistants()
  const deleteOverride = useDeleteTenantOverride()

  function handleEdit(override: TenantOverrideDto) {
    setEditTarget(override)
    setFormOpen(true)
  }

  function handleNew() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditTarget(undefined)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget?.id) return
    deleteOverride.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(undefined),
    })
  }

  const columns: Column<TenantOverrideDto>[] = [
    {
      header: 'Tenant',
      accessor: (row) => (
        <code style={{ color: 'var(--text)', fontSize: '11px' }}>{row.tenantId ?? '—'}</code>
      ),
      width: '160px',
    },
    {
      header: 'Assistant',
      accessor: (row) => (
        <code style={{ color: 'var(--accent)', fontSize: '11px' }}>{row.assistantCode ?? '—'}</code>
      ),
      width: '150px',
    },
    {
      header: 'Override Type',
      accessor: (row) => {
        const tc = TYPE_COLORS[row.overrideType ?? ''] ?? { bg: 'var(--surface3)', color: 'var(--muted)' }
        return (
          <span
            style={{
              display: 'inline-block',
              background: tc.bg,
              color: tc.color,
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 6px',
            }}
          >
            {row.overrideType ?? '—'}
          </span>
        )
      },
      width: '140px',
    },
    {
      header: 'Payload Preview',
      accessor: (row) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'var(--muted)',
            display: 'block',
            maxWidth: '180px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={row.overridePayloadJson ?? ''}
        >
          {row.overridePayloadJson ?? '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <Badge status={row.active ? 'active' : 'inactive'} />,
      width: '90px',
    },
    {
      header: 'Updated',
      accessor: (row) => (
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>{formatDate(row.updatedAt)}</span>
      ),
      width: '150px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Actions',
      width: '130px',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteTarget(row)}
            loading={deleteOverride.isPending && deleteTarget?.id === row.id}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      {/* Page header */}
      <div className="admin-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          Tenant Overrides
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Per-tenant config overrides applied on top of the base assistant config. Active overrides win at resolution time.
        </p>
      </div>

      {/* Single card */}
      <div
        className="rounded-[var(--radius)] border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
          padding: '18px',
          marginBottom: '14px',
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: '14px' }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            🏢 Override Registry
          </span>
          <Button onClick={handleNew}>+ Add Override</Button>
        </div>

        {/* Filter row — inline below card-header, no labels */}
        <div style={{ display: 'flex', gap: '7px', marginBottom: '12px' }}>
          <input
            type="text"
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            placeholder="All Tenants"
            aria-label="Filter by tenant ID"
            style={SELECT_STYLE}
          />
          <select
            value={assistantFilter}
            onChange={(e) => setAssistantFilter(e.target.value)}
            aria-label="Filter by assistant"
            style={SELECT_STYLE}
          >
            <option value="">All Assistants</option>
            {(assistants ?? []).map((a) => (
              <option key={a.assistantCode} value={a.assistantCode}>
                {a.assistantCode}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <DataTable<TenantOverrideDto>
            columns={columns}
            data={overrides ?? []}
            loading={isLoading}
            emptyMessage="No tenant overrides found. Click '+ Add Override' to create one."
            keyExtractor={(row) => row.id ?? 0}
            rowClassName={(row) => (row.active === false ? 'opacity-60' : undefined)}
          />
        </div>
      </div>

      <TenantOverrideForm open={formOpen} onClose={handleFormClose} override={editTarget} />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={handleDeleteConfirm}
        title={`Delete override for "${deleteTarget?.tenantId}"?`}
        message={`This will permanently delete the "${deleteTarget?.overrideType}" override for tenant "${deleteTarget?.tenantId}" / assistant "${deleteTarget?.assistantCode}". This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteOverride.isPending}
      />
    </>
  )
}

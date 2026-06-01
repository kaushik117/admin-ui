import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { ModelRouteForm } from './ModelRouteForm'
import { useModelRoutes, useDeleteModelRoute } from './hooks/useModelRoutes'
import { useAssistants } from '@/features/admin/assistants/hooks/useAssistants'
import { formatDate } from '@/utils/formatters'
import type { ModelRouteDto } from '@/types/api'
import type { Column } from '@/components/ui/DataTable'

const ROUTE_TYPE_LABELS: Record<string, string> = {
  SIMPLE: 'Simple',
  KNOWLEDGE_QA: 'Knowledge QA',
  TOOL_HEAVY: 'Tool Heavy',
  LONG_CONTEXT: 'Long Context',
  STRUCTURED_OUTPUT: 'Structured Output',
}

function conditionsSummary(row: ModelRouteDto): string {
  const parts: string[] = []
  if (row.minPromptLength != null) parts.push(`len ≥ ${row.minPromptLength}`)
  if (row.maxPromptLength != null) parts.push(`len ≤ ${row.maxPromptLength}`)
  if (row.ragEnabledOnly) parts.push('RAG only')
  if (row.toolsRequiredOnly) parts.push('Tools only')
  if (row.structuredOutputOnly) parts.push('Structured')
  return parts.length > 0 ? parts.join(', ') : '—'
}

export default function ModelRoutesPage() {
  const [selectedAssistant, setSelectedAssistant] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRoute, setEditRoute] = useState<ModelRouteDto | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ModelRouteDto | undefined>()

  const { data: assistants } = useAssistants()
  const { data: routes, isLoading } = useModelRoutes(selectedAssistant)
  const del = useDeleteModelRoute(selectedAssistant)

  function handleNew() {
    setEditRoute(undefined)
    setFormOpen(true)
  }

  function handleEdit(row: ModelRouteDto) {
    setEditRoute(row)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditRoute(undefined)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget?.id) return
    del.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(undefined),
    })
  }

  const columns: Column<ModelRouteDto>[] = [
    {
      header: 'Priority',
      accessor: (row) => <PriorityBadge priority={row.priority ?? 0} />,
      width: '80px',
    },
    {
      header: 'Route Name',
      accessor: (row) => (
        <code
          className="font-mono"
          style={{ fontSize: '11px', color: 'var(--text)' }}
        >
          {row.routeName ?? '—'}
        </code>
      ),
      width: '160px',
    },
    {
      header: 'Type',
      accessor: (row) => (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
          style={{
            background: 'var(--surface3)',
            color: 'var(--accent)',
            whiteSpace: 'nowrap',
          }}
        >
          {ROUTE_TYPE_LABELS[row.routeType ?? ''] ?? row.routeType ?? '—'}
        </span>
      ),
      width: '140px',
    },
    {
      header: 'Conditions',
      accessor: (row) => (
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
          {conditionsSummary(row)}
        </span>
      ),
      width: '180px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Provider',
      accessor: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--text)' }}>
          {row.targetProvider ?? '—'}
        </span>
      ),
      width: '110px',
    },
    {
      header: 'Model',
      accessor: (row) => (
        <code style={{ fontSize: '11px', color: 'var(--text)' }}>
          {row.targetModel ?? '—'}
        </code>
      ),
      width: '140px',
    },
    {
      header: 'Max Tokens',
      accessor: (row) => (
        <span style={{ fontSize: '12px', color: row.maxInputTokens != null ? 'var(--text)' : 'var(--muted)' }}>
          {row.maxInputTokens != null ? row.maxInputTokens.toLocaleString() : '—'}
        </span>
      ),
      width: '100px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Temp',
      accessor: (row) => (
        <span style={{ fontSize: '12px', color: row.temperature != null ? 'var(--text)' : 'var(--muted)' }}>
          {row.temperature != null ? row.temperature.toFixed(1) : '—'}
        </span>
      ),
      width: '70px',
      className: 'hidden lg:table-cell',
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
      width: '140px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Actions',
      width: '120px',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteTarget(row)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const hasAssistant = !!selectedAssistant

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          Model Routes
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Priority-ordered routing rules per assistant. The first matching route determines
          which model and provider handle each request.
        </p>
      </div>

      {/* Card */}
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
          <div className="flex items-center gap-2 flex-wrap">
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text)',
                marginRight: '8px',
              }}
            >
              🗺️ Routes
            </span>
            <select
              value={selectedAssistant}
              onChange={(e) => setSelectedAssistant(e.target.value)}
              aria-label="Select assistant"
              className="rounded-[6px] border outline-none cursor-pointer transition-colors focus:border-[var(--accent)]"
              style={{
                background: 'var(--surface2)',
                borderColor: 'var(--border)',
                color: selectedAssistant ? 'var(--text)' : 'var(--muted)',
                fontSize: '12px',
                padding: '6px 10px',
                minWidth: '200px',
              }}
            >
              <option value="">— Select an assistant —</option>
              {assistants?.map((a) => (
                <option key={a.assistantCode} value={a.assistantCode}>
                  {a.name} ({a.assistantCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {hasAssistant && routes && (
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {routes.length} route{routes.length !== 1 ? 's' : ''}
              </span>
            )}
            <Button onClick={handleNew} disabled={!hasAssistant}>
              + Add Route
            </Button>
          </div>
        </div>

        {/* Prompt when no assistant selected */}
        {!hasAssistant && (
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: '48px 0', color: 'var(--muted)', fontSize: '13px' }}
          >
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>🗺️</span>
            <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
              Select an assistant
            </p>
            <p>Choose an assistant above to view and manage its model routing rules.</p>
          </div>
        )}

        {/* Table */}
        {hasAssistant && (
          <div className="overflow-x-auto">
            <DataTable<ModelRouteDto>
              columns={columns}
              data={routes ?? []}
              loading={isLoading}
              emptyMessage="No routes yet. Click '+ Add Route' to create the first routing rule."
              keyExtractor={(row) => String(row.id ?? row.routeName ?? Math.random())}
              rowClassName={(row) => (row.active === false ? 'opacity-60' : undefined)}
            />
          </div>
        )}
      </div>

      {/* Create / edit form */}
      {hasAssistant && (
        <ModelRouteForm
          open={formOpen}
          onClose={handleFormClose}
          assistantCode={selectedAssistant}
          route={editRoute}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={handleDeleteConfirm}
        title={`Delete route "${deleteTarget?.routeName}"?`}
        message={`This will permanently remove the routing rule "${deleteTarget?.routeName ?? ''}" for assistant "${selectedAssistant}". This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={del.isPending}
      />
    </>
  )
}

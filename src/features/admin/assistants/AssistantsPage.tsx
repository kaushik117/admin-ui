import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { AssistantForm } from './AssistantForm'
import {
  useAssistants,
  useActivateAssistant,
  useDeactivateAssistant,
} from './hooks/useAssistants'
import { formatDate, truncate } from '@/utils/formatters'
import type { AssistantSummary } from '@/types/api'
import type { Column } from '@/components/ui/DataTable'

export default function AssistantsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [tenantFilter, setTenantFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AssistantSummary | undefined>()
  const [deactivateTarget, setDeactivateTarget] = useState<AssistantSummary | undefined>()

  const queryParams = {
    active: activeFilter === '' ? undefined : activeFilter === 'true',
    tenantScope: tenantFilter || undefined,
  }

  const { data: assistants, isLoading } = useAssistants(queryParams)
  const activate = useActivateAssistant()
  const deactivate = useDeactivateAssistant()

  function handleEdit(assistant: AssistantSummary) {
    setEditTarget(assistant)
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

  function handleActivate(assistant: AssistantSummary) {
    activate.mutate(assistant.assistantCode)
  }

  function handleDeactivateConfirm() {
    if (!deactivateTarget) return
    deactivate.mutate(deactivateTarget.assistantCode, {
      onSuccess: () => setDeactivateTarget(undefined),
    })
  }

  const columns: Column<AssistantSummary>[] = [
    {
      header: 'Code',
      accessor: (row) => (
        <code
          style={{ color: 'var(--text)' }}
        >
          {row.assistantCode}
        </code>
      ),
      width: '170px',
    },
    { header: 'Name', accessor: 'name' },
    {
      header: 'Tenant Scope',
      accessor: (row) => (
        <span style={{ color: row.tenantScope ? 'var(--text)' : 'var(--muted)' }}>
          {row.tenantScope ?? '—'}
        </span>
      ),
      width: '140px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Config v',
      accessor: (row) => <span style={{ color: 'var(--muted)' }}>{row.configVersion ?? '—'}</span>,
      width: '90px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Status',
      accessor: (row) => <Badge status={row.active ? 'active' : 'inactive'} />,
      width: '90px',
    },
    {
      header: 'Last Updated',
      accessor: (row) => <span style={{ color: 'var(--muted)' }}>{formatDate(row.updatedAt)}</span>,
      width: '160px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Actions',
      width: '175px',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          {row.active ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setDeactivateTarget(row)}
              loading={deactivate.isPending && deactivateTarget?.assistantCode === row.assistantCode}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleActivate(row)}
              loading={activate.isPending && activate.variables === row.assistantCode}
            >
              Activate
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      {/* Page header */}
      <div className="admin-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>Assistants</h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Master registry of all assistants on the platform. Each assistant anchors a full config tree (prompts, routing, policies).
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
          marginBottom: '14px',
        }}
      >
        {/* Card header — filters left, action right */}
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
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                marginRight: '8px',
              }}
            >
              🤖 All Assistants
            </span>
            {/* Status filter */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              aria-label="Filter by status"
              className="rounded-[6px] border outline-none cursor-pointer transition-colors focus:border-[var(--accent)]"
              style={{
                background: 'var(--surface2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                fontSize: '12px',
                padding: '6px 10px',
              }}
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            {/* Tenant filter */}
            <input
              type="text"
              placeholder="Tenant scope…"
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              aria-label="Filter by tenant scope"
              className="rounded-[6px] border outline-none transition-colors focus:border-[var(--accent)]"
              style={{
                background: 'var(--surface2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                fontSize: '12px',
                padding: '6px 10px',
                width: '160px',
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            {assistants && (
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {assistants.length} assistant{assistants.length !== 1 ? 's' : ''}
                {activeFilter === 'true' && ' · active'}
                {activeFilter === 'false' && ' · inactive'}
                {tenantFilter && ` · "${truncate(tenantFilter, 20)}"`}
              </span>
            )}
            <Button onClick={handleNew}>
              + New Assistant
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <DataTable<AssistantSummary>
            columns={columns}
            data={assistants ?? []}
            loading={isLoading}
            emptyMessage="No assistants found. Create your first assistant above."
            keyExtractor={(row) => row.assistantCode}
            rowClassName={(row) => (row.active === false ? 'opacity-60' : undefined)}
          />
        </div>
      </div>

      {/* Create / edit form */}
      <AssistantForm
        open={formOpen}
        onClose={handleFormClose}
        assistant={editTarget}
      />

      {/* Deactivate confirmation */}
      <ConfirmModal
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(undefined)}
        onConfirm={handleDeactivateConfirm}
        title={`Deactivate "${deactivateTarget?.assistantCode}"?`}
        message="This assistant will stop accepting new chat requests until reactivated. Existing sessions are not affected."
        confirmLabel="Deactivate"
        danger
        loading={deactivate.isPending}
      />
    </>
  )
}

import { useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PromptTemplateForm } from './PromptTemplateForm'
import {
  usePromptTemplates,
  useActivatePromptTemplate,
  useDeletePromptTemplate,
} from './hooks/usePromptTemplates'
import { useAssistants } from '@/features/admin/assistants/hooks/useAssistants'
import { formatDate, truncate } from '@/utils/formatters'
import type { PromptTemplateSummary, PromptTemplateDto } from '@/types/api'
import type { Column } from '@/components/ui/DataTable'
import { promptTemplatesApi } from '@/api/admin/prompt-templates'

export default function PromptTemplatesPage() {
  const [selectedAssistant, setSelectedAssistant] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<PromptTemplateDto | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<PromptTemplateSummary | undefined>()

  const { data: assistants } = useAssistants()
  const { data: templates, isLoading } = usePromptTemplates(selectedAssistant)
  const activate = useActivatePromptTemplate(selectedAssistant)
  const del = useDeletePromptTemplate(selectedAssistant)

  function handleNew() {
    setEditTemplate(undefined)
    setFormOpen(true)
  }

  async function handleEdit(row: PromptTemplateSummary) {
    if (!row.id || !selectedAssistant) return
    try {
      const full = await promptTemplatesApi.get(selectedAssistant, row.id)
      setEditTemplate(full)
      setFormOpen(true)
    } catch {
      toast.error('Failed to load template details')
    }
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditTemplate(undefined)
  }

  function handleActivate(row: PromptTemplateSummary) {
    if (row.id !== undefined) activate.mutate(row.id)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget?.id) return
    del.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(undefined),
    })
  }

  function handleDeleteRequest(row: PromptTemplateSummary) {
    if (row.active) {
      toast.error('Cannot delete the active template — activate another version first.')
      return
    }
    setDeleteTarget(row)
  }

  const columns: Column<PromptTemplateSummary>[] = [
    {
      header: 'Version',
      accessor: (row) => (
        <code style={{ color: 'var(--text)' }}>
          {row.version ?? '—'}
        </code>
      ),
      width: '110px',
    },
    {
      header: 'Status',
      accessor: (row) => <Badge status={row.active ? 'active' : 'inactive'} />,
      width: '90px',
    },
    {
      header: 'Created By',
      accessor: (row) => (
        <span style={{ color: row.createdBy ? 'var(--text)' : 'var(--muted)' }}>
          {row.createdBy ?? '—'}
        </span>
      ),
      width: '130px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Created At',
      accessor: (row) => (
        <span style={{ color: 'var(--muted)' }}>{formatDate(row.createdAt)}</span>
      ),
      width: '160px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Actions',
      width: '200px',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          {!row.active && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleActivate(row)}
              loading={activate.isPending && activate.variables === row.id}
            >
              Activate
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteRequest(row)}
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
          Prompt Templates
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Versioned system prompt templates per assistant. Activating a version sets it as the
          live config and deactivates all others.
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
        {/* Card header — assistant selector left, action right */}
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
              📝 Templates
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
            {hasAssistant && templates && (
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {templates.length} version{templates.length !== 1 ? 's' : ''}
                {templates.filter((t) => t.active).length > 0 && ' · 1 active'}
              </span>
            )}
            <Button onClick={handleNew} disabled={!hasAssistant}>
              + New Version
            </Button>
          </div>
        </div>

        {/* Prompt when no assistant is selected */}
        {!hasAssistant && (
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: '48px 0', color: 'var(--muted)', fontSize: '13px' }}
          >
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>📝</span>
            <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
              Select an assistant
            </p>
            <p>Choose an assistant above to view and manage its prompt templates.</p>
          </div>
        )}

        {/* Table */}
        {hasAssistant && (
          <div className="overflow-x-auto">
            <DataTable<PromptTemplateSummary>
              columns={columns}
              data={templates ?? []}
              loading={isLoading}
              emptyMessage="No template versions yet. Click '+ New Version' to create the first one."
              keyExtractor={(row) => String(row.id ?? row.version ?? Math.random())}
              rowClassName={(row) => (row.active === false ? 'opacity-60' : undefined)}
            />
          </div>
        )}
      </div>

      {/* Create / edit form */}
      {hasAssistant && (
        <PromptTemplateForm
          open={formOpen}
          onClose={handleFormClose}
          assistantCode={selectedAssistant}
          template={editTemplate}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={handleDeleteConfirm}
        title={`Delete template "${deleteTarget?.version}"?`}
        message={`This will permanently remove version ${deleteTarget?.version ?? ''} for assistant "${truncate(selectedAssistant, 40)}". This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={del.isPending}
      />
    </>
  )
}

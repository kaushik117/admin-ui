import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { KnowledgeBaseForm } from './KnowledgeBaseForm'
import {
  useKnowledgeBases,
  useActivateKnowledgeBase,
  useDeactivateKnowledgeBase,
} from './hooks/useKnowledgeBases'
import { knowledgeBasesApi } from '@/api/admin/knowledge-bases'
import { useQuery } from '@tanstack/react-query'
import { formatDate } from '@/utils/formatters'
import type { KnowledgeBaseSummary, KnowledgeBaseDto } from '@/types/api'
import type { Column } from '@/components/ui/DataTable'

export default function KnowledgeBasesPage() {
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<KnowledgeBaseDto | undefined>()
  const [deactivateTarget, setDeactivateTarget] = useState<KnowledgeBaseSummary | undefined>()

  const queryParams = {
    active: activeFilter === '' ? undefined : activeFilter === 'true',
  }

  const { data: kbs, isLoading } = useKnowledgeBases(queryParams)
  const activate = useActivateKnowledgeBase()
  const deactivate = useDeactivateKnowledgeBase()

  // Fetch full DTO when editing (summary lacks connectionRef etc.)
  const { refetch: fetchKbDetail } = useQuery({
    queryKey: ['knowledge-base-detail', editTarget?.knowledgeBaseId],
    queryFn: () => knowledgeBasesApi.get(editTarget!.knowledgeBaseId),
    enabled: false,
  })

  async function handleEdit(kb: KnowledgeBaseSummary) {
    // Fetch the full DTO so the form can pre-populate connectionRef + metadataFilterPolicy
    const { data } = await fetchKbDetail()
    if (data) setEditTarget(data)
    else {
      // Fallback — open with partial data; connectionRef will be blank
      setEditTarget({
        knowledgeBaseId: kb.knowledgeBaseId,
        name: kb.name,
        vectorStoreType: kb.vectorStoreType,
        active: kb.active,
        updatedAt: kb.updatedAt,
      } as KnowledgeBaseDto)
    }
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

  function handleActivate(kb: KnowledgeBaseSummary) {
    activate.mutate(kb.knowledgeBaseId)
  }

  function handleDeactivateConfirm() {
    if (!deactivateTarget) return
    deactivate.mutate(deactivateTarget.knowledgeBaseId, {
      onSuccess: () => setDeactivateTarget(undefined),
    })
  }

  const columns: Column<KnowledgeBaseSummary>[] = [
    {
      header: 'KB ID',
      accessor: (row) => (
        <code style={{ color: 'var(--text)' }}>
          {row.knowledgeBaseId}
        </code>
      ),
      width: '180px',
    },
    { header: 'Name', accessor: 'name' },
    {
      header: 'Vector Store',
      accessor: (row) => (
        <span style={{ color: row.vectorStoreType ? 'var(--text)' : 'var(--muted)' }}>
          {row.vectorStoreType ?? '—'}
        </span>
      ),
      width: '130px',
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
              loading={
                deactivate.isPending &&
                deactivateTarget?.knowledgeBaseId === row.knowledgeBaseId
              }
            >
              Deactivate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleActivate(row)}
              loading={activate.isPending && activate.variables === row.knowledgeBaseId}
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
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          Knowledge Bases
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Register and manage vector knowledge bases used for RAG retrieval across assistants.
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
              🗄️ All Knowledge Bases
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
          </div>

          <div className="flex items-center gap-3">
            {kbs && (
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {kbs.length} knowledge base{kbs.length !== 1 ? 's' : ''}
                {activeFilter === 'true' && ' · active'}
                {activeFilter === 'false' && ' · inactive'}
              </span>
            )}
            <Button onClick={handleNew}>+ Register KB</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <DataTable<KnowledgeBaseSummary>
            columns={columns}
            data={kbs ?? []}
            loading={isLoading}
            emptyMessage="No knowledge bases registered yet. Click '+ Register KB' to add one."
            keyExtractor={(row) => row.knowledgeBaseId}
            rowClassName={(row) => (row.active === false ? 'opacity-60' : undefined)}
          />
        </div>
      </div>

      {/* Create / edit form */}
      <KnowledgeBaseForm open={formOpen} onClose={handleFormClose} kb={editTarget} />

      {/* Deactivate confirmation */}
      <ConfirmModal
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(undefined)}
        onConfirm={handleDeactivateConfirm}
        title={`Deactivate "${deactivateTarget?.knowledgeBaseId}"?`}
        message="This knowledge base will no longer be used for RAG retrieval until reactivated. Existing sessions are not affected."
        confirmLabel="Deactivate"
        danger
        loading={deactivate.isPending}
      />
    </>
  )
}

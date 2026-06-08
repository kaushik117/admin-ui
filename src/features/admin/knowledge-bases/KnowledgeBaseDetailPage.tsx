import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { knowledgeBasesApi } from '@/api/admin/knowledge-bases'
import { useKbDocuments, useUploadKbDocument, useDeleteKbDocument } from './hooks/useKnowledgeBases'
import { KnowledgeBaseForm } from './KnowledgeBaseForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { KvGrid } from '@/components/shared/KvGrid'
import { formatDate } from '@/utils/formatters'
import type { KbDocumentSummaryDto } from '@/types/api'
import type { Column } from '@/components/ui/DataTable'

export default function KnowledgeBaseDetailPage() {
  const { kbId = '' } = useParams<{ kbId: string }>()
  const navigate = useNavigate()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | undefined>()

  const { data: kb, isLoading: kbLoading } = useQuery({
    queryKey: ['knowledge-base-detail', kbId],
    queryFn: () => knowledgeBasesApi.get(kbId),
    enabled: !!kbId,
  })

  const { data: docs, isLoading: docsLoading } = useKbDocuments(kbId)
  const upload = useUploadKbDocument(kbId)
  const deleteDoc = useDeleteKbDocument(kbId)

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteDoc.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(undefined) })
  }

  const columns: Column<KbDocumentSummaryDto>[] = [
    {
      header: 'Document Title',
      accessor: (row) => <span style={{ color: 'var(--text)', fontWeight: 500 }}>{row.sourceTitle}</span>,
    },
    {
      header: 'Chunks',
      accessor: (row) => <span style={{ color: 'var(--muted)' }}>{row.chunkCount}</span>,
      width: '80px',
    },
    {
      header: 'Ingested At',
      accessor: (row) => (
        <span style={{ color: 'var(--muted)' }}>{row.ingestedAt ? formatDate(row.ingestedAt) : '—'}</span>
      ),
      width: '160px',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Actions',
      width: '90px',
      accessor: (row) => (
        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row.sourceTitle)}>
          Delete
        </Button>
      ),
    },
  ]

  const configItems = kb
    ? [
        { key: 'Vector Store', value: kb.vectorStoreType ?? '—' },
        { key: 'Embedding Model', value: kb.embeddingModel ?? '—' },
        { key: 'Connection Ref', value: kb.connectionRef ?? '—' },
        { key: 'Status', value: <Badge status={kb.active ? 'active' : 'inactive'} /> },
        ...(kb.createdAt ? [{ key: 'Created', value: formatDate(kb.createdAt) }] : []),
        ...(kb.updatedAt ? [{ key: 'Last Updated', value: formatDate(kb.updatedAt) }] : []),
      ]
    : []

  return (
    <>
      {/* Page header */}
      <div className="admin-header" style={{ marginBottom: '20px' }}>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={() => navigate('../knowledge-bases')}>
            ← Back
          </Button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
              {kbLoading ? kbId : (kb?.name ?? kbId)}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
              Knowledge Base &middot; <code style={{ color: 'var(--muted)' }}>{kbId}</code>
              {kb?.vectorStoreType && ` · ${kb.vectorStoreType}`}
              {kb?.embeddingModel && ` · ${kb.embeddingModel}`}
            </p>
          </div>
        </div>
      </div>

      {/* Documents card */}
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
        <div
          className="flex items-center justify-between flex-wrap gap-2"
          style={{ marginBottom: '14px' }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
            📄 Documents
          </span>
          <div className="flex items-center gap-3">
            {docs && (
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {docs.length} document{docs.length !== 1 ? 's' : ''}
              </span>
            )}
            <Button onClick={() => setUploadOpen(true)}>+ Upload Document</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable<KbDocumentSummaryDto>
            columns={columns}
            data={docs ?? []}
            loading={docsLoading}
            emptyMessage="No documents ingested yet. Upload one to get started."
            keyExtractor={(row) => row.sourceTitle}
          />
        </div>
      </div>

      {/* Configuration card */}
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
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
            ⚙️ Configuration
          </span>
          <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        </div>
        {kb && <KvGrid title="KB Config" items={configItems} />}
      </div>

      {/* Upload modal */}
      <UploadDocumentModal
        open={uploadOpen}
        kbId={kbId}
        onClose={() => setUploadOpen(false)}
        onUpload={(fd) =>
          upload.mutate(fd, { onSuccess: () => setUploadOpen(false) })
        }
        uploading={upload.isPending}
      />

      {/* Edit KB form */}
      <KnowledgeBaseForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        kb={kb}
      />

      {/* Delete document confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteTarget}"?`}
        message="All chunks for this document will be permanently removed from the knowledge base. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleteDoc.isPending}
      />
    </>
  )
}

// ── Upload Document Modal ─────────────────────────────

interface UploadDocumentModalProps {
  open: boolean
  kbId: string
  onClose: () => void
  onUpload: (formData: FormData) => void
  uploading: boolean
}

function UploadDocumentModal({ open, kbId, onClose, onUpload, uploading }: UploadDocumentModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [sourceTitle, setSourceTitle] = useState('')
  const [chunkSize, setChunkSize] = useState('800')
  const [chunkOverlap, setChunkOverlap] = useState('150')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    setFileName(f ? f.name : '')
  }

  function handleClose() {
    setFileName('')
    setSourceTitle('')
    setChunkSize('800')
    setChunkOverlap('150')
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  function handleSubmit() {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    if (sourceTitle.trim()) fd.append('sourceTitle', sourceTitle.trim())
    if (chunkSize) fd.append('chunkSize', chunkSize)
    if (chunkOverlap) fd.append('chunkOverlap', chunkOverlap)
    onUpload(fd)
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    padding: '7px 10px',
    fontSize: '12px',
    color: 'var(--text)',
    width: '100%',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '.4px',
    display: 'block',
    marginBottom: '5px',
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Upload Document to ${kbId}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* File picker */}
        <div>
          <label style={labelStyle}>
            Document File <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <div
            style={{
              border: '2px dashed var(--border)',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--surface2)',
            }}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>📄</div>
            <div style={{ color: fileName ? 'var(--text)' : 'var(--muted)', fontSize: '13px' }}>
              {fileName || 'Click to select a PDF, TXT, MD, or JSON file'}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.md,.json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Source title */}
        <div>
          <label style={labelStyle}>Source Title (optional)</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Human-readable name shown in the documents list. Defaults to filename."
            value={sourceTitle}
            onChange={(e) => setSourceTitle(e.target.value)}
          />
        </div>

        {/* Chunk params */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Chunk Size</label>
            <input
              style={inputStyle}
              type="number"
              placeholder="Tokens per chunk"
              value={chunkSize}
              onChange={(e) => setChunkSize(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Chunk Overlap</label>
            <input
              style={inputStyle}
              type="number"
              placeholder="Overlap tokens"
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(e.target.value)}
            />
          </div>
        </div>

        {/* Re-ingest note */}
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '12px',
            color: 'var(--muted)',
          }}
        >
          Re-uploading a document with the same title replaces all existing chunks for that document.
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2" style={{ paddingTop: '4px' }}>
          <Button variant="ghost" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={uploading} disabled={!fileName}>
            Upload & Ingest
          </Button>
        </div>
      </div>
    </Modal>
  )
}

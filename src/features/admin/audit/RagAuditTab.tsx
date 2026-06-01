import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useRagAudit } from './hooks/useAudit'
import { useKnowledgeBases } from '@/features/admin/knowledge-bases/hooks/useKnowledgeBases'
import { formatDate, formatDuration, truncate } from '@/utils/formatters'
import type { RagAuditRecordDto } from '@/types/api'

const PAGE_SIZE = 20

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

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--muted)',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '.4px',
}

function BoolBadge({ value }: { value?: boolean | null }) {
  if (value == null) return <span style={{ color: 'var(--muted)' }}>—</span>
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 600,
        color: value ? 'var(--green)' : 'var(--muted)',
        background: value
          ? 'color-mix(in srgb, var(--green) 12%, transparent)'
          : 'color-mix(in srgb, var(--muted) 12%, transparent)',
        padding: '2px 6px',
        borderRadius: '4px',
      }}
    >
      {value ? 'Yes' : 'No'}
    </span>
  )
}

function CodeCell({ value }: { value?: string | number | null }) {
  if (value == null) return <span style={{ color: 'var(--muted)' }}>—</span>
  return <code style={{ color: 'var(--text)', fontSize: '11px' }}>{value}</code>
}

export function RagAuditTab() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [draftKbId, setDraftKbId] = useState(searchParams.get('knowledgeBaseId') ?? '')
  const [draftGrounded, setDraftGrounded] = useState(searchParams.get('groundedMode') ?? '')
  const [draftSessionId, setDraftSessionId] = useState(searchParams.get('sessionId') ?? '')
  const [draftRequestId, setDraftRequestId] = useState(searchParams.get('requestId') ?? '')
  const [draftFrom, setDraftFrom] = useState(searchParams.get('from') ?? '')
  const [draftTo, setDraftTo] = useState(searchParams.get('to') ?? '')

  const page = Number(searchParams.get('page') ?? '1')

  const activeParams = {
    knowledgeBaseId: searchParams.get('knowledgeBaseId') || undefined,
    groundedMode:
      searchParams.get('groundedMode') === 'true'
        ? true
        : searchParams.get('groundedMode') === 'false'
          ? false
          : undefined,
    sessionId: searchParams.get('sessionId') || undefined,
    requestId: searchParams.get('requestId') || undefined,
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    page,
    size: PAGE_SIZE,
  }

  const { data: records, isLoading } = useRagAudit(activeParams)
  const { data: knowledgeBases } = useKnowledgeBases()

  const hasActiveFilters = Object.entries(activeParams)
    .filter(([k]) => !['page', 'size'].includes(k))
    .some(([, v]) => v !== undefined)

  const hasMore = (records?.length ?? 0) >= PAGE_SIZE

  function applyFilters() {
    const params: Record<string, string> = { tab: 'rag' }
    if (draftKbId) params.knowledgeBaseId = draftKbId
    if (draftGrounded) params.groundedMode = draftGrounded
    if (draftSessionId) params.sessionId = draftSessionId
    if (draftRequestId) params.requestId = draftRequestId
    if (draftFrom) params.from = draftFrom
    if (draftTo) params.to = draftTo
    params.page = '1'
    setSearchParams(params, { replace: true })
  }

  function clearFilters() {
    setDraftKbId(''); setDraftGrounded(''); setDraftSessionId('')
    setDraftRequestId(''); setDraftFrom(''); setDraftTo('')
    setSearchParams({ tab: 'rag' }, { replace: true })
  }

  function handlePageChange(next: number) {
    const params: Record<string, string> = {}
    searchParams.forEach((v, k) => { params[k] = v })
    params.page = String(next)
    setSearchParams(params, { replace: true })
  }

  return (
    <>
      {/* Filters */}
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
        <div style={{ ...labelStyle, marginBottom: '12px' }}>Filters</div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Knowledge Base</label>
            <select
              value={draftKbId}
              onChange={(e) => setDraftKbId(e.target.value)}
              style={{ ...inputStyle, width: '180px', cursor: 'pointer' }}
            >
              <option value="">All Knowledge Bases</option>
              {knowledgeBases?.map((kb) => (
                <option key={kb.knowledgeBaseId} value={kb.knowledgeBaseId}>
                  {kb.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Grounded Mode</label>
            <select
              value={draftGrounded}
              onChange={(e) => setDraftGrounded(e.target.value)}
              style={{ ...inputStyle, width: '140px', cursor: 'pointer' }}
            >
              <option value="">All</option>
              <option value="true">Grounded</option>
              <option value="false">Non-Grounded</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Session ID</label>
            <input
              value={draftSessionId}
              onChange={(e) => setDraftSessionId(e.target.value)}
              placeholder="session-id"
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Request ID</label>
            <input
              value={draftRequestId}
              onChange={(e) => setDraftRequestId(e.target.value)}
              placeholder="request-id"
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label style={labelStyle}>From</label>
            <input
              type="date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label style={labelStyle}>To</label>
            <input
              type="date"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={applyFilters}>Apply Filters</Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>Clear</Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-[var(--radius)] border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
          padding: '18px',
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            Retrieval Records
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
          {records && (
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {records.length === PAGE_SIZE
                ? `${PAGE_SIZE}+ results`
                : `${records.length} result${records.length !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[
                  ['ID', '60px'],
                  ['Request ID', '160px', 'hidden lg:table-cell'],
                  ['Session ID', '150px'],
                  ['KB ID', '160px'],
                  ['Docs', '70px'],
                  ['Top K', '65px'],
                  ['Similarity', '90px'],
                  ['Latency', '90px'],
                  ['Grounded', '90px'],
                  ['Created At', '155px'],
                ].map(([header, width, cls]) => (
                  <th
                    key={header as string}
                    scope="col"
                    className={cls as string | undefined}
                    style={{
                      padding: '9px 10px',
                      width: width as string,
                      color: 'var(--muted)',
                      textAlign: 'left',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.4px',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} aria-hidden="true">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} style={{ padding: '10px' }}>
                        <div
                          className="h-3 rounded animate-pulse"
                          style={{ background: 'var(--surface3)', width: j === 0 ? '30%' : '70%' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !records || records.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>No RAG audit records found</div>
                      <div style={{ fontSize: '11px' }}>Try adjusting your filters above.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((row: RagAuditRecordDto) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="transition-colors hover:bg-[var(--surface2)]"
                  >
                    <td style={{ padding: '10px', color: 'var(--muted)' }}>{row.id ?? '—'}</td>
                    <td className="hidden lg:table-cell" style={{ padding: '10px' }}>
                      <span title={row.requestId ?? undefined}>
                        <CodeCell value={row.requestId ? truncate(row.requestId, 18) : null} />
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span title={row.sessionId ?? undefined}>
                        <CodeCell value={row.sessionId ? truncate(row.sessionId, 18) : null} />
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text)' }}>
                      {row.knowledgeBaseId ? (
                        <span title={row.knowledgeBaseId}>
                          <code style={{ fontSize: '11px' }}>{truncate(row.knowledgeBaseId, 18)}</code>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text)', textAlign: 'center' }}>
                      {row.retrievedDocumentCount ?? <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--muted)', textAlign: 'center' }}>
                      {row.topK ?? '—'}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--muted)', textAlign: 'center' }}>
                      {row.similarityThreshold != null ? row.similarityThreshold.toFixed(2) : '—'}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text)' }}>
                      {formatDuration(row.latencyMs)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <BoolBadge value={row.groundedMode} />
                    </td>
                    <td style={{ padding: '10px', color: 'var(--muted)', fontSize: '11px' }}>
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && (page > 1 || hasMore) && (
          <div
            className="flex items-center justify-between"
            style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}
          >
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Page {page}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                ← Prev
              </Button>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                {page}
              </span>
              <Button size="sm" variant="ghost" disabled={!hasMore} onClick={() => handlePageChange(page + 1)}>
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/shared/StatCard'
import { useExecutions } from './hooks/useExecutions'
import { useAssistants } from '@/features/admin/assistants/hooks/useAssistants'
import { statsApi } from '@/api/admin/stats'
import { formatDate, formatDuration, formatTokens, truncate } from '@/utils/formatters'
import type { ExecutionRecordDto } from '@/types/api'

const PAGE_SIZE = 20

function CodeCell({ value }: { value?: string | null }) {
  if (!value) return <span style={{ color: 'var(--muted)' }}>—</span>
  return <code style={{ color: 'var(--text)', fontSize: '11px' }}>{value}</code>
}

function SuccessCell({ success }: { success?: boolean | null }) {
  if (success == null) return <span style={{ color: 'var(--muted)' }}>—</span>
  return success ? (
    <CheckCircle size={15} style={{ color: 'var(--green)' }} aria-label="Success" />
  ) : (
    <XCircle size={15} style={{ color: 'var(--red)' }} aria-label="Failed" />
  )
}

function KvRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2" style={{ fontSize: '12px' }}>
      <span style={{ color: 'var(--muted)', minWidth: '160px', fontWeight: 600, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ color: 'var(--text)', wordBreak: 'break-all' }}>{value ?? '—'}</span>
    </div>
  )
}

function ExpandedDetail({ row }: { row: ExecutionRecordDto }) {
  return (
    <div
      style={{
        background: 'var(--surface2)',
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px 32px',
      }}
    >
      <KvRow label="Request ID" value={<code style={{ fontSize: '11px' }}>{row.requestId}</code>} />
      <KvRow label="Session ID" value={<code style={{ fontSize: '11px' }}>{row.sessionId}</code>} />
      <KvRow label="Assistant" value={row.assistantCode} />
      <KvRow label="Tenant" value={row.tenantId} />
      <KvRow label="User" value={row.userId} />
      <KvRow label="Config Version" value={row.configVersion} />
      <KvRow label="Provider" value={row.selectedProvider} />
      <KvRow label="Model" value={row.selectedModel} />
      <KvRow label="Knowledge Base" value={row.knowledgeBaseId} />
      <KvRow label="Memory Store" value={row.memoryStoreType} />
      <KvRow
        label="Streaming"
        value={
          row.streamingEnabled == null ? '—' : (
            <span style={{ color: row.streamingEnabled ? 'var(--green)' : 'var(--muted)' }}>
              {row.streamingEnabled ? 'Enabled' : 'Disabled'}
            </span>
          )
        }
      />
      <KvRow
        label="Success"
        value={
          row.success == null ? '—' : (
            <span style={{ color: row.success ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {row.success ? 'Yes' : 'No'}
            </span>
          )
        }
      />
      {row.errorCode && <KvRow label="Error Code" value={<span style={{ color: 'var(--red)' }}>{row.errorCode}</span>} />}
      {row.errorMessage && (
        <KvRow
          label="Error Message"
          value={<span style={{ color: 'var(--red)' }}>{row.errorMessage}</span>}
        />
      )}
      <KvRow label="Input Tokens" value={formatTokens(row.inputTokens)} />
      <KvRow label="Output Tokens" value={formatTokens(row.outputTokens)} />
      <KvRow label="Latency" value={formatDuration(row.latencyMs)} />
      <KvRow label="Started At" value={formatDate(row.startedAt)} />
      <KvRow label="Completed At" value={formatDate(row.completedAt)} />
      {row.enabledTools && row.enabledTools.length > 0 && (
        <div style={{ gridColumn: '1 / -1', fontSize: '12px' }}>
          <span style={{ color: 'var(--muted)', fontWeight: 600, marginRight: '8px' }}>
            Enabled Tools
          </span>
          <span style={{ color: 'var(--text)' }}>{row.enabledTools.join(', ')}</span>
        </div>
      )}
    </div>
  )
}

export default function ExecutionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [draftAssistantCode, setDraftAssistantCode] = useState(searchParams.get('assistantCode') ?? '')
  const [draftTenantId, setDraftTenantId] = useState(searchParams.get('tenantId') ?? '')
  const [draftSuccess, setDraftSuccess] = useState(searchParams.get('success') ?? '')
  const [draftProvider, setDraftProvider] = useState(searchParams.get('provider') ?? '')
  const [draftModel, setDraftModel] = useState(searchParams.get('model') ?? '')
  const [draftFrom, setDraftFrom] = useState(searchParams.get('from') ?? '')
  const [draftTo, setDraftTo] = useState(searchParams.get('to') ?? '')

  const page = Number(searchParams.get('page') ?? '1')

  const activeParams = {
    assistantCode: searchParams.get('assistantCode') || undefined,
    tenantId: searchParams.get('tenantId') || undefined,
    success:
      searchParams.get('success') === 'true'
        ? true
        : searchParams.get('success') === 'false'
          ? false
          : undefined,
    provider: searchParams.get('provider') || undefined,
    model: searchParams.get('model') || undefined,
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    page,
    size: PAGE_SIZE,
  }

  const { data: executions, isLoading } = useExecutions(activeParams)
  const { data: assistants } = useAssistants({ active: undefined })
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.getPlatformStats,
    staleTime: 30_000,
  })

  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleApplyFilters() {
    const params: Record<string, string> = {}
    if (draftAssistantCode) params.assistantCode = draftAssistantCode
    if (draftTenantId) params.tenantId = draftTenantId
    if (draftSuccess) params.success = draftSuccess
    if (draftProvider) params.provider = draftProvider
    if (draftModel) params.model = draftModel
    if (draftFrom) params.from = draftFrom
    if (draftTo) params.to = draftTo
    params.page = '1'
    setSearchParams(params, { replace: true })
    setExpandedId(null)
  }

  function handleClearFilters() {
    setDraftAssistantCode('')
    setDraftTenantId('')
    setDraftSuccess('')
    setDraftProvider('')
    setDraftModel('')
    setDraftFrom('')
    setDraftTo('')
    setSearchParams({}, { replace: true })
    setExpandedId(null)
  }

  function handlePageChange(next: number) {
    const params: Record<string, string> = {}
    searchParams.forEach((v, k) => { if (k !== 'page') params[k] = v })
    params.page = String(next)
    setSearchParams(params, { replace: true })
    setExpandedId(null)
  }

  function handleRowClick(requestId?: string) {
    if (!requestId) return
    setExpandedId((prev) => (prev === requestId ? null : requestId))
  }

  const hasActiveFilters = Object.entries(activeParams)
    .filter(([k]) => !['page', 'size'].includes(k))
    .some(([, v]) => v !== undefined)

  const hasMore = (executions?.length ?? 0) >= PAGE_SIZE

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

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          Execution Monitor
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Search and inspect chat execution records across all assistants and tenants.
        </p>
      </div>

      {/* Stat cards */}
      <div
        className="grid grid-cols-2 xl:grid-cols-4"
        style={{ gap: '10px', marginBottom: '16px' }}
      >
        <StatCard
          label="Total Executions (24h)"
          value={stats?.totalExecutionsToday ?? '—'}
        />
        <StatCard
          label="Success Rate"
          value={
            stats?.totalExecutionsToday && stats.totalExecutionsToday > 0
              ? `${(((stats.totalExecutionsToday - (stats.failedExecutionsToday ?? 0)) / stats.totalExecutionsToday) * 100).toFixed(1)}%`
              : '—'
          }
          valueColor="var(--green)"
        />
        <StatCard
          label="Avg Latency"
          value={stats?.avgLatencyMs != null ? formatDuration(stats.avgLatencyMs) : '—'}
        />
        <StatCard
          label="Avg Output Tokens"
          value={stats?.avgOutputTokens != null ? formatTokens(stats.avgOutputTokens) : '—'}
        />
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
        <div style={{ ...labelStyle, marginBottom: '12px' }}>Filters</div>

        <div className="flex flex-wrap gap-3 items-end">
          {/* Assistant */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Assistant</label>
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

          {/* Tenant ID */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Tenant ID</label>
            <input
              value={draftTenantId}
              onChange={(e) => setDraftTenantId(e.target.value)}
              placeholder="e.g. default"
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>

          {/* Success */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Result</label>
            <select
              value={draftSuccess}
              onChange={(e) => setDraftSuccess(e.target.value)}
              style={{ ...inputStyle, width: '130px', cursor: 'pointer' }}
            >
              <option value="">All</option>
              <option value="true">Success</option>
              <option value="false">Failed</option>
            </select>
          </div>

          {/* Provider */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Provider</label>
            <input
              value={draftProvider}
              onChange={(e) => setDraftProvider(e.target.value)}
              placeholder="e.g. openai"
              style={{ ...inputStyle, width: '130px' }}
            />
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Model</label>
            <input
              value={draftModel}
              onChange={(e) => setDraftModel(e.target.value)}
              placeholder="e.g. gpt-4o"
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>From</label>
            <input
              type="date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>To</label>
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

      {/* Table card */}
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
            ⚡ Executions
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
          {executions && (
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {executions.length === PAGE_SIZE ? `${PAGE_SIZE}+ results` : `${executions.length} result${executions.length !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {/* expand chevron column */}
                <th style={{ width: '32px', padding: '9px 10px' }} />
                {[
                  ['Request ID', '170px'],
                  ['Session ID', '150px'],
                  ['Assistant', '120px'],
                  ['Tenant', '100px', 'hidden lg:table-cell'],
                  ['User', '110px', 'hidden lg:table-cell'],
                  ['Provider', '100px'],
                  ['Model', '130px'],
                  ['KB', '110px', 'hidden lg:table-cell'],
                  ['OK', '48px'],
                  ['Latency', '80px'],
                  ['In', '70px'],
                  ['Out', '70px'],
                  ['Started At', '150px'],
                ].map(([header, width, className]) => (
                  <th
                    key={header}
                    scope="col"
                    className={className as string | undefined}
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
                    {Array.from({ length: 14 }).map((_, j) => (
                      <td key={j} style={{ padding: '10px' }}>
                        <div
                          className="h-3 rounded animate-pulse"
                          style={{ background: 'var(--surface3)', width: j === 0 ? '40%' : '75%' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !executions || executions.length === 0 ? (
                <tr>
                  <td colSpan={14}>
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>No execution records found</div>
                      <div style={{ fontSize: '11px' }}>Try adjusting your filters above.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                executions.map((row: ExecutionRecordDto) => {
                  const isExpanded = expandedId === row.requestId
                  return [
                    <tr
                      key={row.requestId}
                      onClick={() => handleRowClick(row.requestId)}
                      className="transition-colors hover:bg-[var(--surface2)]"
                      style={{
                        borderBottom: isExpanded ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer',
                        background: isExpanded ? 'var(--surface2)' : undefined,
                      }}
                    >
                      {/* chevron */}
                      <td style={{ padding: '10px', verticalAlign: 'middle', color: 'var(--muted)' }}>
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                        <span
                          title={row.requestId}
                          style={{ display: 'block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          <CodeCell value={row.requestId ? truncate(row.requestId, 18) : null} />
                        </span>
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                        <span title={row.sessionId ?? undefined}>
                          <CodeCell value={row.sessionId ? truncate(row.sessionId, 16) : null} />
                        </span>
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                        <CodeCell value={row.assistantCode} />
                      </td>
                      <td className="hidden lg:table-cell" style={{ padding: '10px', verticalAlign: 'middle', color: 'var(--muted)' }}>
                        {row.tenantId ?? '—'}
                      </td>
                      <td className="hidden lg:table-cell" style={{ padding: '10px', verticalAlign: 'middle', color: 'var(--muted)' }}>
                        {row.userId ? truncate(row.userId, 16) : '—'}
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle', color: 'var(--text)' }}>
                        {row.selectedProvider ?? <span style={{ color: 'var(--muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                        <span title={row.selectedModel ?? undefined} style={{ color: 'var(--text)' }}>
                          {row.selectedModel ? truncate(row.selectedModel, 18) : <span style={{ color: 'var(--muted)' }}>—</span>}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell" style={{ padding: '10px', verticalAlign: 'middle', color: 'var(--muted)' }}>
                        {row.knowledgeBaseId ? truncate(row.knowledgeBaseId, 14) : '—'}
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                        <SuccessCell success={row.success} />
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle', color: 'var(--text)' }}>
                        {formatDuration(row.latencyMs)}
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle', color: 'var(--muted)' }}>
                        {formatTokens(row.inputTokens)}
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle', color: 'var(--muted)' }}>
                        {formatTokens(row.outputTokens)}
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle', color: 'var(--muted)', fontSize: '11px' }}>
                        {formatDate(row.startedAt)}
                      </td>
                    </tr>,
                    isExpanded && (
                      <tr key={`${row.requestId}-detail`} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td colSpan={14} style={{ padding: 0 }}>
                          <ExpandedDetail row={row} />
                        </td>
                      </tr>
                    ),
                  ]
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && (page > 1 || hasMore) && (
          <div
            className="flex items-center justify-between"
            style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}
          >
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Page {page}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
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
              <Button
                size="sm"
                variant="ghost"
                disabled={!hasMore}
                onClick={() => handlePageChange(page + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

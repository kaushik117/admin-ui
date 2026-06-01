import { useQuery } from '@tanstack/react-query'
import { statsApi } from '@/api/admin/stats'
import { assistantsApi } from '@/api/admin/assistants'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatDuration, formatTokens } from '@/utils/formatters'
import type { AssistantSummary } from '@/types/api'
import type { Column } from '@/components/ui/DataTable'

function StatCardSkeleton() {
  return (
    <div
      className="rounded-[var(--radius)] border animate-pulse"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
        padding: '14px',
      }}
    >
      <div className="h-2 w-24 rounded mb-[9px]" style={{ background: 'var(--surface3)' }} />
      <div className="h-[22px] w-16 rounded" style={{ background: 'var(--surface3)' }} />
    </div>
  )
}

const assistantColumns: Column<AssistantSummary>[] = [
  {
    header: 'Code',
    accessor: (row) => (
      <code style={{ color: 'var(--text)' }}>
        {row.assistantCode}
      </code>
    ),
    width: '180px',
  },
  { header: 'Name', accessor: 'name' },
  {
    header: 'Status',
    accessor: (row) => <Badge status={row.active ? 'active' : 'inactive'} />,
    width: '90px',
  },
  {
    header: 'Tenant Scope',
    accessor: (row) => (
      <span style={{ color: row.tenantScope ? 'var(--text)' : 'var(--muted)' }}>
        {row.tenantScope ?? '—'}
      </span>
    ),
    width: '140px',
  },
  {
    header: 'Config Version',
    accessor: (row) => <span style={{ color: 'var(--muted)' }}>{row.configVersion ?? '—'}</span>,
    width: '120px',
  },
  {
    header: 'Last Updated',
    accessor: (row) => <span style={{ color: 'var(--muted)' }}>{formatDate(row.updatedAt)}</span>,
    width: '160px',
  },
]

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.getPlatformStats,
    refetchInterval: 30_000,
  })

  const { data: assistants, isLoading: assistantsLoading } = useQuery({
    queryKey: ['assistants'],
    queryFn: () => assistantsApi.list(),
    staleTime: 60_000,
  })

  const statCards = [
    {
      label: 'Active Sessions',
      value: stats?.activeSessions ?? 0,
      valueColor: 'var(--accent)',
    },
    {
      label: 'Messages (24h)',
      value: formatTokens(stats?.messagesLast24h),
    },
    {
      label: 'Avg Latency',
      value: formatDuration(stats?.avgLatencyMs),
    },
    {
      label: 'Total Assistants',
      value: stats?.totalAssistants ?? 0,
    },
    {
      label: 'Active Assistants',
      value: stats?.activeAssistants ?? 0,
      valueColor: 'var(--green)',
    },
    {
      label: 'Executions Today',
      value: formatTokens(stats?.totalExecutionsToday),
    },
    {
      label: 'Failed Executions',
      value: stats?.failedExecutionsToday ?? 0,
      valueColor: (stats?.failedExecutionsToday ?? 0) > 0 ? 'var(--red)' : undefined,
    },
    {
      label: 'Avg Output Tokens',
      value: formatTokens(stats?.avgOutputTokens),
    },
  ]

  return (
    <>
      {/* Page header — matches .admin-header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          Platform Dashboard
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Overview of the Generic Chatbot Platform — refreshes every 30 s
        </p>
      </div>

      {/* Stats grid — matches .stats-grid */}
      <div
        className="grid grid-cols-2 xl:grid-cols-4"
        style={{ gap: '10px', marginBottom: '16px' }}
      >
        {statsLoading
          ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                valueColor={card.valueColor}
              />
            ))}
      </div>

      {/* Assistants card — matches .card */}
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
        {/* Card header — matches .card-header */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: '14px' }}
        >
          {/* Card title — matches .card-title */}
          <div
            className="flex items-center"
            style={{ fontSize: '13px', fontWeight: 700, gap: '7px', color: 'var(--text)' }}
          >
            🤖 Registered Assistants
          </div>
          {assistants && (
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {assistants.length} total
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <DataTable<AssistantSummary>
            columns={assistantColumns}
            data={assistants ?? []}
            loading={assistantsLoading}
            emptyMessage="No assistants found"
            keyExtractor={(row) => row.assistantCode}
            rowClassName={(row) => (row.active === false ? 'opacity-60' : undefined)}
          />
        </div>
      </div>
    </>
  )
}

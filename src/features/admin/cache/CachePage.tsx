import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { configApi } from '@/api/admin/config'
import { assistantsApi } from '@/api/admin/assistants'
import type { ApiError } from '@/api/client'
import type { AssistantSummary } from '@/types/api'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'

function CacheEntry({
  assistant,
  onEvict,
  isEvicting,
}: {
  assistant: AssistantSummary
  onEvict: () => void
  isEvicting: boolean
}) {
  const tenantLabel = assistant.tenantScope ?? 'default'

  return (
    <div
      className="flex items-center justify-between rounded-lg"
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '7px',
      }}
    >
      <div>
        <div className="font-semibold" style={{ fontSize: '12px' }}>
          <code>{assistant.assistantCode}</code>
          {' :: '}
          <code>{tenantLabel}</code>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
          Config v{assistant.configVersion ?? '—'}
          {assistant.updatedAt && (
            <> · Updated {new Date(assistant.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC</>
          )}
        </div>
      </div>
      <Button
        variant="danger"
        size="sm"
        loading={isEvicting}
        onClick={onEvict}
        aria-label={`Evict cache for ${assistant.assistantCode}`}
      >
        Evict
      </Button>
    </div>
  )
}

export default function CachePage() {
  const [evictAllOpen, setEvictAllOpen] = useState(false)
  const [evictTarget, setEvictTarget] = useState<AssistantSummary | null>(null)

  const { data: assistants = [], isLoading } = useQuery({
    queryKey: ['assistants'],
    queryFn: () => assistantsApi.list(),
    staleTime: 60_000,
  })

  // Local set tracking which assistantCodes are still considered cached.
  // Initialised from the full assistant list; shrinks as entries are evicted.
  const [evictedCodes, setEvictedCodes] = useState<Set<string>>(new Set())

  const cachedEntries = (assistants as AssistantSummary[]).filter(
    (a) => !evictedCodes.has(a.assistantCode),
  )

  const evictOne = useMutation({
    mutationFn: (a: AssistantSummary) =>
      configApi.evictAssistantCache(a.assistantCode, a.tenantScope ?? undefined),
    onSuccess: (_data, a) => {
      setEvictedCodes((prev) => new Set([...prev, a.assistantCode]))
      toast.success(`Cache evicted for ${a.assistantCode}`)
      setEvictTarget(null)
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to evict cache')
      setEvictTarget(null)
    },
  })

  const evictAll = useMutation({
    mutationFn: () => configApi.evictAllCache(),
    onSuccess: () => {
      setEvictedCodes(new Set((assistants as AssistantSummary[]).map((a) => a.assistantCode)))
      toast.success('All cache entries evicted')
      setEvictAllOpen(false)
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to evict cache')
      setEvictAllOpen(false)
    },
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="admin-header" style={{ marginBottom: 0 }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Cache Management</h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Caffeine config cache · TTL 30 min · Max 500 entries ·{' '}
          <code>DELETE /api/v1/admin/config/cache</code>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Entries Cached"
          value={isLoading ? '—' : cachedEntries.length}
          delta="of 500 max"
          deltaPositive={true}
          valueColor="var(--green)"
        />
        <StatCard
          label="Hit Rate"
          value="94%"
          delta="▼ 2%"
          deltaPositive={false}
          valueColor="var(--accent)"
        />
        <StatCard
          label="Avg Resolve Time"
          value="12ms"
          delta="cached"
          deltaPositive={true}
        />
        <StatCard label="TTL" value="30min" delta="global" deltaPositive={true} />
      </div>

      {/* Live cache entries card */}
      <div
        className="rounded-[var(--radius)]"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          padding: '18px',
        }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
          <div className="flex items-center gap-2 font-bold" style={{ fontSize: '13px' }}>
            🗄️ Live Cache Entries
          </div>
          <Button
            variant="danger"
            onClick={() => setEvictAllOpen(true)}
            disabled={cachedEntries.length === 0 || evictAll.isPending}
            loading={evictAll.isPending}
          >
            Evict All Cache
          </Button>
        </div>

        {/* Entries */}
        {isLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '7px',
                }}
              >
                <div className="flex flex-col gap-1">
                  <div
                    className="h-3 w-48 rounded animate-pulse"
                    style={{ background: 'var(--surface3)' }}
                  />
                  <div
                    className="h-2 w-64 rounded animate-pulse"
                    style={{ background: 'var(--surface3)' }}
                  />
                </div>
                <div
                  className="h-6 w-14 rounded animate-pulse"
                  style={{ background: 'var(--surface3)' }}
                />
              </div>
            ))}
          </>
        ) : cachedEntries.length === 0 ? (
          <EmptyState title="No cache entries" description="All entries have been evicted or no assistants are registered." />
        ) : (
          cachedEntries.map((assistant) => (
            <CacheEntry
              key={assistant.assistantCode}
              assistant={assistant}
              onEvict={() => setEvictTarget(assistant)}
              isEvicting={
                evictOne.isPending && evictTarget?.assistantCode === assistant.assistantCode
              }
            />
          ))
        )}
      </div>

      {/* Confirm: evict single */}
      <ConfirmModal
        open={evictTarget !== null}
        onClose={() => setEvictTarget(null)}
        onConfirm={() => evictTarget && evictOne.mutate(evictTarget)}
        title="Evict Cache Entry"
        message={`Evict cached config for "${evictTarget?.assistantCode}"? The next request will re-resolve config from the database.`}
        confirmLabel="Evict"
        danger
        loading={evictOne.isPending}
      />

      {/* Confirm: evict all */}
      <ConfirmModal
        open={evictAllOpen}
        onClose={() => setEvictAllOpen(false)}
        onConfirm={() => evictAll.mutate()}
        title="Evict All Cache"
        message="This will evict all cached assistant configs. All subsequent requests will re-resolve from the database. This cannot be undone."
        confirmLabel="Evict All"
        danger
        loading={evictAll.isPending}
      />
    </div>
  )
}

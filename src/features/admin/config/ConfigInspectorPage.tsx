import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { configApi } from '@/api/admin/config'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { assistantsApi } from '@/api/admin/assistants'
import { KvGrid } from '@/components/shared/KvGrid'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/formatters'
import { ApiError } from '@/api/client'
import type { ResolvedAssistantConfig } from '@/types/api'

type KvColour = 'green' | 'red' | 'blue' | 'yellow'

function kv(key: string, value: ReactNode, colour?: KvColour) {
  return { key, value, colour }
}

function boolItem(key: string, v?: boolean, trueLabel = 'Yes', falseLabel = 'No') {
  if (v == null) return kv(key, '—')
  return kv(key, v ? trueLabel : falseLabel, (v ? 'green' : 'red') as KvColour)
}

function numItem(key: string, v?: number | null, suffix = '') {
  return kv(key, v != null ? `${v}${suffix}` : '—', 'yellow' as KvColour)
}

function strItem(key: string, v?: string | null, colour?: KvColour) {
  return kv(key, v ?? '—', colour)
}

export default function ConfigInspectorPage() {
  const [selectedAssistant, setSelectedAssistant] = useState('')
  const [tenantId, setTenantId] = useState('')

  const { data: assistants } = useQuery({
    queryKey: ['assistants'],
    queryFn: () => assistantsApi.list(),
    staleTime: 60_000,
  })

  const { data: config, isFetching, isError, error, isPending, refetch } = useQuery({
    queryKey: ['config', selectedAssistant, tenantId],
    queryFn: () => configApi.getResolvedConfig(selectedAssistant, tenantId || undefined),
    enabled: false,
    retry: false,
  })

  const evictMutation = useMutation({
    mutationFn: () => configApi.evictAssistantCache(selectedAssistant, tenantId || undefined),
    onSuccess: () => {
      toast.success('Cache evicted — reload to see fresh config')
    },
    onError: () => toast.error('Failed to evict cache'),
  })

  function handleLoad() {
    if (!selectedAssistant) return
    refetch()
  }

  const errorMessage = isError
    ? (error instanceof ApiError ? error.message : 'Failed to load configuration')
    : null

  const showPlaceholder = isPending && !isFetching

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>Config Inspector</h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          <code
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '1px 5px',
              fontSize: '11px',
            }}
          >
            GET /api/v1/admin/assistants/{'{code}'}/config
          </code>
        </p>
      </div>

      {/* Controls card — inline flex row matching prototype */}
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedAssistant}
            onChange={(e) => setSelectedAssistant(e.target.value)}
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
            <option value="">— Select assistant —</option>
            {assistants?.map((a) => (
              <option key={a.assistantCode} value={a.assistantCode}>
                {a.name} ({a.assistantCode})
              </option>
            ))}
          </select>

          <input
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="Tenant ID (optional)"
            className="rounded-[6px] border outline-none transition-colors focus:border-[var(--accent)]"
            style={{
              background: 'var(--surface2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              fontSize: '12px',
              padding: '6px 10px',
              width: '180px',
            }}
          />

          <Button
            variant="primary"
            size="md"
            loading={isFetching}
            disabled={!selectedAssistant || isFetching}
            onClick={handleLoad}
          >
            Load Config
          </Button>
          <Button
            variant="secondary"
            size="md"
            loading={evictMutation.isPending}
            disabled={!selectedAssistant || evictMutation.isPending}
            onClick={() => evictMutation.mutate()}
          >
            Evict Cache
          </Button>
        </div>
      </div>

      {/* Inline error card */}
      {isError && (
        <div
          className="rounded-[var(--radius)] border"
          style={{
            background: 'color-mix(in srgb, var(--red) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--red) 30%, transparent)',
            padding: '12px 16px',
            marginBottom: '14px',
            fontSize: '12px',
            color: 'var(--red)',
          }}
        >
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Placeholder */}
      {showPlaceholder && (
        <div
          className="rounded-[var(--radius)] border flex items-center justify-center"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            padding: '60px',
            color: 'var(--muted)',
            fontSize: '13px',
          }}
        >
          Select an assistant and click "Load Config" to inspect the resolved configuration.
        </div>
      )}

      {/* Loading */}
      {isFetching && (
        <div
          className="rounded-[var(--radius)] border flex items-center justify-center gap-3"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            padding: '60px',
            color: 'var(--muted)',
            fontSize: '13px',
          }}
        >
          <Spinner size="sm" />
          Loading resolved config…
        </div>
      )}

      {/* Config display — single card matching prototype */}
      {config && !isFetching && <ConfigDisplay config={config} />}
    </>
  )
}

function ConfigDisplay({ config }: { config: ResolvedAssistantConfig }) {
  const promptItems = [
    strItem('Version', config.promptConfig?.promptVersion, 'blue'),
    kv('Guardrails', String(config.promptConfig?.guardrailInstructions?.length ?? 0) + ' rules', 'yellow'),
    kv('Variables', String(Object.keys(config.promptConfig?.defaultVariables ?? {}).length) + ' vars', 'yellow'),
    kv(
      'Dev Prompt',
      config.promptConfig?.developerPromptTemplate ? 'Present' : 'None',
      config.promptConfig?.developerPromptTemplate ? 'green' : undefined,
    ),
  ]

  const routingItems = [
    strItem('Default Model', config.modelRoutingConfig?.defaultModel, 'blue'),
    strItem('Provider', config.modelRoutingConfig?.defaultProvider, 'blue'),
    kv(
      'Temperature',
      config.modelRoutingConfig?.defaultTemperature != null
        ? String(config.modelRoutingConfig.defaultTemperature)
        : '—',
      'yellow',
    ),
    numItem('Max Input Tokens', config.modelRoutingConfig?.defaultMaxInputTokens),
    strItem('Fallback', config.modelRoutingConfig?.fallbackPolicy, 'yellow'),
    kv('Routes', String(config.modelRoutingConfig?.routes?.length ?? 0), 'yellow'),
  ]

  const ragItems = [
    boolItem('Enabled', config.ragConfig?.enabled, 'true', 'false'),
    strItem('Knowledge Base', config.ragConfig?.defaultKnowledgeBaseId, 'blue'),
    numItem('Top-K', config.ragConfig?.topK),
    kv(
      'Similarity',
      config.ragConfig?.similarityThreshold != null ? String(config.ragConfig.similarityThreshold) : '—',
      'yellow',
    ),
    boolItem('Citations', config.ragConfig?.citationsEnabled, 'enabled', 'disabled'),
    boolItem('Grounded', config.ragConfig?.groundedAnswerRequired, 'required', 'optional'),
  ]

  const memoryItems = [
    boolItem('Enabled', config.memoryConfig?.enabled, 'true', 'false'),
    strItem('Store', config.memoryConfig?.storeType, 'blue'),
    numItem('Window', config.memoryConfig?.messageWindowSize, ' msgs'),
    numItem('TTL', config.memoryConfig?.ttlMinutes, ' min'),
    boolItem('Persist History', config.memoryConfig?.persistChatHistory, 'true', 'false'),
    boolItem('Summarize Old', config.memoryConfig?.summarizeOldMessages, 'true', 'false'),
  ]

  const toolItems = [
    boolItem('Enabled', config.toolConfig?.enabled, 'true', 'false'),
    boolItem('Runtime Override', config.toolConfig?.allowRuntimeSubsetSelection, 'allowed', 'fixed'),
    numItem('Max Calls / Req', config.toolConfig?.maxToolCallsPerRequest),
    numItem('Timeout', config.toolConfig?.toolTimeoutMs, ' ms'),
    kv('Tools', String(config.toolConfig?.allowedTools?.length ?? 0) + ' tools', 'yellow'),
  ]

  const safetyItems = [
    boolItem('Block Unknown Tools', config.safetyConfig?.blockUnknownTools, 'true', 'false'),
    boolItem('Mask PII in Logs', config.safetyConfig?.maskSensitiveDataInLogs, 'true', 'false'),
    kv('Disallowed Topics', String(config.safetyConfig?.disallowedTopics?.length ?? 0), 'yellow'),
    numItem('Max Output Tokens', config.responseConfig?.maxOutputTokens),
    boolItem('Streaming', config.responseConfig?.streamEnabled, 'enabled', 'disabled'),
  ]

  // Single card: card-header + config-grid (matches prototype exactly)
  return (
    <div
      className="rounded-[var(--radius)] border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
        padding: '18px',
      }}
    >
      {/* card-header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
            {config.assistantName ?? config.assistantCode}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
            {[
              config.assistantCode,
              config.tenantId,
              config.configVersion ? `Config v${config.configVersion}` : null,
              config.resolvedAt ? `Resolved ${formatDate(config.resolvedAt)}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
        <Badge status={config.active ? 'active' : 'inactive'} />
      </div>

      {/* config-grid: 2 columns, gap 10px */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <KvGrid title="Prompt" icon="📝" items={promptItems} />
        <KvGrid title="Routing" icon="🔀" items={routingItems} />
        <KvGrid title="RAG" icon="🗃️" items={ragItems} />
        <KvGrid title="Memory" icon="🧠" items={memoryItems} />
        <KvGrid title="Tools" icon="🔧" items={toolItems} />
        <KvGrid title="Safety" icon="🛡️" items={safetyItems} />
      </div>
    </div>
  )
}

import { useState } from 'react'
import { formatDuration, formatTokens } from '@/utils/formatters'
import type { LocalMessage } from './hooks/useChat'

interface Props {
  messages: LocalMessage[]
}

type Tab = 'summary' | 'keyfacts' | 'sources' | 'stats'

const TABS: { id: Tab; label: string }[] = [
  { id: 'summary', label: '📋 Summary' },
  { id: 'keyfacts', label: '🔑 Key Facts' },
  { id: 'sources', label: '📚 Sources' },
  { id: 'stats', label: '📊 Stats' },
]

export function ContextPanel({ messages }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  const assistantMessages = messages.filter((m) => m.role === 'assistant' && !m.isStreaming)
  const lastAssistant = assistantMessages[assistantMessages.length - 1]
  const allCitations = assistantMessages.flatMap((m) => m.citations ?? [])
  const totalInputTokens = assistantMessages.reduce((sum, m) => sum + (m.inputTokens ?? 0), 0)
  const totalOutputTokens = assistantMessages.reduce((sum, m) => sum + (m.outputTokens ?? 0), 0)
  const allToolExecs = assistantMessages.flatMap((m) => m.toolExecutions ?? [])
  const userTurns = messages.filter((m) => m.role === 'user').length

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
    >
      {/* Tab bar — matches prototype ctx-tabs */}
      <div className="flex shrink-0 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              className="transition-colors hover:text-[var(--text)]"
              style={{
                flex: 1,
                padding: '10px 4px',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: active ? 'var(--accent)' : 'var(--muted)',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                whiteSpace: 'nowrap',
                minWidth: '60px',
                background: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'summary' && <SummaryTab lastAssistant={lastAssistant} turns={userTurns} />}
        {activeTab === 'keyfacts' && <KeyFactsTab lastAssistant={lastAssistant} />}
        {activeTab === 'sources' && <SourcesTab citations={allCitations} />}
        {activeTab === 'stats' && (
          <StatsTab
            totalInputTokens={totalInputTokens}
            totalOutputTokens={totalOutputTokens}
            messageCount={messages.length}
            turnCount={userTurns}
            citationCount={allCitations.length}
            toolExecs={allToolExecs}
            lastLatencyMs={lastAssistant?.latencyMs}
          />
        )}
      </div>
    </div>
  )
}

/* ── Summary Tab ────────────────────────────────────────── */
function SummaryTab({ lastAssistant, turns }: { lastAssistant?: LocalMessage; turns: number }) {
  return (
    <div>
      {/* Conversation Summary */}
      <Section label="Conversation Summary">
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12px',
            lineHeight: 1.65,
            color: lastAssistant ? 'var(--text)' : 'var(--muted)',
            fontStyle: lastAssistant ? 'normal' : 'italic',
          }}
        >
          {lastAssistant
            ? `${turns} turn${turns !== 1 ? 's' : ''} completed. Last reply from ${lastAssistant.selectedProvider ?? 'assistant'}/${lastAssistant.selectedModel ?? 'unknown'}.`
            : 'Summary will appear here after the first assistant reply.'}
        </div>
      </Section>

      <Divider />

      {/* Last Response stats grid */}
      <Section label="Last Response">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <MiniStat label="Model" value={lastAssistant?.selectedModel ?? '—'} />
          <MiniStat label="Latency" value={formatDuration(lastAssistant?.latencyMs)} />
          <MiniStat label="In Tokens" value={formatTokens(lastAssistant?.inputTokens)} color="var(--green)" />
          <MiniStat label="Out Tokens" value={formatTokens(lastAssistant?.outputTokens)} color="var(--accent)" />
        </div>
      </Section>
    </div>
  )
}

/* ── Key Facts Tab ──────────────────────────────────────── */
function KeyFactsTab({ lastAssistant }: { lastAssistant?: LocalMessage }) {
  const m = lastAssistant?.metadata

  return (
    <div>
      <Section label="Pipeline Flags">
        {m ? (
          <div className="flex flex-col gap-1.5">
            <FactRow label="RAG Used" value={m.ragUsed ? '✅ Yes' : '❌ No'} cls={m.ragUsed ? 'green' : ''} />
            <FactRow label="Memory Used" value={m.memoryUsed ? '✅ Yes' : '❌ No'} cls={m.memoryUsed ? 'green' : ''} />
            <FactRow label="Tools Used" value={m.toolsUsed ? '✅ Yes' : '❌ No'} cls={m.toolsUsed ? 'green' : ''} />
            <FactRow label="Streamed" value={m.streamed ? '✅ Yes' : '❌ No'} cls={m.streamed ? 'green' : ''} />
            <FactRow label="Knowledge Base" value={m.knowledgeBaseId ?? '—'} cls="blue" />
            <FactRow label="Prompt Version" value={m.promptVersion ?? '—'} />
            <FactRow label="Config Version" value={m.configVersion ?? '—'} />
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>No metadata available yet.</p>
        )}
      </Section>
    </div>
  )
}

/* ── Sources Tab ────────────────────────────────────────── */
function SourcesTab({ citations }: { citations: NonNullable<LocalMessage['citations']> }) {
  return (
    <Section label="All Session Citations">
      {citations.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>No citations yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {citations.map((c, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                📄 {c.title ?? `Source ${i + 1}`}
              </div>
              {c.location && (
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>{c.location}</div>
              )}
              {c.snippet && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--muted)',
                    marginTop: '6px',
                    lineHeight: 1.5,
                    borderLeft: '2px solid var(--border)',
                    paddingLeft: '8px',
                  }}
                >
                  {c.snippet}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

/* ── Stats Tab ──────────────────────────────────────────── */
function StatsTab({
  totalInputTokens,
  totalOutputTokens,
  messageCount,
  turnCount,
  citationCount,
  toolExecs,
  lastLatencyMs,
}: {
  totalInputTokens: number
  totalOutputTokens: number
  messageCount: number
  turnCount: number
  citationCount: number
  toolExecs: NonNullable<LocalMessage['toolExecutions']>
  lastLatencyMs?: number
}) {
  const latPct = lastLatencyMs ? Math.min((lastLatencyMs / 3000) * 100, 100) : 0

  return (
    <div>
      {/* 2-column mini-stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '14px' }}>
        <MiniStatLarge label="Messages" value={messageCount} />
        <MiniStatLarge label="Turns" value={turnCount} />
        <MiniStatLarge label="Total In Tokens" value={totalInputTokens} color="var(--green)" />
        <MiniStatLarge label="Total Out Tokens" value={totalOutputTokens} color="var(--accent)" />
        <MiniStatLarge label="Citations" value={citationCount} />
        <MiniStatLarge label="Tool Calls" value={toolExecs.length} />
      </div>

      {/* Avg Latency progress bar */}
      <div style={{ padding: '0 14px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>
          <span>Avg Latency</span>
          <span>{lastLatencyMs != null ? formatDuration(lastLatencyMs) : '—'}</span>
        </div>
        <div style={{ background: 'var(--surface3)', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${latPct}%`,
              height: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            }}
          />
        </div>
      </div>

      {/* Tool executions */}
      <Section label="Tool Executions This Session">
        {toolExecs.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>No tool calls yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {toolExecs.map((t, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{t.toolName}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                    {t.toolType ?? 'TOOL'}{t.latencyMs != null ? ` · ${formatDuration(t.latencyMs)}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: t.success ? 'var(--green)' : 'var(--red)' }}>
                  {t.success ? '✓ OK' : '✗ Fail'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

/* ── Shared sub-components ──────────────────────────────── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px' }}>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '.5px',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 14px' }} />
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '7px',
        padding: '8px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1, color: color ?? 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

function MiniStatLarge({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px 10px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1, color: color ?? 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

function FactRow({ label, value, cls }: { label: string; value: string; cls?: string }) {
  const colorMap: Record<string, string> = {
    green: 'var(--green)',
    red: 'var(--red)',
    blue: 'var(--accent)',
    yellow: 'var(--yellow)',
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '7px',
        padding: '7px 10px',
      }}
    >
      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: '11px', fontWeight: 600, color: cls ? colorMap[cls] : 'var(--text)', textAlign: 'right', maxWidth: '150px' }}>
        {value}
      </span>
    </div>
  )
}

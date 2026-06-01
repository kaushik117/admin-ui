import { memo } from 'react'
import { toast } from 'sonner'
import { formatDate, formatDuration } from '@/utils/formatters'
import type { LocalMessage } from './hooks/useChat'

interface Props {
  message: LocalMessage
}

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

const bubbleBase: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '14px',
  lineHeight: 1.65,
  fontSize: '13px',
  wordBreak: 'break-word',
}

export const MessageBubble = memo(function MessageBubble({ message }: Props) {
  const { isStreaming } = message

  if (message.role === 'user') {
    return (
      /* msg-row user: flex gap:10px flex-direction:row-reverse */
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'row-reverse' }}>
        {/* msg-avatar user-av */}
        <div
          style={{
            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, marginTop: '2px',
          }}
        >
          U
        </div>
        {/* msg-body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '75%', minWidth: 0 }}>
          {/* msg-meta user: row-reverse */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexDirection: 'row-reverse', fontSize: '10px', color: 'var(--muted)' }}>
            <span>You</span>
            <span>{formatDate(message.timestamp)}</span>
          </div>
          {/* bubble */}
          <div
            style={{ ...bubbleBase, background: 'var(--user-bubble)', color: 'var(--user-text)', borderBottomRightRadius: '4px' }}
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
        </div>
      </div>
    )
  }

  const displayContent = isStreaming ? message.content + '▌' : message.content

  return (
    /* msg-row assistant: flex gap:10px */
    <div style={{ display: 'flex', gap: '10px' }}>
      {/* msg-avatar bot-av */}
      <div
        style={{
          width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
          background: 'var(--surface3)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', marginTop: '2px',
        }}
      >
        🤖
      </div>

      {/* msg-body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '75%', minWidth: 0 }}>
        {/* msg-meta */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '10px', color: 'var(--muted)' }}>
          <span>Assistant</span>
          {isStreaming ? (
            <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: 'var(--muted)' }}>
              ⚡ Streaming…
            </span>
          ) : (
            message.selectedModel && (
              <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: 'var(--muted)' }}>
                {message.selectedModel}
              </span>
            )
          )}
          {!isStreaming && message.latencyMs != null && <span>{formatDuration(message.latencyMs)}</span>}
          {!isStreaming && <span>{formatDate(message.timestamp)}</span>}
        </div>

        {/* bubble */}
        <div
          style={{
            ...bubbleBase,
            background: 'var(--bot-bubble)',
            color: 'var(--text)',
            border: `1px solid ${isStreaming ? 'var(--accent)' : 'var(--bot-border)'}`,
            boxShadow: 'var(--shadow)',
            borderBottomLeftRadius: '4px',
            transition: 'background var(--transition), border-color var(--transition)',
          }}
          dangerouslySetInnerHTML={{ __html: formatContent(displayContent) }}
        />

        {/* Citation chips — msg-citations */}
        {!isStreaming && message.citations && message.citations.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
            {message.citations.map((c, i) => (
              <button
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '20px', padding: '3px 10px',
                  fontSize: '10px', color: 'var(--accent)', cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = 'var(--surface3)'; el.style.borderColor = 'var(--accent)' }}
                onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = 'var(--surface2)'; el.style.borderColor = 'var(--border)' }}
                onClick={() =>
                  toast.info(c.title ?? 'Citation', {
                    description: `${c.location ?? ''}${c.snippet ? '\n' + c.snippet : ''}`,
                  })
                }
                aria-label={`View citation: ${c.title ?? 'source'}`}
              >
                📄 {c.title ? (c.title.length > 30 ? c.title.slice(0, 30) + '…' : c.title) : `Source ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Tool chips — msg-tools */}
        {!isStreaming && message.toolExecutions && message.toolExecutions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
            {message.toolExecutions.map((t, i) => (
              <span
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: '5px', padding: '2px 8px',
                  fontSize: '10px', color: 'var(--muted)',
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: t.success ? 'var(--green)' : 'var(--red)', display: 'inline-block', flexShrink: 0 }} />
                {t.toolName}{t.latencyMs != null ? ` · ${formatDuration(t.latencyMs)}` : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

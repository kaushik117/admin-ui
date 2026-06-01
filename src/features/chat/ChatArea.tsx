import { useRef, useEffect, useState, useCallback, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { Toggle } from '@/components/ui/Toggle'
import type { LocalMessage } from './hooks/useChat'
import { useChatStore } from '@/store/chatStore'

interface Props {
  sessionId: string | null
  assistantCode: string
  messages: LocalMessage[]
  isPending: boolean
  isStreaming: boolean
  onSend: (text: string) => void
  onClear: () => void
  onCancelStream: () => void
  onOpenSidebar?: () => void
  onOpenContext?: () => void
  showDrawerButtons?: boolean
}

/* ── Icon button matching prototype .btn-icon ── */
function BtnIcon({
  onClick,
  title,
  children,
  disabled,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      aria-label={title}
      style={{
        width: '30px', height: '30px', borderRadius: '6px',
        background: 'var(--surface2)', border: '1px solid var(--border)',
        color: 'var(--muted)', cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', transition: 'all var(--transition)',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        const el = e.currentTarget
        el.style.background = 'var(--surface3)'
        el.style.color = 'var(--text)'
        el.style.borderColor = 'var(--accent)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--surface2)'
        el.style.color = 'var(--muted)'
        el.style.borderColor = 'var(--border)'
      }}
    >
      {children}
    </button>
  )
}

export function ChatArea({
  sessionId,
  assistantCode,
  messages,
  isPending,
  isStreaming,
  onSend,
  onClear,
  onCancelStream,
  onOpenSidebar,
  onOpenContext,
  showDrawerButtons = false,
}: Props) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { streamingEnabled, toggleStreaming } = useChatStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`
  }, [])

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    const text = input.trim()
    if (!text || !assistantCode || !sessionId) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onSend(text)
  }

  function handleCopySessionId() {
    if (sessionId) {
      void navigator.clipboard.writeText(sessionId)
      toast.success('Session ID copied')
    }
  }

  const hasSession = !!sessionId
  const isBusy = isPending || isStreaming
  const canSend = !!input.trim() && !!assistantCode && hasSession && !isBusy

  return (
    /* .chat-area */
    <div
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'var(--bg)', borderRight: '1px solid var(--border)',
        transition: 'background var(--transition)',
      }}
    >
      {/* .chat-topbar */}
      <div
        style={{
          padding: '10px 18px', borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', gap: '10px',
          flexShrink: 0, transition: 'background var(--transition)',
        }}
      >
        {/* Hamburger — show sessions sidebar on tablet */}
        {showDrawerButtons && (
          <BtnIcon onClick={onOpenSidebar ?? (() => {})} title="Open sessions">
            ☰
          </BtnIcon>
        )}

        {/* .chat-topbar-info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}
          >
            {hasSession ? sessionId : 'No session'}
          </div>
          {assistantCode && (
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>
              {assistantCode}
            </div>
          )}
        </div>

        {/* .topbar-actions */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <BtnIcon onClick={handleCopySessionId} title="Copy session ID" disabled={!hasSession}>
            📋
          </BtnIcon>
          <BtnIcon onClick={onClear} title="Clear messages">
            🗑️
          </BtnIcon>
          {showDrawerButtons && (
            <BtnIcon onClick={onOpenContext ?? (() => {})} title="Open context panel">
              📊
            </BtnIcon>
          )}
        </div>
      </div>

      {/* .messages */}
      <div
        style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '18px',
        }}
      >
        {messages.length === 0 && !isBusy && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '36px' }}>💬</div>
            <div style={{ fontSize: '13px' }}>
              {!assistantCode
                ? 'Select an assistant to start chatting'
                : !hasSession
                  ? 'Click "+ New" to start a session'
                  : 'Start a conversation'}
            </div>
            <div style={{ fontSize: '11px' }}>Messages will appear here</div>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {isPending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* .input-area */}
      <div
        style={{
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          background: 'var(--surface)', flexShrink: 0,
          transition: 'background var(--transition)',
        }}
      >
        {/* .input-row */}
        <div
          style={{
            display: 'flex', gap: '8px', alignItems: 'flex-end',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '8px 12px',
            transition: 'border-color var(--transition)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          {/* .msg-input */}
          <textarea
            ref={textareaRef}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--text)', fontSize: '13px', resize: 'none', outline: 'none',
              fontFamily: 'var(--font)', minHeight: '20px', maxHeight: '100px', lineHeight: 1.5,
            }}
            placeholder={
              !assistantCode
                ? 'Select an assistant first…'
                : !hasSession
                  ? 'Create a session first…'
                  : 'Type your message…'
            }
            rows={1}
            value={input}
            disabled={!assistantCode || !hasSession || isBusy}
            onChange={(e) => { setInput(e.target.value); resizeTextarea() }}
            onKeyDown={handleKeyDown}
          />

          {/* send / cancel button — matches .send-btn */}
          {isStreaming ? (
            <button
              onClick={onCancelStream}
              aria-label="Cancel streaming"
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'var(--red)', border: 'none', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '14px', flexShrink: 0,
                transition: 'opacity var(--transition)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '.85' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              ■
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'var(--accent)', border: 'none', color: '#fff',
                cursor: canSend ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '14px', flexShrink: 0,
                opacity: canSend ? 1 : 0.35,
                transition: 'opacity var(--transition)',
              }}
              onMouseEnter={(e) => { if (canSend) e.currentTarget.style.opacity = '.85' }}
              onMouseLeave={(e) => { if (canSend) e.currentTarget.style.opacity = '1' }}
            >
              ➤
            </button>
          )}
        </div>

        {/* .input-footer */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '6px', gap: '10px' }}>
          {/* .input-hint-text */}
          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>⏎ Send &nbsp;⇧⏎ Newline</span>

          {/* .stream-row — margin-left: auto pushes to right */}
          <div
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Toggle
              checked={streamingEnabled}
              onChange={toggleStreaming}
              disabled={isStreaming}
            />
            {/* .stream-label */}
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Streaming: {streamingEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

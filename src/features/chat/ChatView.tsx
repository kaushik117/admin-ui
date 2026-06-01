import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { TopNav } from '@/components/layout/TopNav'
import { Drawer } from '@/components/ui/Drawer'
import { useChatStore } from '@/store/chatStore'
import { useChat, type LocalMessage } from './hooks/useChat'
import { useSSEStream } from './hooks/useSSEStream'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { SessionSidebar } from './SessionSidebar'
import { ChatArea } from './ChatArea'
import { ContextPanel } from './ContextPanel'
import type { ChatRequest } from '@/types/api'

interface SessionEntry {
  id: string
  assistantCode: string
  createdAt: string
}

export default function ChatView() {
  const { assistantCode, tenantId, sessionId, streamingEnabled, newSession } = useChatStore()
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)

  const isDesktop = useMediaQuery('(min-width: 1280px)')

  const { messages, send, isPending, clearMessages, appendMessage, removeMessage } = useChat({
    assistantCode,
    tenantId,
    sessionId: activeSessionId ?? '',
    userId: 'admin-ui-user',
  })

  const { streamingText, isStreaming, startStream, cancel } = useSSEStream()

  useEffect(() => {
    if (!sessionId) return
    setSessions((prev) => {
      if (prev.some((s) => s.id === sessionId)) return prev
      return [{ id: sessionId, assistantCode, createdAt: new Date().toISOString() }, ...prev]
    })
    setActiveSessionId(sessionId)
  }, [sessionId, assistantCode])

  function handleSelectSession(id: string) {
    if (id !== activeSessionId) {
      setActiveSessionId(id)
      clearMessages()
      if (isStreaming) cancel()
    }
    setSidebarOpen(false)
  }

  useEffect(() => {
    if (assistantCode && sessions.length === 0) {
      newSession()
    }
  }, [assistantCode]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStreamSend(text: string) {
    if (!text.trim() || !assistantCode || !activeSessionId) return
    const userMsgId = `user-${Date.now()}`
    appendMessage({
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    })
    const req: ChatRequest = {
      assistantCode,
      tenantId,
      sessionId: activeSessionId,
      userId: 'admin-ui-user',
      message: text,
      runtimeOverride: { streamingEnabled: true },
    }
    try {
      await startStream(req, (accumulatedText, completion) => {
        appendMessage({
          id: completion.messageId ?? `assistant-${Date.now()}`,
          role: 'assistant',
          content: accumulatedText,
          timestamp: completion.timestamp,
          requestId: completion.requestId,
          messageId: completion.messageId ?? undefined,
          selectedModel: completion.selectedModel,
          selectedProvider: completion.selectedProvider,
          citations: completion.citations,
          toolExecutions: completion.toolExecutions,
          metadata: completion.metadata,
          inputTokens: completion.usage?.inputTokens,
          outputTokens: completion.usage?.outputTokens,
          latencyMs: completion.usage?.latencyMs,
        })
      })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        removeMessage(userMsgId)
        toast.error(err instanceof Error ? err.message : 'Streaming failed')
      }
    }
  }

  function handleSend(text: string) {
    if (streamingEnabled) {
      void handleStreamSend(text)
    } else {
      send(text)
    }
  }

  const streamingBubble: LocalMessage | null =
    isStreaming && streamingText
      ? {
          id: 'streaming-bubble',
          role: 'assistant',
          content: streamingText,
          timestamp: new Date().toISOString(),
          isStreaming: true,
        }
      : null

  const effectiveMessages: LocalMessage[] = streamingBubble
    ? [...messages, streamingBubble]
    : messages

  const showTypingIndicator = isPending || (isStreaming && !streamingText)

  const sidebar = (
    <SessionSidebar
      sessions={sessions}
      activeSessionId={activeSessionId}
      onSelectSession={handleSelectSession}
    />
  )

  const contextPanel = <ContextPanel messages={effectiveMessages} />

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: static sidebar column */}
        {isDesktop && (
          <div className="w-[248px] flex-shrink-0 overflow-hidden">
            {sidebar}
          </div>
        )}

        {/* Tablet: sidebar in left drawer */}
        {!isDesktop && (
          <Drawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} side="left" width={248}>
            {sidebar}
          </Drawer>
        )}

        {/* Chat area — full width on tablet, flex-1 on desktop */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ChatArea
            sessionId={activeSessionId}
            assistantCode={assistantCode}
            messages={effectiveMessages}
            isPending={showTypingIndicator}
            isStreaming={isStreaming}
            onSend={handleSend}
            onClear={clearMessages}
            onCancelStream={cancel}
            showDrawerButtons={!isDesktop}
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenContext={() => setContextOpen(true)}
          />
        </div>

        {/* Desktop: static context panel column */}
        {isDesktop && (
          <div className="w-[320px] flex-shrink-0 overflow-hidden">
            {contextPanel}
          </div>
        )}

        {/* Tablet: context panel in right drawer */}
        {!isDesktop && (
          <Drawer open={contextOpen} onClose={() => setContextOpen(false)} side="right" width={320}>
            {contextPanel}
          </Drawer>
        )}
      </div>
    </div>
  )
}

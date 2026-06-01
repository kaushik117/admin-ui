import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { chatApi } from '@/api/chat'
import type { ChatRequest, ChatResponse, ResponseCitation, ToolExecutionSummary, ResponseMetadata } from '@/types/api'

export interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isStreaming?: boolean
  // assistant-only fields
  requestId?: string
  messageId?: string
  selectedModel?: string
  selectedProvider?: string
  finishReason?: string
  citations?: ResponseCitation[]
  toolExecutions?: ToolExecutionSummary[]
  metadata?: ResponseMetadata
  inputTokens?: number
  outputTokens?: number
  latencyMs?: number
}

interface UseChatOptions {
  assistantCode: string
  tenantId: string
  sessionId: string
  userId: string
}

export function useChat({ assistantCode, tenantId, sessionId, userId }: UseChatOptions) {
  const [messages, setMessages] = useState<LocalMessage[]>([])

  const { mutate: sendBlocking, isPending } = useMutation({
    mutationFn: (req: ChatRequest) => chatApi.send(req),
    onMutate: (req) => {
      const optimisticId = `user-${Date.now()}`
      const userMsg: LocalMessage = {
        id: optimisticId,
        role: 'user',
        content: req.message,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      return { optimisticId }
    },
    onSuccess: (data: ChatResponse, _vars, ctx) => {
      const assistantMsg: LocalMessage = {
        id: data.messageId ?? `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: data.timestamp,
        requestId: data.requestId,
        messageId: data.messageId,
        selectedModel: data.selectedModel,
        selectedProvider: data.selectedProvider,
        finishReason: data.finishReason ?? undefined,
        citations: data.citations,
        toolExecutions: data.toolExecutions,
        metadata: data.metadata,
        inputTokens: data.usage?.inputTokens,
        outputTokens: data.usage?.outputTokens,
        latencyMs: data.usage?.latencyMs,
      }
      setMessages((prev) => [...prev, assistantMsg])
      void ctx
    },
    onError: (err: unknown, _vars, ctx) => {
      if (ctx?.optimisticId) {
        setMessages((prev) => prev.filter((m) => m.id !== ctx.optimisticId))
      }
      const message = err instanceof Error ? err.message : 'Failed to send message'
      toast.error(message)
    },
  })

  const send = useCallback(
    (message: string) => {
      if (!message.trim() || !assistantCode || !sessionId) return
      const req: ChatRequest = { assistantCode, tenantId, sessionId, userId, message }
      sendBlocking(req)
    },
    [assistantCode, tenantId, sessionId, userId, sendBlocking],
  )

  const clearMessages = useCallback(() => setMessages([]), [])

  const appendMessage = useCallback((msg: LocalMessage) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return { messages, send, isPending, clearMessages, appendMessage, removeMessage }
}

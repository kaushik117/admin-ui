import { apiClient } from './client'
import type {
  ChatRequest,
  ChatResponse,
  SessionMessagesResponse,
  SessionSummary,
  StreamingChatChunk,
  StreamingCompletion,
} from '@/types/api'

export const chatApi = {
  send: (req: ChatRequest) =>
    apiClient.post<ChatResponse>('/api/v1/chat', req).then((r) => r.data),

  getSession: (sessionId: string) =>
    apiClient.get<SessionSummary>(`/api/v1/sessions/${sessionId}`).then((r) => r.data),

  getMessages: (sessionId: string, limit = 50) =>
    apiClient
      .get<SessionMessagesResponse>(`/api/v1/sessions/${sessionId}/messages`, {
        params: { limit },
      })
      .then((r) => r.data),

  stream: (req: ChatRequest, signal?: AbortSignal) => streamChat(req, signal),
}

async function* streamChat(
  req: ChatRequest,
  signal?: AbortSignal,
): AsyncGenerator<StreamingChatChunk | StreamingCompletion> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
  const res = await fetch(`${baseUrl}/api/v1/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(req),
    signal,
  })

  if (!res.ok) {
    throw new Error(`SSE error: ${res.status} ${res.statusText}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop()!
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const payload = line.slice(5).trim() // trim handles optional space and trailing \r
          if (payload && payload !== '[DONE]') {
            yield JSON.parse(payload) as StreamingChatChunk | StreamingCompletion
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

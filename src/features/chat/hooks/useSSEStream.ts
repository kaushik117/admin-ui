import { useState, useRef } from 'react'
import { chatApi } from '@/api/chat'
import type { ChatRequest, StreamingCompletion } from '@/types/api'

export function useSSEStream() {
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  async function startStream(
    req: ChatRequest,
    onDone: (accumulatedText: string, completion: StreamingCompletion) => void,
  ): Promise<void> {
    const controller = new AbortController()
    controllerRef.current = controller

    setIsStreaming(true)
    setStreamingText('')
    let accumulated = ''

    try {
      for await (const event of chatApi.stream(req, controller.signal)) {
        if (event.eventType === 'message') {
          accumulated += event.contentChunk ?? ''
          setStreamingText(accumulated)
        } else if (event.eventType === 'completion') {
          onDone(accumulated, event)
          break
        }
      }
    } finally {
      setIsStreaming(false)
      setStreamingText('')
      controllerRef.current = null
    }
  }

  function cancel() {
    controllerRef.current?.abort()
  }

  return { streamingText, isStreaming, startStream, cancel }
}

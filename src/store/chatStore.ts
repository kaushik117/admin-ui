import { create } from 'zustand'

interface ChatStore {
  assistantCode: string
  tenantId: string
  sessionId: string | null
  streamingEnabled: boolean
  setAssistant: (code: string) => void
  setTenant: (id: string) => void
  setSession: (id: string | null) => void
  toggleStreaming: () => void
  newSession: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  assistantCode: '',
  tenantId: 'default',
  sessionId: null,
  streamingEnabled: false,
  setAssistant: (code) => set({ assistantCode: code }),
  setTenant: (id) => set({ tenantId: id }),
  setSession: (id) => set({ sessionId: id }),
  toggleStreaming: () => set((s) => ({ streamingEnabled: !s.streamingEnabled })),
  newSession: () => set({ sessionId: `sess-${crypto.randomUUID().slice(0, 8)}` }),
}))

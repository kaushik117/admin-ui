import { apiClient } from './client'
import type { UserSessionsResponse, SessionMessagesResponse } from '@/types/api'

export const sessionsApi = {
  getUserSessions: (userId: string, tenantId: string) =>
    apiClient
      .get<UserSessionsResponse>(`/api/v1/users/${userId}/sessions`, {
        params: { tenantId },
      })
      .then((r) => r.data),

  getMessages: (sessionId: string, limit = 50) =>
    apiClient
      .get<SessionMessagesResponse>(`/api/v1/sessions/${sessionId}/messages`, {
        params: { limit },
      })
      .then((r) => r.data),
}

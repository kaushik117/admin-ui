import { apiClient } from '@/api/client'
import type { AdminSessionSummary, SessionStatus } from '@/types/api'

export interface AdminSessionsQueryParams {
  tenantId?: string
  userId?: string
  assistantCode?: string
  status?: SessionStatus
  from?: string
  to?: string
  page?: number
  size?: number
}

export const adminSessionsApi = {
  list: (params?: AdminSessionsQueryParams) => {
    const backendParams = params
      ? { ...params, page: params.page != null ? params.page - 1 : 0 }
      : params
    return apiClient
      .get<AdminSessionSummary[]>('/api/v1/admin/sessions', { params: backendParams })
      .then((r) => r.data)
  },

  close: (sessionId: string) =>
    apiClient
      .post<AdminSessionSummary>(`/api/v1/admin/sessions/${sessionId}/close`)
      .then((r) => r.data),

  delete: (sessionId: string) =>
    apiClient
      .delete<void>(`/api/v1/admin/sessions/${sessionId}`)
      .then((r) => r.data),
}

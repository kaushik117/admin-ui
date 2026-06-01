import { apiClient } from '@/api/client'
import type { AssistantDto, AssistantSummary, CreateAssistantRequest, UpdateAssistantRequest } from '@/types/api'

export const assistantsApi = {
  list: (params?: { active?: boolean; tenantScope?: string }) =>
    apiClient
      .get<AssistantSummary[]>('/api/v1/admin/assistants', { params })
      .then((r) => r.data),

  get: (assistantCode: string) =>
    apiClient
      .get<AssistantDto>(`/api/v1/admin/assistants/${assistantCode}`)
      .then((r) => r.data),

  create: (req: CreateAssistantRequest) =>
    apiClient
      .post<AssistantDto>('/api/v1/admin/assistants', req)
      .then((r) => r.data),

  update: (assistantCode: string, req: UpdateAssistantRequest) =>
    apiClient
      .put<AssistantDto>(`/api/v1/admin/assistants/${assistantCode}`, req)
      .then((r) => r.data),

  activate: (assistantCode: string) =>
    apiClient
      .post<AssistantDto>(`/api/v1/admin/assistants/${assistantCode}/activate`)
      .then((r) => r.data),

  deactivate: (assistantCode: string) =>
    apiClient
      .post<AssistantDto>(`/api/v1/admin/assistants/${assistantCode}/deactivate`)
      .then((r) => r.data),
}

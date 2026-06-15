import { apiClient } from '@/api/client'
import type { RagAuditRecordDto, ToolAuditRecordDto, ToolType } from '@/types/api'

export interface ToolAuditQueryParams {
  toolName?: string
  toolType?: ToolType
  success?: boolean
  sessionId?: string
  requestId?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface RagAuditQueryParams {
  knowledgeBaseId?: string
  groundedMode?: boolean
  sessionId?: string
  requestId?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export const auditApi = {
  listToolAuditRecords: (params?: ToolAuditQueryParams) => {
    const backendParams = params
      ? { ...params, page: params.page != null ? params.page - 1 : 0 }
      : params
    return apiClient
      .get<ToolAuditRecordDto[]>('/api/v1/admin/audit/tools', { params: backendParams })
      .then((r) => r.data)
  },

  getToolAuditRecord: (id: number) =>
    apiClient
      .get<ToolAuditRecordDto>(`/api/v1/admin/audit/tools/${id}`)
      .then((r) => r.data),

  listRagAuditRecords: (params?: RagAuditQueryParams) => {
    const backendParams = params
      ? { ...params, page: params.page != null ? params.page - 1 : 0 }
      : params
    return apiClient
      .get<RagAuditRecordDto[]>('/api/v1/admin/audit/rag', { params: backendParams })
      .then((r) => r.data)
  },

  getRagAuditRecord: (id: number) =>
    apiClient
      .get<RagAuditRecordDto>(`/api/v1/admin/audit/rag/${id}`)
      .then((r) => r.data),
}

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
  listToolAuditRecords: (params?: ToolAuditQueryParams) =>
    apiClient
      .get<ToolAuditRecordDto[]>('/api/v1/admin/audit/tools', { params })
      .then((r) => r.data),

  getToolAuditRecord: (id: number) =>
    apiClient
      .get<ToolAuditRecordDto>(`/api/v1/admin/audit/tools/${id}`)
      .then((r) => r.data),

  listRagAuditRecords: (params?: RagAuditQueryParams) =>
    apiClient
      .get<RagAuditRecordDto[]>('/api/v1/admin/audit/rag', { params })
      .then((r) => r.data),

  getRagAuditRecord: (id: number) =>
    apiClient
      .get<RagAuditRecordDto>(`/api/v1/admin/audit/rag/${id}`)
      .then((r) => r.data),
}

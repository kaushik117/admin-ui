import { apiClient } from '@/api/client'
import type { ExecutionRecordDto } from '@/types/api'

export interface ExecutionQueryParams {
  assistantCode?: string
  tenantId?: string
  success?: boolean
  provider?: string
  model?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export const executionsApi = {
  list: (params?: ExecutionQueryParams) =>
    apiClient
      .get<ExecutionRecordDto[]>('/api/v1/admin/executions', { params })
      .then((r) => r.data),

  get: (requestId: string) =>
    apiClient
      .get<ExecutionRecordDto>(`/api/v1/admin/executions/${requestId}`)
      .then((r) => r.data),
}

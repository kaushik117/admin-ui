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
  list: (params?: ExecutionQueryParams) => {
    const backendParams = params
      ? { ...params, page: params.page != null ? params.page - 1 : 0 }
      : params
    return apiClient
      .get<ExecutionRecordDto[]>('/api/v1/admin/executions', { params: backendParams })
      .then((r) => r.data)
  },

  get: (requestId: string) =>
    apiClient
      .get<ExecutionRecordDto>(`/api/v1/admin/executions/${requestId}`)
      .then((r) => r.data),
}

import { apiClient } from '@/api/client'
import type { ResolvedAssistantConfig } from '@/types/api'

export const configApi = {
  getResolvedConfig: (assistantCode: string, tenantId?: string) =>
    apiClient
      .get<ResolvedAssistantConfig>(`/api/v1/admin/assistants/${assistantCode}/config`, {
        params: tenantId ? { tenantId } : undefined,
      })
      .then((r) => r.data),

  evictAssistantCache: (assistantCode: string, tenantId?: string) =>
    apiClient.delete(`/api/v1/admin/assistants/${assistantCode}/config/cache`, {
      params: tenantId ? { tenantId } : undefined,
    }),

  evictAllCache: () => apiClient.delete('/api/v1/admin/config/cache'),
}

import { apiClient } from '@/api/client'
import type { PlatformStatsDto } from '@/types/api'

export const statsApi = {
  getPlatformStats: () =>
    apiClient.get<PlatformStatsDto>('/api/v1/admin/stats').then((r) => r.data),
}

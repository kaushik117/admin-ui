import { useQuery } from '@tanstack/react-query'
import {
  auditApi,
  type ToolAuditQueryParams,
  type RagAuditQueryParams,
} from '@/api/admin/audit'

export function useToolAudit(params?: ToolAuditQueryParams) {
  return useQuery({
    queryKey: ['audit', 'tools', params],
    queryFn: () => auditApi.listToolAuditRecords(params),
    staleTime: 0,
  })
}

export function useRagAudit(params?: RagAuditQueryParams) {
  return useQuery({
    queryKey: ['audit', 'rag', params],
    queryFn: () => auditApi.listRagAuditRecords(params),
    staleTime: 0,
  })
}

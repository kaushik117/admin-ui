import { useQuery } from '@tanstack/react-query'
import { executionsApi, type ExecutionQueryParams } from '@/api/admin/executions'

export function useExecutions(params?: ExecutionQueryParams) {
  return useQuery({
    queryKey: ['executions', params],
    queryFn: () => executionsApi.list(params),
    staleTime: 0,
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { policiesApi } from '@/api/admin/policies'
import type { ApiError } from '@/api/client'
import type {
  UpsertMemoryPolicyRequest,
  UpsertRagPolicyRequest,
  UpsertResponsePolicyRequest,
  UpsertSafetyPolicyRequest,
  CreateToolPolicyRequest,
  UpdateToolPolicyRequest,
  ToolPolicyDto,
} from '@/types/api'

// ── Memory Policy ────────────────────────────────────────────────────────────

export function useMemoryPolicy(assistantCode: string) {
  return useQuery({
    queryKey: ['policies', assistantCode, 'memory'],
    queryFn: () => policiesApi.getMemoryPolicy(assistantCode),
    enabled: !!assistantCode,
    staleTime: 60_000,
    retry: (count, err: ApiError) => err.errorCode === 'CONFIG_NOT_FOUND' || err.errorCode === 'ASSISTANT_NOT_FOUND' ? false : count < 1,
  })
}

export function useUpsertMemoryPolicy(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: UpsertMemoryPolicyRequest) =>
      policiesApi.upsertMemoryPolicy(assistantCode, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies', assistantCode, 'memory'] })
      toast.success('Memory policy saved')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

// ── RAG Policy ────────────────────────────────────────────────────────────────

export function useRagPolicy(assistantCode: string) {
  return useQuery({
    queryKey: ['policies', assistantCode, 'rag'],
    queryFn: () => policiesApi.getRagPolicy(assistantCode),
    enabled: !!assistantCode,
    staleTime: 60_000,
    retry: (count, err: ApiError) => err.errorCode === 'CONFIG_NOT_FOUND' || err.errorCode === 'ASSISTANT_NOT_FOUND' ? false : count < 1,
  })
}

export function useUpsertRagPolicy(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: UpsertRagPolicyRequest) =>
      policiesApi.upsertRagPolicy(assistantCode, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies', assistantCode, 'rag'] })
      toast.success('RAG policy saved')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

// ── Response Policy ───────────────────────────────────────────────────────────

export function useResponsePolicy(assistantCode: string) {
  return useQuery({
    queryKey: ['policies', assistantCode, 'response'],
    queryFn: () => policiesApi.getResponsePolicy(assistantCode),
    enabled: !!assistantCode,
    staleTime: 60_000,
    retry: (count, err: ApiError) => err.errorCode === 'CONFIG_NOT_FOUND' || err.errorCode === 'ASSISTANT_NOT_FOUND' ? false : count < 1,
  })
}

export function useUpsertResponsePolicy(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: UpsertResponsePolicyRequest) =>
      policiesApi.upsertResponsePolicy(assistantCode, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies', assistantCode, 'response'] })
      toast.success('Response policy saved')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

// ── Safety Policy ─────────────────────────────────────────────────────────────

export function useSafetyPolicy(assistantCode: string) {
  return useQuery({
    queryKey: ['policies', assistantCode, 'safety'],
    queryFn: () => policiesApi.getSafetyPolicy(assistantCode),
    enabled: !!assistantCode,
    staleTime: 60_000,
    retry: (count, err: ApiError) => err.errorCode === 'CONFIG_NOT_FOUND' || err.errorCode === 'ASSISTANT_NOT_FOUND' ? false : count < 1,
  })
}

export function useUpsertSafetyPolicy(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: UpsertSafetyPolicyRequest) =>
      policiesApi.upsertSafetyPolicy(assistantCode, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies', assistantCode, 'safety'] })
      toast.success('Safety policy saved')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

// ── Tool Policies ─────────────────────────────────────────────────────────────

export function useToolPolicies(assistantCode: string) {
  return useQuery({
    queryKey: ['policies', assistantCode, 'tools'],
    queryFn: () => policiesApi.listToolPolicies(assistantCode),
    enabled: !!assistantCode,
    staleTime: 60_000,
  })
}

export function useCreateToolPolicy(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateToolPolicyRequest) =>
      policiesApi.createToolPolicy(assistantCode, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies', assistantCode, 'tools'] })
      toast.success('Tool policy added')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useUpdateToolPolicy(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateToolPolicyRequest }) =>
      policiesApi.updateToolPolicy(assistantCode, id, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies', assistantCode, 'tools'] })
      toast.success('Tool policy updated')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useToggleToolPolicy(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      policiesApi.updateToolPolicy(assistantCode, id, { enabled }),
    onMutate: async ({ id, enabled }) => {
      await qc.cancelQueries({ queryKey: ['policies', assistantCode, 'tools'] })
      const prev = qc.getQueryData<ToolPolicyDto[]>(['policies', assistantCode, 'tools'])
      qc.setQueryData<ToolPolicyDto[]>(['policies', assistantCode, 'tools'], (old) =>
        old?.map((t) => (t.id === id ? { ...t, enabled } : t)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['policies', assistantCode, 'tools'], ctx.prev)
      toast.error('Failed to toggle tool policy')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['policies', assistantCode, 'tools'] }),
  })
}

export function useDeleteToolPolicy(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => policiesApi.deleteToolPolicy(assistantCode, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies', assistantCode, 'tools'] })
      toast.success('Tool policy deleted')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

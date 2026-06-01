import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { promptTemplatesApi } from '@/api/admin/prompt-templates'
import type { ApiError } from '@/api/client'
import type { CreatePromptTemplateRequest, PromptTemplateSummary, UpdatePromptTemplateRequest } from '@/types/api'

function queryKey(assistantCode: string) {
  return ['assistants', assistantCode, 'prompt-templates'] as const
}

export function usePromptTemplates(assistantCode: string) {
  return useQuery({
    queryKey: queryKey(assistantCode),
    queryFn: () => promptTemplatesApi.list(assistantCode),
    enabled: !!assistantCode,
    staleTime: 60_000,
  })
}

export function useCreatePromptTemplate(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreatePromptTemplateRequest) =>
      promptTemplatesApi.create(assistantCode, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(assistantCode) })
      toast.success('Template version created')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useUpdatePromptTemplate(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdatePromptTemplateRequest }) =>
      promptTemplatesApi.update(assistantCode, id, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(assistantCode) })
      toast.success('Template version updated')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

export function useActivatePromptTemplate(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => promptTemplatesApi.activate(assistantCode, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKey(assistantCode) })
      const previous = qc.getQueryData<PromptTemplateSummary[]>(queryKey(assistantCode))
      qc.setQueryData<PromptTemplateSummary[]>(queryKey(assistantCode), (old) =>
        old?.map((t) => ({ ...t, active: t.id === id })),
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queryKey(assistantCode), ctx.previous)
      }
      toast.error('Failed to activate template')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKey(assistantCode) }),
    onSuccess: () => toast.success('Template activated'),
  })
}

export function useDeletePromptTemplate(assistantCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => promptTemplatesApi.delete(assistantCode, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(assistantCode) })
      toast.success('Template deleted')
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}

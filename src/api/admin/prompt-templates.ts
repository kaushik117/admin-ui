import { apiClient } from '@/api/client'
import type {
  PromptTemplateDto,
  PromptTemplateSummary,
  CreatePromptTemplateRequest,
  UpdatePromptTemplateRequest,
} from '@/types/api'

export const promptTemplatesApi = {
  list: (assistantCode: string) =>
    apiClient
      .get<PromptTemplateSummary[]>(
        `/api/v1/admin/assistants/${assistantCode}/prompt-templates`,
      )
      .then((r) => r.data),

  get: (assistantCode: string, id: number) =>
    apiClient
      .get<PromptTemplateDto>(
        `/api/v1/admin/assistants/${assistantCode}/prompt-templates/${id}`,
      )
      .then((r) => r.data),

  create: (assistantCode: string, req: CreatePromptTemplateRequest) =>
    apiClient
      .post<PromptTemplateDto>(
        `/api/v1/admin/assistants/${assistantCode}/prompt-templates`,
        req,
      )
      .then((r) => r.data),

  update: (assistantCode: string, id: number, req: UpdatePromptTemplateRequest) =>
    apiClient
      .put<PromptTemplateDto>(
        `/api/v1/admin/assistants/${assistantCode}/prompt-templates/${id}`,
        req,
      )
      .then((r) => r.data),

  activate: (assistantCode: string, id: number) =>
    apiClient
      .post<PromptTemplateDto>(
        `/api/v1/admin/assistants/${assistantCode}/prompt-templates/${id}/activate`,
      )
      .then((r) => r.data),

  delete: (assistantCode: string, id: number) =>
    apiClient
      .delete(
        `/api/v1/admin/assistants/${assistantCode}/prompt-templates/${id}`,
      )
      .then((r) => r.data),
}

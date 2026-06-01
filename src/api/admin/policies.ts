import { apiClient } from '@/api/client'
import type {
  MemoryPolicyDto,
  UpsertMemoryPolicyRequest,
  RagPolicyDto,
  UpsertRagPolicyRequest,
  ResponsePolicyDto,
  UpsertResponsePolicyRequest,
  SafetyPolicyDto,
  UpsertSafetyPolicyRequest,
  ToolPolicyDto,
  CreateToolPolicyRequest,
  UpdateToolPolicyRequest,
} from '@/types/api'

export const policiesApi = {
  // ── Memory Policy ──────────────────────────────────────────────────────────
  getMemoryPolicy: (assistantCode: string) =>
    apiClient
      .get<MemoryPolicyDto>(`/api/v1/admin/assistants/${assistantCode}/memory-policy`)
      .then((r) => r.data),

  upsertMemoryPolicy: (assistantCode: string, req: UpsertMemoryPolicyRequest) =>
    apiClient
      .put<MemoryPolicyDto>(`/api/v1/admin/assistants/${assistantCode}/memory-policy`, req)
      .then((r) => r.data),

  // ── RAG Policy ─────────────────────────────────────────────────────────────
  getRagPolicy: (assistantCode: string) =>
    apiClient
      .get<RagPolicyDto>(`/api/v1/admin/assistants/${assistantCode}/rag-policy`)
      .then((r) => r.data),

  upsertRagPolicy: (assistantCode: string, req: UpsertRagPolicyRequest) =>
    apiClient
      .put<RagPolicyDto>(`/api/v1/admin/assistants/${assistantCode}/rag-policy`, req)
      .then((r) => r.data),

  // ── Response Policy ────────────────────────────────────────────────────────
  getResponsePolicy: (assistantCode: string) =>
    apiClient
      .get<ResponsePolicyDto>(`/api/v1/admin/assistants/${assistantCode}/response-policy`)
      .then((r) => r.data),

  upsertResponsePolicy: (assistantCode: string, req: UpsertResponsePolicyRequest) =>
    apiClient
      .put<ResponsePolicyDto>(`/api/v1/admin/assistants/${assistantCode}/response-policy`, req)
      .then((r) => r.data),

  // ── Safety Policy ──────────────────────────────────────────────────────────
  getSafetyPolicy: (assistantCode: string) =>
    apiClient
      .get<SafetyPolicyDto>(`/api/v1/admin/assistants/${assistantCode}/safety-policy`)
      .then((r) => r.data),

  upsertSafetyPolicy: (assistantCode: string, req: UpsertSafetyPolicyRequest) =>
    apiClient
      .put<SafetyPolicyDto>(`/api/v1/admin/assistants/${assistantCode}/safety-policy`, req)
      .then((r) => r.data),

  // ── Tool Policies ──────────────────────────────────────────────────────────
  listToolPolicies: (assistantCode: string, params?: { enabled?: boolean }) =>
    apiClient
      .get<ToolPolicyDto[]>(`/api/v1/admin/assistants/${assistantCode}/tools`, { params })
      .then((r) => r.data),

  createToolPolicy: (assistantCode: string, req: CreateToolPolicyRequest) =>
    apiClient
      .post<ToolPolicyDto>(`/api/v1/admin/assistants/${assistantCode}/tools`, req)
      .then((r) => r.data),

  updateToolPolicy: (assistantCode: string, id: number, req: UpdateToolPolicyRequest) =>
    apiClient
      .put<ToolPolicyDto>(`/api/v1/admin/assistants/${assistantCode}/tools/${id}`, req)
      .then((r) => r.data),

  deleteToolPolicy: (assistantCode: string, id: number) =>
    apiClient
      .delete(`/api/v1/admin/assistants/${assistantCode}/tools/${id}`)
      .then((r) => r.data),
}

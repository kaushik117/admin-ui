# k2pbot Admin UI — Implementation Plan

> **Reference:** [lld.md](./lld.md)  
> **Rule:** Every phase must leave the app buildable (`npm run build` passes) and startable (`npm run dev` renders without crash) before moving to the next phase.  
> **App directory:** `k2pbot-admin-ui/` (sibling of this `docs/` folder, created in Phase 1)

---

## Phase Overview

| # | Phase | Deliverable | Status |
|---|---|---|---|
| 1 | Project Scaffold | Runnable Vite + React + TS + Tailwind shell | ✅ Done |
| 2 | Foundation Layer | Theme tokens, Axios client, API types, Zustand stores, Router skeleton | ✅ Done |
| 3 | UI Primitives | Reusable headless component library | ✅ Done |
| 4 | Chat View — Blocking | Full chat UI backed by `/api/v1/chat` | ✅ Done |
| 5 | Chat View — Streaming | SSE streaming mode backed by `/api/v1/chat/stream` | ✅ Done |
| 6 | Admin Layout | AdminSidebar, routing, lazy page shells | ✅ Done |
| 7 | Dashboard | Platform stats + assistant summary table | ✅ Done |
| 8 | Assistants CRUD | Create / Edit / Activate / Deactivate | ✅ Done |
| 9 | Prompt Templates | Versioned templates, activate, delete | ✅ Done |
| 10 | Model Routes | Priority-ordered routing rules CRUD | ✅ Done |
| 11 | Knowledge Bases | KB register / edit / activate | ✅ Done |
| 12 | Policies | All 5 policy tabs per assistant | ✅ Done |
| 13 | Config Inspector | Resolved config viewer | ✅ Done |
| 14 | Cache Management | Live entries + evict | ✅ Done |
| 15 | Admin Sessions & Messages | Session search, close, delete, message viewer | ✅ Done |
| 16 | Execution Monitor | Execution audit search + detail | ✅ Done |
| 17 | Audit Logs | Tool Audit + RAG Audit tabs | ✅ Done |
| 18 | Tenant Overrides | Tenant override CRUD | ✅ Done |
| 19 | Polish & Hardening | Skeletons, error boundaries, a11y + tablet responsive | ✅ Done |

---

## Phase 1 — Project Scaffold `✅ Done`

**Objective:** Create the `k2pbot-admin-ui` folder with all tooling configured. The dev server renders a blank themed page with no errors.

### Tasks

#### 1.1 Create Vite project
```bash
npm create vite@latest k2pbot-admin-ui -- --template react-ts
cd k2pbot-admin-ui
```

#### 1.2 Install all dependencies
```bash
# Runtime
npm install react-router axios @tanstack/react-query zustand \
  react-hook-form zod @hookform/resolvers \
  lucide-react recharts sonner react-syntax-highlighter \
  clsx tailwind-merge

# Dev
npm install -D tailwindcss @tailwindcss/vite \
  @types/react-syntax-highlighter
```

#### 1.3 Configure Tailwind v4
**File:** `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
```

**File:** `src/index.css`
```css
@import "tailwindcss";

/* ── Theme tokens (exact prototype values) ── */
:root {
  --radius: 10px;
  --font: 'Inter', system-ui, sans-serif;
  --transition: .18s ease;
}

[data-theme="dark"] {
  --bg:          #0f1117;
  --surface:     #1a1d27;
  --surface2:    #22263a;
  --surface3:    #2c3050;
  --border:      #2e3250;
  --accent:      #5b6ef5;
  --accent2:     #7c8bff;
  --green:       #22c55e;
  --yellow:      #f59e0b;
  --red:         #ef4444;
  --text:        #e2e6f3;
  --muted:       #7b82a8;
  --user-bubble: #5b6ef5;
  --user-text:   #fff;
  --bot-bubble:  #1a1d27;
  --bot-border:  #2e3250;
  --shadow:      0 2px 16px rgba(0,0,0,.35);
}

[data-theme="light"] {
  --bg:          #f0f2f8;
  --surface:     #ffffff;
  --surface2:    #f5f6fc;
  --surface3:    #eaecf7;
  --border:      #dde0f0;
  --accent:      #5b6ef5;
  --accent2:     #4458e8;
  --green:       #16a34a;
  --yellow:      #d97706;
  --red:         #dc2626;
  --text:        #1a1d2e;
  --muted:       #6b7280;
  --user-bubble: #5b6ef5;
  --user-text:   #fff;
  --bot-bubble:  #ffffff;
  --bot-border:  #dde0f0;
  --shadow:      0 2px 16px rgba(0,0,40,.08);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  transition: background var(--transition), color var(--transition);
}

/* Scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 3px; }
```

#### 1.4 Configure TypeScript
**File:** `tsconfig.app.json` — add path alias:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### 1.5 Create environment file
**File:** `.env.example`
```bash
VITE_API_BASE_URL=http://localhost:8080
```
**File:** `.env.local` (gitignored)
```bash
VITE_API_BASE_URL=http://localhost:8080
```

#### 1.6 Add `cn` utility
**File:** `src/utils/cn.ts`
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

#### 1.7 Create empty folder structure
Create these directories (place a `.gitkeep` in each):
```
src/api/admin/
src/components/ui/
src/components/layout/
src/components/shared/
src/features/chat/hooks/
src/features/admin/dashboard/
src/features/admin/assistants/hooks/
src/features/admin/prompt-templates/hooks/
src/features/admin/model-routes/hooks/
src/features/admin/knowledge-bases/hooks/
src/features/admin/tenant-overrides/hooks/
src/features/admin/policies/hooks/
src/features/admin/config/
src/features/admin/cache/
src/features/admin/sessions/hooks/
src/features/admin/messages/
src/features/admin/executions/hooks/
src/features/admin/audit/hooks/
src/store/
src/hooks/
src/types/
src/utils/
```

#### 1.8 Verify scaffold
```bash
npm run dev    # must render without errors
npm run build  # must produce dist/ without errors
```

### Acceptance Criteria
- [x] `npm run dev` starts on port 5173 with no console errors
- [x] `npm run build` completes without TypeScript or Vite errors
- [x] Tailwind CSS variables resolve correctly (inspect in DevTools)
- [x] Path alias `@/` resolves in TypeScript

---

## Phase 2 — Foundation Layer `✅ Done`

**Objective:** API client, all TypeScript types, Zustand stores, and React Router shell. The app renders two placeholder routes (`/chat`, `/admin`) with a working TopNav theme toggle.

### Tasks

#### 2.1 Create API types
**File:** `src/types/api.ts`

Define every interface and enum from `openapi.yaml`. Full list (create all at once — this is the canonical type file):

```ts
// ── Enums ────────────────────────────────────────────────
export type SessionStatus = 'ACTIVE' | 'CLOSED' | 'EXPIRED'
export type MemoryStoreType = 'NONE' | 'IN_MEMORY' | 'JDBC'
export type RouteType = 'SIMPLE' | 'KNOWLEDGE_QA' | 'TOOL_HEAVY' | 'LONG_CONTEXT' | 'STRUCTURED_OUTPUT'
export type ToolType = 'LOCAL_BEAN' | 'REST' | 'MCP'
export type FallbackPolicy = 'USE_DEFAULT_MODEL' | 'FAIL_FAST'

// ── Error ─────────────────────────────────────────────────
export interface FieldValidationError { field: string; message: string }
export interface ApiErrorResponse { errorCode: string; errorMessage: string; requestId?: string; timestamp: string; fieldErrors?: FieldValidationError[] }

// ── Chat ──────────────────────────────────────────────────
export interface RuntimeOverride { knowledgeBaseId?: string; memoryStoreType?: MemoryStoreType; enabledToolNames?: string[]; modelHint?: string; streamingEnabled?: boolean }
export interface ChatRequest { assistantCode: string; tenantId: string; sessionId: string; userId: string; message: string; locale?: string; channel?: string; context?: Record<string, unknown>; runtimeOverride?: RuntimeOverride }
export interface ResponseUsage { inputTokens?: number; outputTokens?: number; latencyMs?: number }
export interface ResponseCitation { sourceId?: string; sourceType?: string; title?: string; snippet?: string; location?: string }
export interface ToolExecutionSummary { toolName?: string; toolType?: ToolType; success?: boolean; latencyMs?: number }
export interface ResponseMetadata { ragUsed?: boolean; memoryUsed?: boolean; toolsUsed?: boolean; knowledgeBaseId?: string; promptVersion?: string; configVersion?: string; streamed?: boolean }
export interface ChatResponse { requestId: string; sessionId: string; messageId: string; assistantCode: string; content: string; selectedProvider?: string; selectedModel?: string; finishReason?: string; timestamp: string; usage?: ResponseUsage; citations: ResponseCitation[]; toolExecutions: ToolExecutionSummary[]; metadata?: ResponseMetadata }

// ── Streaming ─────────────────────────────────────────────
export interface StreamingMetadata { selectedModel?: string; selectedProvider?: string; partial?: boolean; finishReason?: string | null }
export interface StreamingChatChunk { requestId: string; sessionId: string; eventType: 'message'; contentChunk?: string; sequenceNumber?: number; timestamp: string; metadata?: StreamingMetadata }
export interface StreamingCompletion { requestId: string; sessionId: string; messageId?: string; eventType: 'completion'; usage?: ResponseUsage; citations: ResponseCitation[]; toolExecutions: ToolExecutionSummary[]; timestamp: string }

// ── Sessions ──────────────────────────────────────────────
export interface SessionSummary { sessionId: string; tenantId?: string; assistantCode?: string; userId?: string; title?: string; status?: SessionStatus; createdAt?: string; updatedAt?: string; lastMessageAt?: string; locale?: string; channel?: string }
export interface MessageDto { messageId?: string; requestId?: string; role?: string; content?: string; selectedModel?: string | null; finishReason?: string | null; hasCitations?: boolean; timestamp?: string }
export interface PageMetadata { size?: number; count?: number; nextCursor?: string | null }
export interface SessionMessagesResponse { sessionId?: string; messages: MessageDto[]; page?: PageMetadata }
export interface UserSessionsResponse { userId?: string; sessions: SessionSummary[]; page?: PageMetadata }

// ── Health ────────────────────────────────────────────────
export interface PingResponse { status?: string; service?: string; timestamp?: string }

// ── Resolved Config ───────────────────────────────────────
export interface ResolvedPromptConfig { systemPromptTemplate?: string; developerPromptTemplate?: string | null; defaultVariables?: Record<string, string>; guardrailInstructions?: string[]; promptVersion?: string }
export interface ResolvedModelRoute { routeName?: string; routeType?: RouteType; minPromptLength?: number | null; maxPromptLength?: number | null; ragEnabledOnly?: boolean; toolsRequiredOnly?: boolean; structuredOutputOnly?: boolean; targetProvider?: string; targetModel?: string; maxInputTokens?: number | null; temperature?: number | null; priority?: number }
export interface ResolvedModelRoutingConfig { defaultModel?: string; defaultProvider?: string; defaultMaxInputTokens?: number; defaultTemperature?: number; fallbackPolicy?: FallbackPolicy; routes?: ResolvedModelRoute[] }
export interface ResolvedRagConfig { enabled?: boolean; defaultKnowledgeBaseId?: string | null; topK?: number; similarityThreshold?: number; retrievalStrategy?: string; citationsEnabled?: boolean; groundedAnswerRequired?: boolean; metadataFilters?: Record<string, string> }
export interface ResolvedMemoryConfig { enabled?: boolean; storeType?: MemoryStoreType; messageWindowSize?: number; ttlMinutes?: number; persistChatHistory?: boolean; summarizeOldMessages?: boolean }
export interface ResolvedToolDefinition { toolName?: string; toolType?: ToolType; requiresApproval?: boolean; timeoutMs?: number | null }
export interface ResolvedToolConfig { enabled?: boolean; allowRuntimeSubsetSelection?: boolean; maxToolCallsPerRequest?: number; toolTimeoutMs?: number; allowedTools?: ResolvedToolDefinition[] }
export interface ResolvedSafetyConfig { blockUnknownTools?: boolean; blockWithoutRagWhenGroundedMode?: boolean; allowDirectModelAnswerWithoutContext?: boolean; maskSensitiveDataInLogs?: boolean; disallowedTopics?: string[] }
export interface ResolvedResponseConfig { defaultTone?: string; defaultFormat?: string; citationRequired?: boolean; markdownEnabled?: boolean; streamEnabled?: boolean; maxOutputTokens?: number }
export interface ResolvedAssistantConfig { assistantCode?: string; tenantId?: string; assistantName?: string; active?: boolean; configVersion?: string; resolvedAt?: string; promptConfig?: ResolvedPromptConfig; modelRoutingConfig?: ResolvedModelRoutingConfig; ragConfig?: ResolvedRagConfig; memoryConfig?: ResolvedMemoryConfig; toolConfig?: ResolvedToolConfig; safetyConfig?: ResolvedSafetyConfig; responseConfig?: ResolvedResponseConfig }

// ── Assistants ────────────────────────────────────────────
export interface AssistantDto { id?: number; assistantCode: string; name: string; description?: string | null; tenantScope?: string | null; configVersion?: string; active?: boolean; createdAt?: string; updatedAt?: string; createdBy?: string | null }
export interface AssistantSummary { assistantCode: string; name: string; tenantScope?: string | null; configVersion?: string; active?: boolean; updatedAt?: string }
export interface CreateAssistantRequest { assistantCode: string; name: string; description?: string | null; tenantScope?: string | null }
export interface UpdateAssistantRequest { name?: string; description?: string | null; tenantScope?: string | null }

// ── Knowledge Bases ───────────────────────────────────────
export interface KnowledgeBaseDto { id?: number; knowledgeBaseId: string; name: string; vectorStoreType?: string; embeddingModel?: string; connectionRef?: string; metadataFilterPolicy?: Record<string, string>; active?: boolean; createdAt?: string; updatedAt?: string }
export interface KnowledgeBaseSummary { knowledgeBaseId: string; name: string; vectorStoreType?: string; active?: boolean; updatedAt?: string }
export interface CreateKnowledgeBaseRequest { knowledgeBaseId: string; name: string; vectorStoreType: string; embeddingModel: string; connectionRef: string; metadataFilterPolicy?: Record<string, string> | null }
export interface UpdateKnowledgeBaseRequest { name?: string; vectorStoreType?: string; embeddingModel?: string; connectionRef?: string; metadataFilterPolicy?: Record<string, string> | null }

// ── Policies ──────────────────────────────────────────────
export interface MemoryPolicyDto { id?: number; assistantCode?: string; memoryEnabled?: boolean; storeType?: MemoryStoreType; messageWindowSize?: number | null; ttlMinutes?: number | null; persistChatHistory?: boolean; summarizeOldMessages?: boolean; updatedAt?: string }
export interface UpsertMemoryPolicyRequest { memoryEnabled: boolean; storeType: MemoryStoreType; messageWindowSize?: number | null; ttlMinutes?: number | null; persistChatHistory?: boolean; summarizeOldMessages?: boolean }
export interface RagPolicyDto { id?: number; assistantCode?: string; ragEnabled?: boolean; defaultKnowledgeBaseId?: string | null; topK?: number | null; similarityThreshold?: number | null; retrievalStrategy?: string | null; citationsEnabled?: boolean; groundedAnswerRequired?: boolean; metadataFilters?: Record<string, string> | null; updatedAt?: string }
export interface UpsertRagPolicyRequest { ragEnabled: boolean; defaultKnowledgeBaseId?: string | null; topK?: number | null; similarityThreshold?: number | null; retrievalStrategy?: string | null; citationsEnabled?: boolean; groundedAnswerRequired?: boolean; metadataFilters?: Record<string, string> | null }
export interface ResponsePolicyDto { id?: number; assistantCode?: string; defaultTone?: string | null; defaultFormat?: string | null; citationRequired?: boolean; markdownEnabled?: boolean; streamEnabled?: boolean; maxOutputTokens?: number | null; updatedAt?: string }
export interface UpsertResponsePolicyRequest { defaultTone?: string | null; defaultFormat?: string | null; citationRequired?: boolean; markdownEnabled?: boolean; streamEnabled?: boolean; maxOutputTokens?: number | null }
export interface SafetyPolicyDto { id?: number; assistantCode?: string; blockUnknownTools?: boolean; blockWithoutRagWhenGroundedMode?: boolean; allowDirectModelAnswerWithoutContext?: boolean; maskSensitiveDataInLogs?: boolean; disallowedTopics?: string[]; updatedAt?: string }
export interface UpsertSafetyPolicyRequest { blockUnknownTools?: boolean; blockWithoutRagWhenGroundedMode?: boolean; allowDirectModelAnswerWithoutContext?: boolean; maskSensitiveDataInLogs?: boolean; disallowedTopics?: string[] | null }
export interface ToolPolicyDto { id?: number; assistantCode?: string; toolName?: string; toolType?: ToolType; enabled?: boolean; requiresApproval?: boolean; timeoutMs?: number | null; createdAt?: string; updatedAt?: string }
export interface CreateToolPolicyRequest { toolName: string; toolType: ToolType; enabled?: boolean; requiresApproval?: boolean; timeoutMs?: number | null }
export interface UpdateToolPolicyRequest { toolName?: string | null; toolType?: ToolType; enabled?: boolean | null; requiresApproval?: boolean | null; timeoutMs?: number | null }

// ── Model Routes ──────────────────────────────────────────
export interface ModelRouteDto { id?: number; assistantCode?: string; routeName?: string; routeType?: RouteType; priority?: number; minPromptLength?: number | null; maxPromptLength?: number | null; ragEnabledOnly?: boolean; toolsRequiredOnly?: boolean; structuredOutputOnly?: boolean; targetProvider?: string; targetModel?: string; maxInputTokens?: number | null; temperature?: number | null; active?: boolean; createdAt?: string; updatedAt?: string }
export interface CreateModelRouteRequest { routeName: string; routeType: RouteType; priority: number; minPromptLength?: number | null; maxPromptLength?: number | null; ragEnabledOnly?: boolean; toolsRequiredOnly?: boolean; structuredOutputOnly?: boolean; targetProvider: string; targetModel: string; maxInputTokens?: number | null; temperature?: number | null; fallbackPolicy?: FallbackPolicy }
export interface UpdateModelRouteRequest { routeName?: string | null; routeType?: RouteType; priority?: number | null; minPromptLength?: number | null; maxPromptLength?: number | null; ragEnabledOnly?: boolean | null; toolsRequiredOnly?: boolean | null; structuredOutputOnly?: boolean | null; targetProvider?: string | null; targetModel?: string | null; maxInputTokens?: number | null; temperature?: number | null; fallbackPolicy?: FallbackPolicy }

// ── Prompt Templates ──────────────────────────────────────
export interface PromptTemplateDto { id?: number; assistantCode?: string; version?: string; active?: boolean; systemPromptTemplate?: string; developerPromptTemplate?: string | null; promptVariables?: Record<string, string> | null; guardrailInstructions?: string[] | null; createdAt?: string; updatedAt?: string; createdBy?: string | null }
export interface PromptTemplateSummary { id?: number; assistantCode?: string; version?: string; active?: boolean; createdAt?: string; createdBy?: string | null }
export interface CreatePromptTemplateRequest { version: string; systemPromptTemplate: string; developerPromptTemplate?: string | null; promptVariables?: Record<string, string> | null; guardrailInstructions?: string[] | null }
export interface UpdatePromptTemplateRequest { version?: string | null; systemPromptTemplate?: string | null; developerPromptTemplate?: string | null; promptVariables?: Record<string, string> | null; guardrailInstructions?: string[] | null }

// ── Executions ────────────────────────────────────────────
export interface ExecutionRecordDto { requestId?: string; sessionId?: string; tenantId?: string; assistantCode?: string; userId?: string; configVersion?: string | null; selectedProvider?: string | null; selectedModel?: string | null; knowledgeBaseId?: string | null; memoryStoreType?: MemoryStoreType; enabledTools?: string[] | null; streamingEnabled?: boolean | null; success?: boolean; errorCode?: string | null; errorMessage?: string | null; inputTokens?: number | null; outputTokens?: number | null; latencyMs?: number | null; startedAt?: string; completedAt?: string | null }

// ── Admin Sessions ────────────────────────────────────────
export interface AdminSessionSummary { sessionId?: string; tenantId?: string; assistantCode?: string; userId?: string; title?: string | null; status?: SessionStatus; messageCount?: number; locale?: string | null; channel?: string | null; createdAt?: string; updatedAt?: string; lastMessageAt?: string | null }

// ── Stats ─────────────────────────────────────────────────
export interface PlatformStatsDto { activeSessions?: number; totalSessionsToday?: number; messagesLast24h?: number; avgLatencyMs?: number | null; totalAssistants?: number; activeAssistants?: number; totalExecutionsToday?: number; failedExecutionsToday?: number; avgOutputTokens?: number | null }

// ── Tenant Overrides ──────────────────────────────────────
export interface TenantOverrideDto { id?: number; tenantId?: string; assistantCode?: string; overrideType?: string; overridePayloadJson?: string; active?: boolean; createdAt?: string; updatedAt?: string; createdBy?: string | null }
export interface CreateTenantOverrideRequest { tenantId: string; assistantCode: string; overrideType: string; overridePayloadJson: string }
export interface UpdateTenantOverrideRequest { overrideType?: string | null; overridePayloadJson?: string | null; active?: boolean | null }

// ── Audit ─────────────────────────────────────────────────
export interface RagAuditRecordDto { id?: number; requestId?: string; sessionId?: string; knowledgeBaseId?: string; retrievedDocumentCount?: number | null; topK?: number | null; similarityThreshold?: number | null; latencyMs?: number | null; groundedMode?: boolean | null; createdAt?: string }
export interface ToolAuditRecordDto { id?: number; requestId?: string; sessionId?: string; toolName?: string; toolType?: ToolType; success?: boolean; latencyMs?: number | null; errorCode?: string | null; errorMessage?: string | null; createdAt?: string }
```

#### 2.2 Create custom error class
**File:** `src/api/client.ts`
```ts
import axios from 'axios'
import type { ApiErrorResponse, FieldValidationError } from '@/types/api'

export class ApiError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly fieldErrors?: FieldValidationError[],
  ) { super(message) }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  res => res,
  err => {
    const data = err.response?.data as ApiErrorResponse | undefined
    return Promise.reject(
      new ApiError(
        data?.errorCode ?? 'UNKNOWN',
        data?.errorMessage ?? err.message,
        data?.fieldErrors,
      ),
    )
  },
)
```

#### 2.3 Create utility constants
**File:** `src/utils/constants.ts`
```ts
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_SESSION_TENANT = 'default'
export const DEFAULT_USER_ID = 'admin-ui-user'
```

**File:** `src/utils/formatters.ts`
```ts
export function formatDate(iso?: string | null): string { ... }     // "31 May 2026 10:01"
export function formatDuration(ms?: number | null): string { ... }  // "1.2 s" or "320 ms"
export function formatTokens(n?: number | null): string { ... }     // "1,240" or "—"
export function truncate(s: string, n: number): string { ... }      // clip + "…"
```

#### 2.4 Create Zustand stores
**File:** `src/store/themeStore.ts`
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore { theme: 'dark' | 'light'; toggle: () => void }

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', next)
        set({ theme: next })
      },
    }),
    { name: 'k2pbot-theme' },
  ),
)

// Call this once at app startup
export function initTheme() {
  const stored = (JSON.parse(localStorage.getItem('k2pbot-theme') ?? '{}') as any)?.state?.theme ?? 'dark'
  document.documentElement.setAttribute('data-theme', stored)
}
```

**File:** `src/store/chatStore.ts`
```ts
import { create } from 'zustand'

interface ChatStore {
  assistantCode: string
  tenantId: string
  sessionId: string | null
  streamingEnabled: boolean
  setAssistant: (code: string) => void
  setTenant: (id: string) => void
  setSession: (id: string | null) => void
  toggleStreaming: () => void
  newSession: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  assistantCode: '',
  tenantId: 'default',
  sessionId: null,
  streamingEnabled: false,
  setAssistant: (code) => set({ assistantCode: code }),
  setTenant: (id) => set({ tenantId: id }),
  setSession: (id) => set({ sessionId: id }),
  toggleStreaming: () => set(s => ({ streamingEnabled: !s.streamingEnabled })),
  newSession: () => set({ sessionId: `sess-${crypto.randomUUID().slice(0, 8)}` }),
}))
```

#### 2.5 Create React Router skeleton
**File:** `src/App.tsx`
```tsx
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Suspense, lazy } from 'react'
import { initTheme } from '@/store/themeStore'

initTheme()

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

const ChatView   = lazy(() => import('@/features/chat/ChatView'))
const AdminView  = lazy(() => import('@/features/admin/AdminView'))

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/chat" replace /> },
  { path: '/chat', element: <Suspense fallback={null}><ChatView /></Suspense> },
  { path: '/admin/*', element: <Suspense fallback={null}><AdminView /></Suspense> },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  )
}
```

**File:** `src/main.tsx`
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
)
```

#### 2.6 Create TopNav component
**File:** `src/components/layout/TopNav.tsx`

Renders: logo `k2p<span>bot</span>`, Chat | Admin tab buttons, status pill (localhost:8080), theme toggle, avatar.

Uses `useNavigate`, `useLocation` (to detect active tab), `useThemeStore`.

The theme toggle calls `themeStore.toggle()`. Status pill calls `GET /api/v1/ping` with `useQuery` — shows green dot if UP, red if error.

#### 2.7 Create placeholder page shells
**File:** `src/features/chat/ChatView.tsx` — renders `<TopNav />` + `<div>Chat coming soon</div>`  
**File:** `src/features/admin/AdminView.tsx` — renders `<TopNav />` + `<div>Admin coming soon</div>`

### Acceptance Criteria
- [x] All TypeScript types compile without errors
- [x] Theme toggle works: switches `data-theme` on `<html>`, colours update
- [x] TopNav renders with correct logo, tab buttons, theme pill
- [x] Navigating to `/` redirects to `/chat`
- [x] Navigating to `/admin` renders admin shell
- [x] `npm run build` passes

---

## Phase 3 — UI Primitives `✅ Done`

**Objective:** Build the complete headless component library. All components are stateless / controlled. No API calls.

### Tasks

#### 3.1 `Button`
**File:** `src/components/ui/Button.tsx`

Props: `variant: 'primary' | 'ghost' | 'danger'`, `size: 'sm' | 'md'`, `loading?: boolean`, `disabled?`, `icon?: ReactNode`, all native `<button>` attrs.

When `loading`, show `<Spinner size="sm" />` and set `disabled`.

```tsx
const variantStyles = {
  primary: 'bg-[var(--accent)] text-white hover:opacity-85',
  ghost:   'bg-transparent text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--surface2)]',
  danger:  'bg-red-500/10 text-[var(--red)] border border-red-500/20 hover:bg-red-500/18',
}
const sizeStyles = { sm: 'px-2 py-0.5 text-[10px]', md: 'px-3 py-1.5 text-xs' }
```

#### 3.2 `Badge`
**File:** `src/components/ui/Badge.tsx`

Props: `status: 'ACTIVE' | 'CLOSED' | 'EXPIRED' | 'INACTIVE'`

Maps to colour + label using object lookup. No switch statements.

#### 3.3 `Card`
**File:** `src/components/ui/Card.tsx`

Props: `children`, `className?`, `padding?: 'sm' | 'md'`

Surface background, border, rounded corners, shadow — matching prototype `.card`.

#### 3.4 `DataTable`
**File:** `src/components/ui/DataTable.tsx`

```ts
interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  width?: string
  className?: string
}
interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (row: T) => string | number
}
```

Shows 5 skeleton rows (grey bars) when `loading=true`. Shows `EmptyState` when `data.length === 0`.

#### 3.5 `Modal`
**File:** `src/components/ui/Modal.tsx`

Portal via `ReactDOM.createPortal`. `Escape` key closes. Focus trap using `react-focus-lock` (or manual tab-cycle). Backdrop click closes.

Props: `open`, `onClose`, `title`, `children`, `footer?`, `size?: 'sm' | 'md' | 'lg'`

Widths: `sm=400px`, `md=560px` (default), `lg=720px`.

#### 3.6 `ConfirmModal`
**File:** `src/components/ui/ConfirmModal.tsx`

Wraps `Modal`. Props: `open`, `onClose`, `onConfirm`, `title`, `message`, `confirmLabel?`, `danger?: boolean`, `loading?`

#### 3.7 Form inputs
**Files:** `src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`

Each wraps the native element with:
- Label above (via `label` prop)
- Error message below (via `error` prop — shows red text)
- Hint text below label (via `hint` prop — shows muted text)
- `required` marker on label when `required` prop is true
- Focus ring uses `var(--accent)` border

All are forwarded with `React.forwardRef` so they work with React Hook Form `register`.

#### 3.8 `Toggle`
**File:** `src/components/ui/Toggle.tsx`

Controlled pill toggle. Props: `checked`, `onChange`, `label?`, `disabled?`

CSS-only animation, no external dependency.

#### 3.9 `Spinner`
**File:** `src/components/ui/Spinner.tsx`

Props: `size?: 'sm' | 'md' | 'lg'`

SVG spinning circle in `var(--accent)`.

#### 3.10 `EmptyState`
**File:** `src/components/ui/EmptyState.tsx`

Props: `icon?: ReactNode`, `title`, `description?`, `action?: { label: string; onClick: () => void }`

Centred layout, muted colours.

#### 3.11 `JsonViewer`
**File:** `src/components/ui/JsonViewer.tsx`

Props: `value: unknown | string`, `maxHeight?: string`

Uses `react-syntax-highlighter` with `atomOneDark` / `atomOneLight` theme selected via `useThemeStore`. Parses string input if it's JSON.

#### 3.12 Shared components

**`src/components/shared/StatCard.tsx`**  
Props: `label`, `value: string | number`, `delta?: string`, `deltaPositive?: boolean`, `valueColor?: string`

**`src/components/shared/KvGrid.tsx`**  
Props: `title`, `icon?: string`, `items: { key: string; value: ReactNode; colour?: 'green' | 'red' | 'blue' | 'yellow' }[]`

Two-column grid matching prototype config inspector blocks.

**`src/components/shared/PriorityBadge.tsx`**  
Props: `priority: number` — renders numbered circle.

**`src/components/shared/PageSkeleton.tsx`**  
Full-page loading skeleton used by Suspense fallbacks.

### Acceptance Criteria
- [x] All components render without TypeScript errors
- [x] `Button` all variants render correctly in dark + light theme
- [x] `DataTable` shows skeleton rows when `loading=true`, `EmptyState` when empty
- [x] `Modal` traps focus, closes on `Escape` and backdrop click
- [x] `Toggle` animates between on/off states

---

## Phase 4 — Chat View (Blocking) `✅ Done`

**Objective:** Fully functional chat UI for blocking mode. Sessions are tracked in local state. Messages persisted in the query cache keyed by sessionId.

### Tasks

#### 4.1 Create chat API module
**File:** `src/api/chat.ts`
```ts
import { apiClient } from './client'
import type { ChatRequest, ChatResponse, SessionMessagesResponse, SessionSummary } from '@/types/api'

export const chatApi = {
  send: (req: ChatRequest) =>
    apiClient.post<ChatResponse>('/api/v1/chat', req).then(r => r.data),

  getSession: (sessionId: string) =>
    apiClient.get<SessionSummary>(`/api/v1/sessions/${sessionId}`).then(r => r.data),

  getMessages: (sessionId: string, limit = 50) =>
    apiClient.get<SessionMessagesResponse>(`/api/v1/sessions/${sessionId}/messages`, {
      params: { limit },
    }).then(r => r.data),
}
```

#### 4.2 Create `useChat` hook
**File:** `src/features/chat/hooks/useChat.ts`

```ts
// Manages local message list for a session.
// On sendBlocking: appends user message immediately (optimistic),
// then appends assistant message on success.
// On error: removes optimistic user message + shows toast.
```

Defines a local `LocalMessage` type (union of user turn and assistant turn with display metadata).

#### 4.3 Sessions API
**File:** `src/api/sessions.ts`

```ts
export const sessionsApi = {
  getUserSessions: (userId: string, tenantId: string) => ...,
}
```

#### 4.4 `ChatView` layout
**File:** `src/features/chat/ChatView.tsx`

Three-column flex layout:
- `<SessionSidebar />` — 248 px, flex-shrink-0
- `<ChatArea />` — flex-1
- `<ContextPanel />` — 320 px, flex-shrink-0

Also wraps everything below `<TopNav />` in a `flex-1 flex overflow-hidden` container.

#### 4.5 `SessionSidebar`
**File:** `src/features/chat/SessionSidebar.tsx`

- `<Select>` for assistant code — populated from `GET /api/v1/admin/assistants?active=true`
- "+ New" button: calls `useChatStore.newSession()`
- Session list: from local store (no persistent API call in this phase — sessions are local-only until Phase 5+ polish)
- Each session item: title, status badge, assistant code
- Active session highlighted

#### 4.6 `ChatArea`
**File:** `src/features/chat/ChatArea.tsx`

Sub-components:
- Chat topbar: session title, meta row, icon actions (copy session ID, clear)
- Messages list (scrollable flex column)
- Input area: textarea + send button + streaming toggle

Auto-scroll to bottom on new messages via `useEffect` + `scrollIntoView`.

Auto-resize textarea: `onInput` recalculates height up to `max-height: 100px`.

`Enter` sends, `Shift+Enter` newline.

#### 4.7 `MessageBubble`
**File:** `src/features/chat/MessageBubble.tsx`

Props: `message: LocalMessage`

User variant (right-aligned): accent bubble.  
Assistant variant (left-aligned): surface bubble with border + shadow.

Renders content with simple markdown (bold `**text**`, line breaks). Do **not** use a full markdown parser yet — implement `formatContent(text)` utility that handles only `**bold**` and `\n → <br>`.

Below assistant bubble (if present):
- Citation chips: truncated document title, click → toast with full title + location
- Tool execution chips: tool name + latency + success/fail dot

Model badge in the message meta row.

#### 4.8 `TypingIndicator`
**File:** `src/features/chat/TypingIndicator.tsx`

Three bouncing dots, CSS keyframe animation. Shown while `isPending` from `useChat`.

#### 4.9 `ContextPanel`
**File:** `src/features/chat/ContextPanel.tsx`

4 tabs: Summary | Key Facts | Sources | Stats

All data derived from the `LocalMessage[]` for the current session.

- **Summary**: last assistant message metadata (model, latency, tokens) + static "No summary yet" if no messages
- **Key Facts**: `ResponseMetadata` fields from last assistant message
- **Sources**: all `citations` accumulated across session messages
- **Stats**: cumulative token totals, turn counts, tool executions

Tab switching is purely local state.

### Acceptance Criteria
- [x] Can select an assistant from the dropdown
- [x] "+ New" creates a new session and switches to it
- [x] Typing a message and pressing Enter or clicking Send appends user message immediately
- [x] Typing indicator shows while waiting
- [x] Assistant reply appears with model badge, citation chips, tool chips
- [x] ContextPanel updates on each reply
- [x] Theme toggle works within chat view
- [x] No console errors

---

## Phase 5 — Chat View (SSE Streaming) `✅ Done`

**Objective:** Wire up the SSE streaming path. Toggle switches between blocking and streaming modes.

### Tasks

#### 5.1 SSE generator
**File:** `src/api/chat.ts` — add:
```ts
export async function* streamChat(req: ChatRequest): AsyncGenerator<StreamingChatChunk | StreamingCompletion> {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/chat/stream`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(req),
    },
  )
  if (!res.ok) throw new Error(`SSE error: ${res.status}`)
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()!
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        yield JSON.parse(line.slice(6))
      }
    }
  }
}
```

#### 5.2 `useSSEStream` hook
**File:** `src/features/chat/hooks/useSSEStream.ts`

```ts
export function useSSEStream() {
  const [streamingText, setStreamingText] = useState('')
  const [completion, setCompletion] = useState<StreamingCompletion | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)

  async function startStream(req: ChatRequest, onDone: (c: StreamingCompletion) => void) {
    setIsStreaming(true); setStreamingText(''); setCompletion(null)
    try {
      for await (const event of chatApi.stream(req)) {
        if (event.eventType === 'message') {
          setStreamingText(prev => prev + (event.contentChunk ?? ''))
        }
        if (event.eventType === 'completion') {
          setCompletion(event); onDone(event)
        }
      }
    } finally { setIsStreaming(false) }
  }

  function cancel() { /* set abort signal */ }

  return { streamingText, completion, isStreaming, startStream, cancel }
}
```

#### 5.3 Wire into ChatArea

When streaming is enabled:
- Call `startStream` instead of `sendBlocking`
- Show a "streaming" message bubble that accumulates `streamingText` character by character with a cursor `▌`
- On completion: replace streaming bubble with final `LocalMessage`

When streaming is disabled (default):
- Use existing blocking `useChat` flow

#### 5.4 Streaming indicator in model badge

Streaming messages show `<modelName> ⚡` badge during streaming, plain badge after completion.

### Acceptance Criteria
- [x] Streaming toggle in input footer switches mode
- [x] In streaming mode, text appears token by token with cursor
- [x] On completion, tool chips and citations appear
- [x] Cancelling mid-stream stops the generator
- [x] Toggling back to blocking mode works correctly

---

## Phase 6 — Admin Layout `✅ Done`

**Objective:** AdminSidebar with full nav, all 14 admin routes wired with lazy-loaded page stubs.

### Tasks

#### 6.1 `AdminSidebar`
**File:** `src/components/layout/AdminSidebar.tsx`

Renders all nav sections from LLD Section 8.3. Active item detected via `useLocation().pathname`. Each nav item is a `<NavLink>` from React Router.

#### 6.2 `AdminView`
**File:** `src/features/admin/AdminView.tsx`

```tsx
<div className="flex h-full overflow-hidden">
  <AdminSidebar />
  <main className="flex-1 overflow-y-auto p-7">
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Suspense fallback={<PageSkeleton />}><DashboardPage /></Suspense>} />
      <Route path="assistants" element={...} />
      {/* ... all 14 routes ... */}
    </Routes>
  </main>
</div>
```

#### 6.3 Create stub pages

Create a stub component for each admin page that renders the page title and "Coming soon" text. This validates routing before each page is implemented:
- `DashboardPage`, `AssistantsPage`, `PromptTemplatesPage`, `ModelRoutesPage`
- `KnowledgeBasesPage`, `TenantOverridesPage`, `PoliciesPage`
- `ConfigInspectorPage`, `CachePage`, `AdminSessionsPage`, `MessagesPage`
- `ExecutionsPage`, `AuditPage`

### Acceptance Criteria
- [x] All 14 admin routes render their stub without crashing
- [x] Active nav item is highlighted on each route
- [x] AdminSidebar scrolls independently of the main content area
- [x] TopNav Admin tab is highlighted when on any `/admin/*` route

---

## Phase 7 — Dashboard `✅ Done`

**Objective:** Real data-backed dashboard with platform stats and assistant summary.

### Tasks

#### 7.1 Stats API
**File:** `src/api/admin/stats.ts`
```ts
export const statsApi = {
  getPlatformStats: () =>
    apiClient.get<PlatformStatsDto>('/api/v1/admin/stats').then(r => r.data),
}
```

#### 7.2 Assistants list API (partial)
**File:** `src/api/admin/assistants.ts` (create full file, implement `list` for now)
```ts
export const assistantsApi = {
  list: (params?: { active?: boolean; tenantScope?: string; page?: number; size?: number }) =>
    apiClient.get<AssistantSummary[]>('/api/v1/admin/assistants', { params }).then(r => r.data),
  // ... rest added in Phase 8
}
```

#### 7.3 `DashboardPage`
**File:** `src/features/admin/dashboard/DashboardPage.tsx`

```tsx
const { data: stats, isLoading: statsLoading } = useQuery({
  queryKey: ['stats'],
  queryFn: statsApi.getPlatformStats,
  refetchInterval: 30_000,
})

const { data: assistants, isLoading: assistantsLoading } = useQuery({
  queryKey: ['assistants'],
  queryFn: () => assistantsApi.list({ active: undefined }),
})
```

Stat grid (4-column, then 4-column row 2):
- Active Sessions, Messages (24h), Avg Latency, Total Assistants
- Active Assistants, Total Executions Today, Failed Executions Today, Avg Output Tokens

Show `StatCard` skeletons while loading.

Assistant table columns: Code, Name, Status, Tenant, Config Version, Last Updated.

### Acceptance Criteria
- [x] Stats refresh every 30 s without UI flicker
- [x] Status pills are correct colours
- [x] If backend is down, error toast appears and empty state shows

---

## Phase 8 — Assistants CRUD `✅ Done`

**Objective:** Full create / edit / activate / deactivate flow with optimistic activate/deactivate.

### Tasks

#### 8.1 Complete assistants API
**File:** `src/api/admin/assistants.ts` — add remaining methods:
```ts
get, create, update, activate, deactivate
```

#### 8.2 `useAssistants` hook
**File:** `src/features/admin/assistants/hooks/useAssistants.ts`

- `useQuery` for list + single
- `useMutation` for create, update, activate, deactivate
- Optimistic toggle for activate/deactivate (as described in LLD 17.2)
- Invalidates `['assistants']` on all mutations

#### 8.3 `AssistantsPage`
**File:** `src/features/admin/assistants/AssistantsPage.tsx`

Filter bar: `active` select (All / Active / Inactive), `tenantScope` text input.

Table with `DataTable`:
| Code | Name | Description | Tenant Scope | Config v | Status | Created | Actions |

Actions column: `Edit` button → opens `AssistantForm` in edit mode. `Activate` or `Deactivate` depending on `active`. Confirm before deactivate.

"+ New Assistant" button (top-right of card header) → `AssistantForm` in create mode.

#### 8.4 `AssistantForm`
**File:** `src/features/admin/assistants/AssistantForm.tsx`

Zod schema:
```ts
const schema = z.object({
  assistantCode: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'lowercase letters, digits, hyphens only'),
  name:          z.string().min(1).max(255),
  description:   z.string().max(1024).optional(),
  tenantScope:   z.string().max(100).optional(),
})
```

- In create mode: all fields editable
- In edit mode: `assistantCode` is disabled (shown as read-only text, not an input)
- Submit label: "Create Assistant" / "Save Changes"
- Server field errors mapped to form via `form.setError`

### Acceptance Criteria
- [x] Can create a new assistant; it appears in the table immediately
- [x] Can edit name, description, tenant scope
- [x] Activate/deactivate updates optimistically, rolls back on error
- [x] Invalid `assistantCode` (spaces, uppercase) shows field error
- [x] Server validation errors (400) appear under the relevant field

---

## Phase 9 — Prompt Templates `✅ Done`

**Objective:** Versioned template list with create, edit, activate, and delete.

### Tasks

#### 9.1 Prompt Templates API
**File:** `src/api/admin/prompt-templates.ts`
Methods: `list`, `get`, `create`, `update`, `activate`, `delete`

#### 9.2 `usePromptTemplates` hook
**File:** `src/features/admin/prompt-templates/hooks/usePromptTemplates.ts`

#### 9.3 `PromptTemplatesPage`
- Assistant selector at top (populates from assistants list)
- Table: Version, Status, System Prompt preview (first 80 chars truncated), Dev Prompt (Present/None), Variables count, Guardrails count, Created By, Created At, Actions
- INACTIVE rows at 60% opacity
- Actions: Edit | Activate (INACTIVE only) | Delete (with `ConfirmModal`)
- "+ New Version" button opens `PromptTemplateForm` in create mode

#### 9.4 `PromptTemplateForm`
Fields:
- `version` (text, required) — hint: `e.g. v2.1.0`
- `systemPromptTemplate` (large monospace `Textarea`, required, max 50 000 chars) — character counter
- `developerPromptTemplate` (monospace `Textarea`, optional)
- `promptVariables` — key-value pair editor: list of `{ key, value }` rows with Add / Remove buttons
- `guardrailInstructions` — list of string inputs with Add / Remove buttons

Zod schema validates version format: `z.string().regex(/^v\d+\.\d+\.\d+$/, 'Must be semver e.g. v2.1.0')`.

### Acceptance Criteria
- [x] Switching assistant selector reloads template list
- [x] Creating a template shows it as INACTIVE
- [x] Activating a template sets it to ACTIVE and sets all others to INACTIVE
- [x] Deleting shows confirm modal; cannot delete the active template (show toast)
- [x] Long system prompt textarea scrolls within the modal

---

## Phase 10 — Model Routes `✅ Done`

**Objective:** Priority-ordered routing rules with full CRUD.

### Tasks

#### 10.1 Routes API
**File:** `src/api/admin/routes.ts`
Methods: `list`, `get`, `create`, `update`, `delete`

#### 10.2 `useModelRoutes` hook

#### 10.3 `ModelRoutesPage`
- Assistant selector + "+ Add Route"
- Table ordered by `priority` ASC: Priority (badge), Route Name, Type, Conditions summary, Target Provider, Target Model, Max Tokens, Temp, Status, Actions
- Conditions summary helper: if `minPromptLength` set → `len > N`; if `ragEnabledOnly` → `RAG only`; etc.
- Delete: `ConfirmModal`

#### 10.4 `ModelRouteForm`
All fields from LLD Section 8.3. Conditional field visibility:
- Show `minPromptLength` / `maxPromptLength` only when `routeType` is `LONG_CONTEXT` or `SIMPLE`
- Show `ragEnabledOnly` checkbox for `KNOWLEDGE_QA`
- Show `toolsRequiredOnly` for `TOOL_HEAVY`

Zod refinement: `priority` must be 1–999, `temperature` must be 0.0–2.0.

### Acceptance Criteria
- [x] Routes render sorted by priority
- [x] Priority badge number matches the `priority` field value
- [x] Create / edit / delete all work
- [x] Conditions column shows human-readable summary

---

## Phase 11 — Knowledge Bases `✅ Done`

**Objective:** KB register, edit, activate/deactivate.

### Tasks

#### 11.1 Knowledge Bases API
**File:** `src/api/admin/knowledge-bases.ts`
Methods: `list`, `get`, `create`, `update`, `activate`, `deactivate`

#### 11.2 `useKnowledgeBases` hook

#### 11.3 `KnowledgeBasesPage`
Filter: `active` select. Table: KB ID, Name, Vector Store, Embedding Model, Connection Ref (truncated), Status, Created, Actions.

`connectionRef` is potentially sensitive — truncate to 40 chars + `…`, full value on hover tooltip (via `title` attribute).

#### 11.4 `KnowledgeBaseForm`
Fields: `knowledgeBaseId` (disabled in edit), `name`, `vectorStoreType` (text with hint: `PGVECTOR`), `embeddingModel`, `connectionRef`, `metadataFilterPolicy` (key-value pair editor, same pattern as prompt variables).

### Acceptance Criteria
- [x] Can register a KB and it appears in list
- [x] Can activate / deactivate
- [x] `knowledgeBaseId` is not editable on update
- [x] `metadataFilterPolicy` key-value editor works correctly

---

## Phase 12 — Policies `✅ Done`

**Objective:** All 5 policy tabs per assistant, all backed by real API calls.

### Tasks

#### 12.1 Policies API
**File:** `src/api/admin/policies.ts`
Methods:
```ts
getMemoryPolicy, upsertMemoryPolicy,
getRagPolicy, upsertRagPolicy,
getResponsePolicy, upsertResponsePolicy,
getSafetyPolicy, upsertSafetyPolicy,
listToolPolicies, createToolPolicy, updateToolPolicy, deleteToolPolicy
```

#### 12.2 `usePolicies` hook
**File:** `src/features/admin/policies/hooks/usePolicies.ts`

Single hook per policy type (5 total), or one combined hook that accepts a `policyType` param. Recommended: one hook per type for clarity.

#### 12.3 `PoliciesPage`
- Assistant selector (URL param `?assistant=loan-advisor`)
- Tab bar: Memory | RAG | Tool | Safety | Response
- Tab state managed by URL hash or local state

#### 12.4 `MemoryPolicyTab`
Form with `Toggle` for `memoryEnabled`, `persistChatHistory`, `summarizeOldMessages`. `Select` for `storeType`. `Input` for `messageWindowSize` and `ttlMinutes`. "Save" submits `PUT`.

If the policy doesn't exist yet (404), show an empty form with defaults (the `PUT` acts as upsert).

#### 12.5 `RagPolicyTab`
Toggles: `ragEnabled`, `citationsEnabled`, `groundedAnswerRequired`. Text inputs: `defaultKnowledgeBaseId`, `retrievalStrategy`. Numbers: `topK` (1–100), `similarityThreshold` (0.0–1.0). Key-value editor: `metadataFilters`.

#### 12.6 `ToolPolicyTab`
Table of tools: Tool Name, Tool Type, Enabled (toggle-like badge), Requires Approval, Timeout, Created, Actions.

"+ Add Tool" button → mini modal form.

Each row's delete action: `ConfirmModal` before `DELETE`.

Toggle `enabled` inline (optimistic, matches the Toggle pattern in LLD 17.2).

#### 12.7 `SafetyPolicyTab`
4 toggles in toggle-row layout. `disallowedTopics`: tag input — type a topic and press Enter or comma to add, click `×` to remove.

#### 12.8 `ResponsePolicyTab`
3 toggles. `defaultTone` and `defaultFormat` text inputs (with examples in hint text). `maxOutputTokens` number input (64–32768).

### Acceptance Criteria
- [x] Switching assistant reloads all policy tabs
- [x] All 5 tabs save without errors
- [x] Tool policy list supports add / edit / delete
- [x] 404 (policy not yet created) gracefully shows empty form — save acts as create
- [x] Field validation prevents out-of-range values

---

## Phase 13 — Config Inspector `✅ Done`

**Objective:** Read-only view of the fully-resolved assistant config with tenant overlay.

### Tasks

#### 13.1 Config API
**File:** `src/api/admin/config.ts`
```ts
export const configApi = {
  getResolvedConfig: (assistantCode: string, tenantId?: string) =>
    apiClient.get<ResolvedAssistantConfig>(`/api/v1/admin/assistants/${assistantCode}/config`, {
      params: { tenantId },
    }).then(r => r.data),
}
```

#### 13.2 `ConfigInspectorPage`
- Assistant `Select` + Tenant text `Input` + "Load Config" `Button`
- Only fetches on button click (not auto-query) — use `enabled: false` + manual `refetch()`
- Config header: name, `assistantCode`, tenant, Config v, status badge, resolved timestamp
- 6-block grid (`KvGrid` components):
  - Prompt (version, guardrail count, variable count)
  - Routing (default model, provider, temperature, max input tokens, fallback policy)
  - RAG (enabled, KB ID, top-K, similarity, citations)
  - Memory (enabled, store type, window, TTL, persist history)
  - Tools (enabled, runtime override, max calls, timeout, tool count)
  - Safety (block unknown tools, mask PII, disallowed topics count, max output tokens, streaming)

Each KvGrid block uses colour coding: green for enabled/true positives, red for blocked/false negatives, blue for IDs/versions, yellow for limits.

### Acceptance Criteria
- [x] Selecting assistant + tenant + clicking "Load Config" fetches and displays config
- [x] Colour coding is correct for boolean values
- [x] If assistant not found, shows inline error card (not full-page error)

---

## Phase 14 — Cache Management `✅ Done`

**Objective:** Live cache entry list with per-entry and bulk eviction.

### Tasks

#### 14.1 Cache eviction API
**File:** `src/api/admin/config.ts` — add:
```ts
evictAssistantCache: (assistantCode: string, tenantId?: string) =>
  apiClient.delete(`/api/v1/admin/assistants/${assistantCode}/config/cache`, { params: { tenantId } }),
evictAllCache: () =>
  apiClient.delete('/api/v1/admin/config/cache'),
```

#### 14.2 `CachePage`
- Stats cards: Entries Cached (count of assistants as proxy), TTL = "30 min" (static), Hit Rate (—, not in API).
- Cache entry list: built from the assistants list — one entry per assistant shown as "assistant :: tenant" row.
- Per-entry "Evict" → confirms → calls `DELETE /api/v1/admin/assistants/{code}/config/cache`
- "Evict All Cache" button at top → `ConfirmModal` → calls `DELETE /api/v1/admin/config/cache`

Both eviction mutations show a success toast on completion and invalidate the assistants query.

### Acceptance Criteria
- [x] Evict All shows confirmation before calling API
- [x] Per-entry evict shows confirmation
- [x] Success toast after eviction
- [x] Error toast if backend returns error

---

## Phase 15 — Admin Sessions & Messages `✅ Done`

**Objective:** Searchable session list with admin actions, and message browser.

### Tasks

#### 15.1 Admin sessions API
**File:** `src/api/admin/admin-sessions.ts`
```ts
listSessions, closeSession, deleteSession
```

#### 15.2 Session messages API (already in `src/api/sessions.ts`)
```ts
getMessages: (sessionId: string, limit?: number) => ...
```

#### 15.3 `AdminSessionsPage`
Filter bar: tenantId (text), userId (text), assistantCode (Select from assistants list), status (Select), date range (two `Input type="date"`).

"Apply Filters" button triggers refetch with new params. URL search params are kept in sync for bookmarkability (use `useSearchParams`).

Table: Session ID (`<code>`), Title, Assistant, User, Tenant, Status (Badge), Msg Count, Channel, Locale, Last Message, Actions.

Actions:
- "Messages" — navigates to `/admin/messages?sessionId=xxx`
- "Close" — `ConfirmModal` → `POST /close`
- "Delete" — `ConfirmModal` (danger, permanent) → `DELETE`

#### 15.4 `MessagesPage`
- Session selector: text input for session ID (pre-populated from URL `?sessionId=`) + limit number input + "Load" button
- After load: shows session title header, message count
- Table: Message ID, Role (coloured badge — USER=blue, ASSISTANT=green, SYSTEM=muted), Content Preview (first 100 chars), Model, Citations (count), Tool Calls (count), Finish, Timestamp

Role badge colours:
- USER: `bg-[var(--accent)]/12 text-[var(--accent)]`
- ASSISTANT: `bg-[var(--green)]/12 text-[var(--green)]`
- SYSTEM: `bg-[var(--muted)]/12 text-[var(--muted)]`

### Acceptance Criteria
- [ ] Filter bar applies all filter combinations
- [ ] URL updates reflect active filters (for bookmarkability)
- [ ] Close session shows confirm, updates status in list optimistically
- [ ] Delete session shows danger confirm, removes from list on success
- [ ] Messages page loads for any valid session ID

---

## Phase 16 — Execution Monitor `✅ Done`

**Objective:** Searchable execution audit log with filter controls.

### Tasks

#### 16.1 Executions API
**File:** `src/api/admin/executions.ts`
```ts
listExecutions: (params: ExecutionQueryParams) => ...
getExecution:   (requestId: string) => ...
```

```ts
interface ExecutionQueryParams {
  assistantCode?: string; tenantId?: string; success?: boolean; provider?: string;
  model?: string; from?: string; to?: string; page?: number; size?: number
}
```

#### 16.2 `useExecutions` hook

#### 16.3 `ExecutionsPage`

Filter bar (collapsible): assistantCode (Select), tenantId (text), success (Select: All/Success/Failed), provider (text), model (text), date from/to.

Table: Request ID (`<code>`), Session ID (`<code>`), Tenant, Assistant, User, Provider, Model, KB, Success (✓ green / ✗ red icon), Latency, In Tokens, Out Tokens, Started At.

Click on a row → expand drawer panel below the row showing full `ExecutionRecordDto` details (enabled tools, streaming flag, error code/message if failed).

Pagination: show page controls at bottom. Keep `page` in URL search params.

### Acceptance Criteria
- [x] All filter combinations work
- [x] Success column shows clear visual indicator
- [x] Row expand shows full detail
- [x] Pagination controls work

---

## Phase 17 — Audit Logs `✅ Done`

**Objective:** Tool Audit and RAG Audit tabs with filter + table.

### Tasks

#### 17.1 Audit API
**File:** `src/api/admin/audit.ts`
```ts
listToolAuditRecords: (params: ToolAuditQueryParams) => ...
getToolAuditRecord:   (id: number) => ...
listRagAuditRecords:  (params: RagAuditQueryParams) => ...
getRagAuditRecord:    (id: number) => ...
```

#### 17.2 `AuditPage`

Tab bar: Tool Audit | RAG Audit

**ToolAuditTab:**  
Filters: toolName, toolType (Select), success (Select), sessionId, requestId, date range.  
Table: ID, Request ID, Session ID, Tool Name, Type, Success (icon), Latency, Error Code, Created At.

**RagAuditTab:**  
Filters: knowledgeBaseId (Select from KB list), groundedMode (Select), sessionId, requestId, date range.  
Table: ID, Request ID, Session ID, KB ID, Retrieved Docs, Top K, Similarity, Latency, Grounded, Created At.

### Acceptance Criteria
- [x] Both tabs filter and paginate correctly
- [x] Success column uses colour-coded icons
- [x] Date range filter works with ISO-8601 format

---

## Phase 18 — Tenant Overrides `✅ Done`

**Objective:** Full CRUD for per-tenant config overrides.

### Tasks

#### 18.1 Tenant Overrides API
**File:** `src/api/admin/tenant-overrides.ts`
Methods: `list`, `get`, `create`, `update`, `delete`

#### 18.2 `useTenantOverrides` hook

#### 18.3 `TenantOverridesPage`
Filters: `tenantId` (text), `assistantCode` (Select).

Table: ID, Tenant ID, Assistant Code, Override Type, Payload Preview (first 60 chars), Active (badge), Created By, Created At, Actions.

#### 18.4 `TenantOverrideForm`
Fields:
- `tenantId` (text, required, disabled in edit)
- `assistantCode` (Select from assistants list, disabled in edit)
- `overrideType` (Select: memory | rag | response | safety)
- `overridePayloadJson` (monospace Textarea) — validated to be valid JSON via Zod:
  ```ts
  z.string().refine(s => { try { JSON.parse(s); return true } catch { return false } }, 'Must be valid JSON')
  ```
- `active` (Toggle, edit mode only)

### Acceptance Criteria
- [x] Creating an override works end-to-end
- [x] Invalid JSON in payload shows field error immediately (on blur)
- [x] Active toggle can be updated independently
- [x] `tenantId` and `assistantCode` are not editable on update

---

## Phase 19 — Polish & Hardening `✅ Done`

**Objective:** Production-ready UI. All skeleton states, error boundaries, a11y sweep, empty states, and final README / CLAUDE.md.

### Tasks

#### 19.1 Loading skeletons
Replace all `loading` spinner placeholders with proper animated skeleton components:
- `TableSkeleton` (5 rows × N columns)
- `StatCardSkeleton`
- `KvGridSkeleton`
- `MessageSkeleton` (3 placeholder bubbles)

Use CSS `animate-pulse` (Tailwind built-in).

#### 19.2 Error boundaries
**File:** `src/components/ui/ErrorBoundary.tsx`

```tsx
class ErrorBoundary extends React.Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> { ... }
```

Place at:
- `<ChatView>` level (catches chat-specific render errors)
- `<AdminView>` level (catches admin-specific render errors)
- `<App>` root level (catches global errors)

Fallback renders a centred error card with "Something went wrong" + a "Reload" button.

#### 19.3 Empty states
Add `<EmptyState>` to every table page with an appropriate icon, message, and (where applicable) a CTA:
- Assistants: "No assistants yet" + "+ Create your first assistant"
- Sessions: "No sessions match your filters"
- Executions: "No execution records found"
- etc.

#### 19.4 Accessibility sweep
For every interactive element in the app:
- [ ] `aria-label` on all icon-only buttons
- [ ] `role="status"` on all loading spinners and skeleton regions
- [ ] `aria-required` on required form fields
- [ ] Modal: `aria-modal`, `aria-labelledby`, `aria-describedby`
- [ ] Toast: `role="alert"` (Sonner handles this natively)
- [ ] Table: `scope="col"` on `<th>` elements
- [ ] Form errors: `aria-describedby` links input to error message

#### 19.5 Keyboard navigation
- [ ] All modals trap focus correctly
- [ ] Tab order is logical in filter bars and forms
- [ ] Chat input: `Enter` submits, `Shift+Enter` newlines
- [ ] Admin sidebar: arrow keys navigate between items

#### 19.6 Tablet responsive layout (768 px – 1279 px)

**Chat View — overlay drawers**

Create `src/components/ui/Drawer.tsx`:
- Props: `open`, `onClose`, `side: 'left' | 'right'`, `children`
- Renders as a fixed-position overlay with a semi-transparent backdrop
- Smooth `translateX` transition (200 ms ease)
- Backdrop click closes the drawer

In `ChatView.tsx`:
- Add `useSidebarOpen` and `useContextOpen` local state (both `false` by default)
- On `< xl` breakpoint (`window.innerWidth < 1280`, or use a `useMediaQuery` hook):
  - Replace the static `SessionSidebar` column with a hamburger button in the chat topbar that opens the sidebar as a left `<Drawer>`
  - Replace the static `ContextPanel` column with a "Details" button in the chat topbar that opens the panel as a right `<Drawer>`
- On `≥ xl`: render both panels as static columns (no drawer)

**Admin View — overlay drawer**

In `AdminView.tsx`:
- Add `useSidebarOpen` local state
- On `< xl`: hamburger button in `TopNav` (or a fixed top-left button in `AdminView`) toggles the `AdminSidebar` as a left `<Drawer>`
- On `≥ xl`: static sidebar column

In `TopNav.tsx`:
- Pass an `onMenuClick` prop for the admin hamburger (only rendered on `< xl`)
- Hide the status pill on `< lg` (`hidden lg:flex`)
- Hide the theme toggle label on `< lg` (icon-only)

**Tables — column hiding**

In every `DataTable` usage, mark lower-priority columns with `className="hidden lg:table-cell"`:
- Assistants: hide Created, Tenant Scope on `< lg`
- Sessions: hide Locale, Channel on `< lg`
- Executions: hide Tenant, User on `< lg`
- Audit tables: hide Request ID on `< lg`

Tables themselves get `overflow-x-auto` on their wrapper so they remain scrollable on tablet when all columns must be shown.

**Grid layouts — 2-column on tablet**

Replace fixed grid classes:
```
stats-grid:   grid-cols-4  → grid-cols-2 xl:grid-cols-4
config-grid:  grid-cols-2  → grid-cols-1 lg:grid-cols-2
form-row:     grid-cols-2  → grid-cols-1 md:grid-cols-2
```

**Modals — full-width on tablet**

In `Modal.tsx`, replace the fixed `w-[560px]` with `w-[90vw] max-w-[560px]`.

**Touch targets**

Add `md:p-2` to all icon buttons that are 30 × 30 px on desktop so they reach the 44 × 44 px minimum on tablet.

**`useMediaQuery` hook**

`src/hooks/useMediaQuery.ts`:
```ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}
// Usage: const isDesktop = useMediaQuery('(min-width: 1280px)')
```

#### 19.7 Write README.md
Create `k2pbot-admin-ui/README.md` with content from LLD Section 15.

#### 19.8 Write CLAUDE.md
Create `k2pbot-admin-ui/CLAUDE.md` with content from LLD Section 16.

#### 19.9 Final verification
```bash
npm run build   # zero TS errors, zero Vite warnings
npm run preview # all routes render correctly in production mode
```

### Acceptance Criteria
- [ ] `npm run build` produces a clean bundle
- [ ] No console errors or warnings in production build
- [ ] All 14 admin pages have skeleton loading states
- [ ] All tables have empty states
- [ ] All destructive actions have confirmation modals
- [ ] Error boundaries catch and display friendly fallback
- [ ] All icon-only buttons have `aria-label`
- [ ] README.md and CLAUDE.md exist and are accurate
- [ ] **Tablet (768–1279 px):** Admin sidebar opens/closes as an overlay drawer
- [ ] **Tablet:** Chat session sidebar opens/closes as a left overlay drawer
- [ ] **Tablet:** Context panel opens/closes as a right overlay drawer
- [ ] **Tablet:** Stats grids render in 2 columns
- [ ] **Tablet:** Form rows stack to single column
- [ ] **Tablet:** Modals are 90 vw wide
- [ ] **Tablet:** Lower-priority table columns are hidden (`hidden lg:table-cell`)
- [ ] **Tablet:** All interactive elements meet 44 × 44 px touch target minimum
- [ ] **Desktop (≥ 1280 px):** All three chat columns visible simultaneously
- [ ] **Desktop:** Admin sidebar is always visible (no drawer)

---

## Dependency Graph

```
Phase 1  ──► Phase 2  ──► Phase 3  ──► Phase 4  ──► Phase 5
                                  │
                                  └──► Phase 6  ──► Phase 7
                                              ├──► Phase 8
                                              ├──► Phase 9
                                              ├──► Phase 10
                                              ├──► Phase 11
                                              ├──► Phase 12
                                              ├──► Phase 13  (needs Phase 8 assistants list)
                                              ├──► Phase 14  (needs Phase 8 assistants list)
                                              ├──► Phase 15
                                              ├──► Phase 16
                                              ├──► Phase 17  (needs Phase 11 KB list)
                                              └──► Phase 18  (needs Phase 8 assistants list)
                                                        │
                                              All ──────► Phase 19
```

Phases 8–18 can be developed in parallel after Phase 6 is complete.

---

## File Creation Checklist (Master)

### Infrastructure
- [ ] `vite.config.ts`
- [ ] `tsconfig.app.json`
- [ ] `.env.example` / `.env.local`
- [ ] `src/index.css`
- [ ] `src/utils/cn.ts`
- [ ] `src/utils/constants.ts`
- [ ] `src/utils/formatters.ts`
- [ ] `src/types/api.ts`

### API Layer
- [x] `src/api/client.ts`
- [x] `src/api/chat.ts`
- [x] `src/api/sessions.ts`
- [x] `src/api/admin/assistants.ts`
- [x] `src/api/admin/knowledge-bases.ts`
- [x] `src/api/admin/policies.ts`
- [x] `src/api/admin/routes.ts`
- [ ] `src/api/admin/prompt-templates.ts`
- [ ] `src/api/admin/config.ts`
- [ ] `src/api/admin/executions.ts`
- [ ] `src/api/admin/audit.ts`
- [ ] `src/api/admin/admin-sessions.ts`
- [x] `src/api/admin/stats.ts`
- [ ] `src/api/admin/tenant-overrides.ts`

### Stores
- [ ] `src/store/themeStore.ts`
- [ ] `src/store/chatStore.ts`

### UI Primitives
- [x] `src/components/ui/Button.tsx`
- [x] `src/components/ui/Badge.tsx`
- [x] `src/components/ui/Card.tsx`
- [x] `src/components/ui/DataTable.tsx`
- [x] `src/components/ui/Modal.tsx`
- [x] `src/components/ui/ConfirmModal.tsx`
- [x] `src/components/ui/Input.tsx`
- [x] `src/components/ui/Select.tsx`
- [x] `src/components/ui/Textarea.tsx`
- [x] `src/components/ui/Toggle.tsx`
- [x] `src/components/ui/Spinner.tsx`
- [x] `src/components/ui/EmptyState.tsx`
- [x] `src/components/ui/JsonViewer.tsx`
- [ ] `src/components/ui/ErrorBoundary.tsx` _(Phase 19)_
- [ ] `src/components/ui/Drawer.tsx` _(Phase 19)_
- [ ] `src/hooks/useMediaQuery.ts` _(Phase 19)_

### Layout
- [x] `src/components/layout/TopNav.tsx`
- [x] `src/components/layout/AdminSidebar.tsx`

### Shared
- [x] `src/components/shared/StatCard.tsx`
- [x] `src/components/shared/KvGrid.tsx`
- [x] `src/components/shared/PriorityBadge.tsx`
- [x] `src/components/shared/PageSkeleton.tsx`
- [x] `src/components/shared/TableSkeleton.tsx`

### App Shell
- [ ] `src/App.tsx`
- [ ] `src/main.tsx`

### Chat Feature (Phase 4–5)
- [x] `src/features/chat/ChatView.tsx`
- [x] `src/features/chat/SessionSidebar.tsx`
- [x] `src/features/chat/ChatArea.tsx`
- [x] `src/features/chat/MessageBubble.tsx`
- [x] `src/features/chat/TypingIndicator.tsx`
- [x] `src/features/chat/ContextPanel.tsx`
- [x] `src/features/chat/hooks/useChat.ts`
- [x] `src/features/chat/hooks/useSSEStream.ts`

### Admin Feature (Phase 6–18)
- [ ] `src/features/admin/AdminView.tsx`
- [ ] `src/features/admin/dashboard/DashboardPage.tsx`
- [x] `src/features/admin/assistants/AssistantsPage.tsx`
- [x] `src/features/admin/assistants/AssistantForm.tsx`
- [x] `src/features/admin/assistants/hooks/useAssistants.ts`
- [ ] `src/features/admin/prompt-templates/PromptTemplatesPage.tsx`
- [ ] `src/features/admin/prompt-templates/PromptTemplateForm.tsx`
- [ ] `src/features/admin/prompt-templates/hooks/usePromptTemplates.ts`
- [x] `src/features/admin/model-routes/ModelRoutesPage.tsx`
- [x] `src/features/admin/model-routes/ModelRouteForm.tsx`
- [x] `src/features/admin/model-routes/hooks/useModelRoutes.ts`
- [x] `src/features/admin/knowledge-bases/KnowledgeBasesPage.tsx`
- [x] `src/features/admin/knowledge-bases/KnowledgeBaseForm.tsx`
- [x] `src/features/admin/knowledge-bases/hooks/useKnowledgeBases.ts`
- [ ] `src/features/admin/tenant-overrides/TenantOverridesPage.tsx`
- [ ] `src/features/admin/tenant-overrides/TenantOverrideForm.tsx`
- [ ] `src/features/admin/tenant-overrides/hooks/useTenantOverrides.ts`
- [x] `src/features/admin/policies/PoliciesPage.tsx`
- [x] `src/features/admin/policies/MemoryPolicyTab.tsx`
- [x] `src/features/admin/policies/RagPolicyTab.tsx`
- [x] `src/features/admin/policies/ToolPolicyTab.tsx`
- [x] `src/features/admin/policies/SafetyPolicyTab.tsx`
- [x] `src/features/admin/policies/ResponsePolicyTab.tsx`
- [x] `src/features/admin/policies/hooks/usePolicies.ts`
- [ ] `src/features/admin/config/ConfigInspectorPage.tsx`
- [ ] `src/features/admin/cache/CachePage.tsx`
- [ ] `src/features/admin/sessions/AdminSessionsPage.tsx`
- [ ] `src/features/admin/sessions/hooks/useAdminSessions.ts`
- [ ] `src/features/admin/messages/MessagesPage.tsx`
- [ ] `src/features/admin/executions/ExecutionsPage.tsx`
- [ ] `src/features/admin/executions/hooks/useExecutions.ts`
- [ ] `src/features/admin/audit/AuditPage.tsx`
- [ ] `src/features/admin/audit/ToolAuditTab.tsx`
- [ ] `src/features/admin/audit/RagAuditTab.tsx`
- [ ] `src/features/admin/audit/hooks/useAudit.ts`

### Docs
- [ ] `README.md`
- [ ] `CLAUDE.md`

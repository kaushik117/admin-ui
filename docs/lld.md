# k2pbot Admin UI — Low-Level Design

> **Status:** Design document — to be implemented in React  
> **API contract:** `openapi.yaml` at project root  
> **Prototype reference:** `ui-prototype.html` at project root  
> **Backend:** Spring Boot 4 / Spring AI 2 at `http://localhost:8080`

---

## 1. Goals & Non-Goals

**Goals**
- Replace the single-file HTML prototype with a production-grade React SPA
- Cover all 60+ API endpoints from `openapi.yaml`
- Support SSE streaming for the chat endpoint
- Dark / light theme toggle (dark default, exact prototype colour tokens)
- Responsive enough for 1280 px+ desktop use (primary target)

**Non-goals**
- Mobile layout (< 768 px) — admin dashboards are desktop tools
- Auth / login flow (out of scope for now; API has no auth layer)
- i18n / multi-language

---

## 2. Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **React 19** | Latest stable; concurrent features |
| Routing | **React Router v7** | File-based routing support; v7 is latest |
| Server state | **TanStack Query v5** | Caching, background refetch, mutations, SSE integration |
| Client state | **Zustand v5** | Minimal, zero-boilerplate store for theme + chat UI state |
| HTTP client | **Axios** | Interceptors for base URL / error normalisation |
| Styling | **Tailwind CSS v4** | CSS custom properties map directly to prototype `--var` tokens |
| Build | **Vite 6** | Fast HMR, excellent TypeScript support |
| Language | **TypeScript 5.5+** | Strict mode; types generated from OpenAPI |
| Forms | **React Hook Form v7 + Zod** | Schema-driven validation, no re-render overhead |
| Icons | **Lucide React** | Consistent icon set, tree-shaken |
| Charts | **Recharts 2** | Dashboard stat visualisations |
| SSE | **Native `EventSource` / `fetch` with `ReadableStream`** | No third-party SSE library needed |
| Toast | **Sonner** | Headless, Tailwind-compatible |
| Code highlight | **react-syntax-highlighter** | Prompt template / JSON viewer |

---

## 3. Project Scaffolding

```
k2pbot-admin-ui/
│
├── .claude/
│   └── settings.json                  # Claude Code project settings
│
├── public/
│   └── favicon.svg
│
├── src/
│   │
│   ├── api/                           # API layer — one file per resource group
│   │   ├── client.ts                  # Axios instance, base URL, interceptors
│   │   ├── chat.ts                    # POST /api/v1/chat, POST /api/v1/chat/stream
│   │   ├── sessions.ts                # GET /api/v1/sessions/*, users/*/sessions
│   │   └── admin/
│   │       ├── assistants.ts          # CRUD + activate/deactivate
│   │       ├── knowledge-bases.ts     # CRUD + activate/deactivate
│   │       ├── policies.ts            # memory / rag / response / safety (upsert) + tools (CRUD)
│   │       ├── routes.ts              # model routes CRUD
│   │       ├── prompt-templates.ts    # versions CRUD + activate
│   │       ├── config.ts              # resolved config + cache evict
│   │       ├── executions.ts          # execution audit search
│   │       ├── audit.ts               # rag + tool audit search
│   │       ├── admin-sessions.ts      # admin session search + close/delete
│   │       ├── stats.ts               # platform stats
│   │       └── tenant-overrides.ts    # CRUD
│   │
│   ├── types/
│   │   └── api.ts                     # TypeScript types matching every OpenAPI schema
│   │
│   ├── components/
│   │   ├── ui/                        # Headless primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx              # active / closed / expired pills
│   │   │   ├── Card.tsx
│   │   │   ├── DataTable.tsx          # generic sortable table with pagination
│   │   │   ├── Modal.tsx              # portal-based, trap focus
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Toggle.tsx             # pill toggle (streaming, booleans)
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── JsonViewer.tsx         # syntax-highlighted JSON / prompt display
│   │   │
│   │   ├── layout/
│   │   │   ├── TopNav.tsx             # logo + Chat|Admin tabs + theme + status pill
│   │   │   ├── AdminSidebar.tsx       # left nav for admin view
│   │   │   └── ChatSidebar.tsx        # session list sidebar
│   │   │
│   │   └── shared/
│   │       ├── PriorityBadge.tsx      # numbered circle for route priority
│   │       ├── KvGrid.tsx             # key-value row renderer (config inspector)
│   │       └── StatCard.tsx           # dashboard stat tile
│   │
│   ├── features/
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatView.tsx           # root layout (sidebar + chat area + context panel)
│   │   │   ├── SessionSidebar.tsx     # assistant select + session list + new button
│   │   │   ├── ChatArea.tsx           # topbar + messages + input
│   │   │   ├── MessageBubble.tsx      # user / assistant bubble, citations, tool chips
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── ContextPanel.tsx       # tabs: Summary / Key Facts / Sources / Stats
│   │   │   └── hooks/
│   │   │       ├── useChat.ts         # blocking chat mutation
│   │   │       └── useSSEStream.ts    # SSE streaming hook
│   │   │
│   │   └── admin/
│   │       ├── AdminView.tsx          # AdminSidebar + <Outlet>
│   │       │
│   │       ├── dashboard/
│   │       │   └── DashboardPage.tsx  # stats grid + assistants table
│   │       │
│   │       ├── assistants/
│   │       │   ├── AssistantsPage.tsx
│   │       │   ├── AssistantForm.tsx  # create / edit modal form
│   │       │   └── hooks/
│   │       │       └── useAssistants.ts
│   │       │
│   │       ├── prompt-templates/
│   │       │   ├── PromptTemplatesPage.tsx
│   │       │   ├── PromptTemplateForm.tsx
│   │       │   └── hooks/
│   │       │       └── usePromptTemplates.ts
│   │       │
│   │       ├── model-routes/
│   │       │   ├── ModelRoutesPage.tsx
│   │       │   ├── ModelRouteForm.tsx
│   │       │   └── hooks/
│   │       │       └── useModelRoutes.ts
│   │       │
│   │       ├── knowledge-bases/
│   │       │   ├── KnowledgeBasesPage.tsx
│   │       │   ├── KnowledgeBaseForm.tsx
│   │       │   └── hooks/
│   │       │       └── useKnowledgeBases.ts
│   │       │
│   │       ├── tenant-overrides/
│   │       │   ├── TenantOverridesPage.tsx
│   │       │   ├── TenantOverrideForm.tsx
│   │       │   └── hooks/
│   │       │       └── useTenantOverrides.ts
│   │       │
│   │       ├── policies/
│   │       │   ├── PoliciesPage.tsx   # tab bar: Memory | RAG | Tool | Safety | Response
│   │       │   ├── MemoryPolicyTab.tsx
│   │       │   ├── RagPolicyTab.tsx
│   │       │   ├── ToolPolicyTab.tsx  # list + add/edit/delete tools
│   │       │   ├── SafetyPolicyTab.tsx
│   │       │   ├── ResponsePolicyTab.tsx
│   │       │   └── hooks/
│   │       │       └── usePolicies.ts
│   │       │
│   │       ├── config/
│   │       │   └── ConfigInspectorPage.tsx  # assistant + tenant selects → KvGrid blocks
│   │       │
│   │       ├── cache/
│   │       │   └── CachePage.tsx      # live cache entries + evict actions
│   │       │
│   │       ├── sessions/
│   │       │   ├── AdminSessionsPage.tsx
│   │       │   └── hooks/
│   │       │       └── useAdminSessions.ts
│   │       │
│   │       ├── messages/
│   │       │   └── MessagesPage.tsx   # session picker → message table
│   │       │
│   │       ├── executions/
│   │       │   ├── ExecutionsPage.tsx
│   │       │   └── hooks/
│   │       │       └── useExecutions.ts
│   │       │
│   │       └── audit/
│   │           ├── AuditPage.tsx      # tab bar: Tool Audit | RAG Audit
│   │           ├── ToolAuditTab.tsx
│   │           ├── RagAuditTab.tsx
│   │           └── hooks/
│   │               └── useAudit.ts
│   │
│   ├── store/
│   │   ├── themeStore.ts              # dark | light, persisted to localStorage
│   │   └── chatStore.ts               # currentSessionId, assistantCode, streamingEnabled
│   │
│   ├── hooks/
│   │   └── useToast.ts                # wraps Sonner
│   │
│   ├── utils/
│   │   ├── formatters.ts              # date, duration, token counts
│   │   └── constants.ts               # BASE_URL, pagination defaults
│   │
│   ├── App.tsx                        # QueryClientProvider + RouterProvider
│   ├── main.tsx
│   └── index.css                      # Tailwind imports + CSS custom properties
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── tailwind.config.ts
├── .env.example
├── README.md
└── CLAUDE.md
```

---

## 4. Routing

All routes are under a single `RouterProvider`. The top-level `App` contains a layout shell with `TopNav`. Two top-level branches: `/chat` and `/admin`.

```
/                      → redirect → /chat
/chat                  → ChatView
/admin                 → AdminView (layout with AdminSidebar)
  /admin               → redirect → /admin/dashboard
  /admin/dashboard
  /admin/assistants
  /admin/prompt-templates
  /admin/model-routes
  /admin/knowledge-bases
  /admin/tenant-overrides
  /admin/policies
  /admin/config
  /admin/cache
  /admin/sessions
  /admin/messages
  /admin/executions
  /admin/audit
```

Router: React Router v7 (using `createBrowserRouter`).

---

## 5. State Management

### 5.1 Theme Store (Zustand)
```ts
interface ThemeStore {
  theme: 'dark' | 'light'
  toggle: () => void
}
// Persisted to localStorage via zustand/middleware/persist
// On mount: applies data-theme attr to <html>
```

### 5.2 Chat Store (Zustand)
```ts
interface ChatStore {
  assistantCode: string | null
  currentSessionId: string | null
  streamingEnabled: boolean
  setAssistant: (code: string) => void
  setSession: (id: string) => void
  toggleStreaming: () => void
}
```

### 5.3 Server State (TanStack Query)
- All API data lives in TanStack Query cache.
- Mutations invalidate relevant query keys on success.
- `queryClient.invalidateQueries` patterns are defined per feature hook.
- Error responses (`ApiErrorResponse`) are mapped to toast notifications via the Axios response interceptor.

---

## 6. API Layer

### 6.1 Axios Client (`src/api/client.ts`)
```ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor: normalise ApiErrorResponse → throw enriched Error
apiClient.interceptors.response.use(
  res => res,
  err => {
    const data = err.response?.data as ApiErrorResponse
    return Promise.reject(new ApiError(data?.errorCode, data?.errorMessage, data?.fieldErrors))
  }
)
```

### 6.2 SSE Streaming (`src/api/chat.ts`)
SSE streaming uses native `fetch` + `ReadableStream` so we can `POST` (EventSource only supports GET):

```ts
async function* streamChat(req: ChatRequest): AsyncGenerator<StreamingChatChunk | StreamingCompletion> {
  const res = await fetch(`${BASE_URL}/api/v1/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(req),
  })
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

The `useSSEStream` hook wraps this generator and manages React state (accumulated content, completion data, loading flag).

---

## 7. TypeScript Types (`src/types/api.ts`)

All types are hand-mapped from `openapi.yaml`. Key interfaces:

```ts
// Enums
type SessionStatus = 'ACTIVE' | 'CLOSED' | 'EXPIRED'
type MemoryStoreType = 'NONE' | 'IN_MEMORY' | 'JDBC'
type RouteType = 'SIMPLE' | 'KNOWLEDGE_QA' | 'TOOL_HEAVY' | 'LONG_CONTEXT' | 'STRUCTURED_OUTPUT'
type ToolType = 'LOCAL_BEAN' | 'REST' | 'MCP'
type FallbackPolicy = 'USE_DEFAULT_MODEL' | 'FAIL_FAST'

// Core DTOs
interface ChatRequest { assistantCode: string; tenantId: string; sessionId: string; userId: string; message: string; locale?: string; channel?: string; context?: Record<string, unknown>; runtimeOverride?: RuntimeOverride }
interface ChatResponse { requestId: string; sessionId: string; messageId: string; assistantCode: string; content: string; selectedProvider: string; selectedModel: string; finishReason: string; timestamp: string; usage?: ResponseUsage; citations: ResponseCitation[]; toolExecutions: ToolExecutionSummary[]; metadata?: ResponseMetadata }
interface StreamingChatChunk { requestId: string; sessionId: string; eventType: 'message'; contentChunk: string; sequenceNumber: number; timestamp: string; metadata?: StreamingMetadata }
interface StreamingCompletion { requestId: string; sessionId: string; messageId: string; eventType: 'completion'; usage?: ResponseUsage; citations: ResponseCitation[]; toolExecutions: ToolExecutionSummary[]; timestamp: string }
interface SessionSummary { sessionId: string; tenantId: string; assistantCode: string; userId: string; title?: string; status: SessionStatus; createdAt: string; updatedAt: string; lastMessageAt?: string; locale?: string; channel?: string }
interface AssistantDto { id: number; assistantCode: string; name: string; description?: string; tenantScope?: string; configVersion: string; active: boolean; createdAt: string; updatedAt: string; createdBy?: string }
interface AssistantSummary { assistantCode: string; name: string; tenantScope?: string; configVersion: string; active: boolean; updatedAt: string }
// ... (full list follows same pattern for all 40+ schemas)

interface ApiErrorResponse { errorCode: string; errorMessage: string; requestId?: string; timestamp: string; fieldErrors?: FieldValidationError[] }
interface PageMetadata { size: number; count: number; nextCursor?: string | null }
```

---

## 8. Component Specifications

### 8.1 UI Primitives

#### `Button`
Props: `variant: 'primary' | 'ghost' | 'danger'`, `size: 'sm' | 'md'`, `loading?: boolean`, `disabled?`, `icon?: ReactNode`, `onClick`, `type`, `children`

Maps to prototype `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`.

#### `Badge`
Props: `status: SessionStatus | 'active' | 'inactive'`  
Renders coloured pill matching `.pill-active`, `.pill-closed`, `.pill-expired`.

#### `DataTable`
Props: `columns: ColumnDef<T>[]`, `data: T[]`, `loading?: boolean`, `emptyMessage?: string`  
Wraps a `<table>` with header, body, hover row highlight. Columns define header label, accessor key, optional render function, optional width.

#### `Modal`
Portal-rendered; traps focus; `Escape` to close.  
Props: `open`, `onClose`, `title`, `children`, `footer?: ReactNode`

#### `Toggle`
Controlled: `checked`, `onChange`. CSS pill animation matching prototype.

#### `JsonViewer`
Displays JSON/text with syntax highlighting. Used in Config Inspector and prompt template preview.

---

### 8.2 Chat Feature

#### `ChatView`
Layout: `flex h-full` with three columns — `ChatSidebar` (248 px fixed) + `ChatArea` (flex-1) + `ContextPanel` (320 px fixed).

#### `SessionSidebar`
- Assistant `<Select>` at top (loads from `GET /api/v1/admin/assistants?active=true`)
- "Sessions" header + "+ New" button
- List of sessions from chat store; clicking selects a session and loads its messages

#### `ChatArea`
- Topbar: session title, session meta (id / user / assistant / locale), copy-id + clear icon buttons
- Messages list: scrollable, padded; renders `MessageBubble` for each message
- Input area: auto-resize textarea, send button, streaming toggle

#### `MessageBubble`
Props: `message: LocalMessage` (union of `ChatRequest` & `ChatResponse` with display metadata)
- User variant: right-aligned, accent background
- Assistant variant: left-aligned, surface background, border
- Renders: content (markdown-simple — bold, newlines), citation chips, tool chips, model badge
- Typing indicator (3-dot bounce) shown while awaiting response

#### `ContextPanel`
4 tabs: Summary | Key Facts | Sources | Stats  
Data comes from the most recent `ChatResponse` for the active session + accumulated session data.

Tab content:
- **Summary**: conversation summary text (derived client-side from last response metadata), topics, last response stats grid (model / latency / in-tokens / out-tokens)
- **Key Facts**: shows `ResponseMetadata` flags (ragUsed, memoryUsed, toolsUsed, knowledgeBaseId, promptVersion, finishReason)
- **Sources**: all `ResponseCitation[]` accumulated for session, shown as cite-cards
- **Stats**: cumulative token counts, avg latency, tool execution list

#### `useChat` hook
```ts
const { mutate: sendBlocking, isPending } = useMutation({
  mutationFn: (req: ChatRequest) => chatApi.send(req),
  onSuccess: (data) => { /* append to local message list */ },
})
```

#### `useSSEStream` hook
```ts
function useSSEStream() {
  const [chunks, setChunks] = useState<string>('')
  const [completion, setCompletion] = useState<StreamingCompletion | null>(null)
  const [streaming, setStreaming] = useState(false)

  async function start(req: ChatRequest) {
    setStreaming(true); setChunks(''); setCompletion(null)
    for await (const event of chatApi.stream(req)) {
      if (event.eventType === 'message') setChunks(prev => prev + event.contentChunk)
      if (event.eventType === 'completion') { setCompletion(event); setStreaming(false) }
    }
  }
  return { chunks, completion, streaming, start }
}
```

---

### 8.3 Admin Feature

#### `AdminView`
`AdminSidebar` (210 px fixed) + `<Outlet>` (flex-1 scrollable).

#### `AdminSidebar`
Nav sections matching prototype:
- **Overview**: Dashboard
- **Assistants**: Assistants, Prompt Templates, Model Routes, Knowledge Bases, Tenant Overrides
- **Policies**: Memory, RAG, Tool, Safety, Response
- **Config**: Config Inspector, Cache Management
- **Conversations**: Sessions, Messages
- **Monitoring**: Execution Monitor, Tool Audit, RAG Audit

Active item highlighted with left border + accent colour.

---

#### `DashboardPage`
- Calls `GET /api/v1/admin/stats` — renders 4-column stat grid
- Calls `GET /api/v1/admin/assistants` — renders assistant summary table with active status pills
- Auto-refreshes every 30 s via `refetchInterval`

Stats shown: Active Sessions, Messages (24 h), Avg Latency, Total Assistants, Active Assistants, Total Executions Today, Failed Executions Today, Avg Output Tokens.

---

#### `AssistantsPage`
- Query: `GET /api/v1/admin/assistants?active=&tenantScope=` with filter controls
- Table columns: Code, Name, Description, Tenant Scope, Config v, Status, Created, Actions
- Actions: Edit (opens `AssistantForm` modal), Activate/Deactivate button (toggle based on `active`)
- "+ New Assistant" → `AssistantForm` modal (create mode)

#### `AssistantForm` (modal)
Fields:
- `assistantCode` (text, required, disabled in edit mode)
- `name` (text, required)
- `description` (textarea)
- `tenantScope` (text)

On submit:
- Create: `POST /api/v1/admin/assistants` → 201
- Edit: `PUT /api/v1/admin/assistants/{assistantCode}` → 200
- Activate: `POST /api/v1/admin/assistants/{assistantCode}/activate`
- Deactivate: `POST /api/v1/admin/assistants/{assistantCode}/deactivate`

---

#### `PromptTemplatesPage`
- Assistant select (filter) at top
- Query: `GET /api/v1/admin/assistants/{assistantCode}/prompt-templates`
- Table: Version, Status (ACTIVE pill), System Prompt preview, Dev Prompt (present/None), Variables count, Guardrails count, Created By, Created At, Actions
- Active row dimmed for INACTIVE versions
- Actions: Edit | Clone (clone = pre-fill form with existing data, different version string) | Activate (INACTIVE rows only) | Delete

#### `PromptTemplateForm` (modal)
Fields:
- `version` (text, required)
- `systemPromptTemplate` (textarea large, required, monospace)
- `developerPromptTemplate` (textarea)
- `promptVariables` (JSON key-value editor — add/remove rows)
- `guardrailInstructions` (multi-line tag input — add/remove strings)

---

#### `ModelRoutesPage`
- Assistant select + "+ Add Route" button
- Query: `GET /api/v1/admin/assistants/{assistantCode}/routes`
- Table: Priority (badge), Route Name, Type, Conditions summary, Target Provider, Target Model, Max Tokens, Temp, Status, Actions
- Conditions summary computed from `ragEnabledOnly`, `toolsRequiredOnly`, `minPromptLength`, `maxPromptLength`

#### `ModelRouteForm` (modal)
Fields:
- `routeName` (text, required)
- `routeType` (select: SIMPLE | KNOWLEDGE_QA | TOOL_HEAVY | LONG_CONTEXT | STRUCTURED_OUTPUT)
- `priority` (number 1–999)
- `minPromptLength`, `maxPromptLength` (number, optional)
- `ragEnabledOnly`, `toolsRequiredOnly`, `structuredOutputOnly` (toggles)
- `targetProvider` (text, required)
- `targetModel` (text, required)
- `maxInputTokens` (number, optional)
- `temperature` (number 0–2, optional)
- `fallbackPolicy` (select: USE_DEFAULT_MODEL | FAIL_FAST)

---

#### `KnowledgeBasesPage`
- Query: `GET /api/v1/admin/knowledge-bases?active=`
- Table: KB ID, Name, Vector Store, Embedding Model, Connection Ref, Status, Created, Actions
- Actions: Edit | Activate/Deactivate

#### `KnowledgeBaseForm` (modal)
Fields: `knowledgeBaseId` (disabled on edit), `name`, `vectorStoreType`, `embeddingModel`, `connectionRef`, `metadataFilterPolicy` (JSON key-value editor)

---

#### `TenantOverridesPage`
- Filters: `tenantId`, `assistantCode`
- Query: `GET /api/v1/admin/tenant-overrides?tenantId=&assistantCode=`
- Table: ID, Tenant ID, Assistant Code, Override Type, Payload preview (truncated), Active, Created, Actions

#### `TenantOverrideForm` (modal)
Fields: `tenantId`, `assistantCode`, `overrideType` (select: memory | rag | response | safety), `overridePayloadJson` (textarea, validated as JSON), `active` (toggle, edit mode only)

---

#### `PoliciesPage`
- Assistant select (persisted in URL query param `?assistant=`)
- Tab bar: Memory | RAG | Tool | Safety | Response
- Each tab loads the relevant policy and displays a form

**MemoryPolicyTab**
Calls `GET /api/v1/admin/assistants/{code}/memory-policy`  
Toggle fields: `memoryEnabled`, `persistChatHistory`, `summarizeOldMessages`  
Number fields: `messageWindowSize`, `ttlMinutes`  
Select: `storeType` (NONE | IN_MEMORY | JDBC)  
Save: `PUT /api/v1/admin/assistants/{code}/memory-policy`

**RagPolicyTab**
`GET` / `PUT` `/api/v1/admin/assistants/{code}/rag-policy`  
Toggles: `ragEnabled`, `citationsEnabled`, `groundedAnswerRequired`  
Number: `topK`, `similarityThreshold`  
Text: `defaultKnowledgeBaseId`, `retrievalStrategy`  
JSON kv: `metadataFilters`

**ToolPolicyTab**
Lists tools: `GET /api/v1/admin/assistants/{code}/tools`  
Table: Tool Name, Tool Type, Enabled, Requires Approval, Timeout, Created, Actions  
Actions: Edit tool | Delete tool  
"+ Add Tool" → mini modal form (toolName, toolType, enabled, requiresApproval, timeoutMs)

**SafetyPolicyTab**
`GET` / `PUT` `/api/v1/admin/assistants/{code}/safety-policy`  
Toggles: `blockUnknownTools`, `blockWithoutRagWhenGroundedMode`, `allowDirectModelAnswerWithoutContext`, `maskSensitiveDataInLogs`  
Tag list: `disallowedTopics`

**ResponsePolicyTab**
`GET` / `PUT` `/api/v1/admin/assistants/{code}/response-policy`  
Toggles: `markdownEnabled`, `streamEnabled`, `citationRequired`  
Text: `defaultTone`, `defaultFormat`  
Number: `maxOutputTokens`

---

#### `ConfigInspectorPage`
- Assistant select + Tenant select + "Load Config" button
- Calls `GET /api/v1/admin/assistants/{code}/config?tenantId=`
- Renders 6-block grid (2 columns × 3 rows) matching prototype:
  - Prompt, Routing, RAG, Memory, Tools, Safety
- Each block is a `KvGrid` component (label → value pairs)

---

#### `CachePage`
- Stats grid (Entries Cached, Hit Rate placeholder, Avg Resolve Time placeholder, TTL)
  > Note: Backend stats endpoint (`/api/v1/admin/stats`) does not include cache-specific metrics; show what's available.
- "Live Cache Entries" section: calls `GET /api/v1/admin/assistants` to list all assistants, renders cache-entry rows
- "Evict" per entry: `DELETE /api/v1/admin/assistants/{code}/config/cache?tenantId=`
- "Evict All": `DELETE /api/v1/admin/config/cache`

---

#### `AdminSessionsPage`
- Filters: `tenantId`, `userId`, `assistantCode`, `status`, date range (`from` / `to`)
- Query: `GET /api/v1/admin/sessions` with all filter params
- Table: Session ID, Title, Assistant, User, Tenant, Status, Channel, Locale, Msg Count, Actions
- Actions: View Messages (navigates to Messages page), Close Session (`POST /close`), Delete Session (`DELETE`)

#### `MessagesPage`
- Session selector (dropdown or search) + Limit number input + Load button
- Calls `GET /api/v1/sessions/{sessionId}/messages?limit=`
- Table: Message ID, Role (coloured badge), Content Preview, Model, Citations count, Tool Calls count, Finish Reason, Timestamp

---

#### `ExecutionsPage`
- Filters: assistantCode, tenantId, success (select: All / Success / Failed), provider, model, date range
- Query: `GET /api/v1/admin/executions` with filters
- Table: Request ID, Session ID, Tenant, Assistant, User, Provider, Model, KB, Success (icon), Latency, Tokens In/Out, Started At
- Click row → detail drawer or navigate to `GET /api/v1/admin/executions/{requestId}`

---

#### `AuditPage`
Tab bar: Tool Audit | RAG Audit

**ToolAuditTab**
Query: `GET /api/v1/admin/audit/tools` with filters (toolName, toolType, success, sessionId, requestId, date range)  
Table: ID, Request ID, Session ID, Tool Name, Tool Type, Success (icon), Latency, Error, Created At

**RagAuditTab**
Query: `GET /api/v1/admin/audit/rag` with filters (knowledgeBaseId, groundedMode, sessionId, requestId, date range)  
Table: ID, Request ID, Session ID, KB ID, Retrieved Docs, Top K, Similarity, Latency, Grounded, Created At

---

## 9. Theme System

CSS custom properties defined in `src/index.css` match the prototype exactly:

```css
:root { --radius: 10px; --font: 'Inter', system-ui, sans-serif; --transition: .18s ease; }

[data-theme="dark"] {
  --bg: #0f1117; --surface: #1a1d27; --surface2: #22263a; --surface3: #2c3050;
  --border: #2e3250; --accent: #5b6ef5; --accent2: #7c8bff;
  --green: #22c55e; --yellow: #f59e0b; --red: #ef4444;
  --text: #e2e6f3; --muted: #7b82a8;
  --user-bubble: #5b6ef5; --user-text: #fff;
  --bot-bubble: #1a1d27; --bot-border: #2e3250; --shadow: 0 2px 16px rgba(0,0,0,.35);
}

[data-theme="light"] {
  --bg: #f0f2f8; --surface: #ffffff; --surface2: #f5f6fc; --surface3: #eaecf7;
  --border: #dde0f0; --accent: #5b6ef5; --accent2: #4458e8;
  --green: #16a34a; --yellow: #d97706; --red: #dc2626;
  --text: #1a1d2e; --muted: #6b7280;
  --user-bubble: #5b6ef5; --user-text: #fff;
  --bot-bubble: #ffffff; --bot-border: #dde0f0; --shadow: 0 2px 16px rgba(0,0,40,.08);
}
```

Tailwind config uses `cssVariables` mode so all `var(--*)` tokens are available as utility classes (`bg-[var(--surface)]`). `ThemeStore` writes `data-theme` on `<html>` on every toggle.

---

## 10. Forms & Validation

All CRUD forms use React Hook Form + Zod. Pattern:

```ts
const schema = z.object({
  assistantCode: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(1024).optional(),
  tenantScope: z.string().max(100).optional(),
})

const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues })

// Field-level errors rendered below each input:
// {form.formState.errors.assistantCode?.message}
```

Server-side `fieldErrors` (from 400 responses) are mapped back onto the form:
```ts
onError: (err: ApiError) => {
  err.fieldErrors?.forEach(fe => form.setError(fe.field as any, { message: fe.message }))
}
```

---

## 11. Pagination

The `DataTable` component accepts a `pagination` prop:
```ts
interface PaginationProps {
  page: number
  size: number
  hasMore: boolean  // nextCursor !== null
  onPageChange: (page: number) => void
}
```

Query hooks accept `{ page, size }` params and include them as query params. Page state is kept in component-local state (not URL) except for pages where bookmarkability matters (sessions, executions).

---

## 12. Error Handling

- **Axios interceptor** converts all non-2xx responses to an `ApiError` instance with `errorCode`, `errorMessage`, `fieldErrors`
- **TanStack Query** `onError` callbacks fire toast notifications via `useToast`
- **Global error boundary** wraps `<RouterProvider>` for unexpected render errors
- **Empty states** shown when queries return empty arrays

Toast messages pattern:
- Success: green — "Saved successfully"
- Error: red — `err.errorMessage || 'Something went wrong'`
- Info: neutral — confirmations

---

## 13. Environment Variables

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:8080

# For development proxying (optional — Vite proxy can also be used)
# vite.config.ts proxy: '/api' → 'http://localhost:8080'
```

---

## 14. Key Dependencies (`package.json`)

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router": "^7.6.0",
    "axios": "^1.9.0",
    "@tanstack/react-query": "^5.79.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.56.0",
    "zod": "^3.24.0",
    "@hookform/resolvers": "^5.0.0",
    "lucide-react": "^0.511.0",
    "recharts": "^2.15.0",
    "sonner": "^2.0.0",
    "react-syntax-highlighter": "^15.6.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.5.0",
    "typescript": "^5.8.0",
    "vite": "^6.3.0",
    "tailwindcss": "^4.1.0",
    "@tailwindcss/vite": "^4.1.0"
  }
}
```

---

## 15. README.md Content

```markdown
# k2pbot Admin UI

React admin dashboard for the **k2pbot Generic Chatbot Platform**.

## Prerequisites

- Node.js 20+
- k2pbot backend running on `http://localhost:8080`

## Quick Start

\`\`\`bash
npm install
npm run dev          # Vite dev server on http://localhost:5173
\`\`\`

## Build

\`\`\`bash
npm run build        # Production bundle → dist/
npm run preview      # Preview production build locally
\`\`\`

## Environment

Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` if the backend is not on port 8080.

## Architecture

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| HTTP | Axios |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |

## Views

- **Chat** (`/chat`) — interactive chat with session history, context panel, SSE streaming toggle
- **Admin** (`/admin`) — full CRUD for assistants, policies, routes, templates, knowledge bases, audit

## API

All endpoints are documented in `openapi.yaml` at the project root. The UI calls `http://localhost:8080/api/v1/*`.
```

---

## 16. CLAUDE.md Content

```markdown
# CLAUDE.md

## Project

k2pbot Admin UI — React 19 + TypeScript SPA for the k2pbot Generic Chatbot Platform.

## Commands

\`\`\`bash
npm run dev          # Dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview build
npm run typecheck    # tsc --noEmit
\`\`\`

## Architecture

- **Routing**: React Router v7 — `createBrowserRouter`. Two top-level routes: `/chat` and `/admin/*`.
- **Server state**: TanStack Query v5. All API data lives in the query cache. Mutations invalidate query keys on success.
- **Client state**: Zustand v5 — `themeStore` (dark/light, persisted to localStorage) and `chatStore` (active session, streaming flag).
- **API layer**: `src/api/` — one file per resource group, all using the shared Axios instance in `src/api/client.ts`.
- **Types**: `src/types/api.ts` — hand-mapped from `openapi.yaml`. Do not generate; keep in sync manually.
- **Forms**: React Hook Form + Zod. Field-level server errors are applied via `form.setError`.

## Conventions

- No Lombok analogues here either — prefer explicit props interfaces over spread types.
- Co-locate hooks with their feature: `src/features/admin/assistants/hooks/useAssistants.ts`.
- `ui/` components are pure and stateless — they receive all data as props.
- Use `clsx` + `tailwind-merge` for conditional class construction.
- Toast notifications via `sonner` — import `toast` directly, do not wrap.
- Colours come from CSS custom properties (`var(--accent)` etc.) — do not hardcode hex values.

## API

Base URL: `VITE_API_BASE_URL` env var (default `http://localhost:8080`).  
Full spec: `openapi.yaml` at project root.  
Error shape: `{ errorCode, errorMessage, requestId, timestamp, fieldErrors[] }`.

## Key Files

| File | Purpose |
|---|---|
| `src/api/client.ts` | Axios instance + error interceptor |
| `src/api/chat.ts` | Blocking chat + SSE streaming generator |
| `src/types/api.ts` | All OpenAPI types as TypeScript interfaces |
| `src/store/themeStore.ts` | Dark/light theme Zustand store |
| `src/store/chatStore.ts` | Active session + streaming flag |
| `src/features/chat/hooks/useSSEStream.ts` | SSE streaming React hook |
| `src/index.css` | CSS custom property theme tokens |

## Testing

Not yet implemented. When adding tests, use Vitest + React Testing Library.  
Do not mock API calls in unit tests unless isolation is strictly required — prefer msw for API mocking.
\`\`\`
```

---

## 17. React Best Practices

### 17.1 Component Patterns

**Single responsibility.** Every component does one thing. `DataTable` knows nothing about API calls; it receives `data` and `columns` as props. Page components own data fetching; UI components own rendering.

**Controlled forms only.** All forms are controlled via React Hook Form. Never use `defaultValue` on uncontrolled inputs in forms that must submit data.

**Co-location.** Keep the query hook, form schema, and page component in the same feature folder. Move to `src/hooks/` only when two or more unrelated features need the same hook.

**No prop drilling past 2 levels.** Use Zustand for cross-cutting state (theme, active session). Use TanStack Query's query cache as the source of truth for server data — never thread API responses as props across layout boundaries.

**Stable references.** Wrap callbacks passed to `React.memo` children in `useCallback`. Wrap derived computations in `useMemo` only when the computation is measurably expensive (not by default).

**Lazy loading.** All admin feature pages are loaded lazily via `React.lazy` + `Suspense`. This keeps the initial chat-view bundle small.

```ts
const AssistantsPage = React.lazy(() => import('@/features/admin/assistants/AssistantsPage'))
// Wrapped in <Suspense fallback={<PageSkeleton />}> in AdminView
```

**Error boundaries.** One at the `AdminView` level, one at `ChatView` level. They render a friendly error card with a "Retry" button that calls `window.location.reload()`.

### 17.2 Data Fetching Patterns

**Query key conventions.** Use arrays that narrow from resource → identifier → filters:
```ts
['assistants']                                   // list
['assistants', 'loan-advisor']                  // single
['assistants', 'loan-advisor', 'routes']        // nested list
['executions', { assistantCode, success, page }] // filtered list
```

**Mutation → invalidation.** Every mutation specifies exact query keys to invalidate on `onSuccess`. Do not invalidate the entire cache.

**Optimistic updates for toggles.** Activate / Deactivate / Enable / Disable actions use `onMutate` + `onError` rollback so the UI feels instant. TanStack Query handles rollback automatically on error.

```ts
onMutate: async (assistantCode) => {
  await queryClient.cancelQueries({ queryKey: ['assistants'] })
  const previous = queryClient.getQueryData(['assistants'])
  queryClient.setQueryData(['assistants'], (old: AssistantSummary[]) =>
    old.map(a => a.assistantCode === assistantCode ? { ...a, active: !a.active } : a)
  )
  return { previous }
},
onError: (_err, _vars, ctx) => queryClient.setQueryData(['assistants'], ctx?.previous),
onSettled: () => queryClient.invalidateQueries({ queryKey: ['assistants'] }),
```

**Stale time.** Config data (assistants, policies) uses `staleTime: 60_000`. Audit / execution data uses `staleTime: 0` (always fresh). Dashboard stats use `refetchInterval: 30_000`.

**Loading skeletons.** Every page shows a skeleton (`<PageSkeleton>`) while its primary query is loading. Tables show 5 skeleton rows. Stat cards show grey boxes.

### 17.3 Performance

**Virtualised lists are not needed** for the expected data volumes (< 500 rows per page, pagination enforced). If row counts grow beyond 1000 visible, add `react-virtual`.

**Avoid anonymous functions in JSX** for column definitions and recurring render methods — define them outside the component or memoize with `useMemo`.

**`React.memo` on leaf components** that receive stable props and render frequently: `MessageBubble`, `StatCard`, `KvRow`.

### 17.4 Code Style

- Named exports everywhere (no default exports except page-level components loaded by `React.lazy`)
- `cn()` utility (`clsx` + `tailwind-merge`) for conditional class names
- All event handlers named `handle*` (`handleSubmit`, `handleClose`)
- Boolean props use `is*` or `has*` prefix: `isLoading`, `hasError`

---

## 18. UI / UX Best Practices

### 18.1 Loading States

Every async action has a defined loading state:

| Trigger | Loading indicator |
|---|---|
| Page initial load | Full-page skeleton |
| Table refetch | Subtle spinner overlay on table (not full-page) |
| Form submit | Button enters `loading` state (spinner + disabled), label stays visible |
| Toggle / activate | Instant optimistic update, no spinner |
| Chat send (blocking) | Typing indicator (3-dot bounce) appears in message area |
| Chat send (streaming) | Content appears character-by-character with cursor `▌` |

### 18.2 Error States

- **Network / 5xx errors** → toast with error message + error code. Keep existing UI intact.
- **404 errors** → inline empty-state card where the resource would appear ("Assistant not found").
- **400 validation errors** → field-level error messages under each input. Form stays open.
- **Destructive action failures** → toast + rollback (for optimistic mutations).

### 18.3 Confirmation Dialogs

Destructive actions (Delete, Deactivate, Evict All Cache, Close Session) show a confirmation modal before proceeding:

```
⚠️  Delete "loan-advisor"?
This will permanently remove the assistant and all its policies.
This action cannot be undone.

[Cancel]  [Delete]
```

The confirm button is coloured `btn-danger` and labelled with the action (not just "OK").

### 18.4 Empty States

Every table/list that can be empty renders a centred empty state with:
- A relevant icon (from Lucide)
- A brief message ("No assistants found")
- A call-to-action button when applicable ("+ Create your first assistant")

### 18.5 Accessibility (a11y)

- All interactive elements are keyboard-reachable and have visible focus rings.
- Modal dialogs trap focus and return focus to the trigger element on close.
- `aria-label` on icon-only buttons (copy, delete, close).
- `role="status"` on loading spinners and skeleton regions.
- Colour is never the sole differentiator — status pills use both colour and text label.
- `<table>` elements have proper `<thead>`, `<th scope="col">`, and `<caption>` (visually hidden if design doesn't show it).

### 18.6 Form UX

- Required fields marked with `*` (and `aria-required`)
- Inline hints below inputs for format expectations (e.g., "e.g. `loan-advisor`", "Semver string e.g. `v2.1.0`")
- Submit disabled until the form is dirty AND valid
- After successful save: modal closes, toast fires, list refetches automatically
- Long textareas (system prompt) have a character counter

### 18.7 Table UX

- Columns are fixed-width where content can be long (use `max-width` + `text-overflow: ellipsis` + `title` attribute for full value on hover)
- Code-like values (`assistantCode`, `sessionId`, request IDs) rendered in `<code>` tags
- Actions column is always the last column, never truncated
- Rows with `active: false` are rendered at 60% opacity (matching prototype inactive rows)

### 18.8 Toast Placement & Duration

All toasts appear bottom-right, 2.6 s auto-dismiss (matching prototype). Error toasts persist until dismissed manually. Toast messages are concise: "Assistant activated", "Route deleted", "Error: CONFIG_INVALID".

### 18.9 Navigation UX

- Active route highlighted in `AdminSidebar` with left border + accent text
- Switching between admin sections preserves filters in URL query params so the browser Back button works
- The TopNav `Chat` / `Admin` tab switches views without losing scroll position in the other view

### 18.10 Responsive Behaviour

Two supported breakpoints — **tablet** (768 px – 1279 px) and **desktop** (≥ 1280 px). No mobile support below 768 px.

#### Breakpoint definitions (Tailwind)
```
sm  → 640px   (not used as a design breakpoint)
md  → 768px   (tablet minimum)
lg  → 1024px  (mid-tablet / small laptop)
xl  → 1280px  (desktop minimum — full layout)
```

#### Chat View

| Element | Desktop (≥ 1280 px) | Tablet (768 – 1279 px) |
|---|---|---|
| Session sidebar | 248 px fixed left column | Hidden; slides in as an overlay drawer triggered by a hamburger icon in the chat topbar |
| Chat area | flex-1 centre column | Full width |
| Context panel | 320 px fixed right column | Hidden; accessible via a "Details" button in the chat topbar that opens it as a right-side overlay drawer |
| Input area | Fixed bottom within chat area | Same, full width |

Overlay drawers use a semi-transparent backdrop; tapping/clicking the backdrop closes the drawer. Both drawers have smooth `translateX` transitions.

#### Admin View

| Element | Desktop (≥ 1280 px) | Tablet (768 – 1279 px) |
|---|---|---|
| Admin sidebar | 210 px fixed left column, always visible | Hidden; opened as an overlay drawer via a hamburger icon in the TopNav |
| Main content area | flex-1, padded 28 px | Full width, padded 16 px |
| Stat cards grid | 4 columns | 2 columns |
| Config block grid | 2 columns | 1 column |
| Data tables | Full columns | Horizontally scrollable; lower-priority columns (Created By, Config v, Tenant) hidden via `hidden lg:table-cell` |
| Form rows (2-column) | Side-by-side | Stacked single column |
| Modals | 560 px centred | 90 vw, max 560 px, centred |

#### TopNav

| Element | Desktop | Tablet |
|---|---|---|
| Nav tabs (Chat / Admin) | Visible | Visible |
| Status pill | Visible | Hidden (`hidden lg:flex`) |
| Theme toggle label | Visible | Icon-only (label hidden) |

#### Typography & Spacing

On tablet, base font-size stays 14 px. Padding and gap values step down by one Tailwind size (e.g., `p-7` → `p-4`, `gap-10` → `gap-6`) using responsive variants.

#### Touch Targets

All clickable elements on tablet must be at minimum 44 × 44 px to meet WCAG 2.5.5. Icon buttons that are 30 × 30 px on desktop gain `md:p-2` padding to meet this requirement on tablet.

---

## 20. Implementation Order

Implement in this order to keep the app runnable at each step:

1. **Scaffold** — Vite project, Tailwind, Router, Axios client, type stubs, themeStore
2. **Layout shell** — TopNav (with theme toggle, view switch), Chat/Admin route structure
3. **Chat view** — SessionSidebar, ChatArea (blocking mode), MessageBubble, ContextPanel (static)
4. **SSE streaming** — `useSSEStream`, streaming indicator, real-time content rendering
5. **Admin layout** — AdminSidebar, outlet routing
6. **Dashboard** — stats query, assistant table
7. **Assistants CRUD** — full create/edit/activate/deactivate
8. **Prompt Templates** — versioned list, create/edit/activate
9. **Model Routes** — priority-ordered list, CRUD
10. **Knowledge Bases** — CRUD + activate/deactivate
11. **Policies** — all 5 tabs (Memory, RAG, Tool, Safety, Response)
12. **Config Inspector** — resolved config display
13. **Cache Management** — list + evict actions
14. **Admin Sessions + Messages** — search tables, close/delete
15. **Executions monitor** — filter + audit table
16. **Audit** — Tool Audit + RAG Audit tabs
17. **Tenant Overrides** — CRUD
18. **Polish** — error boundaries, empty states, loading skeletons, toast wiring

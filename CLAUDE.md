# CLAUDE.md

## Project

k2pbot Admin UI — React 19 + TypeScript SPA for the k2pbot Generic Chatbot Platform.

## Commands

```bash
npm run dev          # Dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview build
npm run typecheck    # tsc --noEmit
```

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
- Use `clsx` + `tailwind-merge` via the `cn()` utility in `src/utils/cn.ts` for conditional class construction.
- Toast notifications via `sonner` — import `toast` directly, do not wrap.
- Colours come from CSS custom properties (`var(--accent)` etc.) — do not hardcode hex values.
- Named exports everywhere (no default exports except page-level components loaded by `React.lazy`).
- All event handlers named `handle*` (`handleSubmit`, `handleClose`).
- Boolean props use `is*` or `has*` prefix: `isLoading`, `hasError`.

## Tailwind v4 — Known Pitfalls

**Arbitrary value utilities are unreliable for spacing/sizing.** Classes like `py-[6px]`, `px-[10px]`, `gap-[5px]` are silently dropped by the Tailwind v4 JIT — `getComputedStyle` returns `0px` even though the class string is present. This was discovered when `Button` padding was zero despite `py-[6px]` in the className.

**Rule: use inline `style` props for any pixel-exact padding, gap, or font-size values** that the component spec requires. Reserve Tailwind utilities for layout (flex, grid, overflow, position) and colour/border/radius tokens where arbitrary values are less likely to conflict.

```tsx
// ✗ Wrong — py-[6px] may silently produce 0px in Tailwind v4
<button className="py-[6px] px-[12px] text-[12px]">…</button>

// ✓ Correct — inline style guarantees the exact computed value
<button style={{ padding: '6px 12px', fontSize: '12px' }}>…</button>
```

**Button sizing is always done via inline style** (see `src/components/ui/Button.tsx` — `sizeStyle` object). Never add padding/font-size to the Button via Tailwind classes.

**All button variants carry `border`** so every variant has the same box height. Primary uses `border-transparent`, ghost uses `border-[var(--border)]`, danger uses a red border. Do not remove the border from any variant — doing so causes a 2 px height mismatch between buttons placed side-by-side (e.g. Cancel + Save in a modal footer).

## UI Component Specs (matched to `ui-prototype.html`)

These values are final. Do not change them without cross-checking the prototype.

| Token | Value | Source |
|---|---|---|
| Button border-radius | `6px` | `.btn { border-radius: 6px }` |
| Button `md` padding | `6px 12px` | `.btn { padding: 6px 12px }` |
| Button `sm` padding | `3px 8px` | `.btn-sm { padding: 3px 8px }` |
| Button font-size `md` | `12px` | `.btn { font-size: 12px }` |
| Button font-size `sm` | `10px` | `.btn-sm { font-size: 10px }` |
| Button font-weight | `600` | `.btn { font-weight: 600 }` |
| Form input border-radius | `7px` | `.form-input { border-radius: 7px }` |
| Form input padding | `7px 10px` | `.form-input { padding: 7px 10px }` |
| Form input font-size | `12px` | `.form-input { font-size: 12px }` |
| Form label font-size | `11px` | `.form-label { font-size: 11px }` |
| Form label style | uppercase, `var(--muted)`, weight 700, `letter-spacing: .4px` | `.form-label` |
| Modal border-radius | `12px` | `.modal { border-radius: 12px }` |
| Modal shadow | `0 8px 40px rgba(0,0,0,.5)` | `.modal { box-shadow: … }` |
| Modal header padding | `16px 20px` | `.modal-header { padding: 16px 20px }` |
| Modal body padding | `20px` | `.modal-body { padding: 20px }` |
| Modal footer padding | `14px 20px` | `.modal-footer { padding: 14px 20px }` |
| Modal close button | `28×28px`, `border-radius: 6px`, `background: var(--surface2)` | `.modal-close` |

## API

Base URL: `VITE_API_BASE_URL` env var (default `http://localhost:8080`).
Full spec: `openapi.yaml` at project root.
Error shape: `{ errorCode, errorMessage, requestId, timestamp, fieldErrors[] }`.

## Key Files

| File | Purpose |
|---|---|
| `src/api/client.ts` | Axios instance + error interceptor |
| `src/api/chat.ts` | Blocking chat API + SSE streaming generator (`streamChat`) |
| `src/api/sessions.ts` | User sessions API |
| `src/api/admin/assistants.ts` | Assistants CRUD API (list, get, create, update, activate, deactivate) |
| `src/api/admin/stats.ts` | Platform stats API (`GET /api/v1/admin/stats`) |
| `src/api/admin/prompt-templates.ts` | Prompt Templates API (list, get, create, update, activate, delete) |
| `src/api/admin/routes.ts` | Model Routes API (list, get, create, update, delete) |
| `src/api/admin/knowledge-bases.ts` | Knowledge Bases API (list, get, create, update, activate, deactivate) |
| `src/api/admin/policies.ts` | Policies API (memory, RAG, response, safety upsert; tool CRUD) |
| `src/api/admin/config.ts` | Resolved config API (`GET /config`) + cache eviction helpers |
| `src/api/admin/admin-sessions.ts` | Admin Sessions API (list, close, delete) |
| `src/api/admin/executions.ts` | Executions API (list with filters, get by requestId) |
| `src/api/admin/audit.ts` | Audit API (tool audit list/get, RAG audit list/get) |
| `src/api/admin/tenant-overrides.ts` | Tenant Overrides API (list, get, create, update, delete) |
| `src/features/admin/dashboard/DashboardPage.tsx` | Dashboard — 8 stat cards + assistants summary table |
| `src/features/admin/assistants/AssistantsPage.tsx` | Assistants list with filter bar, actions, and modals |
| `src/features/admin/assistants/AssistantForm.tsx` | Create/edit assistant modal (React Hook Form + Zod) |
| `src/features/admin/assistants/hooks/useAssistants.ts` | Assistants queries and mutations with optimistic toggle |
| `src/features/admin/prompt-templates/PromptTemplatesPage.tsx` | Prompt templates list with assistant selector, activate/delete actions |
| `src/features/admin/prompt-templates/PromptTemplateForm.tsx` | Create/edit template modal — version, system prompt, dev prompt, variables KV editor, guardrails list |
| `src/features/admin/prompt-templates/hooks/usePromptTemplates.ts` | Prompt template queries and mutations with optimistic activate |
| `src/features/admin/model-routes/ModelRoutesPage.tsx` | Model routes list with assistant selector, priority ordering, and CRUD |
| `src/features/admin/model-routes/ModelRouteForm.tsx` | Create/edit route modal — type, priority, provider/model, conditional condition fields |
| `src/features/admin/model-routes/hooks/useModelRoutes.ts` | Model route queries and mutations |
| `src/features/admin/knowledge-bases/KnowledgeBasesPage.tsx` | Knowledge bases list with activate/deactivate actions |
| `src/features/admin/knowledge-bases/KnowledgeBaseForm.tsx` | Register/edit KB modal — KB ID, store type, embedding model, connection ref, metadata filter KV editor |
| `src/features/admin/knowledge-bases/hooks/useKnowledgeBases.ts` | KB queries and mutations with optimistic toggle |
| `src/features/admin/policies/PoliciesPage.tsx` | Policies page — assistant selector + 5 policy tabs |
| `src/features/admin/policies/MemoryPolicyTab.tsx` | Memory policy form (enabled, store type, window, TTL, persist, summarize) |
| `src/features/admin/policies/RagPolicyTab.tsx` | RAG policy form (enabled, KB ID, topK, similarity, filters) |
| `src/features/admin/policies/ToolPolicyTab.tsx` | Tool policy table — add/edit/delete tools with inline enable toggle |
| `src/features/admin/policies/SafetyPolicyTab.tsx` | Safety policy form (4 toggles + disallowed topics tag input) |
| `src/features/admin/policies/ResponsePolicyTab.tsx` | Response policy form (3 toggles, tone, format, max tokens) |
| `src/features/admin/policies/hooks/usePolicies.ts` | Policy queries and mutations for all 5 policy types |
| `src/features/admin/config/ConfigInspectorPage.tsx` | Config Inspector — assistant+tenant selectors, 6-block KvGrid resolved config view |
| `src/features/admin/cache/CachePage.tsx` | Cache Management — assistant cache entry list, per-entry and bulk eviction |
| `src/features/admin/sessions/AdminSessionsPage.tsx` | Admin Sessions — filter bar, table with close/delete actions, URL-synced filters |
| `src/features/admin/sessions/hooks/useAdminSessions.ts` | Admin session queries and mutations with optimistic close/delete |
| `src/features/admin/messages/MessagesPage.tsx` | Message History — session ID loader, role-coloured message table |
| `src/features/admin/executions/ExecutionsPage.tsx` | Execution Monitor — filter bar, table with inline row expand, pagination |
| `src/features/admin/executions/hooks/useExecutions.ts` | Executions query hook |
| `src/features/admin/audit/AuditPage.tsx` | Audit Logs — Tool Audit / RAG Audit tabs with filters and paginated tables |
| `src/features/admin/audit/ToolAuditTab.tsx` | Tool audit tab — filter by toolName/type/success/session/request/date |
| `src/features/admin/audit/RagAuditTab.tsx` | RAG audit tab — filter by KB/groundedMode/session/request/date |
| `src/features/admin/audit/hooks/useAudit.ts` | useToolAudit and useRagAudit query hooks |
| `src/features/admin/tenant-overrides/TenantOverridesPage.tsx` | Tenant Overrides — filter bar (tenantId + assistant), table with create/edit/delete |
| `src/features/admin/tenant-overrides/TenantOverrideForm.tsx` | Create/edit override modal — tenantId, assistantCode, overrideType, JSON payload, active toggle |
| `src/features/admin/tenant-overrides/hooks/useTenantOverrides.ts` | Tenant override queries and mutations |
| `src/types/api.ts` | All OpenAPI types as TypeScript interfaces |
| `src/store/themeStore.ts` | Dark/light theme Zustand store |
| `src/store/chatStore.ts` | Active session + streaming flag |
| `src/components/layout/AdminSidebar.tsx` | Admin nav sidebar (6 sections, 19 items, search-param-aware active state) |
| `src/features/admin/AdminView.tsx` | Admin shell — sidebar + lazy-routed page outlet |
| `src/features/chat/ChatView.tsx` | Three-column chat layout (sidebar + area + context) |
| `src/features/chat/hooks/useChat.ts` | Blocking chat mutation with optimistic user messages |
| `src/features/chat/hooks/useSSEStream.ts` | SSE streaming hook — accumulates chunks, exposes cancel |
| `src/index.css` | CSS custom property theme tokens |
| `src/components/ui/` | Headless UI primitives (Button, Badge, Card, DataTable, Modal, ConfirmModal, Input, Select, Textarea, Toggle, Spinner, EmptyState, JsonViewer, ErrorBoundary, Drawer) |
| `src/components/shared/` | Shared display components (StatCard, KvGrid, PriorityBadge, PageSkeleton, TableSkeleton) |
| `src/hooks/useMediaQuery.ts` | Reactive media query hook — drives tablet vs. desktop responsive layout |

## Implementation Status

| Phase | Description | Status |
|---|---|---|
| 1 | Project Scaffold (Vite, Tailwind, tooling) | ✅ Done |
| 2 | Foundation Layer (types, client, stores, router, TopNav) | ✅ Done |
| 3 | UI Primitives | ✅ Done |
| 4 | Chat View — Blocking | ✅ Done |
| 5 | Chat View — Streaming | ✅ Done |
| 6 | Admin Layout + sidebar routing | ✅ Done |
| 7 | Dashboard (stats + assistant table) | ✅ Done |
| 8 | Assistants CRUD (create, edit, activate, deactivate) | ✅ Done |
| 9 | Prompt Templates (versioned list, create/edit, activate, delete) | ✅ Done |
| 10 | Model Routes (priority-ordered CRUD per assistant) | ✅ Done |
| 11 | Knowledge Bases (register/edit/activate/deactivate) | ✅ Done |
| 12 | Policies (all 5 policy tabs per assistant) | ✅ Done |
| 13 | Config Inspector (resolved config viewer) | ✅ Done |
| 14 | Cache Management (live entries + evict) | ✅ Done |
| 15 | Admin Sessions & Messages (session search, close, delete, message viewer) | ✅ Done |
| 16 | Execution Monitor (filter bar, table with row expand, pagination) | ✅ Done |
| 17 | Audit Logs (Tool Audit + RAG Audit tabs with filter + pagination) | ✅ Done |
| 18 | Tenant Overrides (per-tenant override CRUD) | ✅ Done |
| 19 | Polish & Hardening | ✅ Done |

## Design Docs

- `docs/lld.md` — Authoritative low-level design
- `docs/implementation-plan.md` — Phase-by-phase build plan

## Testing

Not yet implemented. When adding tests, use Vitest + React Testing Library.
Do not mock API calls in unit tests unless isolation is strictly required — prefer msw for API mocking.

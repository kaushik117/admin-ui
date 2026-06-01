# k2pbot Admin UI

React admin dashboard for the **k2pbot Generic Chatbot Platform**.

## Prerequisites

- Node.js 20+
- k2pbot backend running on `http://localhost:8080`

## Quick Start

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

## Build

```bash
npm run build        # Production bundle → dist/
npm run preview      # Preview production build locally
npm run typecheck    # Type-check without emitting (tsc --noEmit)
```

## Environment

Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` if the backend is not on port 8080.

```bash
cp .env.example .env.local
# Edit .env.local:
VITE_API_BASE_URL=http://localhost:8080
```

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
| Icons | Lucide React |
| Charts | Recharts 2 |
| Toast | Sonner |

## Views

- **Chat** (`/chat`) — three-column layout: session sidebar (assistant select + session list) · chat area (messages + input) · context panel (Summary / Key Facts / Sources / Stats tabs). Supports both blocking and SSE streaming modes (toggle in input footer).
- **Admin** (`/admin`) — sidebar nav with 6 sections and 19 items. Implemented pages:
  - **Dashboard** (`/admin/dashboard`) — 8 platform stat cards (auto-refresh every 30 s) + assistant summary table
  - **Assistants** (`/admin/assistants`) — full CRUD with status filter, activate/deactivate (optimistic), create/edit modal
  - **Prompt Templates** (`/admin/prompt-templates`) — versioned templates per assistant; create/edit with key-value variable editor and guardrail list; activate (optimistic); delete guard on active template
  - **Model Routes** (`/admin/model-routes`) — priority-ordered routing rules per assistant; full CRUD with conditional condition fields per route type (RAG only, tools required, prompt length range, structured output); conditions summary column
  - **Knowledge Bases** (`/admin/knowledge-bases`) — register/edit vector knowledge bases (KB ID, vector store type, embedding model, connection ref, metadata filter policy KV editor); activate/deactivate with optimistic toggle
  - **Policies** (`/admin/policies`) — all 5 policy types per assistant: Memory (enabled, store type, window size, TTL, persist/summarize toggles), RAG (enabled, KB ID, topK, similarity threshold, metadata filters), Tool (allow-list table with add/edit/delete; inline enable toggle with optimistic update), Safety (4 guardrail toggles + disallowed topics tag input), Response (markdown/streaming/citation toggles, tone, format, max output tokens)
  - **Config Inspector** (`/admin/config`) — assistant + optional tenant selector; on-demand fetch of the fully-resolved config; 6-block KvGrid layout (Prompt, Routing, RAG, Memory, Tools, Safety & Response) with colour-coded boolean/numeric/ID values; inline error card on 404
  - **Cache Management** (`/admin/cache`) — 4 stat cards (entries cached, active assistants, TTL, hit rate); live cache entry list built from assistants; per-entry "Evict" with confirm modal; "Evict All Cache" bulk action with danger confirm modal
  - **Sessions** (`/admin/sessions`) — searchable session list across all users and tenants; filters: tenant, user, assistant, status, date range (URL-synced for bookmarkability); "Messages" action navigates to message viewer; optimistic close with confirm; danger delete with confirm
  - **Message History** (`/admin/messages`) — session ID loader (pre-populated from URL `?sessionId=`); configurable message limit; role-coloured message table (USER/ASSISTANT/SYSTEM); content preview with full text on hover; model, citations flag, finish reason, timestamp columns
  - **Execution Monitor** (`/admin/executions`) — searchable execution audit log; filters: assistant, tenant, result (success/failed), provider, model, date range (URL-synced); table with Request ID, Session ID, Assistant, Provider, Model, KB, success icon, latency, token counts, started-at; click any row to expand an inline detail panel showing all `ExecutionRecordDto` fields including error codes and enabled tools; prev/next pagination
  - **Audit Logs** (`/admin/audit`) — two tabs (Tool Audit / RAG Audit); Tool Audit: filter by tool name, tool type (LOCAL_BEAN/REST/MCP), success/failed, session ID, request ID, date range; colour-coded success icon, error code with full message on hover; RAG Audit: filter by knowledge base (select from list), grounded mode, session ID, request ID, date range; shows retrieved doc count, topK, similarity threshold, latency, grounded badge; both tabs paginate and preserve filters in URL params
  - **Tenant Overrides** (`/admin/tenant-overrides`) — manage per-tenant config overrides (memory, RAG, response, or safety) that take precedence over assistant defaults; filter by tenant ID or assistant; create/edit with JSON payload validation; delete with danger confirm; active/inactive toggle in edit form

## Responsive Layout

- **Desktop (≥ 1280 px)** — full three-column chat layout; persistent admin sidebar always visible
- **Tablet (768 – 1279 px)** — session sidebar and context panel slide in as overlay drawers (triggered by ☰ / 📊 buttons in the chat topbar); admin sidebar opens via hamburger in TopNav; stat grids collapse to 2 columns; form rows stack to single column; modals expand to 90 vw

## Error Handling

- `ErrorBoundary` wraps the root app, `/chat`, and `/admin/*` — renders a friendly error card with "Reload page" on unexpected render errors
- 4xx/5xx API errors surface as toast notifications via Sonner
- Field-level server errors (400 `fieldErrors`) are applied directly to the relevant form inputs

## API

All endpoints are documented in `openapi.yaml` at the project root. The UI calls `http://localhost:8080/api/v1/*`.

The dev server proxies `/api/*` requests to `http://localhost:8080`, so API calls work without CORS issues during development.

## Project Structure

```
src/
├── api/              # One file per resource group (chat, sessions, admin/*)
├── components/
│   ├── ui/           # Stateless UI primitives (Button, Modal, DataTable, etc.)
│   ├── layout/       # TopNav, AdminSidebar
│   └── shared/       # StatCard, KvGrid, PriorityBadge, PageSkeleton
├── features/
│   ├── chat/         # Chat view + session sidebar + context panel
│   └── admin/        # All 14 admin pages (dashboard, assistants, policies, cache, …)
├── hooks/            # Shared React hooks
├── store/            # Zustand stores (theme, chat)
├── types/            # TypeScript types from openapi.yaml
└── utils/            # cn(), formatters, constants
```

## Implementation Status

| # | Phase | Status |
|---|---|---|
| 1 | Project Scaffold | ✅ Done |
| 2 | Foundation Layer | ✅ Done |
| 3 | UI Primitives | ✅ Done |
| 4 | Chat View — Blocking | ✅ Done |
| 5 | Chat View — Streaming | ✅ Done |
| 6 | Admin Layout | ✅ Done |
| 7 | Dashboard | ✅ Done |
| 8 | Assistants CRUD | ✅ Done |
| 9 | Prompt Templates | ✅ Done |
| 10 | Model Routes | ✅ Done |
| 11 | Knowledge Bases | ✅ Done |
| 12 | Policies | ✅ Done |
| 13 | Config Inspector | ✅ Done |
| 14 | Cache Management | ✅ Done |
| 15 | Admin Sessions & Messages | ✅ Done |
| 16 | Execution Monitor | ✅ Done |
| 17 | Audit Logs | ✅ Done |
| 18 | Tenant Overrides | ✅ Done |
| 19 | Polish & Hardening | ✅ Done |

See `docs/implementation-plan.md` for the full phase breakdown and acceptance criteria.

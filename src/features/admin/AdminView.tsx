import { Suspense, lazy, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { TopNav } from '@/components/layout/TopNav'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { Drawer } from '@/components/ui/Drawer'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const DashboardPage       = lazy(() => import('./dashboard/DashboardPage'))
const AssistantsPage      = lazy(() => import('./assistants/AssistantsPage'))
const PromptTemplatesPage = lazy(() => import('./prompt-templates/PromptTemplatesPage'))
const ModelRoutesPage     = lazy(() => import('./model-routes/ModelRoutesPage'))
const KnowledgeBasesPage  = lazy(() => import('./knowledge-bases/KnowledgeBasesPage'))
const TenantOverridesPage  = lazy(() => import('./tenant-overrides/TenantOverridesPage'))
const MemoryPolicyPage     = lazy(() => import('./policies/MemoryPolicyPage'))
const RagPolicyPage        = lazy(() => import('./policies/RagPolicyPage'))
const ToolPolicyPage       = lazy(() => import('./policies/ToolPolicyPage'))
const SafetyPolicyPage     = lazy(() => import('./policies/SafetyPolicyPage'))
const ResponsePolicyPage   = lazy(() => import('./policies/ResponsePolicyPage'))
const ConfigInspectorPage  = lazy(() => import('./config/ConfigInspectorPage'))
const CachePage           = lazy(() => import('./cache/CachePage'))
const AdminSessionsPage   = lazy(() => import('./sessions/AdminSessionsPage'))
const MessagesPage        = lazy(() => import('./messages/MessagesPage'))
const ExecutionsPage      = lazy(() => import('./executions/ExecutionsPage'))
const AuditPage           = lazy(() => import('./audit/AuditPage'))

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

export default function AdminView() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1280px)')

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
      <TopNav onMenuClick={isDesktop ? undefined : () => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: static sidebar */}
        {isDesktop && <AdminSidebar />}

        {/* Tablet: sidebar in left drawer */}
        {!isDesktop && (
          <Drawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} side="left" width={210}>
            <AdminSidebar onNavClick={() => setSidebarOpen(false)} />
          </Drawer>
        )}

        <main className="flex-1 overflow-y-auto p-4 xl:p-7">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"        element={<SuspensePage><DashboardPage /></SuspensePage>} />
            <Route path="assistants"       element={<SuspensePage><AssistantsPage /></SuspensePage>} />
            <Route path="prompt-templates" element={<SuspensePage><PromptTemplatesPage /></SuspensePage>} />
            <Route path="model-routes"     element={<SuspensePage><ModelRoutesPage /></SuspensePage>} />
            <Route path="knowledge-bases"  element={<SuspensePage><KnowledgeBasesPage /></SuspensePage>} />
            <Route path="tenant-overrides"    element={<SuspensePage><TenantOverridesPage /></SuspensePage>} />
            <Route path="policies/memory"   element={<SuspensePage><MemoryPolicyPage /></SuspensePage>} />
            <Route path="policies/rag"      element={<SuspensePage><RagPolicyPage /></SuspensePage>} />
            <Route path="policies/tool"     element={<SuspensePage><ToolPolicyPage /></SuspensePage>} />
            <Route path="policies/safety"   element={<SuspensePage><SafetyPolicyPage /></SuspensePage>} />
            <Route path="policies/response" element={<SuspensePage><ResponsePolicyPage /></SuspensePage>} />
            <Route path="config"            element={<SuspensePage><ConfigInspectorPage /></SuspensePage>} />
            <Route path="cache"            element={<SuspensePage><CachePage /></SuspensePage>} />
            <Route path="sessions"         element={<SuspensePage><AdminSessionsPage /></SuspensePage>} />
            <Route path="messages"         element={<SuspensePage><MessagesPage /></SuspensePage>} />
            <Route path="executions"       element={<SuspensePage><ExecutionsPage /></SuspensePage>} />
            <Route path="audit"            element={<SuspensePage><AuditPage /></SuspensePage>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

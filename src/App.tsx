import { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { initTheme } from '@/store/themeStore'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

initTheme()

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

const ChatView = lazy(() => import('@/features/chat/ChatView'))
const AdminView = lazy(() => import('@/features/admin/AdminView'))

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/chat" replace /> },
  {
    path: '/chat',
    element: (
      <ErrorBoundary>
        <Suspense fallback={null}><ChatView /></Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: '/admin/*',
    element: (
      <ErrorBoundary>
        <Suspense fallback={null}><AdminView /></Suspense>
      </ErrorBoundary>
    ),
  },
])

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

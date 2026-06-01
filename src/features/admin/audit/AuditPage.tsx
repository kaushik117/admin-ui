import { useSearchParams } from 'react-router'
import { ToolAuditTab } from './ToolAuditTab'
import { RagAuditTab } from './RagAuditTab'

export default function AuditPage() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'tool'

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          {tab === 'rag' ? 'RAG Audit' : 'Tool Audit'}
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          {tab === 'rag'
            ? 'Document retrieval traces per request.'
            : 'Per-tool invocation traces across all assistants.'}
        </p>
      </div>

      {tab === 'rag' ? <RagAuditTab /> : <ToolAuditTab />}
    </>
  )
}

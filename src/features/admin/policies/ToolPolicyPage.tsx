import { useSearchParams } from 'react-router'
import { useAssistants } from '@/features/admin/assistants/hooks/useAssistants'
import { ToolPolicyTab } from './ToolPolicyTab'

export default function ToolPolicyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: assistants } = useAssistants({ active: undefined })
  const selectedAssistant = searchParams.get('assistant') ?? ''

  function handleAssistantChange(code: string) {
    setSearchParams(code ? { assistant: code } : {})
  }

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>Tool Policy</h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
          Define which tools are available to each assistant, their types, timeouts, and approval requirements.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        <select
          value={selectedAssistant}
          onChange={(e) => handleAssistantChange(e.target.value)}
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: selectedAssistant ? 'var(--text)' : 'var(--muted)',
            fontSize: '12px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="">— Select an assistant —</option>
          {assistants?.map((a) => (
            <option key={a.assistantCode} value={a.assistantCode}>
              {a.name} ({a.assistantCode})
            </option>
          ))}
        </select>
      </div>

      {!selectedAssistant ? (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '60px',
            color: 'var(--muted)',
            fontSize: '13px',
            textAlign: 'center',
          }}
        >
          Select an assistant above to view and edit its tool policy.
        </div>
      ) : (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              🔧 Tools — {selectedAssistant}
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <ToolPolicyTab assistantCode={selectedAssistant} />
          </div>
        </div>
      )}
    </>
  )
}

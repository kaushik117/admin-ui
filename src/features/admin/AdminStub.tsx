interface Props {
  title: string
  subtitle: string
  phase: number
}

export function AdminStub({ title, subtitle, phase }: Props) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>{subtitle}</p>
      </div>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '18px',
          boxShadow: 'var(--shadow)',
        }}
      >
        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Full implementation coming in Phase {phase}.</p>
      </div>
    </div>
  )
}

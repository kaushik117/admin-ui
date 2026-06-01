import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback error={this.state.error} />
    }
    return this.props.children
  }
}

function DefaultFallback({ error }: { error?: Error }) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '240px',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text)',
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
        Something went wrong
      </h2>
      {error?.message && (
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px', maxWidth: '400px' }}>
          {error.message}
        </p>
      )}
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '8px 20px',
          borderRadius: '6px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        Reload page
      </button>
    </div>
  )
}

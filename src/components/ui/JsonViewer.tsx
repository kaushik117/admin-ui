import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useThemeStore } from '@/store/themeStore'

interface JsonViewerProps {
  value: unknown
  language?: string
  maxHeight?: string
}

export function JsonViewer({ value, language = 'json', maxHeight = '300px' }: JsonViewerProps) {
  const { theme } = useThemeStore()

  let display: string
  if (typeof value === 'string') {
    try {
      display = JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      display = value
    }
  } else {
    display = JSON.stringify(value, null, 2) ?? ''
  }

  return (
    <div
      style={{
        maxHeight,
        overflowY: 'auto',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        fontSize: '12px',
      }}
    >
      <SyntaxHighlighter
        language={language}
        style={theme === 'dark' ? atomOneDark : atomOneLight}
        customStyle={{ margin: 0, padding: '12px', background: 'transparent' }}
        wrapLongLines
      >
        {display}
      </SyntaxHighlighter>
    </div>
  )
}

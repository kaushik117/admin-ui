export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 px-5 py-1">
      {/* Bot avatar */}
      <div
        className="shrink-0 flex items-center justify-center mt-0.5"
        style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--surface3)', color: 'var(--accent)', fontSize: '14px' }}
      >
        🤖
      </div>

      {/* Bubble */}
      <div className="flex flex-col gap-1">
        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Assistant</div>
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '14px',
            borderBottomLeftRadius: '4px',
            background: 'var(--bot-bubble)',
            border: '1px solid var(--bot-border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div className="flex gap-1 items-center">
            <span className="typing-dot" />
            <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
            <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>

      <style>{`
        .typing-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--muted);
          animation: typing-bounce .9s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: .15s; }
        .typing-dot:nth-child(3) { animation-delay: .3s; }
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: scale(1); }
          40% { transform: scale(1.5); }
        }
      `}</style>
    </div>
  )
}

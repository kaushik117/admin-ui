import { useLocation, NavLink } from 'react-router'

interface NavItem {
  label: string
  to: string
  icon: string
  matchPath?: string
  matchTab?: string
}

interface NavSection {
  label: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/admin/dashboard', icon: '📊' }],
  },
  {
    label: 'Assistants',
    items: [
      { label: 'Assistants',       to: '/admin/assistants',       icon: '🤖' },
      { label: 'Prompt Templates', to: '/admin/prompt-templates', icon: '📝' },
      { label: 'Model Routes',     to: '/admin/model-routes',     icon: '🔀' },
      { label: 'Knowledge Bases',  to: '/admin/knowledge-bases',  icon: '📚' },
      { label: 'Tenant Overrides', to: '/admin/tenant-overrides', icon: '🏢' },
    ],
  },
  {
    label: 'Policies',
    items: [
      { label: 'Memory Policy',   to: '/admin/policies/memory',   icon: '🧠' },
      { label: 'RAG Policy',      to: '/admin/policies/rag',      icon: '🗃️' },
      { label: 'Tool Policy',     to: '/admin/policies/tool',     icon: '🔧' },
      { label: 'Safety Policy',   to: '/admin/policies/safety',   icon: '🛡️' },
      { label: 'Response Policy', to: '/admin/policies/response', icon: '💬' },
    ],
  },
  {
    label: 'Config',
    items: [
      { label: 'Config Inspector',  to: '/admin/config', icon: '🔍' },
      { label: 'Cache Management',  to: '/admin/cache',  icon: '🗄️' },
    ],
  },
  {
    label: 'Conversations',
    items: [
      { label: 'Sessions', to: '/admin/sessions', icon: '💬' },
      { label: 'Messages', to: '/admin/messages', icon: '📨' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { label: 'Execution Monitor', to: '/admin/executions',        icon: '⚡' },
      { label: 'Tool Audit',        to: '/admin/audit?tab=tool',    icon: '🔧', matchPath: '/admin/audit', matchTab: 'tool' },
      { label: 'RAG Audit',         to: '/admin/audit?tab=rag',     icon: '🗃️', matchPath: '/admin/audit', matchTab: 'rag'  },
    ],
  },
]

interface AdminSidebarProps {
  onNavClick?: () => void
}

export function AdminSidebar({ onNavClick }: AdminSidebarProps = {}) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab')

  function isActive(item: NavItem): boolean {
    if (item.matchPath) {
      return (
        location.pathname === item.matchPath &&
        (item.matchTab ? currentTab === item.matchTab : !currentTab)
      )
    }
    return location.pathname === item.to
  }

  return (
    <aside
      className="w-[210px] flex-shrink-0 overflow-y-auto border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', paddingTop: '14px' }}
    >
      <nav>
        {sections.map((section, si) => (
          <div key={section.label} style={{ marginTop: si > 0 ? '8px' : 0 }}>
            {/* Section label */}
            <div
              style={{
                padding: '6px 14px',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '.5px',
              }}
            >
              {section.label}
            </div>

            {/* Nav items */}
            {section.items.map((item) => {
              const active = isActive(item)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    color: active ? 'var(--accent)' : 'var(--muted)',
                    background: active ? 'rgba(91,110,245,.07)' : undefined,
                    borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                    transition: 'all var(--transition)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--surface2)'
                      e.currentTarget.style.color = 'var(--text)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.color = 'var(--muted)'
                    }
                  }}
                >
                  <span style={{ fontSize: '13px', lineHeight: 1 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}

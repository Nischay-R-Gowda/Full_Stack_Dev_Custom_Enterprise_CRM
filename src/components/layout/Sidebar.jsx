import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, Kanban, GitBranch,
  Phone, MessageSquare, BarChart3, Settings, ChevronLeft,
  ChevronRight, ChevronDown
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/leads', icon: UserPlus, label: 'Leads' },
  { path: '/deals', icon: Kanban, label: 'Deals & Pipeline' },
  { path: '/pipelines', icon: GitBranch, label: 'Pipelines' },
  { path: '/sources', icon: Phone, label: 'Lead Sources' },
  { path: '/activities', icon: MessageSquare, label: 'Activities' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-surface-200 flex flex-col transition-all duration-200 h-screen sticky top-0 z-40`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-surface-100">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        {!collapsed && <span className="font-bold text-surface-800 text-lg tracking-tight">Nexus CRM</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <NavLink key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-surface-100 p-2">
        <button onClick={() => setShowSettings(!showSettings)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
          {!collapsed && <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showSettings ? 'rotate-180' : ''}`} />}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-14 w-6 h-6 bg-white border border-surface-200 rounded-full flex items-center justify-center shadow-sm hover:bg-surface-50 z-50">
        {collapsed ? <ChevronRight className="w-3 h-3 text-surface-500" /> : <ChevronLeft className="w-3 h-3 text-surface-500" />}
      </button>
    </aside>
  )
}

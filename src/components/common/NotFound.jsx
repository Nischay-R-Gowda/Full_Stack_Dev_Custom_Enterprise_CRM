import { Home, Users, UserPlus, Kanban, GitBranch, Phone, MessageSquare, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

// Quick links back into the app so a mistyped URL is not a dead end.
const items = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/leads', icon: UserPlus, label: 'Leads' },
  { path: '/deals', icon: Kanban, label: 'Deals & Pipeline' },
  { path: '/pipelines', icon: GitBranch, label: 'Pipelines' },
  { path: '/sources', icon: Phone, label: 'Lead Sources' },
  { path: '/activities', icon: MessageSquare, label: 'Activities' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
]

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-3xl font-bold text-primary-600">404</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Page Not Found</h1>
          <p className="text-surface-500 mt-1">The page you're looking for doesn't exist.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {items.map(item => (
            <Link key={item.path} to={item.path} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 rounded-lg text-sm text-surface-700 hover:bg-surface-50 transition-colors">
              <item.icon className="w-4 h-4" />{item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

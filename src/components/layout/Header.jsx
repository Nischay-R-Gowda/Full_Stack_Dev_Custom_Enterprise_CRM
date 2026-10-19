import { Search, Bell, ChevronDown } from 'lucide-react'

export default function Header({ breadcrumbs = [] }) {
  return (
    <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-surface-400">/</span>}
            <span className={i === breadcrumbs.length - 1 ? 'text-surface-800 font-medium' : 'text-surface-400'}>{crumb}</span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-surface-400" />
        </div>
        <button className="relative p-2 hover:bg-surface-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-surface-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-surface-200">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">AD</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-surface-800">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-surface-400 hidden md:block" />
        </div>
      </div>
    </header>
  )
}

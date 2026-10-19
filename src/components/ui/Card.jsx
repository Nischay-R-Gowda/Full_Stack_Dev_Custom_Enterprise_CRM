import { Badge } from './Badge'

export function Card({ title, value, change, changeType = 'neutral', icon: Icon, color = 'indigo', className = '' }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
    teal: 'bg-teal-50 text-teal-600',
  }
  return (
    <div className={`bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-surface-900">{value}</p>
          {change && <Badge color={changeType === 'positive' ? 'green' : changeType === 'negative' ? 'red' : 'gray'} size="sm">{change}</Badge>}
        </div>
        {Icon && <div className={`p-2.5 rounded-lg ${colorMap[color]}`}><Icon className="w-5 h-5" /></div>}
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return <div className="bg-white rounded-xl border border-surface-200 p-5 animate-pulse"><div className="h-4 bg-surface-200 rounded w-1/3 mb-3" /><div className="h-8 bg-surface-200 rounded w-1/2" /></div>
}

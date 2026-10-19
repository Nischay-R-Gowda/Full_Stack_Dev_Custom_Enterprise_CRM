const colorMap = {
  gray: 'bg-surface-100 text-surface-700',
  red: 'bg-red-100 text-red-700',
  green: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-amber-100 text-amber-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
  emerald: 'bg-emerald-100 text-emerald-700',
}

export function Badge({ children, color = 'gray', size = 'md', dot }) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${colorMap[color] || colorMap.gray} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'} rounded-full`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />}
      {children}
    </span>
  )
}

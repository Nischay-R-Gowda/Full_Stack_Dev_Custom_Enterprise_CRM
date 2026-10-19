// ── Constants and helpers ──────────────────────────────────────

export const LEAD_SOURCES = {
  google_ads: { label: 'Google Ads', icon: 'Globe', color: 'bg-blue-100 text-blue-700' },
  meta_ads: { label: 'Meta Ads', icon: 'Facebook', color: 'bg-purple-100 text-purple-700' },
  website: { label: 'Website Form', icon: 'LayoutTemplate', color: 'bg-green-100 text-green-700' },
  inbound_call: { label: 'Inbound Call', icon: 'Phone', color: 'bg-orange-100 text-orange-700' },
  referral: { label: 'Referral', icon: 'Users', color: 'bg-teal-100 text-teal-700' },
  manual: { label: 'Manual Entry', icon: 'Plus', color: 'bg-gray-100 text-gray-700' },
}

export const LEAD_STATUSES = {
  new: { label: 'New', color: 'bg-gray-100 text-gray-700' },
  attempting: { label: 'Attempting Contact', color: 'bg-yellow-100 text-yellow-700' },
  connected: { label: 'Connected', color: 'bg-sky-100 text-sky-700' },
  qualified: { label: 'Qualified', color: 'bg-indigo-100 text-indigo-700' },
  disqualified: { label: 'Disqualified', color: 'bg-red-100 text-red-700' },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-700' },
}

export const LEAD_TYPES = {
  mql: { label: 'MQL', description: 'Marketing Qualified Lead' },
  sql: { label: 'SQL', description: 'Sales Qualified Lead' },
  deal: { label: 'Deal', description: 'Sales Opportunity' },
}

export const ACTIVITY_TYPES = {
  call: { label: 'Call', icon: 'Phone', color: 'text-green-600 bg-green-50' },
  email: { label: 'Email', icon: 'Mail', color: 'text-blue-600 bg-blue-50' },
  meeting: { label: 'Meeting', icon: 'Calendar', color: 'text-purple-600 bg-purple-50' },
  note: { label: 'Note', icon: 'FileText', color: 'text-yellow-600 bg-yellow-50' },
  task: { label: 'Task', icon: 'CheckSquare', color: 'text-orange-600 bg-orange-50' },
}

export const LIFECYCLE_STAGES = {
  lead: { label: 'Lead', badge: 'gray' },
  mql: { label: 'MQL', badge: 'purple' },
  sql: { label: 'SQL', badge: 'indigo' },
  customer: { label: 'Customer', badge: 'green' },
}

export const PIPRIORITIES = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
}

export function formatCurrency(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function formatRelativeTime(date) {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

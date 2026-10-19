import { useState } from 'react'
import { Plus, Phone, Mail, Calendar, CheckSquare, FileText, Check, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'
import { formatDate, ACTIVITY_TYPES, PIPRIORITIES } from '../../utils/constants'
import useResource from '../../hooks/useResource'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Input'
import { Badge } from '../ui/Badge'
import Modal from '../ui/Modal'

const TYPE_ICONS = { call: Phone, email: Mail, meeting: Calendar, task: CheckSquare, note: FileText }

export default function Activities() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ type: 'call', subject: '', description: '', dueDate: '', priority: 'medium', contactId: '', leadId: '', dealId: '' })
  const [filter, setFilter] = useState('')

  const { data: activities, loading, reload: load } = useResource(
    () => api.getActivities(filter ? { type: filter } : {}),
    [filter]
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.createActivity({
        ...form,
        subject: form.subject.trim(),
        dueDate: form.dueDate || null,
        contactId: form.contactId ? Number(form.contactId) : null,
        leadId: form.leadId ? Number(form.leadId) : null,
        dealId: form.dealId ? Number(form.dealId) : null,
      })
      toast.success('Activity created')
      setModalOpen(false); load()
    } catch (err) { alert(err.message) }
  }

  const handleToggle = async (activity) => {
    try { await api.updateActivity(activity.id, { completed: !activity.completed }); load() } catch (e) { console.error(e) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return
    try { await api.deleteActivity(id); toast.success('Activity deleted'); load() } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-surface-800">Activities & Follow-ups</h1>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 bg-white border border-surface-300 rounded-lg text-sm">
            <option value="">All Types</option>
            {Object.entries(ACTIVITY_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <Button onClick={() => { setForm({ type: 'call', subject: '', description: '', dueDate: '', priority: 'medium', contactId: '', leadId: '', dealId: '' }); setModalOpen(true) }}><Plus className="w-4 h-4" />Add Activity</Button>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-surface-200 bg-surface-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider w-8"></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Activity</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Priority</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? Array(4).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="animate-pulse h-4 bg-surface-100 rounded w-full" /></td></tr>) :
                activities.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-surface-400">No activities yet</td></tr> :
                activities.map(activity => {
                  const Icon = TYPE_ICONS[activity.type] || FileText
                  return (
                    <tr key={activity.id} className={`hover:bg-surface-50/50 transition-colors ${activity.completed ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(activity)} className={`p-1 rounded-lg transition-colors ${activity.completed ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-surface-100 text-surface-400'}`}>
                          <Check className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className={`text-sm font-medium ${activity.completed ? 'line-through text-surface-400' : 'text-surface-800'}`}>{activity.subject}</p>
                          {activity.description && <p className="text-xs text-surface-500 mt-0.5">{activity.description}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ACTIVITY_TYPES[activity.type]?.color || 'bg-gray-100 text-gray-600'}`}><Icon className="w-3 h-3" />{activity.type}</span></td>
                      <td className="px-4 py-3 text-sm text-surface-500">{activity.dueDate ? formatDate(activity.dueDate) : '—'}</td>
                      <td className="px-4 py-3"><Badge color={activity.priority === 'high' ? 'red' : activity.priority === 'medium' ? 'yellow' : 'gray'}>{activity.priority}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDelete(activity.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Activity">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={Object.entries(ACTIVITY_TYPES).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Input label="Subject" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            <Select label="Priority" value={form.priority} onChange={v => setForm({ ...form, priority: v })} options={Object.entries(PIPRIORITIES).map(([k, v]) => ({ value: k, label: v.label }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Activity</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

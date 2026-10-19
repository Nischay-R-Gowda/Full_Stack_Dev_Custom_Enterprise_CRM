import { useState } from 'react'
import { Plus, Search, X, ChevronRight, UserCheck, UserPlus, ArrowRight } from 'lucide-react'
import { api } from '../../services/api'
import { formatDate, formatCurrency, LEAD_STATUSES, LEAD_SOURCES, LEAD_TYPES } from '../../utils/constants'
import useResource from '../../hooks/useResource'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Input'
import { Badge } from '../ui/Badge'
import Modal from '../ui/Modal'

const emptyLeadForm = { company: '', companySize: '', industry: '', website: '', notes: '', expectedValue: '', source: 'manual' }
const emptyQualifyForm = { type: 'sql', qualificationNotes: '', contactEmail: '', contactFirstName: '', contactLastName: '', contactPhone: '', contactCompany: '' }

export default function Leads() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailLead, setDetailLead] = useState(null)
  const [qualifyModal, setQualifyModal] = useState(null)
  const [form, setForm] = useState(emptyLeadForm)
  const [qualifyForm, setQualifyForm] = useState(emptyQualifyForm)
  const [error, setError] = useState('')

  const { data: leads, loading, reload: loadLeads } = useResource(
    () => api.getLeads({ search, status: statusFilter, source: sourceFilter, type: typeFilter }),
    [search, statusFilter, sourceFilter, typeFilter]
  )

  const openCreate = () => { setForm(emptyLeadForm); setError(''); setModalOpen(true) }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.createLead({
        ...form,
        company: form.company.trim(),
        expectedValue: form.expectedValue ? parseFloat(form.expectedValue) : null,
      })
      setModalOpen(false); loadLeads()
    } catch (err) { setError(err.message) }
  }

  const openQualify = (lead) => {
    // Prefill the contact block from the existing association so qualifying an
    // already-linked lead reuses that contact instead of creating a second one.
    setQualifyForm({
      ...emptyQualifyForm,
      contactEmail: lead.contact?.email || '',
      contactFirstName: lead.contact?.firstName || '',
      contactLastName: lead.contact?.lastName || '',
      contactPhone: lead.contact?.phone || '',
      contactCompany: lead.contact?.company || lead.company || '',
    })
    setError('')
    setQualifyModal(lead)
  }

  const handleQualify = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.qualifyLead(qualifyModal.id, qualifyForm)
      setQualifyModal(null); loadLeads()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return
    try { await api.deleteLead(id); loadLeads() } catch (err) { alert(err.message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full pl-9 pr-4 py-2 bg-white border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm"><option value="">All Statuses</option>{Object.entries(LEAD_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm"><option value="">All Sources</option>{Object.entries(LEAD_SOURCES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm"><option value="">All Types</option>{Object.entries(LEAD_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />New Lead</Button>
      </div>

      {/* Lead Type Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" /> MQL — Marketing Qualified</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> SQL — Sales Qualified</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Deal — Sales Opportunity</div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-surface-200 bg-surface-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Lead</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Company</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Created</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? Array(4).fill(0).map((_, i) => <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="animate-pulse h-4 bg-surface-100 rounded w-full" /></td></tr>) :
                leads.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-surface-400">No leads found. Create one to get started.</td></tr> :
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${lead.type === 'mql' ? 'bg-purple-100' : lead.type === 'sql' ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                          <span className={`text-xs font-bold ${lead.type === 'mql' ? 'text-purple-700' : lead.type === 'sql' ? 'text-indigo-700' : 'text-emerald-700'}`}>{lead.leadNumber?.slice(-4)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-800">{lead.leadNumber}</p>
                          <p className="text-xs text-surface-500">{lead.company || 'No company'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">{lead.company || '—'}</td>
                    <td className="px-4 py-3"><Badge color={lead.type === 'mql' ? 'purple' : lead.type === 'sql' ? 'indigo' : 'green'} dot>{lead.type.toUpperCase()}</Badge></td>
                    <td className="px-4 py-3"><Badge color={LEAD_STATUSES[lead.status]?.color || 'gray'}>{LEAD_STATUSES[lead.status]?.label || lead.status}</Badge></td>
                    <td className="px-4 py-3"><span className="text-xs text-surface-600">{LEAD_SOURCES[lead.source]?.label || lead.source}</span></td>
                    <td className="px-4 py-3">
                      {lead.contact ? (
                        <button onClick={() => setDetailLead(lead)} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                          {lead.contact.firstName} {lead.contact.lastName}<ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <button onClick={() => { setDetailLead(lead) }} className="text-xs text-surface-400 hover:text-primary-600 flex items-center gap-1"><UserPlus className="w-3 h-3" />Add</button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-500">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {lead.status !== 'converted' && lead.status !== 'disqualified' && (
                          <button onClick={() => openQualify(lead)} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors" title="Qualify this lead">
                            <UserCheck className="w-4 h-4" />Qualify
                          </button>
                        )}
                        <button onClick={() => handleDelete(lead.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete lead"><X className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Lead">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <Input label="Company" required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company Size" value={form.companySize} onChange={e => setForm({ ...form, companySize: e.target.value })} />
            <Input label="Industry" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
            <Input label="Expected Value (₹)" type="number" value={form.expectedValue} onChange={e => setForm({ ...form, expectedValue: e.target.value })} />
          </div>
          <Select label="Source" value={form.source} onChange={v => setForm({ ...form, source: v })} options={Object.entries(LEAD_SOURCES).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Input label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Lead</Button>
          </div>
        </form>
      </Modal>

      {/* Qualify Modal */}
      <Modal isOpen={!!qualifyModal} onClose={() => setQualifyModal(null)} title="Qualify Lead">
        <form onSubmit={handleQualify} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <p className="text-sm text-surface-600">Qualify <strong>{qualifyModal?.leadNumber}</strong> ({qualifyModal?.company})</p>
          <Select label="Type" value={qualifyForm.type} onChange={v => setQualifyForm({ ...qualifyForm, type: v })} options={Object.entries(LEAD_TYPES).map(([k, v]) => ({ value: k, label: `${v.label} — ${v.description}` }))} />
          <Input label="Qualification Notes" value={qualifyForm.qualificationNotes} onChange={e => setQualifyForm({ ...qualifyForm, qualificationNotes: e.target.value })} />
          {qualifyForm.type !== 'mql' && (
            <div className="p-3 bg-primary-50 rounded-lg space-y-3">
              <p className="text-xs font-medium text-primary-700">Contact Information (find or create)</p>
              <Input label="First Name" value={qualifyForm.contactFirstName} onChange={e => setQualifyForm({ ...qualifyForm, contactFirstName: e.target.value })} required={qualifyForm.type !== 'mql'} />
              <Input label="Last Name" value={qualifyForm.contactLastName} onChange={e => setQualifyForm({ ...qualifyForm, contactLastName: e.target.value })} required={qualifyForm.type !== 'mql'} />
              <Input label="Email" type="email" value={qualifyForm.contactEmail} onChange={e => setQualifyForm({ ...qualifyForm, contactEmail: e.target.value })} required={qualifyForm.type !== 'mql'} />
              <Input label="Phone" value={qualifyForm.contactPhone} onChange={e => setQualifyForm({ ...qualifyForm, contactPhone: e.target.value })} />
              <Input label="Company" value={qualifyForm.contactCompany} onChange={e => setQualifyForm({ ...qualifyForm, contactCompany: e.target.value })} />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setQualifyModal(null)}>Cancel</Button>
            <Button type="submit"><ArrowRight className="w-4 h-4" />Qualify</Button>
          </div>
        </form>
      </Modal>
      {/* Lead Detail Modal */}
      <Modal isOpen={!!detailLead} onClose={() => setDetailLead(null)} title="Lead Details" size="lg">
        {detailLead && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="blue">{LEAD_TYPES[detailLead.type]?.label || detailLead.type}</Badge>
              <Badge color={LEAD_STATUSES[detailLead.status]?.color || 'gray'}>{LEAD_STATUSES[detailLead.status]?.label || detailLead.status}</Badge>
              <span className="text-xs text-surface-400">{detailLead.leadNumber}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-surface-500">Company</p>
                <p className="text-sm font-semibold text-surface-800 mt-0.5">{detailLead.company || '—'}</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-surface-500">Lead Source</p>
                <p className="text-sm font-semibold text-surface-800 mt-0.5">{LEAD_SOURCES[detailLead.source]?.label || detailLead.source}</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-surface-500">Type</p>
                <p className="text-sm font-semibold text-surface-800 mt-0.5">{LEAD_TYPES[detailLead.type]?.label || detailLead.type}</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-surface-500">Expected Value</p>
                <p className="text-sm font-semibold text-surface-800 mt-0.5">{detailLead.expectedValue ? formatCurrency(detailLead.expectedValue) : '—'}</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-surface-500">Created</p>
                <p className="text-sm font-semibold text-surface-800 mt-0.5">{formatDate(detailLead.createdAt)}</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-surface-500">Contact</p>
                <p className="text-sm font-semibold text-surface-800 mt-0.5">
                  {detailLead.contact ? `${detailLead.contact.firstName} ${detailLead.contact.lastName}` : 'Not associated'}
                </p>
              </div>
            </div>

            {detailLead.contact && (
              <div className="p-3 bg-white border border-surface-200 rounded-lg space-y-1.5">
                <p className="text-xs font-medium text-surface-500">Contact Details</p>
                <p className="text-sm text-surface-700">{detailLead.contact.email}</p>
                {detailLead.contact.phone && <p className="text-sm text-surface-700">{detailLead.contact.phone}</p>}
                {detailLead.contact.company && <p className="text-sm text-surface-700">{detailLead.contact.company}</p>}
              </div>
            )}

            {detailLead.qualificationNotes && (
              <div className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-surface-500 mb-1">Qualification Notes</p>
                <p className="text-sm text-surface-700">{detailLead.qualificationNotes}</p>
              </div>
            )}

            {detailLead.notes && (
              <div className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-surface-500 mb-1">Notes</p>
                <p className="text-sm text-surface-700">{detailLead.notes}</p>
              </div>
            )}

            {detailLead.website && (
              <div className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-surface-500 mb-1">Website</p>
                <a href={detailLead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline break-all">{detailLead.website}</a>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setDetailLead(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

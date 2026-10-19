import { useState, useRef, useEffect } from 'react'

export default function SearchableSelect({ label, options = [], value, onChange, placeholder = 'Search...', displayField = 'label', valueField = 'value' }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const selected = options.find(o => o[valueField] === value)

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = options.filter(o => o[displayField].toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-sm font-medium text-surface-700 mb-1">{label}</label>}
      <button type="button" onClick={() => setOpen(!open)} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm text-left flex items-center justify-between hover:border-primary-400 transition-colors">
        <span className={selected ? 'text-surface-800' : 'text-surface-400'}>{selected ? selected[displayField] : placeholder}</span>
        <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 border-b border-surface-200 text-sm focus:outline-none" placeholder="Search..." />
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? <div className="px-3 py-2 text-sm text-surface-400">No results found</div> :
              filtered.map(o => (
                <button key={o[valueField]} type="button" onClick={() => { onChange(o[valueField]); setOpen(false); setSearch('') }} className={`w-full px-3 py-2 text-sm text-left hover:bg-primary-50 flex items-center justify-between ${value === o[valueField] ? 'bg-primary-50 text-primary-700' : 'text-surface-700'}`}>
                  <span>{o[displayField]}</span>
                  {value === o[valueField] && <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

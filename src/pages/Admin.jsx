import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getToken, isTokenValid, clearToken } from '../lib/auth'

const API = import.meta.env.VITE_API_BASE || ''

const STATUS_OPTIONS = ['Submitted', 'In Review', 'Plan Ready', 'Completed']

const STATUS_STYLES = {
  'Submitted':   'bg-gray-100 text-gray-600',
  'In Review':   'bg-blue-100 text-blue-700',
  'Plan Ready':  'bg-amber-100 text-amber-700',
  'Completed':   'bg-green-100 text-green-700',
}

function isAdminToken() {
  const t = getToken()
  if (!t) return false
  try {
    const payload = JSON.parse(atob(t.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) return false
    const groups = payload['cognito:groups'] || []
    return Array.isArray(groups)
      ? groups.includes('alignex-admin')
      : String(groups).split(',').map(s => s.trim()).includes('alignex-admin')
  } catch { return false }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(ts) {
  if (!ts) return '—'
  return new Date(Number(ts)).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function kv(label, value) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  )
}

const FILE_CATEGORY_ORDER = [
  'Frontal at Rest', 'Frontal Smiling', 'Profile View', 'Right Lateral',
  'Frontal Occlusion', 'Left Lateral', 'Upper Occlusal', 'Lower Occlusal',
  'Lateral Cephalogram', 'OPG',
  'Upper Arch Scan', 'Lower Arch Scan',
  'Other', 'Untagged',
]

function groupFiles(files) {
  const grouped = {}
  for (const f of files) {
    const cat = f.category || 'Untagged'
    ;(grouped[cat] = grouped[cat] || []).push(f)
  }
  return Object.entries(grouped).sort(([a], [b]) => {
    const ia = FILE_CATEGORY_ORDER.indexOf(a)
    const ib = FILE_CATEGORY_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

function CaseRow({ c, index }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(c.status || 'Submitted')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const patientName = [c.patient?.firstName, c.patient?.lastName].filter(Boolean).join(' ') || '—'
  const doctorName  = `Dr. ${[c.dentist?.firstName, c.dentist?.lastName].filter(Boolean).join(' ')}` || '—'
  const fileCount   = c.files?.length ?? 0

  const updateStatus = async (val) => {
    setStatus(val)
    setSaving(true)
    setSaved(false)
    try {
      await fetch(`${API}/admin/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ userId: c.userId, submissionId: c.submissionId, status: val }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silent — status visually updated optimistically
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{patientName}</span>
            <span className="text-xs text-gray-400">{doctorName} · {c.dentist?.clinic}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-400">{formatDate(c.submittedAt)}</span>
            {fileCount > 0 && <span className="text-xs text-gray-300">{fileCount} file{fileCount !== 1 ? 's' : ''}</span>}
            <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${STATUS_STYLES[status] || STATUS_STYLES['Submitted']}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[9px] text-gray-300 font-mono hidden sm:block truncate max-w-[120px]">{c.submissionId}</span>
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-5 py-5 space-y-6">

              {/* Status selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={saving}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
                {saving && <span className="text-xs text-gray-400">Saving…</span>}
                {saved  && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Treating Dentist */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Treating Dentist</p>
                  <div className="space-y-1">
                    {kv('Name', `Dr. ${c.dentist?.firstName} ${c.dentist?.lastName}`)}
                    {kv('DCI No.', c.dentist?.dciNumber)}
                    {kv('Clinic', c.dentist?.clinic)}
                    {kv('Phone', c.dentist?.phone)}
                    {kv('Email', c.dentistEmail)}
                    {kv('Address', [c.dentist?.address1, c.dentist?.address2, c.dentist?.city, c.dentist?.pincode].filter(Boolean).join(', '))}
                  </div>
                </div>

                {/* Patient */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Patient</p>
                  <div className="space-y-1">
                    {kv('Name', `${c.patient?.firstName} ${c.patient?.lastName}`)}
                    {kv('Age', c.patient?.age ? `${c.patient.age} years` : null)}
                    {kv('Gender', c.patient?.gender)}
                    {kv('Complaint', c.patient?.complaint)}
                  </div>
                  {c.notes && (
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Files */}
              {c.files?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Files</p>
                  <div className="space-y-3">
                    {groupFiles(c.files).map(([cat, files]) => (
                      <div key={cat}>
                        <p className="text-xs font-semibold text-primary mb-1.5">{cat}</p>
                        <div className="flex flex-wrap gap-2">
                          {files.map((f) => (
                            <a
                              key={f.name}
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-gray-50 hover:bg-primary/5 border border-gray-200 hover:border-primary/30 rounded-xl px-3 py-1.5 text-xs text-gray-700 hover:text-primary transition-all group"
                            >
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
                                <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
                              </svg>
                              {f.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consents */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Consents</p>
                <div className="space-y-0.5">
                  {kv('Patient data', formatDateTime(c.consentLog?.initial))}
                  {c.consentLog?.missingRecords && kv('Missing records', formatDateTime(c.consentLog.missingRecords))}
                  {c.consentLog?.missingScans   && kv('Missing scans',   formatDateTime(c.consentLog.missingScans))}
                  {kv('Liability', formatDateTime(c.consentLog?.liability))}
                </div>
              </div>

              {/* Ref */}
              <p className="text-[10px] text-gray-300 font-mono">Ref: {c.submissionId}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const [cases, setCases]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    if (!isTokenValid() || !isAdminToken()) {
      navigate('/login', { replace: true })
      return
    }
    fetchCases()
  }, [])

  const fetchCases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/admin/cases`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.status === 401 || res.status === 403) { navigate('/login', { replace: true }); return }
      if (!res.ok) throw new Error('Failed to load cases')
      const data = await res.json()
      setCases(data.cases || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const filtered = cases.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      `${c.patient?.firstName} ${c.patient?.lastName}`.toLowerCase().includes(q) ||
      `${c.dentist?.firstName} ${c.dentist?.lastName}`.toLowerCase().includes(q) ||
      c.submissionId?.toLowerCase().includes(q) ||
      c.dentistEmail?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || (c.status || 'Submitted') === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-primary">
        <div className="container-max py-10 md:py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="font-display font-light text-white text-4xl sm:text-5xl"
              >
                Admin
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="text-white/60 text-sm mt-1"
              >
                {loading ? 'Loading…' : `${cases.length} case${cases.length !== 1 ? 's' : ''} total`}
              </motion.p>
            </div>
            <button
              type="button"
              onClick={() => { fetchCases() }}
              disabled={loading}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors pb-1 disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" strokeLinecap="round" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container-max py-8 max-w-4xl">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by patient, dentist, email, or ref…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
          >
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Loading cases…
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button type="button" onClick={fetchCases} className="text-red-500 text-xs font-medium mt-2 hover:underline">Try again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">{search || statusFilter !== 'All' ? 'No cases match your filters.' : 'No cases submitted yet.'}</p>
          </div>
        )}

        {/* Case list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((c, i) => <CaseRow key={c.submissionId} c={c} index={i} />)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

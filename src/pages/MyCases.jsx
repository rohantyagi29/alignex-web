import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getToken, isTokenValid, clearToken, getTokenEmail } from '../lib/auth'

const API = import.meta.env.VITE_API_BASE || ''

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function CaseCard({ c, index }) {
  const patientName = [c.patient?.firstName, c.patient?.lastName].filter(Boolean).join(' ') || 'Unknown Patient'
  const fileCount = c.fileKeys?.length ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-base truncate">{patientName}</h3>
            <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded-full px-2.5 py-1">
              Submitted
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
            <p className="text-xs text-gray-500">{formatDate(c.submittedAt)}</p>
            {fileCount > 0 && (
              <p className="text-xs text-gray-400">{fileCount} file{fileCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          <p className="text-[10px] text-gray-300 font-mono mt-1.5 truncate">Ref: {c.submissionId}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function MyCases() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const email = getTokenEmail()

  useEffect(() => {
    if (!isTokenValid()) {
      navigate('/login', { replace: true })
      return
    }
    fetchCases()
  }, [])

  const fetchCases = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/my-cases`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.status === 401) { navigate('/login', { replace: true }); return }
      if (!res.ok) throw new Error('Failed to load cases')
      const data = await res.json()
      setCases(data.cases || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearToken()
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pt-16"
    >
      {/* Header */}
      <div className="bg-primary">
        <div className="container-max py-10 md:py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="font-display font-light text-white text-4xl sm:text-5xl"
              >
                My Cases
              </motion.h1>
              {email && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  className="text-white/60 text-sm mt-2"
                >
                  {email}
                </motion.p>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-shrink-0 text-white/70 hover:text-white text-sm font-medium transition-colors pb-1"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="container-max py-10 max-w-2xl">
        {/* Submit new case CTA */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {!loading && !error && (
              <p className="text-gray-500 text-sm">
                {cases.length === 0 ? 'No cases yet' : `${cases.length} case${cases.length !== 1 ? 's' : ''} submitted`}
              </p>
            )}
          </div>
          <Link
            to="/submit-case"
            className="bg-primary text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
              <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
            </svg>
            New Case
          </Link>
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
            <button type="button" onClick={fetchCases} className="text-red-500 text-xs font-medium mt-2 hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && cases.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-700 text-lg">No cases yet</h3>
            <p className="text-gray-400 text-sm mt-2 mb-6">Submit your first case and it will appear here.</p>
            <Link to="/submit-case" className="btn-black">Submit a Case</Link>
          </div>
        )}

        {/* Case list */}
        {!loading && !error && cases.length > 0 && (
          <div className="space-y-3">
            {cases.map((c, i) => <CaseCard key={c.submissionId} c={c} index={i} />)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

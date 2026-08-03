import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { setToken, isTokenValid } from '../lib/auth'

const API = import.meta.env.VITE_API_BASE || ''

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState('idle') // idle | sending | sent | verifying
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef([])
  const cooldownRef = useRef(null)

  useEffect(() => {
    if (isTokenValid()) navigate('/my-cases', { replace: true })
    return () => clearInterval(cooldownRef.current)
  }, [])

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const startCooldown = () => {
    setCooldown(60)
    clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current); return 0 }
        return c - 1
      })
    }, 1000)
  }

  const sendCode = async () => {
    setPhase('sending')
    setError('')
    try {
      const res = await fetch(`${API}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error('Failed to send code')
      setPhase('sent')
      setOtp('')
      startCooldown()
      setTimeout(() => inputRefs.current[0]?.focus(), 80)
    } catch {
      setPhase('idle')
      setError('Could not send code. Check your email and try again.')
    }
  }

  const handleDigit = (i, val) => {
    const digits = otp.split('')
    digits[i] = val.slice(-1)
    const next = digits.join('')
    setOtp(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    setOtp(pasted)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const verify = async () => {
    if (otp.length < 6) { setError('Enter the full 6-digit code.'); return }
    setPhase('verifying')
    setError('')
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid code')
      setToken(data.idToken)
      navigate('/my-cases', { replace: true })
    } catch (e) {
      setPhase('sent')
      setError(e.message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      {/* Top bar */}
      <div className="bg-primary h-16 flex items-center px-6">
        <Link to="/">
          <img src="/assets/Logo.png" alt="Alignex" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="font-display font-bold text-gray-900 text-2xl">Doctor Login</h1>
            <p className="text-gray-500 text-sm mt-1">
              {phase === 'idle' || phase === 'sending'
                ? 'Enter your email to receive a one-time code'
                : `We sent a code to ${email}`}
            </p>
          </div>

          {(phase === 'idle' || phase === 'sending') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && isValidEmail && sendCode()}
                  disabled={phase === 'sending'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                type="button"
                onClick={sendCode}
                disabled={!isValidEmail || phase === 'sending'}
                className="w-full bg-primary text-white rounded-full py-3.5 font-semibold text-sm tracking-wide hover:bg-primary-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {phase === 'sending' && <Spinner />}
                {phase === 'sending' ? 'Sending…' : 'Send Code'}
              </button>
            </div>
          )}

          {(phase === 'sent' || phase === 'verifying') && (
            <div className="space-y-5">
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      handleKeyDown(i, e)
                      if (e.key === 'Enter' && otp.length === 6) verify()
                    }}
                    disabled={phase === 'verifying'}
                    className="w-10 h-11 text-center text-lg font-bold border-2 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 border-gray-200 disabled:opacity-50 transition-all"
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <button
                type="button"
                onClick={verify}
                disabled={phase === 'verifying' || otp.length < 6}
                className="w-full bg-primary text-white rounded-full py-3.5 font-semibold text-sm tracking-wide hover:bg-primary-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {phase === 'verifying' && <Spinner />}
                {phase === 'verifying' ? 'Verifying…' : 'Log In'}
              </button>

              <div className="text-center">
                {cooldown > 0
                  ? <p className="text-gray-400 text-sm">Resend in {cooldown}s</p>
                  : (
                    <button
                      type="button"
                      onClick={sendCode}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Resend code
                    </button>
                  )}
              </div>

              <button
                type="button"
                onClick={() => { setPhase('idle'); setOtp(''); setError('') }}
                className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                ← Change email
              </button>
            </div>
          )}

          <p className="text-center text-gray-400 text-xs mt-8">
            New patient?{' '}
            <Link to="/submit-case" className="text-primary font-medium hover:underline">
              Submit a case
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

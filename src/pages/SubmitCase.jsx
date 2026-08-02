import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { jsPDF } from 'jspdf'
import FileDropZone from '../components/FileDropZone'

const API = import.meta.env.VITE_API_BASE || ''

// Category IDs used for missing-record checks
const PHOTO_XRAY_IDS = [
  'frontal-rest', 'frontal-smiling', 'profile', 'right-lateral',
  'frontal-occlusion', 'left-lateral', 'upper-occlusal', 'lower-occlusal',
  'lateral-ceph', 'opg',
]
const SCAN_IDS = ['upper-scan', 'lower-scan']

// Consent texts — shared between modals and PDF
const PATIENT_CONSENT_TEXT =
  'By checking this box you represent that this patient has consented to you collecting and ' +
  'sharing his/her personal data and records for the purpose of treatment by Alignex aligners. ' +
  'The records may also be used for other educational/marketing purposes without revealing the ' +
  "patient's identity."

const LIABILITY_CONSENT_TEXT =
  'By checking this box you consent that the aligner treatment is going to be carried out under ' +
  'your direction and you take the responsibility for care and supervision during the treatment. ' +
  'Under no circumstances shall Alignex or its employees/members will be held liable for any ' +
  'discomfort or adverse effects that the patient may experience during or after the aligner treatment.'

const MISSING_RECORDS_TEXT =
  'Submission is missing some/all records. We strongly recommend uploading good quality records ' +
  'to allow us to create as accurate a plan as possible to achieve the desired goals. By clicking ' +
  '"I Understand", you agree to take responsibility for any problems that may arise in the ' +
  'treatment due to missing/poor quality records.'

const MISSING_SCANS_TEXT =
  'Scan files (in STL format) have not been uploaded. Case will be kept on hold until the scan ' +
  'files/good quality rubber base impressions are received.'

// ── PDF Generator ───────────────────────────────────────────────────────────
async function generatePDF({ submissionId, dentist, patient, files, notes, consentLog }) {
  // Fetch logo and encode as base64 data URL for embedding in jsPDF
  const logoDataUrl = await fetch('/assets/Logo.png')
    .then((r) => r.blob())
    .then((blob) => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    }))

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, H = 297, L = 15, R = 195, CW = R - L
  let y = 0

  const need = (h = 10) => { if (y + h > H - 18) { doc.addPage(); y = 22 } }
  const gap  = (mm = 3) => { y += mm }

  const txt = (s, x, { sz = 9, bold = false, rgb = [0, 0, 0], wrap = CW } = {}) => {
    doc.setFontSize(sz)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...rgb)
    const lh = sz * 0.43
    doc.splitTextToSize(String(s ?? ''), wrap).forEach(line => {
      need(lh + 1); doc.text(line, x, y); y += lh
    })
    y += 1
  }

  const divider = () => {
    need(3); doc.setDrawColor(220, 220, 220); doc.line(L, y, R, y); y += 3
  }

  const section = (title) => {
    need(14); gap(3)
    doc.setFillColor(235, 245, 255)
    doc.rect(L - 1, y - 3, CW + 2, 8, 'F')
    doc.setFillColor(59, 130, 196)
    doc.rect(L - 1, y - 3, 2, 8, 'F')
    txt(title, L + 4, { sz: 9.5, bold: true, rgb: [30, 70, 130] }); gap(2)
  }

  const kv = (k, v) => {
    if (!v) return
    need(6)
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(90, 90, 90)
    doc.text(k, L + 2, y)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0)
    const lines = doc.splitTextToSize(String(v), CW - 42)
    doc.text(lines, L + 42, y)
    y += Math.max(lines.length, 1) * 4.8 + 0.5
  }

  const consentBlock = (title, body, ts) => {
    need(20); gap(2)
    txt(title, L, { sz: 9.5, bold: true })
    txt(body, L + 2, { sz: 8, rgb: [70, 70, 70], wrap: CW - 4 }); gap(1)
    const agreedLine = `Agreed by Dr. ${dentist.firstName} ${dentist.lastName}  |  ${new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`
    const agreedLines = doc.splitTextToSize(agreedLine, CW - 6)
    const boxH = agreedLines.length * 4.5 + 4
    need(boxH + 2)
    doc.setFillColor(240, 253, 244)
    doc.rect(L, y - 1, CW, boxH, 'F')
    txt(agreedLine, L + 3, { sz: 8.5, bold: true, rgb: [22, 163, 74], wrap: CW - 6 })
    gap(4); divider()
  }

  // Header — blue bar with logo image on left, ref info on right
  doc.setFillColor(59, 130, 196); doc.rect(0, 0, W, 26, 'F')
  // Logo: 1411×430 px → 50mm wide, proportional height ≈15.2mm, centred in 26mm bar
  doc.addImage(logoDataUrl, 'PNG', L, 5.4, 50, 50 * (430 / 1411))
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 225, 255)
  doc.text('Case Submission Summary', R, 11, { align: 'right' })
  doc.text(`Ref: ${submissionId}`, R, 17, { align: 'right' })
  doc.text(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), R, 23, { align: 'right' })
  y = 33

  section('TREATING DENTIST')
  kv('Name:', `Dr. ${dentist.firstName} ${dentist.lastName}`)
  kv('DCI Registration:', dentist.dciNumber || '—')
  kv('Clinic:', dentist.clinic)
  kv('Phone:', dentist.phone)
  kv('Email:', dentist.email)
  const addr = [dentist.address1, dentist.address2, dentist.city, dentist.pincode].filter(Boolean).join(', ')
  if (addr) kv('Address:', addr)

  section('PATIENT DETAILS')
  kv('Name:', `${patient.firstName} ${patient.lastName}`)
  kv('Age:', patient.age ? `${patient.age} years` : '—')
  kv('Gender:', patient.gender || '—')
  kv('Chief Complaint:', patient.complaint)
  if (notes) kv('Notes:', notes)

  section('UPLOADED FILES')
  if (!files.length) {
    txt('No files uploaded.', L + 2, { sz: 8.5, rgb: [150, 150, 150] })
  } else {
    const grouped = {}
    files.forEach(f => { const c = f.category || 'Untagged'; (grouped[c] = grouped[c] || []).push(f.name) })
    Object.entries(grouped).forEach(([cat, names]) => {
      need(5 + names.length * 4.5)
      txt(cat, L + 2, { sz: 8.5, bold: true, rgb: [59, 130, 196] })
      names.forEach(n => txt(`- ${n}`, L + 6, { sz: 8, rgb: [50, 50, 50] }))
      gap(1)
    })
  }

  section('CONSENTS & ACKNOWLEDGMENTS')
  consentBlock('Patient Data & Privacy Consent', PATIENT_CONSENT_TEXT, consentLog.initial)
  if (consentLog.missingRecords) consentBlock('Missing Records Acknowledgment', MISSING_RECORDS_TEXT, consentLog.missingRecords)
  if (consentLog.missingScans)   consentBlock('Missing Scans Acknowledgment',   MISSING_SCANS_TEXT,   consentLog.missingScans)
  consentBlock('Treatment Liability Consent', LIABILITY_CONSENT_TEXT, consentLog.liability)

  for (let p = 1, n = doc.getNumberOfPages(); p <= n; p++) {
    doc.setPage(p)
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 180, 180)
    doc.text(`Alignex Case Management System  |  Page ${p} of ${n}`, W / 2, H - 8, { align: 'center' })
  }

  doc.save(`alignex-${submissionId}.pdf`)
}

// ── Shared UI primitives ─────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.08 } }),
}

function Label({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function Input({ error, ...props }) {
  return (
    <div>
      <input
        {...props}
        className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Textarea({ error, ...props }) {
  return (
    <div>
      <textarea
        {...props}
        rows={4}
        className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function SectionHeading({ number, children }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <h2 className="font-display font-semibold text-gray-900 text-xl">{children}</h2>
    </div>
  )
}

// ── Modal shell ──────────────────────────────────────────────────────────────
function ModalOverlay({ children, maxW = 'max-w-lg' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`bg-white rounded-3xl p-6 sm:p-8 ${maxW} w-full shadow-2xl my-auto`}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function ConsentCheckbox({ checked, onChange, children }) {
  return (
    <label className="flex gap-3 items-start cursor-pointer select-none" onClick={() => onChange(!checked)}>
      <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        checked ? 'bg-primary border-primary' : 'border-gray-300 hover:border-primary/50'
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700 leading-relaxed">{children}</span>
    </label>
  )
}

// ── Prompt 2: Patient consent — shown on page load ───────────────────────────
function InitialConsentModal({ onContinue }) {
  const [checked, setChecked] = useState(false)
  return (
    <ModalOverlay>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-bold text-gray-900 text-lg">Patient Consent Confirmation</h3>
          <p className="text-xs text-gray-400 mt-0.5">Read and confirm before accessing the form</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5 text-sm text-gray-700 leading-relaxed max-h-44 overflow-y-auto">
        {PATIENT_CONSENT_TEXT}
      </div>

      <div className="mb-6">
        <ConsentCheckbox checked={checked} onChange={setChecked}>
          I confirm that the patient has given their consent to the collection and sharing of their
          data as described above.
        </ConsentCheckbox>
      </div>

      <button
        type="button"
        onClick={() => checked && onContinue()}
        disabled={!checked}
        className="w-full bg-primary text-white rounded-full py-3.5 font-semibold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
      >
        Continue to Form
      </button>
    </ModalOverlay>
  )
}

// ── Prompt 4: Missing photo/xray records ─────────────────────────────────────
function MissingRecordsModal({ onBack, onUnderstand }) {
  return (
    <ModalOverlay>
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-bold text-gray-900 text-lg">Missing Records</h3>
          <p className="text-xs text-gray-400 mt-0.5">Some photo or X-ray categories are empty</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-2 text-sm text-gray-700 leading-relaxed">
        {MISSING_RECORDS_TEXT}
      </div>
      <p className="text-xs text-amber-700 font-medium px-1 mb-6">
        Click <strong>Back</strong> to close this box and continue uploading the records.
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 border-2 border-gray-200 text-gray-700 rounded-full py-3 font-semibold text-sm hover:border-gray-300 transition-colors">
          Back
        </button>
        <button type="button" onClick={onUnderstand}
          className="flex-1 bg-orange-500 text-white rounded-full py-3 font-semibold text-sm hover:bg-orange-600 transition-colors">
          I Understand
        </button>
      </div>
    </ModalOverlay>
  )
}

// ── Prompt 5: Missing STL scans ───────────────────────────────────────────────
function MissingScansModal({ onBack, onUnderstand }) {
  return (
    <ModalOverlay>
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 7V5a2 2 0 0 1 2-2h2M22 7V5a2 2 0 0 0-2-2h-2M2 17v2a2 2 0 0 0 2 2h2M22 17v2a2 2 0 0 1-2 2h-2" strokeLinecap="round" />
            <path d="M7 12h10M12 7v10" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-bold text-gray-900 text-lg">Scan Files Missing</h3>
          <p className="text-xs text-gray-400 mt-0.5">Upper and/or lower arch STL scans not uploaded</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-2 text-sm text-gray-700 leading-relaxed">
        {MISSING_SCANS_TEXT}
        <p className="mt-3 font-medium text-orange-800">
          Click "I Understand" if you are going to courier rubber base impressions and aluwax/rubber base bite.
        </p>
      </div>
      <p className="text-xs text-orange-700 font-medium px-1 mb-6">
        Click <strong>Back</strong> to dismiss and continue uploading the scan files.
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 border-2 border-gray-200 text-gray-700 rounded-full py-3 font-semibold text-sm hover:border-gray-300 transition-colors">
          Back
        </button>
        <button type="button" onClick={onUnderstand}
          className="flex-1 bg-orange-500 text-white rounded-full py-3 font-semibold text-sm hover:bg-orange-600 transition-colors">
          I Understand
        </button>
      </div>
    </ModalOverlay>
  )
}

// ── Prompt 3: Liability consent — shown just before OTP ──────────────────────
function LiabilityConsentModal({ submitting, onBack, onAgree }) {
  const [checked, setChecked] = useState(false)
  return (
    <ModalOverlay>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
            <polyline points="14 2 14 8 20 8" strokeLinejoin="round" />
            <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
            <circle cx="12" cy="10" r="0.5" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-bold text-gray-900 text-lg">Treatment Liability Consent</h3>
          <p className="text-xs text-gray-400 mt-0.5">Final confirmation before submission</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5 text-sm text-gray-700 leading-relaxed max-h-44 overflow-y-auto">
        {LIABILITY_CONSENT_TEXT}
      </div>

      <div className="mb-6">
        <ConsentCheckbox checked={checked} onChange={setChecked}>
          I agree to the terms stated above and accept full responsibility for the supervision and
          care of the patient during the aligner treatment.
        </ConsentCheckbox>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={submitting}
          className="flex-1 border-2 border-gray-200 text-gray-700 rounded-full py-3 font-semibold text-sm hover:border-gray-300 transition-colors disabled:opacity-40">
          Back
        </button>
        <button type="button" onClick={() => checked && onAgree()} disabled={!checked || submitting}
          className="flex-1 bg-primary text-white rounded-full py-3 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Sending code…
            </span>
          ) : 'Confirm & Submit'}
        </button>
      </div>
    </ModalOverlay>
  )
}

// ── OTP overlay ──────────────────────────────────────────────────────────────
function OtpOverlay({ email, formData, files, setUploadProgress, onSuccess, onClose }) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('verify')
  const [resendCooldown, setResendCooldown] = useState(60)
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  const timerRef = useRef(null)
  if (!timerRef.current) {
    timerRef.current = setInterval(() => setResendCooldown((c) => (c > 0 ? c - 1 : 0)), 1000)
  }

  const handleDigit = (i, val) => {
    const digits = otp.split('')
    digits[i] = val.slice(-1)
    const next = digits.join('')
    setOtp(next)
    if (val && i < 5) inputRefs[i + 1].current?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs[i - 1].current?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    setOtp(pasted)
    inputRefs[Math.min(pasted.length, 5)].current?.focus()
  }

  const resend = async () => {
    if (resendCooldown > 0) return
    try {
      await fetch(`${API}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setResendCooldown(60)
      setError('')
    } catch {
      setError('Failed to resend. Try again.')
    }
  }

  const submit = async () => {
    if (otp.length < 6) { setError('Please enter the full 6-digit code.'); return }
    setError('')

    try {
      const verifyRes = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed')
      const { idToken } = verifyData
      const authHeader = { Authorization: `Bearer ${idToken}` }

      setPhase('uploading')
      let submissionId = crypto.randomUUID()
      let fileKeys = []

      if (files.length > 0) {
        const urlRes = await fetch(`${API}/get-upload-urls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify({ files: files.map((f) => ({ name: f.name, type: f.type })) }),
        })
        if (!urlRes.ok) throw new Error('Failed to get upload URLs')
        const { submissionId: sid, urls } = await urlRes.json()
        submissionId = sid

        await Promise.all(
          urls.map(({ uploadUrl, key, name }, idx) => {
            const fileObj = files.find((f) => f.name === name) || files[idx]
            return new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest()
              xhr.open('PUT', uploadUrl)
              xhr.setRequestHeader('Content-Type', fileObj.type)
              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  setUploadProgress((prev) => ({
                    ...prev,
                    [fileObj.id]: Math.round((e.loaded / e.total) * 100),
                  }))
                }
              }
              xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error('Upload failed')))
              xhr.onerror = () => reject(new Error('Upload failed'))
              xhr.send(fileObj.file)
            })
          })
        )

        fileKeys = urls.map(({ key, name }, idx) => ({
          key,
          name,
          category: files.find((f) => f.name === name)?.category || files[idx]?.category || null,
        }))
      }

      setPhase('submitting')
      const submitRes = await fetch(`${API}/submit-case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          submissionId,
          dentist: formData.dentist,
          patient: formData.patient,
          notes: formData.notes,
          fileKeys,
          consentLog: formData.consentLog,
        }),
      })
      const submitData = await submitRes.json()
      if (!submitRes.ok) throw new Error(submitData.error || 'Submission failed')

      clearInterval(timerRef.current)
      onSuccess(submitData.submissionId)
    } catch (e) {
      setError(e.message)
      setPhase('verify')
    }
  }

  const isLoading    = phase !== 'verify'
  const loadingLabel = phase === 'uploading'
    ? `Uploading ${files.length} file${files.length !== 1 ? 's' : ''}…`
    : 'Submitting case…'

  return (
    <ModalOverlay maxW="max-w-md">
      {!isLoading && (
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
      )}

      <div className="text-center mb-5 sm:mb-8">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-gray-900 text-2xl">Verify your email</h3>
        <p className="text-gray-500 text-sm mt-2">
          We sent a 6-digit code to<br />
          <span className="font-semibold text-gray-800">{email}</span>
        </p>
      </div>

      <div className="flex gap-1.5 sm:gap-2 justify-center mb-6 sm:mb-8" onPaste={handlePaste}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={inputRefs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i] || ''}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isLoading}
            className="w-10 h-11 sm:w-11 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 rounded-xl outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/30 border-gray-200 disabled:opacity-50"
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center mb-4 bg-red-50 rounded-xl py-2 px-4">{error}</p>
      )}

      <button type="button" onClick={submit} disabled={isLoading}
        className="w-full bg-primary text-white rounded-full py-4 font-semibold text-sm tracking-widest uppercase hover:bg-primary-dark transition-colors duration-200 disabled:opacity-60">
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            {loadingLabel}
          </span>
        ) : 'Verify & Submit Case'}
      </button>

      <div className="text-center mt-5">
        {resendCooldown > 0
          ? <p className="text-gray-400 text-sm">Resend code in {resendCooldown}s</p>
          : <button type="button" onClick={resend} disabled={isLoading}
              className="text-primary text-sm font-medium hover:underline disabled:opacity-40">
              Resend code
            </button>
        }
      </div>
    </ModalOverlay>
  )
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ submissionId, onDownloadPDF }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-center p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8"
      >
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <h2 className="font-display font-bold text-gray-900 text-4xl">Case submitted!</h2>
      <p className="text-gray-500 text-lg mt-4 max-w-md">
        Our orthodontists will review it and get back to you shortly. Check your email for a confirmation.
      </p>
      <div className="mt-6 bg-gray-50 rounded-2xl px-8 py-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Reference ID</p>
        <p className="font-mono font-bold text-gray-800 text-lg mt-1">{submissionId}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-10">
        <a href="/" className="btn-black">Back to Home</a>
        <button
          type="button"
          onClick={onDownloadPDF}
          className="flex items-center gap-2 border-2 border-gray-900 text-gray-900 rounded-full px-8 py-4 font-semibold text-sm tracking-wide hover:bg-gray-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
            <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
          </svg>
          Download Case Summary PDF
        </button>
      </div>
    </motion.div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────
const EMPTY_DENTIST = {
  firstName: '', lastName: '', dciNumber: '', clinic: '',
  phone: '', email: '', address1: '', address2: '', city: '', pincode: '',
}
const EMPTY_PATIENT = { firstName: '', lastName: '', age: '', gender: '', complaint: '' }

const normalizePhone = (v) => {
  const d = v.replace(/\D/g, '')
  return d.length === 12 && d.startsWith('91') ? d.slice(2) : d
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SubmitCase() {
  const [dentist, setDentist]               = useState(EMPTY_DENTIST)
  const [patient, setPatient]               = useState(EMPTY_PATIENT)
  const [notes, setNotes]                   = useState('')
  const [files, setFiles]                   = useState([])
  const [errors, setErrors]                 = useState({})
  const [uploadProgress, setUploadProgress] = useState({})
  const [submitting, setSubmitting]         = useState(false)
  const [showOtp, setShowOtp]               = useState(false)
  const [submissionId, setSubmissionId]     = useState(null)

  // Consent / prompt state
  const [initialConsentGiven, setInitialConsentGiven] = useState(false)
  const [submitStep, setSubmitStep]                   = useState(null) // 'missing-records' | 'missing-scans' | 'liability'
  const [consentLog, setConsentLog]                   = useState({})
  const pendingRef = useRef({ emptyPhotoXray: false, emptyScans: false })

  const set = (setter) => (field) => (e) => setter((prev) => ({ ...prev, [field]: e.target.value }))

  const isFormValid = (() => {
    if (!dentist.firstName.trim() || !dentist.lastName.trim()) return false
    if (!dentist.dciNumber.trim()) return false
    if (!dentist.clinic.trim()) return false
    if (!dentist.phone.trim() || normalizePhone(dentist.phone).length !== 10) return false
    if (!dentist.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dentist.email.trim())) return false
    if (!dentist.address1.trim()) return false
    if (!dentist.city.trim()) return false
    if (!dentist.pincode.trim() || !/^\d{6}$/.test(dentist.pincode.trim())) return false
    if (!patient.firstName.trim() || !patient.lastName.trim()) return false
    if (!patient.age || Number(patient.age) < 1 || Number(patient.age) > 120) return false
    if (!patient.gender) return false
    if (!patient.complaint.trim()) return false
    return true
  })()

  const validate = () => {
    const e = {}
    if (!dentist.firstName.trim()) e['dentist.firstName'] = 'Required'
    if (!dentist.lastName.trim())  e['dentist.lastName']  = 'Required'
    if (!dentist.dciNumber.trim()) e['dentist.dciNumber'] = 'Required'
    if (!dentist.clinic.trim())    e['dentist.clinic']    = 'Required'
    if (!dentist.phone.trim()) {
      e['dentist.phone'] = 'Required'
    } else if (normalizePhone(dentist.phone).length !== 10) {
      e['dentist.phone'] = 'Enter a valid 10-digit phone number'
    }
    if (!dentist.email.trim()) {
      e['dentist.email'] = 'Required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dentist.email.trim())) {
      e['dentist.email'] = 'Enter a valid email address'
    }
    if (!dentist.address1.trim()) e['dentist.address1'] = 'Required'
    if (!dentist.city.trim())     e['dentist.city']     = 'Required'
    if (!dentist.pincode.trim()) {
      e['dentist.pincode'] = 'Required'
    } else if (!/^\d{6}$/.test(dentist.pincode.trim())) {
      e['dentist.pincode'] = 'Pincode must be 6 digits'
    }
    if (!patient.firstName.trim()) e['patient.firstName'] = 'Required'
    if (!patient.lastName.trim())  e['patient.lastName']  = 'Required'
    if (!patient.age) {
      e['patient.age'] = 'Required'
    } else if (Number(patient.age) < 1 || Number(patient.age) > 120) {
      e['patient.age'] = 'Enter a valid age (1–120)'
    }
    if (!patient.gender)           e['patient.gender']    = 'Required'
    if (!patient.complaint.trim()) e['patient.complaint'] = 'Required'
    return e
  }

  // Kick off the submit flow — validate first, then show warnings in order
  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      document.getElementById(Object.keys(errs)[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setErrors({})

    const emptyPhotoXray = PHOTO_XRAY_IDS.some((id) => !files.some((f) => f.category === id))
    const emptyScans     = SCAN_IDS.some((id) => !files.some((f) => f.category === id))
    pendingRef.current   = { emptyPhotoXray, emptyScans }

    if (emptyPhotoXray) setSubmitStep('missing-records')
    else if (emptyScans) setSubmitStep('missing-scans')
    else setSubmitStep('liability')
  }

  const handleMissingRecordsAck = () => {
    setConsentLog((prev) => ({ ...prev, missingRecords: Date.now() }))
    if (pendingRef.current.emptyScans) setSubmitStep('missing-scans')
    else setSubmitStep('liability')
  }

  const handleMissingScansAck = () => {
    setConsentLog((prev) => ({ ...prev, missingScans: Date.now() }))
    setSubmitStep('liability')
  }

  const handleLiabilityAgree = async () => {
    const liabilityTs = Date.now()
    setConsentLog((prev) => ({ ...prev, liability: liabilityTs }))
    setSubmitStep(null)
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: dentist.email }),
      })
      if (!res.ok) throw new Error('Failed to send verification code')
      setShowOtp(true)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => setSubmitStep(null)

  if (submissionId) return (
    <SuccessScreen
      submissionId={submissionId}
      onDownloadPDF={() => generatePDF({ submissionId, dentist, patient, files, notes, consentLog }).catch(console.error)}
    />
  )

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="pt-16 min-h-screen bg-gray-50"
    >
      {/* Page header */}
      <div className="bg-primary">
        <div className="container-max py-10 md:py-14">
          <motion.h1 variants={fadeUp} initial="hidden" animate="show"
            className="font-display font-light text-white text-4xl sm:text-5xl md:text-6xl">
            Submit a Case
          </motion.h1>
          <motion.p variants={fadeUp} custom={1} initial="hidden" animate="show"
            className="mt-4 text-white/70 text-lg max-w-lg">
            Fill in the details below. You'll verify your email before we receive your case.
          </motion.p>
        </div>
      </div>

      <div className="container-max py-16 max-w-3xl">
        {/* Section 1 — Dentist */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-10 shadow-sm mb-8">
          <SectionHeading number="1">Treating Dentist Details</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div id="dentist.firstName">
              <Label required>First Name</Label>
              <Input placeholder="Jane" value={dentist.firstName} onChange={set(setDentist)('firstName')} error={errors['dentist.firstName']} />
            </div>
            <div id="dentist.lastName">
              <Label required>Last Name</Label>
              <Input placeholder="Smith" value={dentist.lastName} onChange={set(setDentist)('lastName')} error={errors['dentist.lastName']} />
            </div>
            <div id="dentist.clinic" className="sm:col-span-2">
              <Label required>Clinic Name</Label>
              <Input placeholder="SmileCare Dental" value={dentist.clinic} onChange={set(setDentist)('clinic')} error={errors['dentist.clinic']} />
            </div>
            <div id="dentist.dciNumber" className="sm:col-span-2">
              <Label required>DCI Registration Number</Label>
              <Input placeholder="e.g. MH-12345" value={dentist.dciNumber} onChange={set(setDentist)('dciNumber')} error={errors['dentist.dciNumber']} />
            </div>
            <div id="dentist.phone">
              <Label required>Phone Number</Label>
              <Input type="tel" placeholder="98765 43210" value={dentist.phone} onChange={set(setDentist)('phone')} error={errors['dentist.phone']} />
            </div>
            <div id="dentist.email">
              <Label required>Email Address</Label>
              <Input type="email" placeholder="doctor@clinic.com" value={dentist.email} onChange={set(setDentist)('email')} error={errors['dentist.email']} />
            </div>
            <div className="sm:col-span-2" id="dentist.address1">
              <Label required>Address Line 1</Label>
              <Input placeholder="Building / Street" value={dentist.address1} onChange={set(setDentist)('address1')} error={errors['dentist.address1']} />
            </div>
            <div className="sm:col-span-2">
              <Label>Address Line 2</Label>
              <Input placeholder="Area / Landmark (optional)" value={dentist.address2} onChange={set(setDentist)('address2')} />
            </div>
            <div id="dentist.city">
              <Label required>City</Label>
              <Input placeholder="Mumbai" value={dentist.city} onChange={set(setDentist)('city')} error={errors['dentist.city']} />
            </div>
            <div id="dentist.pincode">
              <Label required>Pincode</Label>
              <Input placeholder="400001" maxLength={6} value={dentist.pincode} onChange={set(setDentist)('pincode')} error={errors['dentist.pincode']} />
            </div>
          </div>
        </motion.div>

        {/* Section 2 — Patient */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-10 shadow-sm mb-8">
          <SectionHeading number="2">Patient Details</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div id="patient.firstName">
              <Label required>First Name</Label>
              <Input placeholder="John" value={patient.firstName} onChange={set(setPatient)('firstName')} error={errors['patient.firstName']} />
            </div>
            <div id="patient.lastName">
              <Label required>Last Name</Label>
              <Input placeholder="Doe" value={patient.lastName} onChange={set(setPatient)('lastName')} error={errors['patient.lastName']} />
            </div>
            <div id="patient.age">
              <Label required>Age</Label>
              <Input type="number" placeholder="28" min="1" max="120" value={patient.age} onChange={set(setPatient)('age')} error={errors['patient.age']} />
            </div>
            <div />
            <div className="sm:col-span-2" id="patient.gender">
              <Label required>Gender</Label>
              <div className="flex gap-4 mt-1">
                {['Male', 'Female', 'Other'].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value={g} checked={patient.gender === g}
                      onChange={set(setPatient)('gender')} className="accent-primary" />
                    <span className="text-sm text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
              {errors['patient.gender'] && <p className="text-red-500 text-xs mt-1">{errors['patient.gender']}</p>}
            </div>
            <div className="sm:col-span-2" id="patient.complaint">
              <Label required>Chief Complaint / Treatment Goal</Label>
              <Textarea
                placeholder="Describe the patient's main concern or what the treatment should achieve…"
                value={patient.complaint}
                onChange={set(setPatient)('complaint')}
                error={errors['patient.complaint']}
              />
            </div>
          </div>
        </motion.div>

        {/* Section 3 — Files */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-10 shadow-sm mb-8">
          <SectionHeading number="3">Upload Files</SectionHeading>
          <p className="text-gray-500 text-sm mb-6 -mt-4">
            Drop all photos, X-rays, and scans at once, then drag them to the right category.
          </p>
          <FileDropZone value={files} onChange={setFiles} uploadProgress={uploadProgress} />
        </motion.div>

        {/* Section 4 — Notes */}
        <motion.div variants={fadeUp} custom={3} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-10 shadow-sm mb-10">
          <SectionHeading number="4">Additional Notes</SectionHeading>
          <Textarea
            placeholder="Any special instructions, previous treatment history, or concerns…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </motion.div>

        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-red-600 text-sm text-center">
            {errors.submit}
          </div>
        )}

        <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !isFormValid}
            className="btn-black px-14 py-5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Sending code…
              </span>
            ) : 'Submit Case'}
          </button>
          <p className="text-gray-400 text-xs mt-4">You'll verify your email in the next step</p>
        </motion.div>
      </div>

      {/* All overlays */}
      <AnimatePresence>
        {!initialConsentGiven && (
          <InitialConsentModal
            key="initial-consent"
            onContinue={() => {
              setConsentLog((prev) => ({ ...prev, initial: Date.now() }))
              setInitialConsentGiven(true)
            }}
          />
        )}
        {submitStep === 'missing-records' && (
          <MissingRecordsModal key="missing-records" onBack={handleBack} onUnderstand={handleMissingRecordsAck} />
        )}
        {submitStep === 'missing-scans' && (
          <MissingScansModal key="missing-scans" onBack={handleBack} onUnderstand={handleMissingScansAck} />
        )}
        {submitStep === 'liability' && (
          <LiabilityConsentModal key="liability" submitting={submitting} onBack={handleBack} onAgree={handleLiabilityAgree} />
        )}
        {showOtp && (
          <OtpOverlay
            key="otp"
            email={dentist.email}
            formData={{ dentist, patient, notes, consentLog }}
            files={files}
            setUploadProgress={setUploadProgress}
            onSuccess={(sid) => { setShowOtp(false); setSubmissionId(sid) }}
            onClose={() => setShowOtp(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

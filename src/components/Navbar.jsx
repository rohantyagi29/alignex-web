import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { isTokenValid, clearToken } from '../lib/auth'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Why Alignex', to: '/why-alignex' },
  { label: 'How Alignex Works', to: '/how-it-works' },
  { label: 'Education', to: '/education' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Contact Us', to: '/contact' },
]

function AlignexLogo() {
  return (
    <img
      src="/assets/Logo.png"
      alt="Alignex"
      className="h-12 w-auto object-contain"
      style={{ imageRendering: 'auto' }}
    />
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setLoggedIn(isTokenValid())
  }, [location.pathname])

  const handleLogout = () => {
    clearToken()
    setLoggedIn(false)
    navigate('/')
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-primary transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-primary/40' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" aria-label="Alignex home">
            <AlignexLogo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map(({ label, to }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative text-sm text-white transition-opacity duration-200 hover:opacity-80 ${
                    active ? 'font-bold' : 'font-normal'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"
                    />
                  )}
                </Link>
              )
            })}
            {loggedIn ? (
              <>
                <Link
                  to="/my-cases"
                  className={`relative text-sm text-white transition-opacity duration-200 hover:opacity-80 ${
                    location.pathname === '/my-cases' ? 'font-bold' : 'font-normal'
                  }`}
                >
                  My Cases
                  {location.pathname === '/my-cases' && (
                    <motion.span layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                  )}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-primary bg-white rounded-full px-4 py-1.5 hover:bg-white/90 transition-colors"
              >
                Log in
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-primary-dark border-t border-white/10"
          >
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`block px-6 py-3.5 text-sm text-white border-b border-white/5 transition-colors hover:bg-white/10 ${
                  location.pathname === to ? 'font-bold bg-white/10' : ''
                }`}
              >
                {label}
              </Link>
            ))}
            {loggedIn ? (
              <>
                <Link
                  to="/my-cases"
                  className={`block px-6 py-3.5 text-sm text-white border-b border-white/5 transition-colors hover:bg-white/10 ${
                    location.pathname === '/my-cases' ? 'font-bold bg-white/10' : ''
                  }`}
                >
                  My Cases
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-6 py-3.5 text-sm text-white/70 hover:bg-white/10 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-6 py-3.5 text-sm font-semibold text-white border-b border-white/5 hover:bg-white/10 transition-colors"
              >
                Log in
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

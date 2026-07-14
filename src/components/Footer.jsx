import { Link } from 'react-router-dom'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Why Alignex', to: '/why-alignex' },
  { label: 'How Alignex Works', to: '/how-it-works' },
  { label: 'Education', to: '/education' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Contact Us', to: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-white/30 text-xs mt-8">
          © {new Date().getFullYear()} Alignex. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

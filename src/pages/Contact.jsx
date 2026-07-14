import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.1 },
  }),
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" className="flex-shrink-0 mt-0.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" className="flex-shrink-0">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.42 2 2 0 0 1 3.62 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" className="flex-shrink-0">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

export default function Contact() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="pt-16"
    >
      {/* Header */}
      <div className="bg-primary">
        <div className="container-max py-14">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="font-display font-light text-white text-5xl md:text-6xl"
          >
            Contact Us
          </motion.h1>
        </div>
      </div>

      {/* Cards */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Reservations Office */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="border-2 border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <h2 className="font-display font-semibold text-primary text-xl">Reservations Office</h2>
              <div className="mt-6 space-y-4 text-primary text-sm">
                <div className="flex gap-3 items-start">
                  <LocationIcon />
                  <span>Alignex, Vishwa Bldg, HIngwala Lane Extn, Ghatkopar East, Mumbai</span>
                </div>
                <div className="flex gap-3 items-center">
                  <PhoneIcon />
                  <span>1123-456-7890</span>
                </div>
                <div className="flex gap-3 items-center">
                  <EmailIcon />
                  <span>alignex@gmail.com</span>
                </div>
              </div>
            </motion.div>

            {/* Office Hours */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="border-2 border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <h2 className="font-display font-semibold text-primary text-xl">Office Hours</h2>
              <div className="mt-6 space-y-4 text-primary text-sm">
                <div>
                  <p className="font-medium">Monday to Friday</p>
                  <p className="text-primary/70">9:00 am to 6:00 pm</p>
                </div>
                <div>
                  <p className="font-medium">Saturday</p>
                  <p className="text-primary/70">9:00 am to 12:00 noon</p>
                </div>
              </div>
            </motion.div>

            {/* Get Social */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="border-2 border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <h2 className="font-display font-semibold text-primary text-xl">Get Social</h2>
              <div className="mt-6 flex gap-4">
                {[FacebookIcon, TwitterIcon, InstagramIcon].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-11 h-11 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
              <div className="mt-6">
                <a
                  href="#"
                  className="inline-block bg-primary text-white text-sm font-medium italic px-6 py-3 rounded-full hover:bg-primary-dark transition-colors duration-200"
                >
                  Tag us in your photos!
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}

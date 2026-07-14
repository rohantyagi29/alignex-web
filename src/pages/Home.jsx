import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.12 },
  }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 44 44" width="44" height="44" fill="none">
      <path
        d="M22 3 L24 18.5 L39.5 22 L24 25.5 L22 41 L20 25.5 L4.5 22 L20 18.5 Z"
        stroke="#3B82C4"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ImagePlaceholder({ label, className }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-4 border-2 border-dashed border-primary/30 bg-primary/5 rounded-3xl ${className}`}
    >
      <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-10 h-10 text-primary/50" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15 L16 10 L5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-primary/50 text-sm font-medium text-center px-6 leading-snug">{label}</p>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen bg-black flex items-center overflow-hidden">
      {/* Subtle blue glow in the top-right */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="container-max w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-16 pb-10">
        {/* Left content */}
        <motion.div variants={fadeLeft} initial="hidden" animate="show" className="z-10">
          <h1 className="font-display font-light text-white text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.08] tracking-tight">
            Unlocking<br />
            Orthodontic<br />
            Excellence with<br />
            <span className="font-bold text-white">Alignex Clear</span><br />
            <span className="font-bold text-white">Aligners</span>
          </h1>
          <p className="mt-8 text-white/60 text-lg leading-relaxed max-w-md">
            Our job is to make it effective, efficient &amp;<br />
            scientifically accurate!
          </p>
          <div className="mt-10">
            <Link to="/contact" className="btn-white-outline">
              Submit a Case
            </Link>
          </div>
        </motion.div>

        {/* Right: image placeholder */}
        <motion.div variants={fadeRight} initial="hidden" animate="show" className="flex justify-center lg:justify-end">
          <div className="relative">
            {/* Glow behind the placeholder */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-90 pointer-events-none" />
            <ImagePlaceholder
              label="Girl holding clear aligner — hero image"
              className="relative w-[340px] h-[500px] md:w-[420px] md:h-[580px]"
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </section>
  )
}

function PrideSection() {
  const pillars = [
    {
      heading: 'No outsourcing.\nNo shortcuts.\nOnly Ortho.',
      body: 'Every Alignex clear aligner case in Mumbai is planned and executed only by senior orthodontists—never third parties.',
    },
    {
      heading: '3 Dentists. 2 Orthodontists.\n100% Control.',
      body: 'Your case is handled by a specialist team with complete in-house planning for superior precision and consistently better results.',
    },
    {
      heading: 'Premium Results Without the\nPremium Price Tag.',
      body: 'Get high-end clear aligner treatment in Mumbai with results that compete with the best—at pricing that actually makes sense.',
    },
  ]

  return (
    <>
      {/* Blue strip CTA */}
      <div className="bg-primary py-6 flex justify-center">
        <Link to="/contact" className="btn-black">Submit a Case</Link>
      </div>

      <section className="section-pad bg-white">
        <div className="container-max">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="font-display text-primary text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight max-w-2xl"
          >
            We take pride in how we do our work
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {pillars.map((p, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="group"
              >
                <SparkleIcon />
                <h3 className="mt-6 font-display font-bold text-primary text-xl leading-snug whitespace-pre-line">
                  {p.heading}
                </h3>
                <p className="mt-4 text-gray-500 text-sm leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function OurStorySection() {
  return (
    <section className="bg-primary section-pad">
      <div className="container-max max-w-4xl">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="font-display font-light text-white text-4xl md:text-5xl"
        >
          Our Story
        </motion.h2>

        <motion.div
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 space-y-5 text-white/90 text-base md:text-lg leading-relaxed"
        >
          <p>
            Based out of Mumbai, Alignex was formed when three friends got together with one Vision in mind — to make Clear Aligners a daily part of every Dental Practice across India.
          </p>
          <p>
            We started out with careful &amp; meticulous research, to ensure maximum comfort &amp; ideal Orthodontic results in every case.
          </p>
          <p>
            After seeing massive success in our own patients, we decided to bring ALIGNEX ALIGNERS to the rest of the country.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={2}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 space-y-1"
        >
          {['DR SNEH MEHTA', 'DR SANKET BHALGAT', 'DR MAYANK JAIN'].map((name) => (
            <p key={name} className="text-white/70 text-sm font-medium tracking-widest uppercase">
              {name}
            </p>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={3}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10"
        >
          <Link
            to="/about"
            className="inline-block border border-white/40 text-white px-7 py-3 rounded-full text-sm font-medium hover:bg-white hover:text-primary transition-all duration-300"
          >
            Read more
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    { name: 'Dr. Priya Sharma', role: 'Orthodontist, Delhi' },
    { name: 'Dr. Rahul Nair', role: 'Dentist, Bangalore' },
    { name: 'Dr. Meera Pillai', role: 'Orthodontist, Chennai' },
  ]

  return (
    <section className="section-pad bg-white">
      <div className="container-max">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display font-semibold text-primary text-4xl md:text-5xl">Testimonials</h2>
          <p className="mt-4 text-primary text-base">
            We are happy to share their success stories &amp; experiences with you
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              {/* Circular avatar placeholder */}
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 bg-primary/5 flex items-center justify-center group-hover:border-primary transition-colors duration-300">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-primary/30" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>

              <p className="mt-6 text-gray-500 text-sm italic leading-relaxed">
                "Working with Alignex has completely transformed how I approach orthodontic cases. The precision, the support, and the results speak for themselves."
              </p>
              <p className="mt-5 font-display font-semibold text-gray-800 text-base">{t.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ThreeCSection() {
  const concepts = [
    {
      label: 'COST',
      body: 'Cost does come across as a factor for many dentists inhibiting them from shifting to clear aligners. Our solution to this was simple…',
    },
    {
      label: 'CONTROL',
      body: 'It is a belief of many Dental practitioners that one cannot achieve the same amount of control through Aligners as through conventional braces. Though it may seem to be true, there is a solution…',
    },
    {
      label: 'COMFORT',
      body: 'For many Dentists and even Orthodontists, Traditional Braces treatment feels like a comfort zone because of the fear of trusting something new & unfamiliar. To help overcome this…',
    },
  ]

  return (
    <section className="section-pad bg-gray-50">
      <div className="container-max grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left: accordion items */}
        <div className="space-y-10">
          {concepts.map((c, i) => (
            <motion.div
              key={c.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="border-b border-gray-200 pb-10 last:border-0 last:pb-0"
            >
              <h3 className="font-display font-bold text-primary text-2xl tracking-wide">{c.label}</h3>
              <p className="mt-3 text-gray-500 text-sm leading-relaxed">{c.body}</p>
              <Link
                to="/why-alignex"
                className="inline-block mt-4 bg-primary text-white text-xs font-semibold px-5 py-2.5 rounded hover:bg-primary-dark transition-colors duration-200"
              >
                Read more
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right: heading + CTA */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="lg:sticky lg:top-28"
        >
          <h2 className="font-display font-black text-gray-900 text-4xl md:text-5xl leading-tight">
            Our '3 C'<br />Concept for<br />Doctors
          </h2>
          <p className="mt-6 text-gray-400 text-base leading-relaxed">
            Our unique 3C concept is here to aid Dentists in embracing the Clear Aligner Technology with ease and thus, upgrade their Orthodontic practice.
          </p>
          <div className="mt-10">
            <Link to="/contact" className="btn-black">Contact Us</Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <HeroSection />
      <PrideSection />
      <OurStorySection />
      <TestimonialsSection />
      <ThreeCSection />
    </motion.div>
  )
}

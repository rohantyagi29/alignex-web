import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.1 },
  }),
}

const concepts = [
  {
    label: 'COST',
    body: [
      'Cost does come across as a factor for many dentists, inhibiting them from shifting to clear aligners. Our solution to this is simple…',
      'Each Orthodontic Treatment plan is done by an experienced Orthodontist with efficient and precise planning on a premium software. This ensures the least possible number of required aligners for accurate treatment and hence, can lower the Treatment cost without compromising on the quality.',
      'We also provide Aligners in stages & not as a bulk of the entire treatment. This saves potential re-scan charges and also the payment process happens in installments.',
    ],
    bolds: ['least possible number of required aligners', 'lower the Treatment cost', 'provide Aligners in stages & not as a bulk', 'installments.'],
  },
  {
    label: 'CONTROL',
    body: [
      'It is a belief of many dental practitioners that one cannot achieve the same amount of Control through Aligners as through conventional braces. Though it may seem to be true, there is a solution…',
      'We have tried to resolve this factor by having stage-wise Aligners sets and intermediate, stage-wise, close monitoring provided by our highly experienced Orthodontists.',
      'Our Aligners are delivered stage wise, unless specifically requested they be delivered for the entire treatment at the onset.',
    ],
    bolds: ['having stage-wise Aligners sets', 'delivered stage wise'],
  },
  {
    label: 'COMFORT',
    body: [
      'For many Dentists and even orthodontists, Traditional Braces treatment feels like a Comfort zone because of the fear of trusting something new & unfamiliar. To help overcome this…,',
      'We provide a Basic Training Course to Dentists to deal with the clinical aspects of treating Aligner patients.',
      'We also provide routine online Orthodontic support to the Dentists to help achieve the best possible treatment results.',
    ],
    bolds: ['Basic Training Course', 'routine online Orthodontic support'],
  },
]

const whyChoose = [
  {
    heading: 'Cutting-Edge Technology:',
    text: 'At Alignex, we embrace the latest advancements in orthodontic technology, ensuring that our clear aligners deliver superior results.',
  },
  {
    heading: 'Clinical Excellence:',
    text: 'Our clear aligners are meticulously designed and backed by rigorous scientific research to guarantee clinical perfection. Designing is done ONLY by senior Orthodontists.',
  },
  {
    heading: 'Dentist-Centric Approach:',
    text: "We understand your unique needs and priorities as a dentist, and we're here to support your practice's growth and success.",
  },
  {
    heading: 'Patient Satisfaction:',
    text: 'Patients adore the discreet and comfortable nature of Alignex Clear Aligners, leading to higher patient satisfaction and referrals.',
  },
]

function highlightBolds(text, bolds) {
  let result = text
  bolds?.forEach((b) => {
    result = result.replace(b, `__BOLD__${b}__ENDBOLD__`)
  })
  const parts = result.split(/(__BOLD__|__ENDBOLD__)/)
  let isBold = false
  return parts.map((part, i) => {
    if (part === '__BOLD__') { isBold = true; return null }
    if (part === '__ENDBOLD__') { isBold = false; return null }
    return isBold ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : <span key={i}>{part}</span>
  })
}

export default function WhyAlignex() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="pt-16"
    >
      {/* Page header with image */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch min-h-[420px]">
            {/* Left: heading + blue box */}
            <div className="py-14 pr-12">
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="font-display text-primary text-5xl md:text-6xl font-light"
              >
                Why Alignex
              </motion.h1>

              <motion.div
                variants={fadeUp}
                custom={1}
                initial="hidden"
                animate="show"
                className="mt-8 bg-primary rounded-2xl p-8"
              >
                <p className="text-white font-semibold text-lg leading-relaxed">
                  Welcome to Alignex, your trusted partner in achieving Orthodontic excellence.
                  <br /><br />
                  Our commitment is to empower dentists like you with the expertise and precision of Alignex Clear Aligners.
                </p>
                <p className="mt-5 text-white/70 text-sm italic">
                  "Expertise in Aligners" isn't just our tagline — it's our promise to you.
                </p>
              </motion.div>
            </div>

            {/* Right: smiling girl image */}
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="show"
              className="flex items-end justify-center bg-primary/5 relative overflow-hidden"
            >
              <img
                src="/assets/ModelWhy.png"
                alt="Smiling patient with Alignex clear aligners"
                className="w-full h-full object-contain object-bottom"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(59,130,196,0.2))' }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* 3C Concept */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="font-display font-bold text-primary text-center text-4xl md:text-5xl"
          >
            Our 3 C concept for Doctors
          </motion.h2>

          <div className="mt-14 border border-primary/20 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-primary/15">
            {concepts.map((c, i) => (
              <motion.div
                key={c.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="p-8 text-center"
              >
                <h3 className="font-display font-bold text-primary text-xl tracking-widest">{c.label}</h3>
                <div className="mt-4 space-y-3">
                  {c.body.map((para, j) => (
                    <p key={j} className="text-gray-600 text-sm leading-relaxed">
                      {highlightBolds(para, c.bolds)}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose section */}
      <section className="section-pad bg-gray-50">
        <div className="container-max max-w-4xl">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="font-display font-semibold text-primary text-xl"
          >
            Why Choose Alignex Clear Aligners:
          </motion.h2>

          <ul className="mt-8 space-y-8">
            {whyChoose.map((item, i) => (
              <motion.li
                key={item.heading}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <span className="w-2 flex-shrink-0 mt-1.5">
                  <span className="block w-2 h-2 rounded-full bg-primary" />
                </span>
                <p className="text-gray-600 text-base leading-relaxed">
                  <span className="font-bold text-primary">{item.heading}</span>{' '}
                  {item.text}
                </p>
              </motion.li>
            ))}
          </ul>

          <motion.div
            variants={fadeUp}
            custom={4}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="border-t border-primary/20 pt-12">
              <p className="text-gray-700 text-base">
                Ready to elevate your Orthodontic practice to new heights?
              </p>
              <p className="text-gray-700 text-base mt-1">
                Contact Alignex today to explore how our clear aligner expertise can be the cornerstone of your success.
              </p>
              <div className="mt-8">
                <Link to="/contact" className="btn-black">Contact Us</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

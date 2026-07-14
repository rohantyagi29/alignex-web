import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.05 },
  }),
}

const faqs = [
  {
    q: 'X-Factor of Alignex — Why alignex should be your preferred aligner service provider',
    a: (
      <>
        <p><strong>Swift Turnaround Time:</strong> Once you approve your treatment plan, we dispatch the first batch of Alignex aligners within 7 working days.</p>
        <p className="mt-2"><strong>Quality Materials for Predictable Results:</strong> We use state-of-the-art materials that meet CE certification standards for creating our aligners and accessory products. This ensures predictable results, intermittent checks, and an honest approach to orthodontic care.</p>
        <p className="mt-2"><strong>Suitability for an array of Orthodontic Issues:</strong> Most malocclusions can be treated with well-planned orthodontic treatment, and aligners are a versatile option. However, proper case selection is essential, and Alignex provides guidance in this regard to help you achieve desired results in every case with a focus on occlusion.</p>
      </>
    ),
  },
  {
    q: 'Affordability — Are aligners expensive/how much does aligner treatment cost?',
    a: 'Alignex operates on the principle of providing quality orthodontic care at affordable prices for everyone in the nation. The total treatment cost with Alignex aligners under the care of a qualified professional can vary depending on the complexity. What\'s more, we offer flexible payment options with easy installment plans to make it budget-friendly.',
  },
  {
    q: 'What if I am a dentist who is new to aligners?',
    a: "If you're new to aligners, Alignex provides you all the support you need. Start with simpler cases, gain confidence, and gradually move on to more complex malocclusions. Our case review system allows you to consult experienced orthodontists, providing guidance every step of the way. We also provide comprehensive training in attachment placement and case selection to equip you to adapt aligners in your practice from the very next day.",
  },
  {
    q: 'What materials are used in making Alignex aligners?',
    a: 'All the materials used to fabricate Alignex aligners and accessory products are crafted using the most advanced technology available. These materials are CE certified, meeting European standards for quality and safety. This commitment to using cutting-edge materials ensures predictability of results, intermittent checks, and an honest approach to orthodontic care.',
  },
  {
    q: 'How do Aligners work?',
    a: 'Alignex aligners work through micro-changes built into each aligner. These micro changes apply a consistent, gradual force to your teeth when the aligner is worn. For aligners to be effective, they must be worn consistently and as per the recommended schedule—approximately 20-22 hours every day.',
  },
  {
    q: "What's the Recommended Wear Time for Aligners?",
    a: 'The recommended wear time for aligner treatment is 20-22 hours every day. Each aligner should be worn for at least 10 days in the prescribed manner before moving on to the next aligner set in the series. In case of Alignex Pro, the wearing time gets reduced to 7 days per aligner.',
  },
  {
    q: 'Do Aligners Require Regular Check-Up Visits?',
    a: 'Unlike fixed braces, aligners do not require monthly adjustments, reducing the need for frequent dental visits. However, the frequency of check-up visits will be determined by your dentist based on the complexity of your case.',
  },
  {
    q: 'Will wearing dental aligners cause discomfort?',
    a: 'Minor discomfort is normal for the initial 2-3 days of wearing aligners as they apply consistent force on the teeth. However, most patients quickly become comfortable with aligners and experience minimal issues.',
  },
  {
    q: 'Can aligners effectively address all types of orthodontic issues?',
    a: "Alignex aligners are suitable for the majority of malocclusions present in the population, and they can treat most orthodontic issues. However, a very small percentage of malocclusions may have a skeletal component, which may require surgical treatment in addition to orthodontic treatment. It's crucial to have a deep understanding of orthodontic science to select the right cases for aligner treatment.",
  },
  {
    q: 'How Do I Begin Treatment with Alignex?',
    a: (
      <>
        <p>If you are a patient, to start your aligner journey with Alignex, schedule a consultation with our experienced team of dentists or orthodontists. We shall also connect you to an Alignex practitioner near you. Post that, we shall assess your needs and create a personalized treatment plan tailored to your unique case.</p>
        <p className="mt-2">In case you are a dentist, all you need to do is click on the <strong>"Submit a Case"</strong> button on our home page, and our team will guide you through the process.</p>
      </>
    ),
  },
]

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-30px' }}
      className="border-b border-gray-100 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-5 py-6 text-left group"
      >
        {/* Blue left accent */}
        <span
          className={`flex-shrink-0 w-1 rounded-full self-stretch transition-colors duration-300 ${
            open ? 'bg-primary' : 'bg-gray-200'
          }`}
        />

        <div className="flex-1 flex items-start justify-between gap-4">
          <h3
            className={`font-display font-semibold text-base md:text-lg leading-snug transition-colors duration-200 ${
              open ? 'text-primary' : 'text-gray-800 group-hover:text-primary'
            }`}
          >
            {index + 1}. {faq.q}
          </h3>
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-0.5 ${
              open ? 'border-primary bg-primary text-white rotate-45' : 'border-gray-300 text-gray-400'
            }`}
          >
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 1v10M1 6h10" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pl-6 pb-6 pr-10 text-gray-600 text-sm md:text-base leading-relaxed">
              {typeof faq.a === 'string' ? <p>{faq.a}</p> : faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQs() {
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
            FAQs
          </motion.h1>
        </div>
      </div>

      {/* FAQ list */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-4xl">
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  )
}

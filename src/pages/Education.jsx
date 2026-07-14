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

const topics = [
  {
    title: 'Clear Aligner Basics',
    desc: 'A comprehensive introduction to clear aligner therapy — mechanics, case selection, and what to expect at every stage.',
  },
  {
    title: 'Attachment Placement Guide',
    desc: 'Step-by-step clinical guidance on placing and removing attachments for optimal aligner retention and force delivery.',
  },
  {
    title: 'Occlusion & Aligners',
    desc: "Understanding functional occlusion and how it influences your aligner treatment plans for long-term stable results.",
  },
  {
    title: 'Case Review & Planning',
    desc: 'Learn how our in-house orthodontists review records, plan movements, and ensure clinically sound outcomes every time.',
  },
]

export default function Education() {
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
            Education
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="show"
            className="mt-4 text-white/70 text-lg max-w-lg"
          >
            Resources, guides, and knowledge to help dentists master clear aligner therapy.
          </motion.p>
        </div>
      </div>

      {/* Content placeholder */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-gray-400 text-sm font-medium tracking-widest uppercase mb-12"
          >
            Coming Soon — Educational content is being prepared
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {topics.map((topic, i) => (
              <motion.div
                key={topic.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="border border-primary/15 rounded-2xl p-8 bg-gray-50 hover:border-primary/40 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-gray-800 text-lg">{topic.title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{topic.desc}</p>
                <span className="inline-block mt-5 text-primary text-sm font-semibold opacity-40">
                  Article coming soon
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            custom={5}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <p className="text-gray-600 text-base">
              Have a topic you'd like us to cover?
            </p>
            <div className="mt-6">
              <Link to="/contact" className="btn-primary-outline">Get in Touch</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

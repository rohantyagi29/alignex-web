import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.08 },
  }),
}

const steps = [
  {
    n: 1,
    title: 'Case Submission',
    body: 'The records required for case submission include:\n3 extra-oral photos: Frontal at rest, Frontal smiling, Profile\n5 intra-oral photos: Frontal in bite, Right lateral in bite, Left lateral in bite, Upper Occlusal, Lower Occlusal\nOPG',
  },
  {
    n: 2,
    title: 'Treatment Planning',
    body: "Upon receiving and reviewing all the records, our in-house orthodontists will then plan the patient's treatment, including the desired movements of the teeth and the sequence of clear aligner trays that will be required to achieve the desired result. The plan will be sent to you for your review.",
  },
  {
    n: 3,
    title: 'Plan Approval',
    body: 'If the treatment plan is not upto your satisfaction you can always request for revisions. Once you are satisfied with the plan and approve the same, the case will be processed for clear aligners manufacturing.',
  },
  {
    n: 4,
    title: 'Model Generation',
    body: 'The plan is then processed to create 3D models of each aligner step. The models are then printed for aligner manufacturing.',
  },
  {
    n: 5,
    title: 'Clear Aligner Fabrication',
    body: 'The clear aligners are made from a clear, medical-grade thermoplastic material, either PET-G (Alignex Classic) or multi-layered (Alignex Pro) that is comfortable to wear and virtually invisible when in place.',
  },
  {
    n: 6,
    title: 'Quality Control',
    body: "The clear aligners are then subject to a series of quality control checks to ensure they meet the necessary standards and fit the patient's teeth precisely.",
  },
  {
    n: 7,
    title: 'Delivery to Dentist',
    body: 'Once the clear aligners have been fabricated and quality checked, they are packaged and shipped to the dentist, who will fit them to the patient and initiate treatment.',
  },
]

export default function HowItWorks() {
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
            How Alignex Works
          </motion.h1>
        </div>
      </div>

      {/* Steps */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-4xl">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="font-display font-bold text-gray-900 text-2xl md:text-3xl text-center"
          >
            Step-wise Process for Dentists
          </motion.h2>

          <div className="mt-16 relative">
            {/* Vertical connector line */}
            <div className="absolute left-[38px] top-10 bottom-10 w-0.5 bg-primary/15 hidden md:block" />

            <div className="space-y-14">
              {steps.map((step, i) => (
                <motion.div
                  key={step.n}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  className="flex gap-8 items-start"
                >
                  {/* Number */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <span
                      className={`font-display font-black text-5xl md:text-6xl leading-none ${
                        i % 2 === 0 ? 'text-primary' : 'text-gray-900'
                      }`}
                    >
                      {step.n}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="font-display font-semibold text-primary text-xl md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Closing paragraph */}
          <motion.div
            variants={fadeUp}
            custom={8}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-20 p-8 bg-primary/5 border-l-4 border-primary rounded-r-2xl"
          >
            <p className="text-primary font-semibold text-base md:text-lg leading-relaxed">
              Overall, the lab processes involved in creating clear aligners involve the use of advanced technology and specialized software to fabricate a precise and effective solution for straightening teeth. With proper planning and fabrication, clear aligners can be a highly effective and convenient solution for improving one's smile.
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

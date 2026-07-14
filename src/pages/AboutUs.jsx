import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.1 },
  }),
}

function DoctorPhoto({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover object-top"
    />
  )
}

const doctors = [
  {
    name: 'Dr. Sneh Mehta',
    photo: '/assets/Sneh.jpg',
    title: 'M.D.S. Orthodontist',
    subtitle: 'Clear Aligner Specialist',
    bio: 'Dr. Sneh Mehta is more than just an Orthodontist — he is a visionary in the world of dentistry. With a passion for improving smiles and a drive for innovation, Dr. Sneh has dedicated his career to providing the highest quality of care to his patients. From developing cutting-edge techniques to incorporating the latest technology in his practice, Dr. Sneh is always pushing the boundaries of what is possible in Orthodontics. He has honed his skills & gained years of experience practising as an Aligner Specialist, with',
    highlight: 'special expertise in planning software.',
    highlightSuffix: ' No detail misses his sharp eye! His unmatched software skills & clinical expertise form an irreplaceable part of Alignex.',
    imageRight: false,
  },
  {
    name: 'Dr. Mayank Jain',
    photo: '/assets/Mayank.png',
    title: 'M.D.S. Orthodontist',
    subtitle: 'Clear Aligner Specialist',
    bio: 'Dr Mayank Jain is an alumnus of the prestigious Govt Dental College Ahmedabad. He uses a personalized approach to treatment, tailoring his care to the specific needs of each patient to ensure optimal results. Whether he\'s working with children, teens, or adults, Dr. Jain\'s passion for orthodontics shines through in every aspect of his work. He has been providing Aligner Treatment since over 10 years, even when the technology was new & not well established. He has achieved remarkable success with his cases. He also',
    highlight: 'specializes in adjunct orthodontics and myofunctional appliances.',
    highlightSuffix: ' With Dr Jain at the helm, Alignex aims to give simple solutions which end up appealing to dentists and help them utilise Orthodontics more efficiently in their clinical practice.',
    imageRight: true,
  },
  {
    name: 'Dr. Sanket Bhalgat',
    photo: '/assets/Sanket.jpg',
    title: 'B.D.S.',
    subtitle: 'TMJ Disorders & Occlusion Specialist',
    bio: 'Dentist-cum-Entrepreneur, Dr Sanket Bhalgat has been deeply involved in social causes since his early days. Working as a clinician & educator, his focus has always been to give to society & to provide the best resources to all his patients. Alignex is his way of ensuring that no Dentist feels that they cannot provide their patients with the most premium & best Orthodontic solution technology has to offer. He completed his certification in',
    highlight: 'TMJ Disorders & Occlusion from Tufts University',
    highlightSuffix: ' and has been practising Occlusion-based Dentistry ever since. Under his guidance, Alignex promises to provide the best possible results, keeping Functional Occlusion in mind.',
    imageRight: false,
  },
]

function DoctorCard({ doctor, index }) {
  const { name, photo, title, subtitle, bio, highlight, highlightSuffix, imageRight } = doctor

  const imageSlot = (
    <div className="relative flex-shrink-0 w-full lg:w-[380px]">
      {/* Blue accent bg */}
      <div className="absolute inset-0 bg-primary rounded-3xl" />
      {/* Photo container with top-right rounded corner only (matching Canva design) */}
      <div
        className="relative overflow-hidden rounded-tl-3xl rounded-bl-3xl rounded-tr-[80px] rounded-br-3xl mx-6 mt-6 h-[360px]"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        <DoctorPhoto src={photo} alt={name} />
      </div>
      {/* Name card overlay */}
      <div className="relative mx-6 -mt-14 mb-6 bg-black text-white py-4 px-6 rounded-xl z-10">
        <p className="font-display font-bold text-base">{name}</p>
        <p className="text-xs text-white/70 mt-0.5 font-medium">{title}</p>
        <p className="text-xs text-white/70">{subtitle}</p>
      </div>
    </div>
  )

  const textSlot = (
    <div className="flex-1 py-6">
      <p className="text-gray-600 text-base leading-relaxed">
        {bio}
        {highlight && (
          <>
            {' '}
            <strong className="text-gray-900 font-bold">{highlight}</strong>
            {highlightSuffix}
          </>
        )}
      </p>
    </div>
  )

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={`flex flex-col lg:flex-row gap-10 items-start ${imageRight ? 'lg:flex-row-reverse' : ''}`}
    >
      {imageSlot}
      {textSlot}
    </motion.div>
  )
}

export default function AboutUs() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="pt-16"
    >
      {/* Page header */}
      <div className="bg-primary">
        <div className="container-max py-14">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="font-display font-light text-white text-5xl md:text-6xl"
          >
            About Us
          </motion.h1>
        </div>
      </div>

      {/* Intro */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-4xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-4 text-gray-600 text-base md:text-lg leading-relaxed"
          >
            <p>
              Alignex is the brainchild of 3 passionate minds — Dr Sneh Mehta, Dr Sanket Bhalgat &amp; Dr Mayank Jain. They are all batchmates and alumni of Government Dental College &amp; Hospital, Mumbai.
            </p>
            <p>
              After their BDS, Dr Sneh &amp; Dr Mayank went on to do their Masters in Orthodontics &amp; Dentofacial Orthopaedics.
            </p>
            <p>
              Dr Sanket focussed his entire knowledge on making his clinical practice completely Occlusion based.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Doctor profiles */}
      <section className="bg-gray-50 section-pad">
        <div className="container-max space-y-24">
          {doctors.map((doc, i) => (
            <DoctorCard key={doc.name} doctor={doc} index={i} />
          ))}
        </div>
      </section>
    </motion.div>
  )
}

import { motion } from 'framer-motion'

import './SpellCast.css'

export default function SpellCast({
  type = 'fire',
}) {
  return (
    <div className="spellWrapper">
      {/* MAGIC CORE */}
      <motion.div
        className={`magicCore ${type}`}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
      />

      {/* PARTICLES */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className={`particle ${type}`}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            x:
              Math.random() * 240 -
              120,

            y:
              Math.random() * 240 -
              120,

            opacity: 0,
            scale: [1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.12,
          }}
        />
      ))}

      {/* SHOCKWAVE */}
      <motion.div
        className={`shockwave ${type}`}
        animate={{
          scale: [0.5, 2.8],
          opacity: [0.8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
      />
    </div>
  )
}
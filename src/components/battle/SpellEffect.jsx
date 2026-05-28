import { motion } from 'framer-motion'

import './SpellEffect.css'

export default function SpellEffect({
  type = 'fire',
}) {
  return (
    <motion.div
      initial={{
        scale: 0,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className={`spellEffect ${type}`}
    >
      {type === 'fire' && '🔥'}
      {type === 'ice' && '❄️'}
      {type === 'lightning' && '⚡'}
      {type === 'cosmic' && '✨'}
    </motion.div>
  )
}
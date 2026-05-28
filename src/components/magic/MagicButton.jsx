import { motion } from 'framer-motion'

export default function MagicButton({
  children,
  onClick,
}) {
  return (
    <motion.button
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.95,
      }}
      onClick={onClick}
      className="magicButton"
    >
      {children}
    </motion.button>
  )
}
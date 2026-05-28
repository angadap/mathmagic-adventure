import './GlowButton.css'

export default function GlowButton({
  children,
  onClick,
  fullWidth = false,
}) {
  return (
    <button
      className={`glowButton ${
        fullWidth ? 'fullWidth' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
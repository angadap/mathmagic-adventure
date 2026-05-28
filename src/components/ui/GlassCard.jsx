import './GlassCard.css'

export default function GlassCard({
  children,
  className = '',
  onClick,
}) {
  return (
    <div
      className={`glassCard ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
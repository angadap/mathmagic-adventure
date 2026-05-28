import './FloatingParticles.css'

export default function FloatingParticles({
  count = 20,
}) {
  return (
    <div className="particles">
      {[...Array(count)].map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${5 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          ✨
        </span>
      ))}
    </div>
  )
}
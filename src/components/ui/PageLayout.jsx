import FloatingParticles from '../effects/FloatingParticles'

import './PageLayout.css'

export default function PageLayout({
  children,
}) {
  return (
    <div className="pageLayout">
      <div className="bgGlow glow1"></div>
      <div className="bgGlow glow2"></div>

      <FloatingParticles />

      <div className="pageContent">
        {children}
      </div>
    </div>
  )
}
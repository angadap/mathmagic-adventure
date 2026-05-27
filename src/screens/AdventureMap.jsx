import { motion } from 'framer-motion'
import {
  Lock,
  Star,
  Trophy,
  Crown,
  Gem,
} from 'lucide-react'

import './AdventureMap.css'

const worlds = [
  {
    id: 1,
    title: 'Addition Island',
    subtitle: 'Master basic sums',
    emoji: '🏝️',
    stars: 3,
    unlocked: true,
    top: '8%',
    left: '10%',
    glow: 'cyanGlow',
  },
  {
    id: 2,
    title: 'Multiplication Mountain',
    subtitle: 'Climb multiplication peaks',
    emoji: '⛰️',
    stars: 2,
    unlocked: true,
    top: '28%',
    right: '5%',
    glow: 'purpleGlow',
  },
  {
    id: 3,
    title: 'Fraction Forest',
    subtitle: 'Explore magical fractions',
    emoji: '🌲',
    stars: 1,
    unlocked: true,
    top: '48%',
    left: '12%',
    glow: 'greenGlow',
  },
  {
    id: 4,
    title: 'Geometry Castle',
    subtitle: 'Unlock shape powers',
    emoji: '🏰',
    stars: 0,
    unlocked: false,
    top: '68%',
    right: '10%',
    glow: 'pinkGlow',
  },
]

export default function AdventureMap() {
  return (
    <div className="mapScreen">
      {/* Background Effects */}
      <div className="mapGlow glow1"></div>
      <div className="mapGlow glow2"></div>
      <div className="mapGlow glow3"></div>

      {/* Floating Particles */}
      <div className="mapParticles">
        {[...Array(30)].map((_, i) => (
          <span
            key={i}
            className="mapParticle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            ✨
          </span>
        ))}
      </div>

      <div className="mapContainer">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mapHeader"
        >
          <div>
            <div className="mapLabel">
              MAGICAL WORLD MAP
            </div>

            <h1>Adventure Journey</h1>
          </div>

          <div className="gemBox">
            <Gem size={18} />
            <span>120</span>
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="progressCard"
        >
          <div className="progressTop">
            <div>
              <div className="smallText">
                Current Quest
              </div>

              <h3>Defeat Number Dragon</h3>
            </div>

            <div className="crownBox">
              <Crown size={20} />
            </div>
          </div>

          <div className="questProgress">
            <div className="questFill"></div>
          </div>

          <div className="questText">
            72% completed
          </div>
        </motion.div>

        {/* Map Area */}
        <div className="worldMap">
          {/* Path Lines */}
          <div className="pathLine path1"></div>
          <div className="pathLine path2"></div>
          <div className="pathLine path3"></div>

          {worlds.map((world, index) => (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className={`worldNode ${world.glow}`}
              style={{
                top: world.top,
                left: world.left,
                right: world.right,
              }}
            >
              <div
                className={`worldCard ${
                  !world.unlocked ? 'lockedWorld' : ''
                }`}
              >
                {!world.unlocked && (
                  <div className="lockOverlay">
                    <Lock size={28} />
                  </div>
                )}

                <div className="worldEmoji">
                  {world.emoji}
                </div>

                <h2>{world.title}</h2>

                <p>{world.subtitle}</p>

                <div className="starsRow">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={
                        star <= world.stars
                          ? '#FFC93C'
                          : 'transparent'
                      }
                      color="#FFC93C"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Boss Node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="bossNode"
          >
            <div className="bossInner">
              👹
            </div>

            <div className="bossText">
              Boss Battle
            </div>
          </motion.div>
        </div>

        {/* Bottom Reward */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="rewardChest"
        >
          <div className="chestLeft">
            <div className="chestEmoji">
              🎁
            </div>

            <div>
              <h3>Treasure Chest</h3>
              <p>Open after next victory</p>
            </div>
          </div>

          <button>
            Open
          </button>
        </motion.div>

        {/* Bottom Navigation */}
        <div className="mapBottomNav">
          <div className="mapNavItem">
            🏠
            <span>Home</span>
          </div>

          <div className="mapNavItem activeMapNav">
            🗺️
            <span>Adventure</span>
          </div>

          <div className="battleOrb">
            ⚔️
          </div>

          <div className="mapNavItem">
            <Trophy size={18} />
            <span>Rewards</span>
          </div>

          <div className="mapNavItem">
            👤
            <span>Profile</span>
          </div>
        </div>
      </div>
    </div>
  )
}
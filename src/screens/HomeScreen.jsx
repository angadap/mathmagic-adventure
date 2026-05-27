import { motion } from 'framer-motion'
import {
  Sparkles,
  Flame,
  Trophy,
  Swords,
  Star,
} from 'lucide-react'

import './HomeScreen.css'

const cards = [
  {
    title: 'Adventure Mode',
    subtitle: 'Explore magical math worlds',
    icon: '🗺️',
    glow: 'purpleGlow',
  },
  {
    title: 'Boss Battle',
    subtitle: 'Defeat monsters using math',
    icon: '⚔️',
    glow: 'redGlow',
  },
  {
    title: 'Daily Quests',
    subtitle: 'Complete challenges & earn rewards',
    icon: '🔥',
    glow: 'cyanGlow',
  },
]

export default function HomeScreen() {
  return (
    <div className="homeScreen">
      {/* Background Effects */}
      <div className="backgroundGlow bg1"></div>
      <div className="backgroundGlow bg2"></div>
      <div className="backgroundGlow bg3"></div>

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(25)].map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${4 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            ✨
          </span>
        ))}
      </div>

      <div className="contentWrapper">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="heroSection"
        >
          <div className="wizardOrb">
            🧙
          </div>

          <h1 className="title">MathMagic</h1>

          <div className="academyText">
            FANTASY ACADEMY
          </div>

          <p className="subtitle">
            Learn math through magical adventures ✨
          </p>
        </motion.div>

        {/* XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xpCard"
        >
          <div className="xpTop">
            <div>
              <div className="smallLabel">Current Rank</div>
              <div className="rankText">Galaxy Wizard</div>
            </div>

            <div className="streakBox">
              <Flame size={20} />
              <span>7</span>
            </div>
          </div>

          <div className="xpBar">
            <div className="xpFill"></div>
          </div>

          <div className="xpNumbers">
            <span>1800 XP</span>
            <span>2500 XP</span>
          </div>
        </motion.div>

        {/* Reward Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rewardBanner"
        >
          <div>
            <div className="rewardTitle">Daily Reward</div>
            <div className="rewardSubtitle">
              Claim magical treasure chest
            </div>
          </div>

          <button className="claimButton">
            Claim
          </button>
        </motion.div>

        {/* Main Cards */}
        <div className="cardsContainer">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`magicCard ${card.glow}`}
            >
              <div>
                <h2>{card.title}</h2>
                <p>{card.subtitle}</p>
              </div>

              <div className="cardIcon">{card.icon}</div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="bottomNav">
          <div className="navItem activeNav">
            <Sparkles size={20} />
            <span>Home</span>
          </div>

          <div className="navItem">
            <Star size={20} />
            <span>Adventure</span>
          </div>

          <div className="battleButton">
            <Swords size={32} />
          </div>

          <div className="navItem">
            <Trophy size={20} />
            <span>Rewards</span>
          </div>

          <div className="navItem">
            👤
            <span>Profile</span>
          </div>
        </div>
      </div>
    </div>
  )
}
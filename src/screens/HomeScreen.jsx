import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DailyRewardPopup from '../components/rewards/DailyRewardPopup'

import './HomeScreen.css'



const cards = [

  {
  title: 'Choose Avatar',
  subtitle: 'Select your magical hero',
  emoji: '🧙',
  route: '/avatars',
  glow: 'cyanGlow',
  },
  {
    title: 'Adventure Mode',
    subtitle: 'Explore magical worlds',
    emoji: '🗺️',
    route: '/adventure',
    glow: 'purpleGlow',
  },
  {
    title: 'Boss Battle',
    subtitle: 'Defeat powerful monsters',
    emoji: '⚔️',
    route: '/boss',
    glow: 'redGlow',
  },
  {
    title: 'Daily Quest',
    subtitle: 'Earn bonus rewards',
    emoji: '✨',
    route: null,
    glow: 'cyanGlow',
  },
  {
  title: 'Magic Inventory',
  subtitle: 'Collect magical items',
  emoji: '🎒',
  route: '/inventory',
  glow: 'purpleGlow',
},
{
  title: 'Magic Pets',
  subtitle: 'Train magical companions',
  emoji: '🐉',
  route: '/pets',
  glow: 'pinkGlow',
},
{
  title: 'Magic Arena',
  subtitle: 'Compete with top wizards',
  emoji: '🏆',
  route: '/leaderboard',
  glow: 'purpleGlow',
},
{
  title: 'Wizard Shop',
  subtitle: 'Spend magical gems',
  emoji: '🛒',
  route: '/shop',
  glow: 'pinkGlow',
},
{
  title: 'Story Mode',
  subtitle: 'Play magical quests',
  emoji: '📜',
  route: '/story',
  glow: 'purpleGlow',
},
{
  title: 'Math Battle',
  subtitle: 'Solve magical questions',
  emoji: '⚡',
  route: '/battle',
  glow: 'purpleGlow',
},
]

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
  <>
    <DailyRewardPopup />

    <div className="homeScreen">
      {/* Background Effects */}
      <div className="bgGlow glow1"></div>
      <div className="bgGlow glow2"></div>

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
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

      <div className="homeContainer">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="heroSection"
        >
          <div className="heroBadge">
            MAGICAL MATH ADVENTURE
          </div>

          <h1 className="heroTitle">
            MathMagic
          </h1>

          <p className="heroSubtitle">
            Learn maths through magical battles,
            adventures and fantasy quests.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="cardsGrid">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3 + index * 0.1,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`magicCard ${card.glow}`}
              onClick={() => {
                if (card.route) {
                  navigate(card.route)
                }
              }}
            >
              <div className="cardEmoji">
                {card.emoji}
              </div>

              <h2>{card.title}</h2>

              <p>{card.subtitle}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="bottomNav">
          <div className="navItem activeNav">
            🏠
            <span>Home</span>
          </div>

          <div className="navItem">
            🗺️
            <span>Map</span>
          </div>

          <div className="battleButton">
            ⚔️
          </div>

          <div className="navItem">
            🏆
            <span>Rewards</span>
          </div>

<div
  className="navItem"
  onClick={() => navigate('/profile')}
>
  👤
  <span>Profile</span>
</div>
        </div>
      </div>
    </div>
    </>
  )
}
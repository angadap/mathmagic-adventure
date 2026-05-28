import { motion } from 'framer-motion'

import {
  Crown,
  Gem,
  Trophy,
  Sparkles,
} from 'lucide-react'

import PageLayout from '../components/ui/PageLayout'
import GlassCard from '../components/ui/GlassCard'

import useGame from '../hooks/useGame'

import './ProfileScreen.css'

export default function ProfileScreen() {
  const { player } = useGame()

  return (
    <PageLayout>
      <div className="profileScreen">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="profileHero"
        >
          <div className="profileAvatar">
            {player.avatar}
          </div>

          <h1>{player.name}</h1>

          <p>Master of Magical Maths</p>
        </motion.div>

        {/* XP CARD */}
        <GlassCard className="xpCard">
          <div className="xpTop">
            <div>
              <div className="smallLabel">
                CURRENT LEVEL
              </div>

              <h2>Level {player.level}</h2>
            </div>

            <div className="xpIcon">
              <Crown size={28} />
            </div>
          </div>

          <div className="xpBar">
            <div
              className="xpFill"
              style={{
                width: `${(player.xp % 1000) / 10}%`,
              }}
            ></div>
          </div>

          <div className="xpValue">
            {player.xp} XP
          </div>
        </GlassCard>

        {/* STATS */}
        <div className="statsGrid">
          <GlassCard>
            <div className="statIcon purpleStat">
              <Gem size={24} />
            </div>

            <h3>{player.gems}</h3>

            <p>Magic Gems</p>
          </GlassCard>

          <GlassCard>
            <div className="statIcon pinkStat">
              <Sparkles size={24} />
            </div>

            <h3>18</h3>

            <p>Spells Learned</p>
          </GlassCard>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="achievementSection">
          <div className="sectionTitle">
            <Trophy size={20} />

            <span>Achievements</span>
          </div>

          <div className="achievementList">
            <GlassCard>
              <div className="achievementRow">
                <div>
                  <h4>Dragon Slayer</h4>

                  <p>
                    Defeat first boss battle
                  </p>
                </div>

                <div className="achievementEmoji">
                  🐉
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="achievementRow">
                <div>
                  <h4>Math Wizard</h4>

                  <p>
                    Reach Level 5
                  </p>
                </div>

                <div className="achievementEmoji">
                  ✨
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="achievementRow">
                <div>
                  <h4>Treasure Hunter</h4>

                  <p>
                    Collect 200 Gems
                  </p>
                </div>

                <div className="achievementEmoji">
                  💎
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
import { motion } from 'framer-motion'

import {
  Crown,
  Heart,
  Shield,
  Sparkles,
} from 'lucide-react'

import PageLayout from '../components/ui/PageLayout'
import GlassCard from '../components/ui/GlassCard'

import SpellCast from '../components/magic/SpellCast'
import MagicButton from '../components/magic/MagicButton'

import './BossBattle.css'

export default function BossBattle() {
  return (
    <PageLayout>
      <div className="bossBattleScreen">
        {/* HEADER */}

        <div className="bossHeader">
          <div className="bossBadge">
            FINAL BATTLE
          </div>

          <h1>Shadow Dragon</h1>

          <p>
            Defeat the ancient dragon
            using magical maths powers.
          </p>
        </div>

        {/* BOSS CARD */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <GlassCard>
            <div className="bossCard">
              {/* BOSS IMAGE */}

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                }}
                className="bossEmoji"
              >
                🐉
              </motion.div>

              {/* SPELL EFFECT */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'center',
                  marginTop: '20px',
                }}
              >
                <SpellCast type="arcane" />
              </div>

              {/* BOSS INFO */}

              <div className="bossInfo">
                <div className="bossStat">
                  <Heart size={18} />

                  <span>
                    HP: 8500
                  </span>
                </div>

                <div className="bossStat">
                  <Shield size={18} />

                  <span>
                    Armor: 320
                  </span>
                </div>

                <div className="bossStat">
                  <Crown size={18} />

                  <span>
                    Level 12 Boss
                  </span>
                </div>
              </div>

              {/* PROGRESS */}

              <div className="bossHealthWrapper">
                <div className="bossHealthTop">
                  <span>
                    Boss Health
                  </span>

                  <span>78%</span>
                </div>

                <div className="bossHealthBar">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: '78%',
                    }}
                    transition={{
                      duration: 1.2,
                    }}
                    className="bossHealthFill"
                  />
                </div>
              </div>

              {/* ATTACK BUTTON */}

              <div
                style={{
                  marginTop: '30px',
                }}
              >
                <MagicButton>
                  ⚔️ Cast Spell
                </MagicButton>
              </div>

              {/* REWARDS */}

              <div className="bossRewards">
                <div className="rewardCard">
                  <Sparkles size={18} />

                  +500 XP
                </div>

                <div className="rewardCard">
                  💎 +250 Gems
                </div>

                <div className="rewardCard">
                  🐉 Dragon Pet Egg
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </PageLayout>
  )
}
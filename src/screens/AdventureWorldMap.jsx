import { motion } from 'framer-motion'

import {
  Lock,
  Star,
  Crown,
  CheckCircle2,
} from 'lucide-react'

import PageLayout from '../components/ui/PageLayout'
import GlassCard from '../components/ui/GlassCard'

import useWorlds from '../hooks/useWorlds'

import './AdventureWorldMap.css'

export default function AdventureWorldMap() {
  const { worlds } = useWorlds()

  return (
    <PageLayout>
      <div className="worldMapScreen">
        <div className="worldHeader">
          <div className="worldBadge">
            MAGICAL KINGDOMS
          </div>

          <h1>Adventure Map</h1>

          <p>
            Travel through magical worlds
            and defeat maths monsters.
          </p>
        </div>

        <div className="worldPath">
          {worlds.map((world, index) => (
            <motion.div
              key={world.id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.1,
              }}
              className="worldWrapper"
            >
              <div className="pathLine"></div>

              <GlassCard
                className={`worldCard ${
                  !world.unlocked
                    ? 'lockedWorld'
                    : ''
                }`}
              >
                <div className="worldTop">
                  <div className="worldEmoji">
                    {world.emoji}
                  </div>

                  {!world.unlocked && (
                    <div className="lockIcon">
                      <Lock size={18} />
                    </div>
                  )}

                  {world.completed && (
                    <div className="completeIcon">
                      <CheckCircle2
                        size={22}
                      />
                    </div>
                  )}
                </div>

                <h2>{world.name}</h2>

                <p>{world.difficulty}</p>

                <div className="worldBottom">
                  <div className="starsRow">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        fill={
                          world.stars >= star
                            ? '#ffd166'
                            : 'transparent'
                        }
                      />
                    ))}
                  </div>

                  {world.completed && (
                    <div className="completedBadge">
                      COMPLETE
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="worldFooter">
          <div className="crownBox">
            <Crown size={22} />

            <span>
              Unlock Dragon Castle
            </span>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
import { motion } from 'framer-motion'

import {
  Crown,
  Trophy,
  Medal,
} from 'lucide-react'

import PageLayout from '../components/ui/PageLayout'
import GlassCard from '../components/ui/GlassCard'

import {
  leaderboardPlayers,
} from '../data/leaderboard'

import './LeaderboardScreen.css'

export default function LeaderboardScreen() {
  return (
    <PageLayout>
      <div className="leaderboardScreen">
        <div className="leaderboardHeader">
          <div className="leaderboardBadge">
            GLOBAL RANKINGS
          </div>

          <h1>Magic Arena</h1>

          <p>
            Compete against maths wizards
            across the kingdom.
          </p>
        </div>

        <div className="topThree">
          {leaderboardPlayers
            .slice(0, 3)
            .map((player, index) => (
              <motion.div
                key={player.id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.15,
                }}
              >
                <GlassCard
                  className={`topPlayer rank${player.rank}`}
                >
                  <div className="rankIcon">
                    {player.rank === 1 && (
                      <Crown size={26} />
                    )}

                    {player.rank === 2 && (
                      <Trophy size={24} />
                    )}

                    {player.rank === 3 && (
                      <Medal size={24} />
                    )}
                  </div>

                  <div className="topAvatar">
                    {player.avatar}
                  </div>

                  <h2>{player.name}</h2>

                  <p>
                    Level {player.level}
                  </p>

                  <div className="topScore">
                    {player.score} XP
                  </div>
                </GlassCard>
              </motion.div>
            ))}
        </div>

        <div className="leaderboardList">
          {leaderboardPlayers.map(
            (player, index) => (
              <motion.div
                key={player.id}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
              >
                <GlassCard>
                  <div className="leaderboardRow">
                    <div className="leftPlayer">
                      <div className="playerRank">
                        #{player.rank}
                      </div>

                      <div className="playerAvatar">
                        {player.avatar}
                      </div>

                      <div>
                        <h3>
                          {player.name}
                        </h3>

                        <p>
                          Level {player.level}
                        </p>
                      </div>
                    </div>

                    <div className="playerXP">
                      {player.score}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          )}
        </div>
      </div>
    </PageLayout>
  )
}
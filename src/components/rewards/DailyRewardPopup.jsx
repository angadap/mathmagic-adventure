import { motion } from 'framer-motion'

import {
  Flame,
  Gift,
  Sparkles,
} from 'lucide-react'

import useRewards from '../../hooks/useRewards'

import './DailyRewardPopup.css'

export default function DailyRewardPopup() {
  const {
    streak,
    claimReward,
    showReward,
  } = useRewards()

  if (!showReward) return null

  return (
    <div className="rewardOverlay">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.7,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="rewardPopup"
      >
        <div className="rewardIcon">
          🎁
        </div>

        <h2>Daily Reward!</h2>

        <p>
          Your magical streak continues.
        </p>

        <div className="streakBox">
          <Flame size={20} />

          <span>
            {streak} Day Streak
          </span>
        </div>

        <div className="rewardItems">
          <div className="rewardItem">
            ✨ +50 XP
          </div>

          <div className="rewardItem">
            💎 +20 Gems
          </div>

          <div className="rewardItem">
            <Gift size={18} />

            Mystery Loot
          </div>
        </div>

        <button
          onClick={claimReward}
          className="claimButton"
        >
          <Sparkles size={18} />

          Claim Reward
        </button>
      </motion.div>
    </div>
  )
}
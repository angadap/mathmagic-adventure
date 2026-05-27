import { useState } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

import {
  Flame,
  Shield,
  Zap,
  Crown,
} from 'lucide-react'

import './BossBattle.css'

export default function BossBattle() {
  const [bossHP, setBossHP] = useState(100)
  const [combo, setCombo] = useState(0)
  const [showVictory, setShowVictory] = useState(false)

  const correctAnswer = 56

  const answers = [42, 56, 64, 48]

  const attackBoss = (value) => {
    if (value === correctAnswer) {
      const newHP = Math.max(bossHP - 20, 0)

      setBossHP(newHP)
      setCombo(combo + 1)

      if (newHP <= 0) {
        setShowVictory(true)
      }
    } else {
      setCombo(0)
    }
  }

  return (
    <div className="bossScreen">
      {showVictory && <Confetti />}

      {/* Background Glows */}
      <div className="battleGlow glow1"></div>
      <div className="battleGlow glow2"></div>
      <div className="battleGlow glow3"></div>

      {/* Floating Particles */}
      <div className="battleParticles">
        {[...Array(30)].map((_, i) => (
          <span
            key={i}
            className="battleParticle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${4 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          >
            ✨
          </span>
        ))}
      </div>

      <div className="battleContainer">
        {/* Header */}
        <div className="battleHeader">
          <div>
            <div className="battleLabel">
              FINAL BATTLE
            </div>

            <h1>Lava Dragon</h1>
          </div>

          <div className="levelBadge">
            LVL 5
          </div>
        </div>

        {/* Boss HP */}
        <div className="bossHPCard">
          <div className="hpTop">
            <span>Boss HP</span>
            <span>{bossHP}/100</span>
          </div>

          <div className="hpBar">
            <motion.div
              animate={{ width: `${bossHP}%` }}
              className="hpFill"
            ></motion.div>
          </div>
        </div>

        {/* Boss Monster */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="bossMonster"
        >
          👹
        </motion.div>

        {/* Combo Section */}
        <div className="comboCard">
          <div className="comboItem">
            <Flame size={20} />
            <span>Combo x{combo}</span>
          </div>

          <div className="comboItem">
            <Shield size={20} />
            <span>Shield 80%</span>
          </div>

          <div className="comboItem">
            <Zap size={20} />
            <span>Mana 60%</span>
          </div>
        </div>

        {/* Question */}
        <div className="questionCard">
          <div className="questionLabel">
            Solve the Fire Rune
          </div>

          <h2>8 × 7 = ?</h2>
        </div>

        {/* Answer Buttons */}
        <div className="answersGrid">
          {answers.map((answer) => (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              key={answer}
              onClick={() => attackBoss(answer)}
              className="answerButton"
            >
              {answer}
            </motion.button>
          ))}
        </div>

        {/* Victory Popup */}
        {showVictory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="victoryPopup"
          >
            <div className="victoryEmoji">
              🏆
            </div>

            <h2>Boss Defeated!</h2>

            <p>
              You earned 250 XP and unlocked
              Fire Spell Magic!
            </p>

            <div className="rewardRow">
              <div className="rewardBox">
                ✨ +250 XP
              </div>

              <div className="rewardBox">
                💎 +50 Gems
              </div>
            </div>

            <button className="continueButton">
              Continue Adventure
            </button>
          </motion.div>
        )}

        {/* Bottom Arena */}
        <div className="arenaFooter">
          <div className="arenaText">
            🔥 Magical Arena Battle
          </div>

          <div className="crownOrb">
            <Crown size={24} />
          </div>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'

import useWorlds from '../hooks/useWorlds'

import { motion } from 'framer-motion'

import Confetti from 'react-confetti'

import {
  Flame,
  Shield,
  Zap,
  Crown,
} from 'lucide-react'

import SpellEffect from '../components/battle/SpellEffect'

import useQuestionEngine from '../hooks/useQuestionEngine'

import useGame from '../hooks/useGame'

import './BossBattle.css'

export default function BossBattle() {
  const [bossHP, setBossHP] =
    useState(100)

  const [showVictory,
    setShowVictory] =
    useState(false)

  const [spell,
    setSpell] =
    useState(null)

  const [screenShake,
    setScreenShake] =
    useState(false)

  const {
    currentQuestion,
    combo,
    score,
    submitAnswer,
  } = useQuestionEngine('easy')

 const { addXP, addGems } =
  useGame()

const { completeWorld } =
  useWorlds()

  const attackBoss = (value) => {
    const isCorrect =
      submitAnswer(value)

    if (isCorrect) {
      const newHP =
        Math.max(bossHP - 20, 0)

      setBossHP(newHP)

      // SPELL EFFECT
      const spells = [
        'fire',
        'ice',
        'lightning',
        'cosmic',
      ]

      const randomSpell =
        spells[
          Math.floor(
            Math.random() *
            spells.length
          )
        ]

      setSpell(randomSpell)

      setTimeout(() => {
        setSpell(null)
      }, 700)

      if (newHP <= 0) {
        setShowVictory(true)

        addXP(250)

        addGems(50)
      }
    } else {
      // SCREEN SHAKE
      setScreenShake(true)

      setTimeout(() => {
        setScreenShake(false)
      }, 500)
    }
  }

  if (!currentQuestion) return null

  return (
    <motion.div
      animate={
        screenShake
          ? {
              x: [-10, 10, -10, 10, 0],
            }
          : {}
      }
      transition={{
        duration: 0.4,
      }}
      className="bossScreen"
    >
      {showVictory && <Confetti />}

      {spell && (
        <SpellEffect type={spell} />
      )}

      <div className="battleGlow glow1"></div>
      <div className="battleGlow glow2"></div>
      <div className="battleGlow glow3"></div>

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

        <div className="bossHPCard">
          <div className="hpTop">
            <span>Boss HP</span>

            <span>{bossHP}/100</span>
          </div>

          <div className="hpBar">
            <motion.div
              animate={{
                width: `${bossHP}%`,
              }}
              className="hpFill"
            ></motion.div>
          </div>
        </div>

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

            <span>Score {score}</span>
          </div>
        </div>

        <div className="questionCard">
          <div className="questionLabel">
            Solve the Fire Rune
          </div>

          <h2>
            {currentQuestion.question}
          </h2>
        </div>

        <div className="answersGrid">
          {currentQuestion.answers.map(
            (answer) => (
              <motion.button
                whileHover={{
                  scale: 1.04,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                key={answer}
                onClick={() =>
                  attackBoss(answer)
                }
                className="answerButton"
              >
                {answer}
              </motion.button>
            )
          )}
        </div>

        {showVictory && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="victoryPopup"
          >
            <div className="victoryEmoji">
              🏆
            </div>

            <h2>Boss Defeated!</h2>

            <p>
              You earned 250 XP and
              unlocked magical spell powers!
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

        <div className="arenaFooter">
          <div className="arenaText">
            🔥 Magical Arena Battle
          </div>

          <div className="crownOrb">
            <Crown size={24} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
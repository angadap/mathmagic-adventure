import { useState } from 'react'

import { motion } from 'framer-motion'

import {
  Flame,
  Gem,
  Trophy,
} from 'lucide-react'

import PageLayout from '../components/ui/PageLayout'

import QuestionCard
from '../components/game/QuestionCard'

import SpellCast
from '../components/magic/SpellCast'

import {
  mathQuestions,
} from '../data/questions'

import useGame
from '../hooks/useGame'

import './MathBattleScreen.css'

export default function MathBattleScreen() {
  const [currentIndex,
    setCurrentIndex] =
    useState(0)

  const [message,
    setMessage] =
    useState('')

  const [combo,
    setCombo] =
    useState(0)

  const { addXP, addGems } =
    useGame()

  const currentQuestion =
    mathQuestions[currentIndex]

  const handleAnswer = (
    selected
  ) => {
    if (
      selected ===
      currentQuestion.answer
    ) {
      setMessage(
        '✨ Correct Spell Cast!'
      )

      setCombo((prev) => prev + 1)

      addXP(50)

      addGems(10)
    } else {
      setMessage(
        '❌ Wrong Spell!'
      )

      setCombo(0)
    }

    setTimeout(() => {
      const next =
        currentIndex + 1

      if (
        next <
        mathQuestions.length
      ) {
        setCurrentIndex(next)
      } else {
        setMessage(
          '🏆 Battle Completed!'
        )
      }
    }, 1200)
  }

  return (
    <PageLayout>
      <div className="mathBattleScreen">
        <div className="battleHeader">
          <div className="battleBadge">
            MATH BATTLE
          </div>

          <h1>Spell Arena</h1>

          <p>
            Solve maths to cast
            magical attacks.
          </p>
        </div>

        <div className="battleStats">
          <div className="battleStat">
            <Flame size={18} />

            Combo: {combo}
          </div>

          <div className="battleStat">
            <Gem size={18} />

            +10 Gems
          </div>

          <div className="battleStat">
            <Trophy size={18} />

            +50 XP
          </div>
        </div>

        <div className="spellArea">
          <SpellCast type="fire" />
        </div>

        {currentIndex <
        mathQuestions.length ? (
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="battleComplete"
          >
            🏆 Victory!
          </motion.div>
        )}

        {message && (
          <div className="battleMessage">
            {message}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
import { useEffect, useState } from 'react'

import {
  generateQuestion,
} from '../utils/questionGenerator'

export default function useQuestionEngine(
  difficulty = 'easy'
) {
  const [currentQuestion,
    setCurrentQuestion] =
    useState(null)

  const [score, setScore] = useState(0)

  const [combo, setCombo] = useState(0)

  const nextQuestion = () => {
    setCurrentQuestion(
      generateQuestion(difficulty)
    )
  }

  useEffect(() => {
    nextQuestion()
  }, [])

  const submitAnswer = (value) => {
    if (
      value === currentQuestion.answer
    ) {
      setScore((prev) => prev + 10)

      setCombo((prev) => prev + 1)

      nextQuestion()

      return true
    } else {
      setCombo(0)

      return false
    }
  }

  return {
    currentQuestion,
    score,
    combo,
    submitAnswer,
  }
}
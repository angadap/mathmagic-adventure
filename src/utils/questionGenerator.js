import {
  difficultyLevels,
  operations,
} from '../data/questions'

function randomNumber(min, max) {
  return (
    Math.floor(
      Math.random() * (max - min + 1)
    ) + min
  )
}

function randomOperation() {
  return operations[
    Math.floor(
      Math.random() * operations.length
    )
  ]
}

export function generateQuestion(
  difficulty = 'easy'
) {
  const level =
    difficultyLevels[difficulty]

  const num1 = randomNumber(
    level.min,
    level.max
  )

  const num2 = randomNumber(
    level.min,
    level.max
  )

  const operation = randomOperation()

  let answer = 0

  switch (operation) {
    case '+':
      answer = num1 + num2
      break

    case '-':
      answer = num1 - num2
      break

    case '×':
      answer = num1 * num2
      break

    default:
      answer = 0
  }

  const wrongAnswers = [
    answer + randomNumber(1, 10),
    answer - randomNumber(1, 10),
    answer + randomNumber(11, 20),
  ]

  const answers = [
    answer,
    ...wrongAnswers,
  ].sort(() => Math.random() - 0.5)

  return {
    question: `${num1} ${operation} ${num2}`,
    answer,
    answers,
  }
}
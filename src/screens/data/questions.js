export const difficultyLevels = {
  easy: {
    min: 1,
    max: 10,
  },

  medium: {
    min: 10,
    max: 30,
  },

  hard: {
    min: 30,
    max: 100,
  },
}

export const operations = [
  '+',
  '-',
  '×',
]

export const mathQuestions = [
  {
    id: 1,
    question: '12 + 8',
    options: [18, 20, 22, 24],
    answer: 20,
    difficulty: 'Easy',
  },

  {
    id: 2,
    question: '9 × 7',
    options: [54, 63, 72, 81],
    answer: 63,
    difficulty: 'Medium',
  },

  {
    id: 3,
    question: '45 ÷ 5',
    options: [8, 9, 10, 12],
    answer: 9,
    difficulty: 'Easy',
  },

  {
    id: 4,
    question: '15 × 6',
    options: [90, 80, 75, 95],
    answer: 90,
    difficulty: 'Hard',
  },
]
import { motion } from 'framer-motion'

import './QuestionCard.css'

export default function QuestionCard({
  question,
  onAnswer,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="questionCard"
    >
      <div className="difficultyBadge">
        {question.difficulty}
      </div>

      <h2 className="questionText">
        {question.question}
      </h2>

      <div className="optionsGrid">
        {question.options.map(
          (option) => (
            <button
              key={option}
              onClick={() =>
                onAnswer(option)
              }
              className="optionButton"
            >
              {option}
            </button>
          )
        )}
      </div>
    </motion.div>
  )
}
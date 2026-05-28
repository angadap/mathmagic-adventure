import { motion } from 'framer-motion'

import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react'

import PageLayout from '../components/ui/PageLayout'
import GlassCard from '../components/ui/GlassCard'

import {
  storyChapters,
} from '../data/storyChapters'

import useQuest from '../hooks/useQuest'

import './StoryScreen.css'

export default function StoryScreen() {
  const {
    completedQuests,
    completeQuest,
  } = useQuest()

  return (
    <PageLayout>
      <div className="storyScreen">
        <div className="storyHeader">
          <div className="storyBadge">
            STORY QUESTS
          </div>

          <h1>Magic Chronicles</h1>

          <p>
            Complete magical story
            missions and unlock kingdoms.
          </p>
        </div>

        <div className="storyGrid">
          {storyChapters.map(
            (chapter, index) => {
              const completed =
                completedQuests.includes(
                  chapter.id
                )

              return (
                <motion.div
                  key={chapter.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.1,
                  }}
                >
                  <GlassCard
                    className={`storyCard ${
                      !chapter.unlocked
                        ? 'lockedStory'
                        : ''
                    }`}
                  >
                    <div className="storyTop">
                      <div className="storyEmoji">
                        {chapter.emoji}
                      </div>

                      {!chapter.unlocked && (
                        <Lock size={20} />
                      )}
                    </div>

                    <h2>
                      {chapter.title}
                    </h2>

                    <div className="storyTeacher">
                      {chapter.teacher}
                    </div>

                    <p>
                      {
                        chapter.objective
                      }
                    </p>

                    <div className="storyReward">
                      <Sparkles
                        size={18}
                      />

                      {
                        chapter.reward
                      }
                    </div>

                    {chapter.unlocked && (
                      <button
                        onClick={() =>
                          completeQuest(
                            chapter.id
                          )
                        }
                        className={`storyButton ${
                          completed
                            ? 'completedBtn'
                            : ''
                        }`}
                      >
                        {completed ? (
                          <>
                            <CheckCircle2
                              size={18}
                            />

                            Completed
                          </>
                        ) : (
                          <>
                            <BookOpen
                              size={18}
                            />

                            Start Quest
                          </>
                        )}
                      </button>
                    )}
                  </GlassCard>
                </motion.div>
              )
            }
          )}
        </div>
      </div>
    </PageLayout>
  )
}
import {
  createContext,
  useEffect,
  useState,
} from 'react'

export const QuestContext =
  createContext()

export function QuestProvider({
  children,
}) {
  const [completedQuests,
    setCompletedQuests] =
    useState([])

  // LOAD
  useEffect(() => {
    const saved =
      localStorage.getItem(
        'mathmagic-quests'
      )

    if (saved) {
      setCompletedQuests(
        JSON.parse(saved)
      )
    }
  }, [])

  // SAVE
  useEffect(() => {
    localStorage.setItem(
      'mathmagic-quests',
      JSON.stringify(
        completedQuests
      )
    )
  }, [completedQuests])

  const completeQuest = (
    questId
  ) => {
    if (
      completedQuests.includes(
        questId
      )
    )
      return

    setCompletedQuests((prev) => [
      ...prev,
      questId,
    ])
  }

  return (
    <QuestContext.Provider
      value={{
        completedQuests,
        completeQuest,
      }}
    >
      {children}
    </QuestContext.Provider>
  )
}
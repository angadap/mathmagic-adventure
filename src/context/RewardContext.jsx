import {
  createContext,
  useEffect,
  useState,
} from 'react'

export const RewardContext =
  createContext()

export function RewardProvider({
  children,
}) {
  const [streak, setStreak] =
    useState(1)

  const [claimedToday,
    setClaimedToday] =
    useState(false)

  const [showReward,
    setShowReward] =
    useState(false)

  // LOAD SAVE
  useEffect(() => {
    const savedStreak =
      localStorage.getItem(
        'mathmagic-streak'
      )

    const savedDate =
      localStorage.getItem(
        'mathmagic-last-login'
      )

    const today =
      new Date().toDateString()

    if (savedStreak) {
      setStreak(Number(savedStreak))
    }

    if (savedDate !== today) {
      setClaimedToday(false)

      setShowReward(true)
    } else {
      setClaimedToday(true)
    }
  }, [])

  // CLAIM REWARD
  const claimReward = () => {
    const today =
      new Date().toDateString()

    const nextStreak =
      streak + 1

    setStreak(nextStreak)

    setClaimedToday(true)

    setShowReward(false)

    localStorage.setItem(
      'mathmagic-streak',
      nextStreak
    )

    localStorage.setItem(
      'mathmagic-last-login',
      today
    )
  }

  return (
    <RewardContext.Provider
      value={{
        streak,
        claimedToday,
        showReward,
        claimReward,
        setShowReward,
      }}
    >
      {children}
    </RewardContext.Provider>
  )
}


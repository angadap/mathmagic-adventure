import {
  createContext,
  useEffect,
  useState,
} from 'react'

export const GameContext =
  createContext()

export function GameProvider({
  children,
}) {
  const [player, setPlayer] = useState({
    name: 'Math Wizard',
    xp: 1800,
    level: 7,
    gems: 250,
    avatar: '🧙‍♂️',
  })

  // LOAD SAVE
  useEffect(() => {
    const savedPlayer =
      localStorage.getItem('mathmagic-player')

    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer))
    }
  }, [])

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem(
      'mathmagic-player',
      JSON.stringify(player)
    )
  }, [player])

  // XP SYSTEM
  const addXP = (amount) => {
    setPlayer((prev) => ({
      ...prev,
      xp: prev.xp + amount,
    }))
  }

  // GEMS
  const addGems = (amount) => {
    setPlayer((prev) => ({
      ...prev,
      gems: prev.gems + amount,
    }))
  }

  // AVATAR
  const setAvatar = (avatar) => {
    setPlayer((prev) => ({
      ...prev,
      avatar,
    }))
  }

  return (
    <GameContext.Provider
      value={{
        player,
        addXP,
        addGems,
        setAvatar,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
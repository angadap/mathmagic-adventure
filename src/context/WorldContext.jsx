import {
  createContext,
  useEffect,
  useState,
} from 'react'

import { worlds as initialWorlds }
from '../data/worlds'

export const WorldContext =
  createContext()

export function WorldProvider({
  children,
}) {
  const [worlds, setWorlds] =
    useState(initialWorlds)

  // LOAD SAVE
  useEffect(() => {
    const saved =
      localStorage.getItem(
        'mathmagic-worlds'
      )

    if (saved) {
      setWorlds(JSON.parse(saved))
    }
  }, [])

  // SAVE
  useEffect(() => {
    localStorage.setItem(
      'mathmagic-worlds',
      JSON.stringify(worlds)
    )
  }, [worlds])

  // COMPLETE WORLD
  const completeWorld = (
    worldId,
    stars = 3
  ) => {
    setWorlds((prev) =>
      prev.map((world) => {
        // COMPLETE CURRENT
        if (world.id === worldId) {
          return {
            ...world,
            completed: true,
            stars,
          }
        }

        // UNLOCK NEXT
        if (world.id === worldId + 1) {
          return {
            ...world,
            unlocked: true,
          }
        }

        return world
      })
    )
  }

  // RESET SAVE
  const resetWorlds = () => {
    setWorlds(initialWorlds)
  }

  return (
    <WorldContext.Provider
      value={{
        worlds,
        completeWorld,
        resetWorlds,
      }}
    >
      {children}
    </WorldContext.Provider>
  )
}
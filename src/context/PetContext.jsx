import {
  createContext,
  useEffect,
  useState,
} from 'react'

import {
  starterPets,
} from '../data/pets'

export const PetContext =
  createContext()

export function PetProvider({
  children,
}) {
  const [pets, setPets] =
    useState(starterPets)

  // LOAD
  useEffect(() => {
    const saved =
      localStorage.getItem(
        'mathmagic-pets'
      )

    if (saved) {
      setPets(JSON.parse(saved))
    }
  }, [])

  // SAVE
  useEffect(() => {
    localStorage.setItem(
      'mathmagic-pets',
      JSON.stringify(pets)
    )
  }, [pets])

  // LEVEL UP PET
  const levelUpPet = (petId) => {
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              level: pet.level + 1,
            }
          : pet
      )
    )
  }

  // UNLOCK PET
  const unlockPet = (petId) => {
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              unlocked: true,
            }
          : pet
      )
    )
  }

  return (
    <PetContext.Provider
      value={{
        pets,
        levelUpPet,
        unlockPet,
      }}
    >
      {children}
    </PetContext.Provider>
  )
}
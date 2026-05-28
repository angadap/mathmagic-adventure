import {
  createContext,
  useEffect,
  useState,
} from 'react'

import {
  starterItems,
} from '../data/items'

export const InventoryContext =
  createContext()

export function InventoryProvider({
  children,
}) {
  const [items, setItems] =
    useState(starterItems)

  // LOAD SAVE
  useEffect(() => {
    const saved =
      localStorage.getItem(
        'mathmagic-items'
      )

    if (saved) {
      setItems(JSON.parse(saved))
    }
  }, [])

  // SAVE
  useEffect(() => {
    localStorage.setItem(
      'mathmagic-items',
      JSON.stringify(items)
    )
  }, [items])

  // ADD ITEM
  const addItem = (item) => {
    setItems((prev) => {
      const existing =
        prev.find(
          (i) => i.id === item.id
        )

      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity:
                  i.quantity + 1,
              }
            : i
        )
      }

      return [...prev, item]
    })
  }

  return (
    <InventoryContext.Provider
      value={{
        items,
        addItem,
      }}
    >
      {children}
    
    </InventoryContext.Provider>
  )
}
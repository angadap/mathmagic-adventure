import { useContext } from 'react'

import {
  InventoryContext,
} from '../context/InventoryContext'

export default function useInventory() {
  return useContext(
    InventoryContext
  )
}
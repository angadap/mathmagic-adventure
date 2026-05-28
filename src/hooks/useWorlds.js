import { useContext } from 'react'

import { WorldContext }
from '../context/WorldContext'

export default function useWorlds() {
  return useContext(WorldContext)
}
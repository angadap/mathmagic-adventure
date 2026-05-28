import { useContext } from 'react'

import {
  PetContext,
} from '../context/PetContext'

export default function usePets() {
  return useContext(PetContext)
}
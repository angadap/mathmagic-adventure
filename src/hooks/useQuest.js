import { useContext } from 'react'

import {
  QuestContext,
} from '../context/QuestContext'

export default function useQuest() {
  return useContext(QuestContext)
}
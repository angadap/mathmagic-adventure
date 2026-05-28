import { useContext } from 'react'

import {
  RewardContext,
} from '../context/RewardContext'

export default function useRewards() {
  return useContext(RewardContext)
}
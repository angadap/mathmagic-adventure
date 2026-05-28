import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import PageLayout from '../components/ui/PageLayout'
import GlassCard from '../components/ui/GlassCard'
import GlowButton from '../components/ui/GlowButton'

import useGame from '../hooks/useGame'

import './AvatarSelection.css'

const avatars = [
  {
    id: 1,
    name: 'Star Wizard',
    emoji: '🧙‍♂️',
    power: 'Cosmic Spells',
  },
  {
    id: 2,
    name: 'Dragon Tamer',
    emoji: '🐉',
    power: 'Fire Attacks',
  },
  {
    id: 3,
    name: 'Galaxy Knight',
    emoji: '⚔️',
    power: 'Mega Combos',
  },
  {
    id: 4,
    name: 'Ice Sorceress',
    emoji: '❄️',
    power: 'Freeze Magic',
  },
]

export default function AvatarSelection() {
  const [selected, setSelected] =
    useState(null)

  const navigate = useNavigate()

  const { setAvatar } = useGame()

  const handleStart = () => {
    const selectedAvatar = avatars.find(
      (a) => a.id === selected
    )

    if (!selectedAvatar) return

    setAvatar(selectedAvatar.emoji)

    navigate('/')
  }

  return (
    <PageLayout>
      <div className="avatarScreen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="avatarHeader"
        >
          <div className="avatarBadge">
            CHOOSE YOUR HERO
          </div>

          <h1>Select Avatar</h1>

          <p>
            Choose your magical character
            and begin your maths adventure.
          </p>
        </motion.div>

        <div className="avatarGrid">
          {avatars.map((avatar) => (
            <motion.div
              key={avatar.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setSelected(avatar.id)
              }
            >
              <GlassCard
                className={
                  selected === avatar.id
                    ? 'selectedAvatar'
                    : ''
                }
              >
                <div className="avatarEmoji">
                  {avatar.emoji}
                </div>

                <h2>{avatar.name}</h2>

                <p>{avatar.power}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="avatarButton">
          <GlowButton
            fullWidth
            onClick={handleStart}
          >
            Start Adventure
          </GlowButton>
        </div>
      </div>
    </PageLayout>
  )
}
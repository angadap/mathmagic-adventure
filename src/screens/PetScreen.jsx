import { motion } from 'framer-motion'

import {
  Shield,
  Sparkles,
  Lock,
} from 'lucide-react'

import PageLayout from '../components/ui/PageLayout'
import GlassCard from '../components/ui/GlassCard'

import usePets from '../hooks/usePets'

import './PetScreen.css'

export default function PetScreen() {
  const { pets } = usePets()

  return (
    <PageLayout>
      <div className="petScreen">
        <div className="petHeader">
          <div className="petBadge">
            MAGICAL COMPANIONS
          </div>

          <h1>Pet Kingdom</h1>

          <p>
            Train magical pets and
            evolve powerful companions.
          </p>
        </div>

        <div className="petGrid">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.1,
              }}
            >
              <GlassCard
                className={`petCard ${
                  !pet.unlocked
                    ? 'lockedPet'
                    : ''
                }`}
              >
                <div className="petTop">
                  <div className="petEmoji">
                    {pet.emoji}
                  </div>

                  {!pet.unlocked && (
                    <div className="petLock">
                      <Lock size={18} />
                    </div>
                  )}
                </div>

                <h2>{pet.name}</h2>

                <p>{pet.element} Element</p>

                <div className="petBottom">
                  <div className="petLevel">
                    LVL {pet.level}
                  </div>

                  <div
                    className={`petRarity ${pet.rarity.toLowerCase()}`}
                  >
                    {pet.rarity}
                  </div>
                </div>

                <div className="petSkills">
                  <div className="skill">
                    <Shield size={16} />

                    <span>
                      +10 Battle Shield
                    </span>
                  </div>

                  <div className="skill">
                    <Sparkles size={16} />

                    <span>
                      Magic Boost
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
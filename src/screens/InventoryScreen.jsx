import { motion } from 'framer-motion'

import {
  Backpack,
  Sparkles,
} from 'lucide-react'

import PageLayout from '../components/ui/PageLayout'
import GlassCard from '../components/ui/GlassCard'

import useInventory from '../hooks/useInventory'

import './InventoryScreen.css'

export default function InventoryScreen() {
  const { items } =
    useInventory()

  return (
    <PageLayout>
      <div className="inventoryScreen">
        <div className="inventoryHeader">
          <div className="inventoryBadge">
            MAGIC INVENTORY
          </div>

          <h1>Treasure Vault</h1>

          <p>
            Collect magical items and
            legendary rewards.
          </p>
        </div>

        <div className="inventoryGrid">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
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
              <GlassCard>
                <div className="itemTop">
                  <div className="itemEmoji">
                    {item.emoji}
                  </div>

                  <div
                    className={`rarity ${item.rarity.toLowerCase()}`}
                  >
                    {item.rarity}
                  </div>
                </div>

                <h2>{item.name}</h2>

                <p>{item.description}</p>

                <div className="itemBottom">
                  <div className="itemQty">
                    x{item.quantity}
                  </div>

                  <Sparkles size={20} />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="inventoryFooter">
          <Backpack size={22} />

          <span>
            More magical loot coming soon
          </span>
        </div>
      </div>
    </PageLayout>
  )
}
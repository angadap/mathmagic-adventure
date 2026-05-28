import { motion } from 'framer-motion'

import {
  Gem,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'

import PageLayout from '../components/ui/PageLayout'
import GlassCard from '../components/ui/GlassCard'

import { shopItems }
from '../data/shopItems'

import useGame from '../hooks/useGame'

import './ShopScreen.css'

export default function ShopScreen() {
  const { player, addGems } =
    useGame()

  const buyItem = (item) => {
    if (player.gems < item.price) {
      alert('Not enough gems!')
      return
    }

    alert(
      `Purchased ${item.name}!`
    )

    // TEMPORARY GEM DEDUCT
    addGems(-item.price)
  }

  return (
    <PageLayout>
      <div className="shopScreen">
        <div className="shopHeader">
          <div className="shopBadge">
            MAGIC MARKET
          </div>

          <h1>Wizard Shop</h1>

          <p>
            Spend gems on magical loot,
            rare pets and legendary items.
          </p>
        </div>

        <div className="gemBalance">
          <Gem size={22} />

          <span>
            {player.gems} Gems
          </span>
        </div>

        <div className="shopGrid">
          {shopItems.map(
            (item, index) => (
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
                  <div className="shopTop">
                    <div className="shopEmoji">
                      {item.emoji}
                    </div>

                    <div
                      className={`shopRarity ${item.rarity.toLowerCase()}`}
                    >
                      {item.rarity}
                    </div>
                  </div>

                  <h2>{item.name}</h2>

                  <p>{item.category}</p>

                  <div className="shopBottom">
                    <div className="priceTag">
                      💎 {item.price}
                    </div>

                    <button
                      onClick={() =>
                        buyItem(item)
                      }
                      className="buyButton"
                    >
                      <ShoppingBag
                        size={16}
                      />

                      Buy
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )
          )}
        </div>

        <div className="shopFooter">
          <Sparkles size={22} />

          <span>
            New magical items arriving soon
          </span>
        </div>
      </div>
    </PageLayout>
  )
}
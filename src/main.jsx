import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

import { GameProvider }
from './context/GameContext'

import { WorldProvider }
from './context/WorldContext'

import { InventoryProvider }
from './context/InventoryContext'

import { PetProvider }
from './context/PetContext'

import { RewardProvider }
from './context/RewardContext'

import './index.css'
import './styles/theme.css'

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <GameProvider>
      <WorldProvider>
        <InventoryProvider>
          <PetProvider>
            <RewardProvider>
              <App />
            </RewardProvider>
          </PetProvider>
        </InventoryProvider>
      </WorldProvider>
    </GameProvider>
  </React.StrictMode>
)
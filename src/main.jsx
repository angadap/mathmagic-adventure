import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

import { GameProvider }
from './context/GameContext'

import { WorldProvider }
from './context/WorldContext'

import './index.css'
import './styles/theme.css'

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <GameProvider>
      <WorldProvider>
        <App />
      </WorldProvider>
    </GameProvider>
  </React.StrictMode>
)
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import HomeScreen from '../screens/HomeScreen'
import BossBattle from '../screens/BossBattle'
import AvatarSelection from '../screens/AvatarSelection'
import ProfileScreen from '../screens/ProfileScreen'
import AdventureWorldMap from '../screens/AdventureWorldMap'
import InventoryScreen from '../screens/InventoryScreen'
import PetScreen from '../screens/PetScreen'
import LeaderboardScreen from '../screens/LeaderboardScreen'
import ShopScreen from '../screens/ShopScreen'
import StoryScreen from '../screens/StoryScreen'
import MathBattleScreen from '../screens/MathBattleScreen'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomeScreen />}
        />

        <Route
          path="/battle"
          element={
            <MathBattleScreen />
          }
        />

        <Route
          path="/adventure"
          element={<AdventureWorldMap />}
        />

        <Route
          path="/boss"
          element={<BossBattle />}
        />

        <Route
          path="/avatars"
          element={<AvatarSelection />}
        />

        <Route
          path="/profile"
          element={<ProfileScreen />}
        />

        <Route
          path="/inventory"
          element={<InventoryScreen />}
        />

        <Route
          path="/pets"
          element={<PetScreen />}
        />

        <Route
          path="/leaderboard"
          element={<LeaderboardScreen />}
        />

        <Route
          path="/shop"
          element={<ShopScreen />}
        />

        <Route
          path="/story"
          element={<StoryScreen />}
        />
      </Routes>
    </BrowserRouter>
  )
}
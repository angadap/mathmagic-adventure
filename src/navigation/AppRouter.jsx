import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import HomeScreen from '../screens/HomeScreen'
import AdventureMap from '../screens/AdventureMap'
import BossBattle from '../screens/BossBattle'
import AvatarSelection from '../screens/AvatarSelection'
import ProfileScreen from '../screens/ProfileScreen'
import AdventureWorldMap from '../screens/AdventureWorldMap'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomeScreen />}
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
      </Routes>
    </BrowserRouter>
  )
}
import { PlayerProvider, usePlayer } from './player'
import { useRoute, navigate } from './router'
import { Home } from './pages/Home'
import { GameHub } from './pages/GameHub'
import { GamePage } from './pages/GamePage'
import { Scenery } from './components/Scenery'

function Routes() {
  const route = useRoute()
  const { player } = usePlayer()

  // Ohne Spielerdaten immer zur Startseite
  if (!player || route === '/') return <Home />
  if (route.startsWith('/game/')) return <GamePage id={route.slice('/game/'.length)} />
  if (route === '/games') return <GameHub />
  navigate('/')
  return null
}

export function App() {
  return (
    <PlayerProvider>
      <Scenery />
      <main className="page">
        <Routes />
      </main>
    </PlayerProvider>
  )
}

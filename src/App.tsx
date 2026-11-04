import { PlayerProvider, usePlayer } from './player'
import { ScoreProvider } from './score'
import { useRoute, navigate } from './router'
import { Home } from './pages/Home'
import { GameHub } from './pages/GameHub'
import { GamePage } from './pages/GamePage'
import { Scenery } from './components/Scenery'
import { ScoreBadge } from './components/ScoreBadge'

function Routes() {
  const route = useRoute()
  const { player } = usePlayer()

  // Ohne Spielerdaten immer zur Startseite
  if (!player || route === '/') return <Home />

  let page = null
  if (route.startsWith('/game/')) page = <GamePage id={route.slice('/game/'.length)} />
  else if (route === '/games') page = <GameHub />
  else {
    navigate('/')
    return null
  }
  return (
    <>
      <ScoreBadge />
      {page}
    </>
  )
}

export function App() {
  return (
    <PlayerProvider>
      <ScoreProvider>
        <Scenery />
        <main className="page">
          <Routes />
        </main>
      </ScoreProvider>
    </PlayerProvider>
  )
}

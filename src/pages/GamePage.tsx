import { Suspense } from 'react'
import { games } from '../games/registry'
import { usePlayer } from '../player'
import { navigate } from '../router'

export function GamePage({ id }: { id: string }) {
  const { player } = usePlayer()
  const game = games.find((g) => g.id === id)
  if (!player || !game) {
    navigate('/games')
    return null
  }
  const Game = game.component
  return (
    <Suspense fallback={<div className="center-stack"><div className="logo spin">🚒</div></div>}>
      <Game player={player} onExit={() => navigate('/games')} />
    </Suspense>
  )
}

import { useCallback, useRef } from 'react'
import type { GameProps } from '../types'
import { useScore } from '../../score'
import { MiniGameEscapeRoute } from './MiniGameEscapeRoute'

// Verbindet das eigenständige Modul mit der Plattform (Punkte, Zurück-Navigation).
export default function EscapeRouteGame({ player, onExit }: GameProps) {
  const { addPoints } = useScore()
  const last = useRef(0)

  const onScoreUpdate = useCallback(
    (score: number) => {
      const delta = score - last.current
      if (delta > 0) addPoints(delta, 'weg-ins-freie')
      last.current = score // bei "Nochmal" springt der Wert auf 0 zurück
    },
    [addPoints],
  )

  return (
    <div className="game">
      <div className="game-head">
        <button className="btn small" onClick={onExit}>⬅️ Zurück</button>
        <h1>🏃 Der Weg ins Freie</h1>
      </div>
      <MiniGameEscapeRoute difficulty={player.difficulty} playerName={player.name} onScoreUpdate={onScoreUpdate} onFinish={onExit} />
    </div>
  )
}

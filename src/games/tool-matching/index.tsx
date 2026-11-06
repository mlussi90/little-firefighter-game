import { useCallback, useRef } from 'react'
import type { GameProps } from '../types'
import { useScore } from '../../score'
import { MiniGameToolMatching } from './MiniGameToolMatching'

// Verbindet das eigenständige Modul mit der Plattform (Punkte, Zurück-Navigation).
export default function ToolMatchingGame({ player, onExit }: GameProps) {
  const { addPoints } = useScore()
  const last = useRef(0)

  const onScoreUpdate = useCallback(
    (score: number) => {
      const delta = score - last.current
      if (delta > 0) addPoints(delta, 'werkzeug')
      last.current = score // bei "Nochmal" springt der Wert auf 0 zurück
    },
    [addPoints],
  )

  return (
    <div className="game">
      <div className="game-head">
        <button className="btn small" onClick={onExit}>⬅️ Zurück</button>
        <h1>🪜 Das richtige Werkzeug</h1>
      </div>
      <MiniGameToolMatching difficulty={player.difficulty} playerName={player.name} onScoreUpdate={onScoreUpdate} onComplete={onExit} />
    </div>
  )
}

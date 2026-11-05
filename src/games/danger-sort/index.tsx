import { useCallback, useRef } from 'react'
import type { GameProps } from '../types'
import { useScore } from '../../score'
import { MiniGameDangerSort } from './MiniGameDangerSort'

// Verbindet das eigenständige Modul mit der Plattform (Punkte, Zurück-Navigation).
export default function DangerSortGame({ player, onExit }: GameProps) {
  const { addPoints } = useScore()
  const last = useRef(0)

  const onScoreUpdate = useCallback(
    (score: number) => {
      const delta = score - last.current
      if (delta > 0) addPoints(delta, 'gefahr-oder-sicher')
      last.current = score // bei "Nochmal" springt der Wert auf 0 zurück
    },
    [addPoints],
  )

  return (
    <div className="game">
      <div className="game-head">
        <button className="btn small" onClick={onExit}>⬅️ Zurück</button>
        <h1>✋ Gefahr oder sicher?</h1>
      </div>
      <MiniGameDangerSort
        difficulty={player.difficulty}
        playerName={player.name}
        onScoreUpdate={onScoreUpdate}
        onComplete={onExit}
      />
    </div>
  )
}

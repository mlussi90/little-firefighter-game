import type { GameProps } from '../types'

// Platzhalter – das Leitstellenspiel wird separat entwickelt.
export default function Dispatch({ player, onExit }: GameProps) {
  return (
    <div className="center-stack">
      <h1>📞 Leitstelle</h1>
      <p>Hallo {player.name || 'Feuerwehrfreund'}, hier entsteht bald das Spiel!</p>
      <button className="btn" onClick={onExit}>⬅️ Zurück</button>
    </div>
  )
}

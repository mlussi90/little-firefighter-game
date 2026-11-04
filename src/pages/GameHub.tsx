import { games } from '../games/registry'
import { usePlayer } from '../player'
import { navigate } from '../router'
import { speak } from '../speech'
import { DIFFICULTIES } from '../types'

export function GameHub() {
  const { player } = usePlayer()
  if (!player) return null
  const level = DIFFICULTIES.find((d) => d.id === player.difficulty)!
  const greeting = player.name ? `Hallo ${player.name}!` : 'Hallo!'

  return (
    <div className="hub">
      <header className="hub-head">
        <button className="btn small" onClick={() => navigate('/')}>⚙️ Ändern</button>
        <div>
          <h1 onClick={() => speak(`${greeting} Was möchtest du spielen?`)}>{greeting} 👋</h1>
          <p className="lead">Was möchtest du spielen? <span className="badge">{level.emoji} {level.label}</span></p>
        </div>
      </header>

      <div className="grid">
        {games.map((g) => (
          <button
            key={g.id}
            className="game-card"
            style={{ ['--c' as string]: g.color }}
            onClick={() => {
              speak(g.title)
              navigate(`/game/${g.id}`)
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              speak(g.description)
            }}
          >
            <span className="game-emoji">{g.emoji}</span>
            <strong>{g.title}</strong>
            <small>{g.description}</small>
            {g.comingSoon && <span className="ribbon">Bald da!</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { usePlayer } from '../player'
import { navigate } from '../router'
import { speak } from '../speech'
import { DIFFICULTIES, type Difficulty } from '../types'

export function Home() {
  const { player, setPlayer } = usePlayer()
  const [name, setName] = useState(player?.name ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty>(player?.difficulty ?? 'easy')

  const start = () => {
    const trimmed = name.trim()
    setPlayer({ name: trimmed, difficulty })
    speak(trimmed ? `Auf geht's, ${trimmed}!` : `Auf geht's!`)
    navigate('/games')
  }

  return (
    <div className="card home">
      <div className="logo">🚒</div>
      <h1>Feuerwehr<br />Abenteuer</h1>
      <p className="lead">Hilf der Feuerwehr bei ihren Einsätzen!</p>

      <label className="field">
        <span>Wie heißt du? <small>(du musst nicht)</small></span>
        <input
          value={name}
          maxLength={20}
          placeholder="Dein Name"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && start()}
        />
      </label>

      <div className="field">
        <span>Wie schwer soll es sein?</span>
        <div className="levels">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`level ${difficulty === d.id ? 'active' : ''}`}
              onClick={() => {
                setDifficulty(d.id)
                speak(d.label)
              }}
            >
              <span className="level-emoji">{d.emoji}</span>
              <strong>{d.label}</strong>
              <small>{d.hint}</small>
            </button>
          ))}
        </div>
      </div>

      <button className="btn big" onClick={start}>▶️ Los geht's!</button>
    </div>
  )
}

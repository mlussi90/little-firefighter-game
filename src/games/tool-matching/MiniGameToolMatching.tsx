import { useEffect, useMemo, useRef, useState } from 'react'
import type { Difficulty } from '../../types'
import { speak, speakAsync, stopSpeaking } from '../../speech'
import { playGentle, playSuccess } from '../../sound'
import { SCENARIOS, type Scenario } from './scenarios'
import './tool-matching.css'

export type { Scenario, Tool } from './scenarios'

export interface MiniGameToolMatchingProps {
  /** Alle möglichen Einsätze; Standard: das Daten-Array aus scenarios.ts. */
  scenarios?: readonly Scenario[]
  /** Anzahl Runden pro Durchgang (Standard 5, höchstens so viele wie Einsätze). */
  rounds?: number
  difficulty?: Difficulty
  playerName?: string
  /** Wird aufgerufen, wenn alle Runden gespielt sind und das Kind „Fertig" wählt. */
  onComplete: () => void
  /** Aktueller Punktestand dieses Durchgangs (springt bei „Nochmal" auf 0). */
  onScoreUpdate?: (score: number) => void
}

const POINTS: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 }
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const shuffle = <T,>(a: readonly T[]): T[] => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Wählt Einsätze aus und mischt bei jedem die Reihenfolge der Werkzeuge. */
const buildRounds = (source: readonly Scenario[], n: number): Scenario[] =>
  shuffle(source)
    .slice(0, n)
    .map((s) => ({ ...s, availableTools: shuffle(s.availableTools) }))

type Phase = 'intro' | 'play' | 'done'

export function MiniGameToolMatching({
  scenarios = SCENARIOS,
  rounds = 5,
  difficulty = 'easy',
  playerName = '',
  onComplete,
  onScoreUpdate,
}: MiniGameToolMatchingProps) {
  const [round, setRound] = useState(() => buildRounds(scenarios, rounds))
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('intro')
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [rightId, setRightId] = useState<string | null>(null)
  const [hintId, setHintId] = useState<string | null>(null)

  const scenario = round[idx]
  const solved = rightId !== null
  const busy = useRef(false)
  const wrongThisRound = useRef(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    onScoreUpdate?.(score)
  }, [score, onScoreUpdate])

  // Einsatz vorlesen
  useEffect(() => {
    if (phase === 'intro') speak('Alarm! Wähle das richtige Werkzeug für jeden Einsatz.')
    if (phase === 'play' && scenario) speak(`${scenario.problemDescription} Welches Werkzeug hilft?`)
  }, [phase, idx, scenario])

  const choose = async (toolId: string) => {
    if (busy.current || phase !== 'play') return
    busy.current = true

    if (toolId === scenario.correctToolId) {
      setRightId(toolId)
      playSuccess()
      const points = wrongThisRound.current ? Math.ceil(POINTS[difficulty] / 2) : POINTS[difficulty]
      setScore((s) => s + points)
      const lob = playerName ? `Super, ${playerName}!` : 'Super!'
      await speakAsync(`${lob} ${scenario.solvedText}`)
      await wait(400)
      if (!alive.current) return
      setRightId(null)
      setHintId(null)
      wrongThisRound.current = false
      if (idx + 1 < round.length) setIdx(idx + 1)
      else setPhase('done')
      busy.current = false
    } else {
      // Falsch: sanftes Feedback, ohne Punktabzug
      wrongThisRound.current = true
      setMistakes((m) => m + 1)
      setWrongId(toolId)
      playGentle()
      if (difficulty === 'easy') setHintId(scenario.correctToolId)
      speak('Hoppla! Versuch es nochmal.')
      await wait(600)
      if (!alive.current) return
      setWrongId(null)
      busy.current = false
    }
  }

  const restart = () => {
    setRound(buildRounds(scenarios, rounds))
    setIdx(0)
    setScore(0)
    setMistakes(0)
    setWrongId(null)
    setRightId(null)
    setHintId(null)
    wrongThisRound.current = false
    busy.current = false
    setPhase('play')
  }

  const stars = useMemo(() => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1), [mistakes])

  if (phase === 'intro') {
    return (
      <div className="center-stack card">
        <div className="logo">🚒</div>
        <h2>Welches Werkzeug hilft?</h2>
        <p className="lead">Schau dir den Einsatz an und tippe das richtige Werkzeug an.</p>
        <button className="btn big" onClick={() => setPhase('play')}>▶️ Los geht's!</button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="center-stack card">
        <div className="logo">🏆</div>
        <h2>Prima{playerName ? `, ${playerName}` : ''}!</h2>
        <p className="sterne">{'⭐'.repeat(stars) + '☆'.repeat(3 - stars)}</p>
        <p className="lead">{score} Punkte</p>
        <div className="row">
          <button className="btn big" onClick={restart}>🔁 Nochmal</button>
          <button className="btn" onClick={onComplete}>🏠 Fertig</button>
        </div>
      </div>
    )
  }

  return (
    <div className="tm">
      <div className="szene-bar">
        <span className="dots" aria-label={`Einsatz ${idx + 1} von ${round.length}`}>
          {round.map((_, i) => (
            <i key={i} className={i < idx ? 'done' : i === idx ? 'now' : ''} />
          ))}
        </span>
      </div>

      <div
        key={scenario.id}
        className={`tm-scene ${scenario.id === 'keller' ? 'dark' : ''}`}
        style={{ background: scenario.background }}
        role="img"
        aria-label={solved ? scenario.solvedText : scenario.problemDescription}
      >
        <div className={`tm-icon problem ${solved ? 'gone' : ''}`}>{scenario.problemIcon}</div>
        {solved && <div className="tm-icon solved">{scenario.solvedIcon}</div>}
        <div className="tm-text" aria-live="polite">{solved ? '✅ Geschafft!' : scenario.problemDescription}</div>
        <button className="btn small" onClick={() => speak(`${scenario.problemDescription} Welches Werkzeug hilft?`)}>🔊 Nochmal anhören</button>
      </div>

      <div className="tm-tools" role="group" aria-label="Werkzeuge">
        {scenario.availableTools.map((t) => (
          <button
            key={t.id}
            className={`tm-tool ${wrongId === t.id ? 'wrong' : ''} ${rightId === t.id ? 'right' : ''} ${hintId === t.id && !solved ? 'hint' : ''} ${solved && rightId !== t.id ? 'faded' : ''}`}
            onClick={() => void choose(t.id)}
            disabled={solved}
            aria-label={t.name}
          >
            <span className="tm-tool-icon" aria-hidden="true">{t.icon}</span>
            <span className="tm-tool-name">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

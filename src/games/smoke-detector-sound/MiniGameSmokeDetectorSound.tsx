import { useEffect, useMemo, useRef, useState } from 'react'
import type { Difficulty } from '../../types'
import { speak, speakAsync, stopSpeaking } from '../../speech'
import { playGentle, playSuccess } from '../../sound'
import { playTrack, unlockAudio, type PlayingTrack } from './playTrack'
import { TRACKS, type AudioTrack } from './tracks'
import './smoke-detector-sound.css'

export type { AudioTrack } from './tracks'

export interface MiniGameSmokeDetectorSoundProps {
  /** Alle Geräusche (mind. ein Rauchmelder und ein Alltagsgeräusch); Standard: tracks.ts. */
  tracks?: readonly AudioTrack[]
  /** Anzahl Runden (Standard 5). */
  rounds?: number
  difficulty?: Difficulty
  playerName?: string
  /** Wird aufgerufen, wenn alle Runden gespielt sind und das Kind „Fertig" wählt. */
  onComplete?: () => void
  /** Aktueller Punktestand dieses Durchgangs (springt bei „Nochmal" auf 0). */
  onScoreUpdate?: (score: number) => void
}

type Phase = 'intro' | 'play' | 'done'
type Stage = 'waiting' | 'normal-sound' | 'alarm-sound' | 'result'
type Answer = 'alarm' | 'normal' | null

const POINTS: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 }
/** Bis wann die Reaktion als „schnell" gilt (volle Punkte). */
const FAST_MS: Record<Difficulty, number> = { easy: 4000, medium: 3000, hard: 2000 }
const ALARM_TIMEOUT_MS = 8000
const WAIT_MIN = 2000
const WAIT_MAX = 5000

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const shuffle = <T,>(a: readonly T[]): T[] => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Etwa 3 von 5 Runden sind Rauchmelder, der Rest Alltagsgeräusche (ohne direkte Wiederholung). */
function buildRounds(tracks: readonly AudioTrack[], n: number): AudioTrack[] {
  const alarms = tracks.filter((t) => t.isSmokeAlarm)
  const normals = shuffle(tracks.filter((t) => !t.isSmokeAlarm))
  if (alarms.length === 0 || normals.length === 0) return shuffle(tracks).slice(0, n)
  const alarmCount = Math.max(1, Math.min(n - 1, Math.ceil(n * 0.6)))
  const list: AudioTrack[] = []
  for (let i = 0; i < n - alarmCount; i++) list.push(normals[i % normals.length])
  for (let i = 0; i < alarmCount; i++) list.push(alarms[Math.floor(Math.random() * alarms.length)])
  return shuffle(list)
}

export function MiniGameSmokeDetectorSound({
  tracks = TRACKS,
  rounds = 5,
  difficulty = 'easy',
  playerName = '',
  onComplete,
  onScoreUpdate,
}: MiniGameSmokeDetectorSoundProps) {
  const [list, setList] = useState(() => buildRounds(tracks, rounds))
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('intro')
  const [stage, setStage] = useState<Stage>('waiting')
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [reactions, setReactions] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [resultIcon, setResultIcon] = useState('')
  const [notice, setNotice] = useState('')

  const track = list[idx]
  const alive = useRef(true)
  const runId = useRef(0)
  const playing = useRef<PlayingTrack | null>(null)
  const listening = useRef<((a: Answer) => void) | null>(null)
  const soundStart = useRef(0)
  const soundOn = useRef(false)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      runId.current++
      playing.current?.stop()
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    onScoreUpdate?.(score)
  }, [score, onScoreUpdate])

  const name = playerName ? `, ${playerName}` : ''

  // Eine Runde ablaufen lassen
  useEffect(() => {
    if (phase !== 'play') return
    const id = ++runId.current
    const cancelled = () => !alive.current || runId.current !== id

    const waitForAnswer = (ms: number) =>
      new Promise<Answer>((resolve) => {
        const t = setTimeout(() => { listening.current = null; resolve(null) }, ms)
        listening.current = (a) => { clearTimeout(t); listening.current = null; resolve(a) }
      })

    void (async () => {
      setStage('waiting')
      setNotice('')
      setMessage('')
      await speakAsync('Horch genau!')
      if (cancelled()) return
      await wait(WAIT_MIN + Math.random() * (WAIT_MAX - WAIT_MIN))
      if (cancelled()) return

      let ms = 0

      if (track.isSmokeAlarm) {
        setStage('alarm-sound')
        soundOn.current = true
        soundStart.current = performance.now()
        playing.current = playTrack(track, true)
        const answer = await waitForAnswer(ALARM_TIMEOUT_MS)
        ms = performance.now() - soundStart.current
        playing.current?.stop()
        soundOn.current = false
        if (cancelled()) return
        if (answer === 'alarm') {
          const fast = ms <= FAST_MS[difficulty]
          setScore((s) => s + (fast ? POINTS[difficulty] : Math.ceil(POINTS[difficulty] / 2)))
          setReactions((r) => [...r, ms])
          playSuccess()
          setResultIcon('🚪🏃')
          setMessage(`${fast ? 'Super schnell' : 'Gut gemacht'}${name}! Das war der Rauchmelder. Ab nach draußen!`)
        } else {
          setMisses((m) => m + 1)
          playGentle()
          setResultIcon('🚨')
          setMessage('Das war der Rauchmelder! Wenn er hoch piept, gehen wir sofort nach draußen. Beim nächsten Mal klappt es!')
        }
      } else {
        setStage('normal-sound')
        soundOn.current = true
        soundStart.current = performance.now()
        playing.current = playTrack(track, false)
        const answer = await waitForAnswer(playing.current.durationMs + 1200)
        playing.current?.stop()
        soundOn.current = false
        if (cancelled()) return
        if (answer === 'alarm') {
          setMisses((m) => m + 1)
          playGentle()
          setResultIcon(track.icon)
          setMessage(`Hoppla, das war nur ${track.spokenName}. Kein Grund zur Eile!`)
        } else {
          // abgewartet oder „Normal" gedrückt
          setScore((s) => s + POINTS[difficulty])
          playSuccess()
          setResultIcon(track.icon)
          setMessage(`Richtig${name}! Das war nur ${track.spokenName}. Das ist normal.`)
        }
      }

      setStage('result')
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, track])

  // Ergebnistext vorlesen und dann weiter
  useEffect(() => {
    if (stage !== 'result' || !message) return
    const id = runId.current
    void (async () => {
      await speakAsync(message)
      await wait(600)
      if (!alive.current || runId.current !== id) return
      if (idx + 1 < list.length) setIdx(idx + 1)
      else setPhase('done')
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  const answer = (a: 'alarm' | 'normal') => {
    if (stage === 'waiting') {
      setNotice('Noch nichts zu hören. Horch genau!')
      return
    }
    if (stage === 'result') return
    listening.current?.(a)
  }

  const restart = () => {
    runId.current++
    setList(buildRounds(tracks, rounds))
    setIdx(0)
    setScore(0)
    setMisses(0)
    setReactions([])
    setPhase('play')
  }

  const stars = useMemo(() => (misses === 0 ? 3 : misses <= 2 ? 2 : 1), [misses])
  const avgSeconds = reactions.length ? (reactions.reduce((a, b) => a + b, 0) / reactions.length / 1000).toFixed(1) : null

  if (phase === 'intro') {
    return (
      <div className="center-stack card">
        <div className="logo">🚨</div>
        <h2>Rauchmelder-Check</h2>
        <p className="lead">Horch genau! Bei normalen Geräuschen bleibst du ruhig. Piept der Rauchmelder hoch, tippst du schnell auf den grünen Knopf und gehst nach draußen.</p>
        <div className="row">
          <button className="btn small" onClick={() => { unlockAudio(); playTrack(TRACKS.find((t) => t.isSmokeAlarm) ?? tracks[0]); speak('So klingt der Rauchmelder.') }}>🔊 So klingt der Rauchmelder</button>
        </div>
        <button className="btn big" onClick={() => { unlockAudio(); setPhase('play') }}>▶️ Los geht's!</button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="center-stack card">
        <div className="logo">🏆</div>
        <h2>Prima{name}!</h2>
        <p className="sterne">{'⭐'.repeat(stars) + '☆'.repeat(3 - stars)}</p>
        <p className="lead">{score} Punkte{avgSeconds ? ` · Reaktion: ${avgSeconds} Sekunden` : ''}</p>
        <div className="row">
          <button className="btn big" onClick={restart}>🔁 Nochmal</button>
          <button className="btn" onClick={onComplete}>🏠 Fertig</button>
        </div>
      </div>
    )
  }

  const isAlarm = stage === 'alarm-sound'
  return (
    <div className="sd">
      <div className="szene-bar">
        <span className="dots" aria-label={`Runde ${idx + 1} von ${list.length}`}>
          {list.map((_, i) => (
            <i key={i} className={i < idx ? 'done' : i === idx ? 'now' : ''} />
          ))}
        </span>
      </div>

      <div className={`sd-stage ${isAlarm ? 'alarm' : ''}`} aria-live="polite">
        {isAlarm && <span className="sd-blink" aria-hidden="true">🚨</span>}
        {stage === 'waiting' && (
          <>
            <div className="sd-ear">👂</div>
            <div className="sd-text">{notice || 'Horch genau …'}</div>
          </>
        )}
        {(stage === 'normal-sound' || stage === 'alarm-sound') && (
          <>
            <div className="sd-note">🔊</div>
            <div className="sd-text">{isAlarm ? 'Piep! Piep! Piep!' : 'Was ist das?'}</div>
          </>
        )}
        {stage === 'result' && (
          <>
            <div className="sd-result">{resultIcon}</div>
            <div className="sd-text">{message}</div>
          </>
        )}
      </div>

      <div className="sd-actions">
        <button className="sd-alarm-btn" onClick={() => answer('alarm')} disabled={stage === 'result'}>
          🚨 Rauchmelder! Nach draußen! 🚪
        </button>
        <button className="sd-normal-btn" onClick={() => answer('normal')} disabled={stage === 'result'}>
          😌 Normal
        </button>
      </div>
    </div>
  )
}

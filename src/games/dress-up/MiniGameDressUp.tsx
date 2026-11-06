import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import type { Difficulty } from '../../types'
import { speak, speakAsync, stopSpeaking } from '../../speech'
import { playGentle, playSuccess } from '../../sound'
import { EQUIPMENT, type EquipmentItem, type EquipmentSlot } from './equipment'
import './dress-up.css'

export type { EquipmentItem } from './equipment'

export interface MiniGameDressUpProps {
  /** Alle Teile; Standard: das Daten-Array aus equipment.ts. */
  items?: EquipmentItem[]
  difficulty?: Difficulty
  playerName?: string
  /** Wird aufgerufen, wenn das Kind am Ende „Fertig" wählt. */
  onComplete: () => void
  /** Aktueller Punktestand dieses Durchgangs (springt bei „Nochmal" auf 0). */
  onScoreUpdate?: (score: number) => void
}

const POINTS: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 }
const SLOTS: EquipmentSlot[] = ['head', 'body', 'hands', 'feet']
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

let hornCtx: AudioContext | null = null
/** Martinshorn: zweiklang „Tatü-Tata", direkt per Web Audio. */
function playSiren() {
  try {
    hornCtx ??= new AudioContext()
    const c = hornCtx
    if (c.state === 'suspended') void c.resume()
    for (let i = 0; i < 6; i++) {
      const t = c.currentTime + i * 0.5
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(i % 2 ? 392 : 523.25, t)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
      osc.connect(g).connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.5)
    }
  } catch {
    /* kein Ton möglich – Spiel funktioniert trotzdem */
  }
}

export function MiniGameDressUp({ items = EQUIPMENT, difficulty = 'easy', playerName = '', onComplete, onScoreUpdate }: MiniGameDressUpProps) {
  const [layout, setLayout] = useState(() => shuffle(items))
  const [worn, setWorn] = useState<Record<string, EquipmentItem>>({}) // slot → Teil
  const [shaking, setShaking] = useState<string | null>(null)
  const [bubble, setBubble] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [won, setWon] = useState(false)
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null)

  const figureRef = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const alive = useRef(true)
  const busy = useRef(false)

  const correct = useMemo(() => items.filter((i) => i.type === 'correct'), [items])
  const basis = POINTS[difficulty]
  const showHint = difficulty === 'easy'

  useEffect(() => {
    alive.current = true
    speak('Alarm! Zieh dem Feuerwehrmann die richtige Ausrüstung an.')
    return () => {
      alive.current = false
      stopSpeaking()
    }
  }, [])
  useEffect(() => {
    onScoreUpdate?.(score)
  }, [score, onScoreUpdate])

  const finish = async () => {
    busy.current = true
    await wait(700)
    if (!alive.current) return
    setWon(true)
    playSiren()
    await speakAsync(`${playerName ? `Super, ${playerName}! ` : 'Super! '}Fertig angezogen. Das Feuerwehrauto fährt los!`)
  }

  const equip = (item: EquipmentItem) => {
    if (busy.current || worn[item.slot]) return
    if (item.type === 'correct') {
      playSuccess()
      const next = { ...worn, [item.slot]: item }
      setWorn(next)
      setBubble(null)
      setScore((s) => s + basis)
      if (correct.every((c) => next[c.slot]?.id === c.id)) void finish()
      else speak(item.name)
    } else {
      playGentle()
      setMistakes((m) => m + 1)
      setShaking(item.id)
      setBubble('🤔')
      setTimeout(() => setShaking(null), 500)
      speak(item.hint ?? 'Das braucht die Feuerwehr nicht. Versuch etwas anderes!')
    }
  }

  // Antippen oder Ziehen: beides probiert das Teil an der Figur aus.
  const onDown = (e: RPointerEvent<HTMLButtonElement>, item: EquipmentItem) => {
    if (busy.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, y: e.clientY }
    setDrag({ id: item.id, x: 0, y: 0 })
  }
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!start.current) return
    setDrag((d) => d && { ...d, x: e.clientX - start.current!.x, y: e.clientY - start.current!.y })
  }
  const onUp = (e: RPointerEvent<HTMLButtonElement>, item: EquipmentItem) => {
    const s = start.current
    start.current = null
    setDrag(null)
    if (!s) return
    const moved = Math.hypot(e.clientX - s.x, e.clientY - s.y) > 12
    if (!moved) return equip(item)
    const r = figureRef.current?.getBoundingClientRect()
    if (r && e.clientX >= r.left - 20 && e.clientX <= r.right + 20 && e.clientY >= r.top - 20 && e.clientY <= r.bottom + 20) equip(item)
  }

  const restart = () => {
    stopSpeaking()
    setLayout(shuffle(items))
    setWorn({})
    setScore(0)
    setMistakes(0)
    setWon(false)
    setBubble(null)
    busy.current = false
    speak('Alarm! Zieh dem Feuerwehrmann die richtige Ausrüstung an.')
  }

  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
  const wornIds = new Set(Object.values(worn).map((i) => i.id))

  if (won) {
    return (
      <div className="du center-stack card">
        <div className="du-road">
          <div className="du-truck">🚒</div>
        </div>
        <div className="du-siren">🚨</div>
        <h2>Einsatzbereit{playerName ? `, ${playerName}` : ''}!</h2>
        <p className="sterne">{'⭐'.repeat(stars) + '☆'.repeat(3 - stars)}</p>
        <p className="lead">{score} Punkte</p>
        <div className="row">
          <button className="btn big" onClick={restart}>🔁 Nochmal</button>
          <button className="btn" onClick={onComplete}>🏠 Fertig</button>
        </div>
      </div>
    )
  }

  const hintItem = showHint && mistakes > 0 ? correct.find((c) => !worn[c.slot]) : null

  return (
    <div className="du">
      <div className="du-alarm">🚨 Alarm! 🚨</div>
      <div className="du-board">
        <div className="du-figure" ref={figureRef}>
          <div className="du-body" aria-hidden>🧒</div>
          {SLOTS.map((s) => {
            const w = worn[s]
            return (
              <span key={s} className={`du-slot ${s} ${w ? 'on' : ''}`}>
                {w ? w.icon : ''}
              </span>
            )
          })}
          {bubble && <span className="du-bubble">{bubble}</span>}
          <div className="du-progress">
            {correct.map((c) => (
              <span key={c.id} className={worn[c.slot] ? 'done' : ''}>{worn[c.slot] ? '✅' : '⬜'}</span>
            ))}
          </div>
        </div>

        <div className="du-items">
          {layout.map((it) => {
            const isDrag = drag?.id === it.id
            return (
              <button
                key={it.id}
                className={`du-item ${wornIds.has(it.id) ? 'gone' : ''} ${shaking === it.id ? 'shake' : ''} ${isDrag ? 'drag' : ''} ${hintItem?.id === it.id ? 'du-pulse' : ''}`}
                style={isDrag ? { transform: `translate(${drag.x}px, ${drag.y}px) scale(1.15)` } : undefined}
                onPointerDown={(e) => onDown(e, it)}
                onPointerMove={onMove}
                onPointerUp={(e) => onUp(e, it)}
                onPointerCancel={() => {
                  start.current = null
                  setDrag(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') equip(it)
                }}
                aria-label={it.name}
              >
                <span className="du-icon">{it.icon}</span>
                <span className="du-name">{it.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Difficulty } from '../../types'
import { speak, speakAsync, stopSpeaking } from '../../speech'
import { playGentle, playSuccess } from '../../sound'
import { DANGER_ITEMS, type DangerItem } from './items'

type Category = DangerItem['category']

export interface Sounds {
  success: () => void
  gentle: () => void
}

export interface MiniGameDangerSortProps {
  difficulty?: Difficulty
  playerName?: string
  /** Wird aufgerufen, wenn das Kind „Fertig" wählt. */
  onComplete?: () => void
  /** Aktueller Punktestand dieses Durchgangs (springt bei „Nochmal" zurück auf 0). */
  onScoreUpdate?: (score: number) => void
  /** Eigene Sound-Trigger (Standard: eingebaute Web-Audio-Töne). */
  sounds?: Sounds
}

const ITEMS_PER_HALF: Record<Difficulty, number> = { easy: 3, medium: 4, hard: 5 }
const POINTS: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 }
const DEFAULT_SOUNDS: Sounds = { success: playSuccess, gentle: playGentle }

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const shuffle = <T,>(a: readonly T[]): T[] => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

function buildRound(difficulty: Difficulty): DangerItem[] {
  const n = ITEMS_PER_HALF[difficulty]
  const pick = (c: Category) => shuffle(DANGER_ITEMS.filter((i) => i.category === c)).slice(0, n)
  return shuffle([...pick('safe'), ...pick('dangerous')])
}

const ZONES: Record<Category, { icon: string; label: string; spoken: string }> = {
  safe: { icon: '😊🧸', label: 'Spielkiste', spoken: 'Spielzeug kommt in die Spielkiste.' },
  dangerous: { icon: '✋🚫', label: 'Nur für Erwachsene', spoken: 'Gefährliches ist nur für Erwachsene.' },
}

const itemSize = (icon: string) => {
  try {
    return Math.min([...new Intl.Segmenter().segment(icon)].length, 3)
  } catch {
    return 1
  }
}

type Mode = 'idle' | 'drag' | 'fly' | 'back'
type Phase = 'intro' | 'play' | 'done'

export function MiniGameDangerSort({
  difficulty = 'easy',
  playerName = '',
  onComplete,
  onScoreUpdate,
  sounds = DEFAULT_SOUNDS,
}: MiniGameDangerSortProps) {
  const [items, setItems] = useState(() => buildRound(difficulty))
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('intro')
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [pos, setPos] = useState({ x: 0, y: 0, s: 1 })
  const [mode, setMode] = useState<Mode>('idle')
  const [hint, setHint] = useState<Category | null>(null)
  const [bump, setBump] = useState<Category | null>(null)

  const item = items[idx]
  const busy = useRef(false)
  const wrongThisItem = useRef(false)
  const alive = useRef(true)
  const itemRef = useRef<HTMLDivElement>(null)
  const zoneRefs = { safe: useRef<HTMLButtonElement>(null), dangerous: useRef<HTMLButtonElement>(null) }
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null)

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

  // Intro vorlesen / neuen Gegenstand ansagen
  useEffect(() => {
    if (phase === 'intro') speak(`${ZONES.safe.spoken} ${ZONES.dangerous.spoken}`)
    if (phase === 'play') speak(item.spokenName)
  }, [phase, idx, item])

  const decide = useCallback(
    async (zone: Category) => {
      if (busy.current || phase !== 'play') return
      busy.current = true

      if (zone === item.category) {
        // Richtig: Gegenstand fliegt in den Bereich
        const ir = itemRef.current?.getBoundingClientRect()
        const zr = zoneRefs[zone].current?.getBoundingClientRect()
        if (ir && zr) {
          setPos((p) => ({
            x: p.x + (zr.left + zr.width / 2 - (ir.left + ir.width / 2)),
            y: p.y + (zr.top + zr.height / 2 - (ir.top + ir.height / 2)),
            s: 0.25,
          }))
        }
        setMode('fly')
        setBump(zone)
        sounds.success()
        const points = wrongThisItem.current ? Math.ceil(POINTS[difficulty] / 2) : POINTS[difficulty]
        setScore((s) => s + points)
        const lob = playerName ? `Super, ${playerName}!` : 'Super!'
        await speakAsync(
          zone === 'dangerous' ? `${lob} ${item.spokenName} ist gefährlich. Das ist nur für Erwachsene.` : `${lob} ${item.spokenName} ist zum Spielen.`,
        )
        await wait(300)
        if (!alive.current) return
        setBump(null)
        setHint(null)
        wrongThisItem.current = false
        setPos({ x: 0, y: 0, s: 1 })
        setMode('idle')
        if (idx + 1 < items.length) setIdx(idx + 1)
        else setPhase('done')
        busy.current = false
      } else {
        // Falsch: sanft zurück, ohne negatives Feedback
        wrongThisItem.current = true
        setMistakes((m) => m + 1)
        sounds.gentle()
        setMode('back')
        setPos({ x: 0, y: 0, s: 1 })
        if (difficulty === 'easy') setHint(item.category)
        speak('Hoppla! Versuch es nochmal.')
        await wait(500)
        if (!alive.current) return
        setMode('idle')
        busy.current = false
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, item, idx, items.length, difficulty, playerName, sounds],
  )

  const zoneAt = (x: number, y: number): Category | null => {
    for (const z of ['safe', 'dangerous'] as const) {
      const r = zoneRefs[z].current?.getBoundingClientRect()
      if (r && x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 12 && y <= r.bottom + 12) return z
    }
    return null
  }

  // --- Drag & Drop per Pointer-Events (Maus und Touch) ---
  const onDown = (e: React.PointerEvent) => {
    if (busy.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    press.current = { x: e.clientX, y: e.clientY, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const p = press.current
    if (!p) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    if (!p.moved && Math.hypot(dx, dy) > 8) {
      p.moved = true
      setMode('drag')
    }
    if (p.moved) setPos({ x: dx, y: dy, s: 1.1 })
  }
  const onUp = (e: React.PointerEvent) => {
    const p = press.current
    press.current = null
    if (!p) return
    if (!p.moved) {
      speak(item.spokenName) // nur angetippt: Namen nochmal vorlesen
      return
    }
    const zone = zoneAt(e.clientX, e.clientY)
    if (zone) void decide(zone)
    else {
      setMode('back')
      setPos({ x: 0, y: 0, s: 1 })
    }
  }

  const restart = () => {
    setItems(buildRound(difficulty))
    setIdx(0)
    setScore(0)
    setMistakes(0)
    setPos({ x: 0, y: 0, s: 1 })
    setMode('idle')
    wrongThisItem.current = false
    busy.current = false
    setPhase('play')
  }

  const stars = useMemo(() => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1), [mistakes])

  const zoneButton = (z: Category) => (
    <button
      ref={zoneRefs[z]}
      className={`ds-zone ${z} ${hint === z ? 'hint' : ''} ${bump === z ? 'bump' : ''}`}
      onClick={() => phase === 'play' && void decide(z)}
      aria-label={ZONES[z].label}
    >
      <span className="ds-zone-icon">{ZONES[z].icon}</span>
      <span className="ds-zone-label">{ZONES[z].label}</span>
    </button>
  )

  if (phase === 'intro') {
    return (
      <div className="ds">
        <div className="ds-zones">
          {(['safe', 'dangerous'] as const).map((z) => (
            <div key={z} className={`ds-zone ${z} static`}>
              <span className="ds-zone-icon">{ZONES[z].icon}</span>
              <span className="ds-zone-label">{ZONES[z].label}</span>
            </div>
          ))}
        </div>
        <div className="center-stack" style={{ marginTop: '1.5rem' }}>
          <button className="btn big" onClick={() => setPhase('play')}>▶️ Los geht's!</button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="center-stack card ds-done">
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
    <div className="ds">
      <div className="szene-bar">
        <span className="dots">
          {items.map((_, i) => (
            <i key={i} className={i < idx ? 'done' : i === idx ? 'now' : ''} />
          ))}
        </span>
      </div>

      <div className="ds-stage">
        <div
          key={idx}
          ref={itemRef}
          className={`ds-item ${mode} size-${itemSize(item.icon)} ${mode === 'back' ? 'wiggle' : ''}`}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.s})` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="img"
          aria-label={item.name}
        >
          {item.image ? <img src={item.image} alt="" draggable={false} /> : <span>{item.icon}</span>}
        </div>
        <button className="btn small" onClick={() => speak(item.spokenName)}>🔊 {item.name}</button>
      </div>

      <div className="ds-zones">
        {zoneButton('safe')}
        {zoneButton('dangerous')}
      </div>
    </div>
  )
}

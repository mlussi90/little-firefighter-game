import { useCallback, useEffect, useRef, useState } from 'react'
import type { Difficulty } from '../../types'
import { speak, speakAsync, stopSpeaking } from '../../speech'
import { playGentle, playSuccess } from '../../sound'
import './escape-route.css'

/** Die Phasen als einfache State Machine: intro → smoke → hide → meet → completed */
export type EscapePhase = 'intro' | 'smoke' | 'hide' | 'meet' | 'completed'

export interface MiniGameEscapeRouteProps {
  difficulty?: Difficulty
  playerName?: string
  /** Wird aufgerufen, wenn das Kind am Ende „Fertig" wählt. */
  onFinish: () => void
  /** Aktueller Punktestand dieses Durchgangs (springt bei „Nochmal" auf 0). */
  onScoreUpdate?: (score: number) => void
}

interface Option {
  id: string
  icon: string // Emoji – später durch SVG/Bild ersetzbar
  label: string
  ok: boolean
  wrongSpeech?: string
}

const POINTS: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 }
const STEPS: Record<Difficulty, number> = { easy: 4, medium: 5, hard: 6 }

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}
const symbols = (s: string) => {
  try {
    return Math.min([...new Intl.Segmenter().segment(s)].length, 5)
  } catch {
    return 1
  }
}

const hideOptions = (d: Difficulty): Option[] => {
  const o: Option[] = [
    { id: 'tuer', icon: '🚪🏃', label: 'Zur Tür', ok: true },
    { id: 'schrank', icon: '🗄️', label: 'Schrank', ok: false, wrongSpeech: 'Nein! Im Schrank findet dich die Feuerwehr nicht. Geh zur Tür!' },
  ]
  if (d !== 'easy') o.push({ id: 'bett', icon: '🛏️', label: 'Unters Bett', ok: false, wrongSpeech: 'Nicht unters Bett! Da siehst du die Feuerwehr nicht. Geh zur Tür!' })
  return shuffle(o)
}

const meetOptions = (d: Difficulty): Option[] => {
  const o: Option[] = [
    { id: 'sammel', icon: '🌳🚩', label: 'Sammelplatz', ok: true },
    { id: 'nachbar', icon: '🏡', label: 'Nachbarhaus', ok: false, wrongSpeech: 'Nicht ins Nachbarhaus. Warte am Sammelplatz beim Baum!' },
    { id: 'tonne', icon: '🗑️', label: 'Mülltonne', ok: false, wrongSpeech: 'Die Mülltonne ist kein Sammelplatz. Geh zum Baum mit der Fahne!' },
  ]
  if (d === 'hard') o.push({ id: 'strasse', icon: '🚗', label: 'Straße', ok: false, wrongSpeech: 'Auf der Straße fahren Autos. Das ist gefährlich. Geh zum Sammelplatz!' })
  return shuffle(o)
}

const RULES: Record<'smoke' | 'hide' | 'meet', string> = {
  smoke: 'Rauch steigt nach oben. Darum krabbeln wir unten!',
  hide: 'Nie verstecken! Geh immer zur Tür nach draußen.',
  meet: 'Am Sammelplatz warten wir. Die Feuerwehr kommt!',
}

const STEP_ICONS: { phase: 'smoke' | 'hide' | 'meet'; icon: string }[] = [
  { phase: 'smoke', icon: '⬇️' },
  { phase: 'hide', icon: '🚪' },
  { phase: 'meet', icon: '🌳' },
]
const ORDER: EscapePhase[] = ['intro', 'smoke', 'hide', 'meet', 'completed']

export function MiniGameEscapeRoute({ difficulty = 'easy', playerName = '', onFinish, onScoreUpdate }: MiniGameEscapeRouteProps) {
  const [phase, setPhase] = useState<EscapePhase>('intro')
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [bubble, setBubble] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState(false)

  // Phase 1
  const [ducked, setDucked] = useState(false)
  const [step, setStep] = useState(0)
  const [coughHint, setCoughHint] = useState(false)
  // Phase 2 & 3
  const [options, setOptions] = useState<Option[]>([])
  const [tried, setTried] = useState<Set<string>>(new Set())
  const [chosen, setChosen] = useState<string | null>(null)

  const busy = useRef(false)
  const alive = useRef(true)
  const missedThisPhase = useRef(false)
  const steps = STEPS[difficulty]
  const basis = POINTS[difficulty]

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

  const enter = useCallback(
    (p: EscapePhase) => {
      setPhase(p)
      setBubble(null)
      setCelebrate(false)
      setTried(new Set())
      setChosen(null)
      missedThisPhase.current = false
      busy.current = false
      if (p === 'smoke') {
        setDucked(false)
        setStep(0)
        setCoughHint(false)
        speak('Es qualmt! Hilf dem Kind nach draußen. Der Rauch ist oben!')
      }
      if (p === 'hide') {
        setOptions(hideOptions(difficulty))
        speak('Im Zimmer brennt es. Wohin soll das Kind gehen?')
      }
      if (p === 'meet') {
        setOptions(meetOptions(difficulty))
        speak('Geschafft, du bist draußen! Wo wartet ihr auf die Feuerwehr?')
      }
    },
    [difficulty],
  )

  // Jede Phase wird mit Punkten und Merksatz abgeschlossen, dann geht es automatisch weiter.
  const succeed = async (p: 'smoke' | 'hide' | 'meet') => {
    busy.current = true
    playSuccess()
    setCelebrate(true)
    setScore((s) => s + (missedThisPhase.current ? Math.ceil(basis / 2) : basis))
    await speakAsync(`${playerName ? `Super, ${playerName}! ` : 'Super! '}${RULES[p]}`)
    await wait(400)
    if (!alive.current) return
    enter(ORDER[ORDER.indexOf(p) + 1])
  }

  const fail = (speech: string, icon: string) => {
    missedThisPhase.current = true
    setMistakes((m) => m + 1)
    playGentle()
    setBubble(icon)
    speak(speech)
  }

  // ---- Phase 1: ducken & krabbeln ----
  const duck = () => {
    if (busy.current || ducked) return
    setDucked(true)
    setCoughHint(false)
    setBubble('👍')
    speak('Gut! Unten ist die Luft klar. Jetzt krabbel zur Tür!')
  }
  const crawl = () => {
    if (busy.current) return
    if (!ducked) {
      setCoughHint(true)
      fail('Hust, hust! Der Rauch ist oben. Duck dich erst!', '😷')
      return
    }
    setBubble(null)
    const next = step + 1
    setStep(next)
    if (next >= steps) void succeed('smoke')
  }

  // ---- Phase 2 & 3: Auswahl ----
  const choose = (o: Option) => {
    if (busy.current || tried.has(o.id)) return
    if (o.ok) {
      setChosen(o.id)
      void succeed(phase as 'hide' | 'meet')
    } else {
      setTried((t) => new Set(t).add(o.id))
      fail(o.wrongSpeech ?? 'Versuch es nochmal!', '🤔')
    }
  }

  const restart = () => {
    setScore(0)
    setMistakes(0)
    enter('smoke')
  }

  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
  const showHint = difficulty === 'easy'

  // ---------- Darstellung ----------
  if (phase === 'intro') {
    return (
      <div className="er center-stack">
        <div className="er-intro-icons">🏠🔥 → ⬇️ → 🚪 → 🌳</div>
        <h2>Der Weg ins Freie</h2>
        <button className="er-listen" onClick={() => speak('Es brennt! Rauch steigt nach oben. Krabbel unten, geh zur Tür und lauf zum Sammelplatz.')}>🔊</button>
        <div className="row">
          <button className="btn big" onClick={() => enter('smoke')}>▶️ Los geht's!</button>
        </div>
      </div>
    )
  }

  if (phase === 'completed') {
    return (
      <div className="er center-stack card">
        <div className="er-truck">🚒</div>
        <h2>Gerettet{playerName ? `, ${playerName}` : ''}!</h2>
        <p className="er-rules">⬇️ 🚪 🌳</p>
        <p className="sterne">{'⭐'.repeat(stars) + '☆'.repeat(3 - stars)}</p>
        <p className="lead">{score} Punkte</p>
        <div className="row">
          <button className="btn big" onClick={restart}>🔁 Nochmal</button>
          <button className="btn" onClick={onFinish}>🏠 Fertig</button>
        </div>
      </div>
    )
  }

  return (
    <div className="er">
      <div className="er-steps">
        {STEP_ICONS.map(({ phase: p, icon }) => (
          <span key={p} className={`er-step ${p === phase ? 'now' : ORDER.indexOf(p) < ORDER.indexOf(phase) ? 'done' : ''}`}>{icon}</span>
        ))}
      </div>

      {phase === 'smoke' && (
        <>
          <div className={`er-scene ${celebrate ? 'happy' : ''}`}>
            <div className="er-smoke" aria-hidden>
              <span className="c1">☁️</span><span className="c2">☁️</span><span className="c3">☁️</span><span className="c4">☁️</span><span className="c5">☁️</span>
            </div>
            <div className="er-floor" />
            <div className="er-door">🚪</div>
            <div
              className={`er-kid ${ducked ? 'crawl' : 'stand'} ${coughHint ? 'cough' : ''}`}
              style={{ left: `${6 + (step / steps) * 66}%` }}
            >
              {ducked ? '🧎' : '🧍'}
              {bubble && <span className="er-bubble">{bubble}</span>}
            </div>
          </div>
          <div className="er-actions">
            <button className={`btn er-big ${!ducked && (coughHint || showHint) ? 'er-pulse' : ''}`} onClick={duck} disabled={ducked}>
              ⬇️ Ducken
            </button>
            <button className={`btn er-big go ${ducked && showHint ? 'er-pulse' : ''}`} onClick={crawl}>
              ➡️ Krabbeln
            </button>
          </div>
        </>
      )}

      {(phase === 'hide' || phase === 'meet') && (
        <>
          <div className={`er-scene ${phase} ${celebrate ? 'happy' : ''}`}>
            {phase === 'hide' ? (
              <>
                <span className="er-fire f1">🔥</span><span className="er-fire f2">🔥</span><span className="er-fire f3">🔥</span>
                <div className="er-smoke light" aria-hidden><span className="c1">☁️</span><span className="c3">☁️</span></div>
              </>
            ) : (
              <>
                <div className="er-burning">🏠🔥</div>
                <div className="er-sun">☀️</div>
              </>
            )}
            <div className="er-floor" />
            <div className="er-kid stand mid">🧒{bubble && <span className="er-bubble">{bubble}</span>}</div>
          </div>
          <div className="tiles er-options">
            {options.map((o) => {
              const right = chosen === o.id
              const cls = right ? 'right' : tried.has(o.id) ? 'wrong' : showHint && missedThisPhase.current && o.ok ? 'er-pulse' : ''
              return (
                <div key={o.id} className="tile-wrap">
                  <button
                    className={`tile size-${symbols(o.icon)} ${cls}`}
                    disabled={chosen !== null || tried.has(o.id)}
                    onClick={() => choose(o)}
                    aria-label={o.label}
                  >
                    <span className="tile-emoji">{o.icon}</span>
                    <span className="tile-text">{o.label}</span>
                  </button>
                  <button className="hear" onClick={() => speak(o.label)} aria-label={`${o.label} vorlesen`}>🔊</button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

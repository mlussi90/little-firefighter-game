import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GameProps } from '../types'
import type { Difficulty } from '../../types'
import { speak, speakAsync, stopSpeaking } from '../../speech'
import { useScore } from '../../score'
import { baueRunde } from './engine'
import { useCallPlayer } from './useCallPlayer'
import { SLOTS, type Anruf, type Frage } from './types'

const GAME_ID = 'leitstelle'
const PUNKTE: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 }
const FEHLT_BONUS = 30
const ANRUFE_PRO_RUNDE = 3

const LOB = ['Super', 'Prima', 'Toll gemacht', 'Richtig', 'Genau']
const lob = (name: string) => `${LOB[Math.floor(Math.random() * LOB.length)]}${name ? `, ${name}` : ''}!`

/** Text-Toggle: für Kinder, die schon lesen können. Standardmäßig aus. */
function useShowText() {
  const [show, setShow] = useState(() => {
    try {
      return localStorage.getItem('ffgame.showText') === '1'
    } catch {
      return false
    }
  })
  const toggle = () =>
    setShow((s) => {
      try {
        localStorage.setItem('ffgame.showText', s ? '0' : '1')
      } catch {
        /* ignorieren */
      }
      return !s
    })
  return [show, toggle] as const
}

function Transcript({ zeilen, current }: { zeilen: string[]; current: number }) {
  return (
    <ol className="transcript">
      {zeilen.map((z, i) => (
        <li key={i} className={i === current ? 'now' : ''}>{z}</li>
      ))}
    </ol>
  )
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Anzahl sichtbarer Zeichen (Emoji-Gruppen zählen als eins) – steuert die Bildgröße der Kachel.
const zeichen = (s: string) => {
  try {
    return [...new Intl.Segmenter().segment(s)].length
  } catch {
    return [...s].length
  }
}

interface Option {
  key: string
  emoji: string
  text: string
}

/**
 * Liest erst die Frage und danach jede Antwort vor und hebt die gerade genannte Kachel hervor –
 * damit auch Kinder, die noch nicht lesen können, alle Möglichkeiten kennenlernen.
 */
function useVorlesen(intro: string, labels: string[]) {
  const [hot, setHot] = useState(-1)
  const run = useRef(0)

  const stop = useCallback(() => {
    run.current++
    stopSpeaking()
    setHot(-1)
  }, [])

  const start = useCallback(async () => {
    const id = ++run.current
    stopSpeaking()
    setHot(-1)
    await speakAsync(intro)
    for (let i = 0; i < labels.length; i++) {
      if (run.current !== id) return
      setHot(i)
      await speakAsync(labels[i])
      if (run.current !== id) return
      await wait(250)
    }
    if (run.current === id) setHot(-1)
  }, [intro, labels])

  useEffect(() => {
    start()
    return () => {
      run.current++
      stopSpeaking()
    }
  }, [start])

  return { hot, start, stop }
}

/** Große Bild-Kacheln; jede hat einen eigenen 🔊-Knopf zum Anhören. */
function Auswahl({
  items, richtig, gewaehlt, falsche, hot, onWahl, onHoeren,
}: {
  items: Option[]
  richtig: string
  gewaehlt: string | null
  falsche: Set<string>
  hot: number
  onWahl: (key: string) => void
  onHoeren: (i: number) => void
}) {
  return (
    <div className="tiles">
      {items.map((k, i) => {
        const klasse = gewaehlt === k.key ? 'right' : falsche.has(k.key) ? 'wrong' : ''
        return (
          <div key={k.key} className={`tile-wrap ${hot === i ? 'hot' : ''}`}>
            <button
              className={`tile size-${Math.min(zeichen(k.emoji), 5)} ${klasse}`}
              disabled={gewaehlt !== null || falsche.has(k.key)}
              onClick={() => onWahl(k.key)}
              aria-label={k.text}
              data-richtig={k.key === richtig}
            >
              <span className="tile-emoji">{k.emoji}</span>
              <span className="tile-text">{k.text}</span>
            </button>
            <button className="hear" onClick={() => onHoeren(i)} aria-label={`${k.text} vorlesen`}>🔊</button>
          </div>
        )
      })}
    </div>
  )
}

/** Eine W-Frage mit Antwortkacheln. */
function FrageKarte({
  frage, name, onFehler, onRichtig, onWeiter,
}: {
  frage: Frage
  name: string
  onFehler: () => void
  onRichtig: (ersterVersuch: boolean) => void
  onWeiter: () => void
}) {
  const [falsche, setFalsche] = useState<Set<string>>(new Set())
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)
  const timer = useRef<number>(undefined)
  const slot = SLOTS.find((s) => s.id === frage.slot)!
  const items = useMemo<Option[]>(() => frage.kacheln.map((k) => ({ key: k.text, ...k })), [frage])
  const labels = useMemo(() => items.map((i) => i.text), [items])
  const { hot, start, stop } = useVorlesen(frage.text, labels)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const wahl = (key: string) => {
    stop()
    if (key === frage.richtig) {
      setGewaehlt(key)
      speak(lob(name))
      onRichtig(falsche.size === 0)
      timer.current = window.setTimeout(onWeiter, 1600)
    } else {
      setFalsche(new Set(falsche).add(key))
      onFehler()
      speak('Nicht ganz. Versuch es nochmal!')
    }
  }

  return (
    <div className="frage">
      <button className="frage-kopf" onClick={start} title="Nochmal vorlesen">
        <span className="frage-emoji">{slot.emoji}</span>
        <span>{frage.text}</span>
        <span>🔊</span>
      </button>
      <Auswahl
        items={items}
        richtig={frage.richtig}
        gewaehlt={gewaehlt}
        falsche={falsche}
        hot={hot}
        onWahl={wahl}
        onHoeren={(i) => {
          stop()
          speak(items[i].text)
        }}
      />
    </div>
  )
}

/** Schwer: Welche der 5 W-Fragen wurde im Anruf gar nicht beantwortet? */
function FehltKarte({
  fehlt, name, onFehler, onRichtig, onWeiter,
}: {
  fehlt: string
  name: string
  onFehler: () => void
  onRichtig: (ersterVersuch: boolean) => void
  onWeiter: () => void
}) {
  const [falsche, setFalsche] = useState<Set<string>>(new Set())
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)
  const frage = 'Welche Information hat der Anrufer vergessen?'
  const items = useMemo<Option[]>(() => SLOTS.map((s) => ({ key: s.id, emoji: s.emoji, text: s.kurz })), [])
  const labels = useMemo(() => items.map((i) => i.text), [items])
  const { hot, start, stop } = useVorlesen(frage, labels)
  const s = SLOTS.find((x) => x.id === fehlt)!

  const wahl = (key: string) => {
    stop()
    if (key === fehlt) {
      setGewaehlt(key)
      speak(`${lob(name)} Das hat gefehlt. Du musst nachfragen: ${s.frage}`)
      onRichtig(falsche.size === 0)
    } else {
      setFalsche(new Set(falsche).add(key))
      onFehler()
      speak('Nicht ganz. Das wurde gesagt. Versuch es nochmal!')
    }
  }

  return (
    <div className="frage">
      <button className="frage-kopf" onClick={start}>
        <span className="frage-emoji">🤔</span>
        <span>{frage}</span>
        <span>🔊</span>
      </button>
      <Auswahl
        items={items}
        richtig={fehlt}
        gewaehlt={gewaehlt}
        falsche={falsche}
        hot={hot}
        onWahl={wahl}
        onHoeren={(i) => {
          stop()
          speak(items[i].text)
        }}
      />
      {gewaehlt && (
        <div className="nachfragen">
          <p>Hier musst du nachfragen:<br /><strong>„{s.frage}"</strong></p>
          <button className="btn" onClick={onWeiter}>Weiter ➡️</button>
        </div>
      )}
    </div>
  )
}

function Szene({
  anruf, difficulty, name, onFertig,
}: {
  anruf: Anruf
  difficulty: Difficulty
  name: string
  onFertig: (r: { sterne: number; punkte: number }) => void
}) {
  const { addPoints } = useScore()
  const player = useCallPlayer(anruf.zeilen)
  const [phase, setPhase] = useState<'klingeln' | 'anruf' | 'fragen' | 'fehlt'>('klingeln')
  const [qi, setQi] = useState(0)
  const fehler = useRef(0)
  const punkte = useRef(0)
  const [showText, toggleText] = useShowText()
  const basis = PUNKTE[difficulty]

  const gib = (n: number) => {
    punkte.current += n
    addPoints(n, GAME_ID)
  }
  const fertig = () => {
    const f = fehler.current
    onFertig({ sterne: f === 0 ? 3 : f <= 1 ? 2 : 1, punkte: punkte.current })
  }
  const naechste = () => {
    if (qi + 1 < anruf.fragen.length) setQi(qi + 1)
    else if (anruf.fehlt) setPhase('fehlt')
    else fertig()
  }
  const onFehler = () => {
    fehler.current++
  }
  const nochmalMoeglich = !player.playing && player.plays - 1 < anruf.wiederholungen

  return (
    <div className="szene">
      <div className="szene-bar">
        <button className={`btn small ${showText ? 'on' : ''}`} onClick={toggleText}>
          {showText ? '📖 Text ausblenden' : '📖 Text anzeigen'}
        </button>
        {(phase === 'fragen' || phase === 'fehlt') && (
          <span className="dots">
            {anruf.fragen.map((_, i) => (
              <i key={i} className={phase === 'fehlt' || i < qi ? 'done' : i === qi ? 'now' : ''} />
            ))}
            {anruf.fehlt && <i className={phase === 'fehlt' ? 'now' : ''} />}
          </span>
        )}
      </div>

      {phase === 'klingeln' && (
        <div className="center-stack">
          <div className="phone ring">📞</div>
          <h2>Ein Notruf!</h2>
          <button
            className="btn big"
            onClick={() => {
              setPhase('anruf')
              player.play()
            }}
          >
            📞 Abnehmen
          </button>
        </div>
      )}

      {phase === 'anruf' && (
        <div className="center-stack">
          <div className={`phone ${player.playing ? 'talking' : ''}`}>📞</div>
          <h2>{player.playing ? 'Hör gut zu …' : 'Der Anruf ist zu Ende.'}</h2>
          {showText && <Transcript zeilen={anruf.zeilen} current={player.current} />}
          <div className="row">
            {nochmalMoeglich && <button className="btn" onClick={player.play}>🔁 Nochmal hören</button>}
            <button className="btn big" disabled={player.playing || player.plays === 0} onClick={() => setPhase('fragen')}>
              Weiter ➡️
            </button>
          </div>
        </div>
      )}

      {phase === 'fragen' && (
        <>
          <FrageKarte
            key={qi}
            frage={anruf.fragen[qi]}
            name={name}
            onFehler={onFehler}
            onRichtig={(erst) => gib(erst ? basis : Math.ceil(basis / 2))}
            onWeiter={naechste}
          />
          {showText && <Transcript zeilen={anruf.zeilen} current={player.current} />}
          {nochmalMoeglich && (
            <div className="center-stack">
              <button className="btn small" onClick={player.play}>🔁 Anruf nochmal hören</button>
            </div>
          )}
        </>
      )}

      {phase === 'fehlt' && anruf.fehlt && (
        <FehltKarte
          fehlt={anruf.fehlt}
          name={name}
          onFehler={onFehler}
          onRichtig={(erst) => gib(erst ? FEHLT_BONUS : Math.ceil(FEHLT_BONUS / 2))}
          onWeiter={fertig}
        />
      )}
    </div>
  )
}

const sterneText = (n: number) => '⭐'.repeat(n) + '☆'.repeat(3 - n)

export default function Leitstelle({ player, onExit }: GameProps) {
  const [runde, setRunde] = useState(() => baueRunde(player.difficulty, ANRUFE_PRO_RUNDE))
  const [nr, setNr] = useState(0)
  const [ergebnisse, setErgebnisse] = useState<{ sterne: number; punkte: number }[]>([])
  const [screen, setScreen] = useState<'call' | 'zwischen' | 'ende'>('call')

  const letzter = ergebnisse[ergebnisse.length - 1]

  const nochmal = () => {
    setRunde(baueRunde(player.difficulty, ANRUFE_PRO_RUNDE))
    setNr(0)
    setErgebnisse([])
    setScreen('call')
  }

  return (
    <div className="game">
      <div className="game-head">
        <button className="btn small" onClick={onExit}>⬅️ Zurück</button>
        <h1>📞 Leitstelle</h1>
        <span className="badge">Anruf {Math.min(nr + 1, runde.length)} / {runde.length}</span>
      </div>

      {screen === 'call' && (
        <Szene
          key={nr}
          anruf={runde[nr]}
          difficulty={player.difficulty}
          name={player.name}
          onFertig={(r) => {
            setErgebnisse((e) => [...e, r])
            speak(lob(player.name))
            setScreen(nr + 1 < runde.length ? 'zwischen' : 'ende')
          }}
        />
      )}

      {screen === 'zwischen' && letzter && (
        <div className="center-stack card">
          <div className="logo">🎉</div>
          <h2>Anruf geschafft!</h2>
          <p className="sterne">{sterneText(letzter.sterne)}</p>
          <p className="lead">+{letzter.punkte} Punkte</p>
          <button
            className="btn big"
            onClick={() => {
              setNr(nr + 1)
              setScreen('call')
            }}
          >
            📞 Nächster Anruf
          </button>
        </div>
      )}

      {screen === 'ende' && (
        <div className="center-stack card">
          <div className="logo">🏆</div>
          <h2>Schicht geschafft{player.name ? `, ${player.name}` : ''}!</h2>
          <p className="sterne">{ergebnisse.map((e) => sterneText(e.sterne)).join('  ')}</p>
          <p className="lead">Diese Runde: {ergebnisse.reduce((a, e) => a + e.punkte, 0)} Punkte</p>
          <div className="row">
            <button className="btn big" onClick={nochmal}>🔁 Nochmal</button>
            <button className="btn" onClick={onExit}>🏠 Spieleauswahl</button>
          </div>
        </div>
      )}
    </div>
  )
}

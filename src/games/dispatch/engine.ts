import type { Difficulty } from '../../types'
import { szenarien } from './scenarios'
import { SLOTS, type Anruf, type Frage, type Kachel, type Slot, type Szenario } from './types'

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

const CONFIG: Record<Difficulty, { kacheln: number; stoer: [number, number]; wiederholungen: number; fehlt: boolean; gemischt: boolean }> = {
  easy: { kacheln: 3, stoer: [0, 0], wiederholungen: Infinity, fehlt: false, gemischt: false },
  medium: { kacheln: 4, stoer: [1, 2], wiederholungen: Infinity, fehlt: false, gemischt: true },
  hard: { kacheln: 5, stoer: [2, 3], wiederholungen: 1, fehlt: true, gemischt: true },
}

// Notfall-Auffüller, falls die anderen Szenarien nicht genug falsche Kacheln liefern.
const STANDARD_ABLENKER: Record<Slot, Kachel[]> = {
  wo: [
    { emoji: '🏫', text: 'Schule' }, { emoji: '🌳', text: 'Park' }, { emoji: '🛒', text: 'Supermarkt' },
    { emoji: '🚉', text: 'Bahnhof' }, { emoji: '🏊', text: 'Schwimmbad' },
  ],
  was: [
    { emoji: '🌊', text: 'Hochwasser' }, { emoji: '🌪️', text: 'Sturm' }, { emoji: '🐱', text: 'Katze auf dem Baum' },
    { emoji: '⚡', text: 'Stromausfall' }, { emoji: '🛗', text: 'Aufzug steckt fest' },
  ],
  wieviele: [
    { emoji: '👤', text: 'Eine Person' }, { emoji: '👫', text: 'Zwei Personen' }, { emoji: '👥', text: 'Drei Personen' },
    { emoji: '👨‍👩‍👧‍👦', text: 'Vier Personen' }, { emoji: '🧑‍🤝‍🧑', text: 'Fünf Personen' },
  ],
  verletzung: [
    { emoji: '🦴', text: 'Knochenbruch' }, { emoji: '🤕', text: 'Kopfverletzung' }, { emoji: '🩹', text: 'Schnittwunde' },
    { emoji: '🥵', text: 'Hitzschlag' }, { emoji: '🐝', text: 'Insektenstich' },
  ],
  warten: [
    { emoji: '📵', text: 'Legt auf' }, { emoji: '🏃', text: 'Rennt weg' }, { emoji: '😴', text: 'Geht schlafen' },
  ],
}

const eindeutig = (liste: Kachel[]): Kachel[] => {
  const gesehen = new Set<string>()
  return liste.filter((k) => !gesehen.has(k.text) && gesehen.add(k.text))
}

function baueFrage(s: Szenario, slot: Slot, anzahl: number, gehoerteAblenker: Kachel[]): Frage {
  const richtig = s.fakten[slot].kachel
  const eigene = (s.ablenker ?? []).filter((a) => a.slot === slot).map((a) => a.kachel)
  const ausAnderen = szenarien.filter((x) => x.id !== s.id).map((x) => x.fakten[slot].kachel)
  // Reihenfolge der Priorität: im Anruf gehörte Ablenker, eigene, andere Szenarien, Standard
  const falsch = eindeutig([
    ...gehoerteAblenker,
    ...shuffle(eigene),
    ...shuffle(ausAnderen),
    ...shuffle(STANDARD_ABLENKER[slot]),
  ])
    .filter((k) => k.text !== richtig.text)
    .slice(0, anzahl - 1)
  return {
    slot,
    text: SLOTS.find((x) => x.id === slot)!.frage,
    kacheln: shuffle([richtig, ...falsch]),
    richtig: richtig.text,
  }
}

export function baueAnruf(s: Szenario, difficulty: Difficulty): Anruf {
  const cfg = CONFIG[difficulty]
  const kandidaten: Slot[] = s.fehlt ?? ['wo', 'wieviele', 'verletzung']
  const fehlt = cfg.fehlt ? kandidaten[Math.floor(Math.random() * kandidaten.length)] : undefined
  const slots = SLOTS.map((x) => x.id).filter((id) => id !== fehlt)

  // Störinfos: gehörte Ablenker (mit Kachel) + reine Störinfos
  const pool = [
    ...(s.ablenker ?? []).filter((a) => a.sage).map((a) => ({ sage: a.sage!, ablenker: a })),
    ...(s.stoerinfos ?? []).map((x) => ({ sage: x.sage, ablenker: undefined })),
  ]
  const [min, max] = cfg.stoer
  const n = Math.min(pool.length, min + Math.floor(Math.random() * (max - min + 1)))
  const stoerungen = shuffle(pool).slice(0, n)

  const fakten = slots.map((id) => s.fakten[id].sage)
  const zeilen = cfg.gemischt ? shuffle([...fakten, ...stoerungen.map((x) => x.sage)]) : fakten

  const fragen = slots.map((slot) =>
    baueFrage(
      s,
      slot,
      cfg.kacheln,
      stoerungen.filter((x) => x.ablenker?.slot === slot).map((x) => x.ablenker!.kachel),
    ),
  )
  return { szenario: s, zeilen, fragen, fehlt, wiederholungen: cfg.wiederholungen }
}

/** Zieht `anzahl` verschiedene Szenarien (bei zu wenigen: mit Wiederholung) und baut die Anrufe. */
export function baueRunde(difficulty: Difficulty, anzahl = 3): Anruf[] {
  const passend = szenarien.filter((s) => !s.level || s.level.includes(difficulty))
  const quelle = passend.length ? passend : szenarien
  let ziehen = shuffle(quelle)
  while (ziehen.length < anzahl) ziehen = [...ziehen, ...shuffle(quelle)]
  return ziehen.slice(0, anzahl).map((s) => baueAnruf(s, difficulty))
}

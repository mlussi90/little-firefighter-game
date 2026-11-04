import type { Difficulty } from '../../types'

/** Die 5 W-Fragen des Notrufs. */
export type Slot = 'wo' | 'was' | 'wieviele' | 'verletzung' | 'warten'

export const SLOTS: { id: Slot; emoji: string; kurz: string; frage: string }[] = [
  { id: 'wo', emoji: '📍', kurz: 'Wo?', frage: 'Wo ist es passiert?' },
  { id: 'was', emoji: '❗', kurz: 'Was?', frage: 'Was ist passiert?' },
  { id: 'wieviele', emoji: '🧑🧑🧑', kurz: 'Wie viele?', frage: 'Wie viele Personen sind betroffen?' },
  { id: 'verletzung', emoji: '🩹', kurz: 'Welche Verletzungen?', frage: 'Welche Verletzungen gibt es?' },
  { id: 'warten', emoji: '👂', kurz: 'Warten auf Rückfragen', frage: 'Was macht der Anrufer zum Schluss?' },
]

/** Eine antippbare Kachel. `text` muss pro W-Frage eindeutig sein. */
export interface Kachel {
  emoji: string
  text: string
}

/** Eine richtige Information: was der Anrufer sagt und welche Kachel dazu gehört. */
export interface Fakt {
  sage: string // muss für sich allein verständlich sein (wird auf Mittel/Schwer gemischt)
  kachel: Kachel
}

/** Eine falsche Antwortkachel. Mit `sage` kann sie im Anruf auch gehört werden (Störinfo, die verwirrt). */
export interface Ablenker {
  slot: Slot
  kachel: Kachel
  sage?: string
}

/** Ein Notruf-Szenario – das ist alles, was zum Erweitern geschrieben werden muss. */
export interface Szenario {
  id: string
  titel: string
  emoji: string
  /** Für welche Stufen das Szenario taugt (Standard: alle). */
  level?: Difficulty[]
  fakten: Record<Slot, Fakt>
  /** Zusätzliche falsche Kacheln. Fehlende werden automatisch aus anderen Szenarien aufgefüllt. */
  ablenker?: Ablenker[]
  /** Unnötige Infos, die nur gesprochen werden (ab Mittel). */
  stoerinfos?: { sage: string }[]
  /** Auf Schwer: welche Info darf fehlen? (Standard: wo, wieviele oder verletzung) */
  fehlt?: Slot[]
}

export interface Frage {
  slot: Slot
  text: string
  kacheln: Kachel[]
  richtig: string // text der richtigen Kachel
}

export interface Anruf {
  szenario: Szenario
  zeilen: string[]
  fragen: Frage[]
  fehlt?: Slot
  wiederholungen: number
}

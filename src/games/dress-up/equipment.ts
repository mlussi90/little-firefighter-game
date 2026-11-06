export type EquipmentSlot = 'head' | 'body' | 'feet' | 'hands'

export interface EquipmentItem {
  id: string
  name: string
  type: 'correct' | 'wrong'
  slot: EquipmentSlot
  icon: string // Emoji – später durch SVG/Bild ersetzbar
  /** Wird bei einem falschen Teil vorgelesen. */
  hint?: string
}

/** Modulares Daten-Array: Teile hier ergänzen oder austauschen. */
export const EQUIPMENT: EquipmentItem[] = [
  { id: 'helm', name: 'Feuerwehrhelm', type: 'correct', slot: 'head', icon: '⛑️' },
  { id: 'jacke', name: 'Einsatzjacke', type: 'correct', slot: 'body', icon: '🧥' },
  { id: 'stiefel', name: 'Feuerwehrstiefel', type: 'correct', slot: 'feet', icon: '🥾' },
  { id: 'handschuhe', name: 'Handschuhe', type: 'correct', slot: 'hands', icon: '🧤' },
  { id: 'badehose', name: 'Badehose', type: 'wrong', slot: 'body', icon: '🩳', hint: 'Hihi, eine Badehose! Die ist zum Schwimmen, nicht fürs Feuer.' },
  { id: 'partyhut', name: 'Partyhut', type: 'wrong', slot: 'head', icon: '🥳', hint: 'Ein Partyhut! Der schützt den Kopf nicht vor Feuer.' },
  { id: 'zauberstab', name: 'Zauberstab', type: 'wrong', slot: 'hands', icon: '🪄', hint: 'Ein Zauberstab! Die Feuerwehr braucht echte Handschuhe.' },
  { id: 'clownsschuhe', name: 'Clownsschuhe', type: 'wrong', slot: 'feet', icon: '🤡', hint: 'Clownsschuhe sind zu lustig. Such feste Stiefel!' },
]

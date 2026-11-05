/** Ein Gegenstand zum Einsortieren. */
export interface DangerItem {
  id: string
  name: string // Kurzname
  spokenName: string // so wird er vorgelesen, inkl. Artikel
  category: 'safe' | 'dangerous'
  /** Emoji (ein oder mehrere). Später austauschbar gegen `image` (z. B. eigene SVG/PNG-URL). */
  icon: string
  image?: string
}

// Neue Gegenstände einfach hier ergänzen – das Spiel zieht sie automatisch.
export const DANGER_ITEMS: readonly DangerItem[] = [
  // ✋ Gefährlich – nur für Erwachsene
  { id: 'kerze', name: 'Kerze', spokenName: 'Die Kerze', category: 'dangerous', icon: '🕯️' },
  { id: 'streichholz', name: 'Streichhölzer', spokenName: 'Die Streichhölzer', category: 'dangerous', icon: '🪵🔥' },
  { id: 'feuer', name: 'Feuer', spokenName: 'Das Feuer', category: 'dangerous', icon: '🔥' },
  { id: 'ladekabel', name: 'Ladekabel', spokenName: 'Das Ladekabel', category: 'dangerous', icon: '🔌' },
  { id: 'buegeleisen', name: 'Bügeleisen', spokenName: 'Das Bügeleisen', category: 'dangerous', icon: '♨️👕' },
  { id: 'herd', name: 'Heißer Herd', spokenName: 'Der heiße Herd', category: 'dangerous', icon: '🍳🔥' },
  { id: 'boeller', name: 'Böller', spokenName: 'Der Böller', category: 'dangerous', icon: '🧨' },
  { id: 'wunderkerze', name: 'Wunderkerze', spokenName: 'Die Wunderkerze', category: 'dangerous', icon: '🎇' },

  // 🧸 Sicher – Spielzeug
  { id: 'teddy', name: 'Teddybär', spokenName: 'Der Teddybär', category: 'safe', icon: '🧸' },
  { id: 'ball', name: 'Ball', spokenName: 'Der Ball', category: 'safe', icon: '⚽' },
  { id: 'buch', name: 'Buch', spokenName: 'Das Buch', category: 'safe', icon: '📖' },
  { id: 'bausteine', name: 'Bausteine', spokenName: 'Die Bausteine', category: 'safe', icon: '🧱' },
  { id: 'puzzle', name: 'Puzzle', spokenName: 'Das Puzzle', category: 'safe', icon: '🧩' },
  { id: 'malstifte', name: 'Malstifte', spokenName: 'Die Malstifte', category: 'safe', icon: '🖍️' },
  { id: 'drachen', name: 'Drachen', spokenName: 'Der Drachen', category: 'safe', icon: '🪁' },
  { id: 'badeente', name: 'Badeente', spokenName: 'Die Badeente', category: 'safe', icon: '🦆' },
  { id: 'spielauto', name: 'Spielauto', spokenName: 'Das Spielauto', category: 'safe', icon: '🚙' },
  { id: 'trommel', name: 'Trommel', spokenName: 'Die Trommel', category: 'safe', icon: '🥁' },
]

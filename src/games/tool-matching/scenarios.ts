/** Ein Werkzeug / eine Ausrüstung zur Auswahl. */
export interface Tool {
  id: string
  name: string // Kurzname
  spokenName: string // so wird er vorgelesen, inkl. Artikel
  /** Emoji. Später austauschbar gegen eigene Grafik. */
  icon: string
}

/** Ein Einsatz: ein Problem und die Werkzeuge zur Auswahl. */
export interface Scenario {
  id: string
  problemDescription: string // wird angezeigt und vorgelesen
  problemIcon: string // Emoji(s) für die Szene
  correctToolId: string
  availableTools: readonly Tool[] // genau eines davon ist richtig
  /** Emoji, das nach der Lösung statt des Problems erscheint. */
  solvedIcon: string
  /** Satz nach dem Lösen, wird vorgelesen. */
  solvedText: string
  /** Hintergrund der Szene. */
  background: string
}

const T = {
  hose: { id: 'strahlrohr', name: 'Wasserschlauch', spokenName: 'der Wasserschlauch', icon: '🚿' },
  ladder: { id: 'drehleiter', name: 'Drehleiter', spokenName: 'die Drehleiter', icon: '🪜' },
  torch: { id: 'taschenlampe', name: 'Taschenlampe', spokenName: 'die Taschenlampe', icon: '🔦' },
  broom: { id: 'besen', name: 'Besen', spokenName: 'der Besen mit Bindemittel', icon: '🧹' },
  pump: { id: 'pumpe', name: 'Pumpe', spokenName: 'die Pumpe', icon: '⛽' },
  axe: { id: 'axt', name: 'Axt', spokenName: 'die Axt', icon: '🪓' },
  blanket: { id: 'decke', name: 'Decke', spokenName: 'die Decke', icon: '🛏️' },
  phone: { id: 'telefon', name: 'Telefon', spokenName: 'das Telefon', icon: '📱' },
  bucket: { id: 'eimer', name: 'Eimer', spokenName: 'der Eimer', icon: '🪣' },
  saw: { id: 'saege', name: 'Säge', spokenName: 'die Säge', icon: '🪚' },
  towel: { id: 'handtuch', name: 'Handtuch', spokenName: 'das Handtuch', icon: '🧻' },
} as const satisfies Record<string, Tool>

// Neue Einsätze einfach hier ergänzen – das Spiel wählt pro Durchgang 5 aus.
export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'gebuesch',
    problemDescription: 'Feuer im Gebüsch!',
    problemIcon: '🔥🌳',
    correctToolId: T.hose.id,
    availableTools: [T.hose, T.ladder, T.broom],
    solvedIcon: '🌳💦',
    solvedText: 'Prima! Mit Wasser aus dem Schlauch geht das Feuer aus.',
    background: 'linear-gradient(#cfeedd, #9fd8a6)',
  },
  {
    id: 'katze',
    problemDescription: 'Die Katze sitzt oben auf dem Baum!',
    problemIcon: '🐈🌳',
    correctToolId: T.ladder.id,
    availableTools: [T.torch, T.ladder, T.hose],
    solvedIcon: '🐈❤️',
    solvedText: 'Super! Mit der Drehleiter wird die Katze gerettet.',
    background: 'linear-gradient(#d4efff, #b5e3a8)',
  },
  {
    id: 'keller',
    problemDescription: 'Es ist ganz dunkel im Keller!',
    problemIcon: '🌑🏚️',
    correctToolId: T.torch.id,
    availableTools: [T.broom, T.torch, T.ladder],
    solvedIcon: '💡🏠',
    solvedText: 'Toll! Mit der Taschenlampe sieht man wieder alles.',
    background: 'linear-gradient(#4a4a5e, #25253a)',
  },
  {
    id: 'oel',
    problemDescription: 'Ein Ölfleck auf der Straße!',
    problemIcon: '🛢️🛣️',
    correctToolId: T.broom.id,
    availableTools: [T.hose, T.torch, T.broom],
    solvedIcon: '✨🛣️',
    solvedText: 'Klasse! Mit Besen und Bindemittel ist die Straße wieder sauber.',
    background: 'linear-gradient(#e0e0e0, #b8b8b8)',
  },
  {
    id: 'ueberschwemmung',
    problemDescription: 'Der Keller steht unter Wasser!',
    problemIcon: '🌊🏠',
    correctToolId: T.pump.id,
    availableTools: [T.pump, T.axe, T.torch],
    solvedIcon: '☀️🏠',
    solvedText: 'Gut gemacht! Die Pumpe saugt das Wasser weg.',
    background: 'linear-gradient(#cfe9ff, #8ec5ef)',
  },
  {
    id: 'baum',
    problemDescription: 'Ein dicker Baum liegt auf dem Weg!',
    problemIcon: '🌲🚧',
    correctToolId: T.saw.id,
    availableTools: [T.hose, T.saw, T.broom],
    solvedIcon: '🪵🛤️',
    solvedText: 'Prima! Mit der Säge wird der Weg wieder frei.',
    background: 'linear-gradient(#d4efff, #c9b48a)',
  },
]

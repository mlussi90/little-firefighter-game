/** Wie ein Geräusch erzeugt wird, wenn keine Audiodatei (`src`) angegeben ist. */
export type SynthKind = 'dog' | 'doorbell' | 'siren' | 'cat' | 'smoke-alarm'

/** Ein Geräusch im Spiel. */
export interface AudioTrack {
  id: string
  name: string
  spokenName: string // inkl. Artikel, z. B. "die Türklingel"
  /** Emoji für die Auflösung nach der Runde. */
  icon: string
  /** URL einer Audiodatei (z. B. /sounds/hund.mp3). Ohne `src` wird das Geräusch per Web Audio erzeugt. */
  src?: string
  /** Erzeugungsart, falls kein `src` gesetzt ist. */
  synth?: SynthKind
  isSmokeAlarm: boolean
}

// Eigene Audiodateien: `src` setzen – sonst kommt der eingebaute Synthesizer zum Einsatz.
export const TRACKS: readonly AudioTrack[] = [
  { id: 'hund', name: 'Hund', spokenName: 'der Hund', icon: '🐶', synth: 'dog', isSmokeAlarm: false },
  { id: 'tuerklingel', name: 'Türklingel', spokenName: 'die Türklingel', icon: '🔔', synth: 'doorbell', isSmokeAlarm: false },
  { id: 'martinshorn', name: 'Martinshorn', spokenName: 'das Martinshorn', icon: '🚒', synth: 'siren', isSmokeAlarm: false },
  { id: 'katze', name: 'Katze', spokenName: 'die Katze', icon: '🐱', synth: 'cat', isSmokeAlarm: false },
  { id: 'rauchmelder', name: 'Rauchmelder', spokenName: 'der Rauchmelder', icon: '🚨', synth: 'smoke-alarm', isSmokeAlarm: true },
]

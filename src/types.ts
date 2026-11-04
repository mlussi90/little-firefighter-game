export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Player {
  name: string // darf leer sein
  difficulty: Difficulty
}

export const DIFFICULTIES: { id: Difficulty; label: string; emoji: string; hint: string }[] = [
  { id: 'easy', label: 'Leicht', emoji: '🐣', hint: 'Zum Anfangen' },
  { id: 'medium', label: 'Mittel', emoji: '🚒', hint: 'Schon etwas knifflig' },
  { id: 'hard', label: 'Schwer', emoji: '🔥', hint: 'Für echte Profis' },
]

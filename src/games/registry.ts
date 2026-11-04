import { lazy } from 'react'
import type { GameDefinition } from './types'

/**
 * HIER neue Spiele eintragen.
 * 1. Ordner src/games/<name>/ anlegen, mit einer Komponente (default export), die GameProps annimmt.
 * 2. Eintrag unten ergänzen – fertig, die Auswahlseite zeigt es automatisch an.
 */
export const games: GameDefinition[] = [
  {
    id: 'dispatch',
    title: 'Leitstelle',
    emoji: '📞',
    description: 'Nimm die Notrufe an und schicke die Feuerwehr los!',
    color: '#e63946',
    component: lazy(() => import('./dispatch')),
    comingSoon: true,
  },
]

import type { ComponentType, LazyExoticComponent } from 'react'
import type { Player } from '../types'

/** Props, die jedes Spiel von der Plattform bekommt. */
export interface GameProps {
  player: Player
  onExit: () => void
}

/** Ein Eintrag in der Spieleauswahl. */
export interface GameDefinition {
  id: string // wird Teil der URL: #/game/<id>
  title: string
  emoji: string
  description: string // wird auch vorgelesen
  color: string // Kartenfarbe
  component: LazyExoticComponent<ComponentType<GameProps>>
  comingSoon?: boolean
}

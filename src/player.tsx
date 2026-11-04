import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Player } from './types'

const KEY = 'ffgame.player'

function load(): Player | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Player) : null
  } catch {
    return null
  }
}

interface Ctx {
  player: Player | null
  setPlayer: (p: Player) => void
}
const PlayerCtx = createContext<Ctx>({ player: null, setPlayer: () => {} })

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setState] = useState<Player | null>(load)
  const setPlayer = (p: Player) => {
    setState(p)
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* ignorieren */
    }
  }
  return <PlayerCtx.Provider value={{ player, setPlayer }}>{children}</PlayerCtx.Provider>
}

export const usePlayer = () => useContext(PlayerCtx)

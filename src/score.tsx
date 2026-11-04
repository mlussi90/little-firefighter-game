import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

// Plattformweite Punkte für die gesamte Spielsession (alle Minispiele zusammen).
// sessionStorage: überlebt Neuladen und Spielwechsel, ist aber beim Schließen des Tabs weg.
const KEY = 'ffgame.score'

type ByGame = Record<string, number>

function load(): ByGame {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as ByGame
  } catch {
    return {}
  }
}

interface Ctx {
  total: number
  byGame: ByGame
  /** Letzte Punktevergabe (id ändert sich bei jeder Vergabe, für die Animation). */
  last: { n: number; id: number } | null
  /** Von jedem Minispiel aufrufbar: addPoints(10, 'leitstelle') */
  addPoints: (n: number, gameId: string) => void
  reset: () => void
}

const ScoreCtx = createContext<Ctx>({ total: 0, byGame: {}, last: null, addPoints: () => {}, reset: () => {} })

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [byGame, setByGame] = useState<ByGame>(load)
  const [last, setLast] = useState<Ctx['last']>(null)

  const save = (b: ByGame) => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(b))
    } catch {
      /* ignorieren */
    }
  }

  const addPoints = useCallback((n: number, gameId: string) => {
    setByGame((prev) => {
      const next = { ...prev, [gameId]: (prev[gameId] ?? 0) + n }
      save(next)
      return next
    })
    setLast((l) => ({ n, id: (l?.id ?? 0) + 1 }))
  }, [])

  const reset = useCallback(() => {
    setByGame({})
    setLast(null)
    save({})
  }, [])

  const value = useMemo<Ctx>(
    () => ({ total: Object.values(byGame).reduce((a, b) => a + b, 0), byGame, last, addPoints, reset }),
    [byGame, last, addPoints, reset],
  )
  return <ScoreCtx.Provider value={value}>{children}</ScoreCtx.Provider>
}

export const useScore = () => useContext(ScoreCtx)

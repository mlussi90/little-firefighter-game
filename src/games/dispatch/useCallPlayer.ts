import { useCallback, useEffect, useRef, useState } from 'react'
import { speakAsync, stopSpeaking } from '../../speech'

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Spielt die Zeilen des Anrufs nacheinander ab und meldet, welche Zeile gerade gesprochen wird. */
export function useCallPlayer(zeilen: string[]) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(-1)
  const [plays, setPlays] = useState(0) // wie oft der Anruf vollständig gehört wurde
  const run = useRef(0)

  const play = useCallback(async () => {
    const id = ++run.current
    stopSpeaking()
    setPlaying(true)
    for (let i = 0; i < zeilen.length; i++) {
      if (run.current !== id) return
      setCurrent(i)
      await speakAsync(zeilen[i])
      if (run.current !== id) return
      await wait(600)
    }
    if (run.current === id) {
      setPlaying(false)
      setCurrent(-1)
      setPlays((p) => p + 1)
    }
  }, [zeilen])

  // Beim Verlassen sofort verstummen
  useEffect(
    () => () => {
      run.current++
      stopSpeaking()
    },
    [],
  )

  return { playing, current, plays, play }
}

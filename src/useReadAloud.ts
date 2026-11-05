import { useCallback, useEffect, useRef, useState } from 'react'
import { speakAsync, stopSpeaking } from './speech'

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Liest erst die Frage und danach jede Antwort vor; `hot` ist der Index der gerade genannten Antwort
 * (zum Hervorheben). `labels` bitte memoisieren, sonst startet das Vorlesen bei jedem Render neu.
 */
export function useReadAloud(intro: string, labels: string[]) {
  const [hot, setHot] = useState(-1)
  const run = useRef(0)

  const stop = useCallback(() => {
    run.current++
    stopSpeaking()
    setHot(-1)
  }, [])

  const start = useCallback(async () => {
    const id = ++run.current
    stopSpeaking()
    setHot(-1)
    await speakAsync(intro)
    for (let i = 0; i < labels.length; i++) {
      if (run.current !== id) return
      setHot(i)
      await speakAsync(labels[i])
      if (run.current !== id) return
      await wait(250)
    }
    if (run.current === id) setHot(-1)
  }, [intro, labels])

  useEffect(() => {
    void start()
    return () => {
      run.current++
      stopSpeaking()
    }
  }, [start])

  return { hot, start, stop }
}

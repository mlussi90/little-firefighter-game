import type { AudioTrack, SynthKind } from './tracks'

export interface PlayingTrack {
  stop: () => void
  /** Ungefähre Länge in ms (bei Dateien unbekannt: 0). */
  durationMs: number
}

let ctx: AudioContext | null = null
function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!C) return null
      ctx = new C()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Muss in einem Klick-Handler aufgerufen werden, damit der Browser Ton erlaubt. */
export function unlockAudio() {
  audio()
}

type Node = OscillatorNode
function burst(c: AudioContext, out: AudioNode, nodes: Node[], o: {
  t: number; dur: number; f0: number; f1?: number; type: OscillatorType; vol: number; vibrato?: number
}) {
  const t = c.currentTime + o.t
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = o.type
  osc.frequency.setValueAtTime(o.f0, t)
  if (o.f1) osc.frequency.linearRampToValueAtTime(o.f1, t + o.dur)
  if (o.vibrato) {
    const lfo = c.createOscillator()
    const lg = c.createGain()
    lfo.frequency.value = o.vibrato
    lg.gain.value = o.f0 * 0.04
    lfo.connect(lg).connect(osc.frequency)
    lfo.start(t)
    lfo.stop(t + o.dur + 0.05)
    nodes.push(lfo)
  }
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.vol, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
  osc.connect(g).connect(out)
  osc.start(t)
  osc.stop(t + o.dur + 0.05)
  nodes.push(osc)
}

/** Pro Geräusch: Länge in ms und Aufbau. Der Rauchmelder wiederholt sich, bis das Kind reagiert. */
const SYNTH: Record<SynthKind, { ms: number; build: (c: AudioContext, out: AudioNode, n: Node[]) => void }> = {
  dog: {
    ms: 1500,
    build: (c, out, n) => {
      for (const t of [0, 0.5, 1.0]) burst(c, out, n, { t, dur: 0.22, f0: 520, f1: 260, type: 'sawtooth', vol: 0.18 })
    },
  },
  doorbell: {
    ms: 1600,
    build: (c, out, n) => {
      burst(c, out, n, { t: 0, dur: 0.7, f0: 659.25, type: 'sine', vol: 0.25 })
      burst(c, out, n, { t: 0.55, dur: 0.9, f0: 523.25, type: 'sine', vol: 0.25 })
    },
  },
  siren: {
    ms: 2000,
    build: (c, out, n) => {
      for (let i = 0; i < 4; i++) burst(c, out, n, { t: i * 0.5, dur: 0.48, f0: i % 2 ? 392 : 523.25, type: 'square', vol: 0.08 })
    },
  },
  cat: {
    ms: 1400,
    build: (c, out, n) => {
      burst(c, out, n, { t: 0, dur: 0.35, f0: 500, f1: 900, type: 'triangle', vol: 0.22, vibrato: 7 })
      burst(c, out, n, { t: 0.35, dur: 0.7, f0: 900, f1: 420, type: 'triangle', vol: 0.22, vibrato: 7 })
    },
  },
  'smoke-alarm': {
    // Typisches Muster: drei schrille Pieptöne, kurze Pause – dann wieder von vorn.
    ms: 2400,
    build: (c, out, n) => {
      for (const t of [0, 0.25, 0.5, 1.4, 1.65, 1.9]) burst(c, out, n, { t, dur: 0.17, f0: 3100, type: 'square', vol: 0.1 })
    },
  },
}

/** Spielt ein Geräusch. `loop` wiederholt es, bis `stop()` aufgerufen wird. */
export function playTrack(track: AudioTrack, loop = false): PlayingTrack {
  // Audiodatei hat Vorrang
  if (track.src) {
    const a = new Audio(track.src)
    a.loop = loop
    void a.play().catch(() => {})
    return { stop: () => { a.pause(); a.currentTime = 0 }, durationMs: 0 }
  }

  const c = audio()
  const spec = SYNTH[track.synth ?? 'dog']
  if (!c) return { stop: () => {}, durationMs: spec.ms }

  const nodes: Node[] = []
  const out = c.createGain()
  out.connect(c.destination)
  let stopped = false
  let timer = 0
  const run = () => {
    if (stopped) return
    spec.build(c, out, nodes)
    if (loop) timer = window.setTimeout(run, spec.ms)
  }
  run()
  return {
    durationMs: spec.ms,
    stop: () => {
      stopped = true
      window.clearTimeout(timer)
      out.gain.cancelScheduledValues(c.currentTime)
      out.gain.setValueAtTime(0, c.currentTime)
      for (const o of nodes) { try { o.stop() } catch { /* schon gestoppt */ } }
    },
  }
}

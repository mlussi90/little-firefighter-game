// Kleine Soundeffekte, direkt im Browser erzeugt (Web Audio) – keine Audiodateien nötig.
// Bewusst weich und kurz; der Korrektur-Ton ist freundlich und nicht "negativ".

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + start
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/** Fröhlicher aufsteigender Klang bei richtiger Antwort. */
export function playSuccess() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.18))
}

/** Sanftes, tiefes "Hmm" – Hinweis zum nochmal Versuchen, ohne Bestrafung. */
export function playGentle() {
  tone(392, 0, 0.18, 'sine', 0.12)
  tone(349.23, 0.16, 0.25, 'sine', 0.1)
}

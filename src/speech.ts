// Vorlesen per Browser-Sprachausgabe – der Sohn kann noch nicht lesen.
//
// Ohne explizit gewählte Stimme nimmt der Browser oft die Standardstimme (meist Englisch),
// auch wenn lang="de-DE" gesetzt ist. Deshalb suchen wir selbst die beste deutsche Stimme aus.

const synth = 'speechSynthesis' in window ? window.speechSynthesis : null

// Bevorzugte Stimmen, in dieser Reihenfolge (Teilstrings, Groß-/Kleinschreibung egal).
// "natural"/"neural" = sehr gute Online-Stimmen (Edge), "google" = Chrome, Rest = macOS/iOS.
// macOS benennt die Qualitätsstufen je nach Systemsprache "Erweitert"/"Enhanced" bzw. "Premium".
const PREFERRED = ['natural', 'neural', 'premium', 'erweitert', 'enhanced', 'google', 'anna', 'petra', 'markus', 'yannick']

function pickGermanVoice(): SpeechSynthesisVoice | null {
  if (!synth) return null
  const german = synth.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('de'))
  if (german.length === 0) return null

  const score = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase()
    const idx = PREFERRED.findIndex((p) => name.includes(p))
    let s = idx === -1 ? 0 : PREFERRED.length - idx
    if (v.lang.toLowerCase().replace('_', '-') === 'de-de') s += 0.5 // Deutschland vor AT/CH
    return s
  }
  return german.sort((a, b) => score(b) - score(a))[0]
}

let voice: SpeechSynthesisVoice | null = null
if (synth) {
  // Stimmen werden von vielen Browsern erst asynchron geladen.
  const refresh = () => {
    voice = pickGermanVoice()  }
  refresh()
  synth.addEventListener('voiceschanged', refresh)
}

export function speak(text: string) {
  if (!synth) return
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'de-DE'
  if (voice) u.voice = voice
  u.rate = 0.95
  u.pitch = 1 // höhere Tonlage klingt bei den meisten Stimmen blechern
  synth.speak(u)
}

export function stopSpeaking() {
  synth?.cancel()
}

/**
 * Spricht einen Text und löst auf, sobald er zu Ende ist (oder abgebrochen wurde).
 * Bricht NICHT vorher ab – für Sequenzen gedacht. Hat eine Sicherung, falls der
 * Browser das "end"-Ereignis nie schickt, und funktioniert auch ganz ohne Sprachausgabe.
 */
export function speakAsync(text: string, opts: { rate?: number; pitch?: number } = {}): Promise<void> {
  const fallbackMs = text.length * 90 + 800
  return new Promise((resolve) => {
    if (!synth) {
      setTimeout(resolve, fallbackMs)
      return
    }
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'de-DE'
    if (voice) u.voice = voice
    u.rate = opts.rate ?? 0.95
    u.pitch = opts.pitch ?? 1
    const safety = setTimeout(resolve, fallbackMs * 3 + 3000)
    const done = () => {
      clearTimeout(safety)
      resolve()
    }
    u.onend = done
    u.onerror = done
    synth.speak(u)
  })
}

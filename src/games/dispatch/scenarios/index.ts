import { SLOTS, type Szenario } from '../types'

// Jede Datei *.szenario.ts in diesem Ordner wird automatisch geladen.
// Neues Szenario = neue Datei anlegen (am besten eine bestehende kopieren).
const module = import.meta.glob<{ default: Szenario }>('./*.szenario.ts', { eager: true })

export const szenarien: Szenario[] = Object.values(module).map((m) => m.default)

// Plausibilitätsprüfung im Dev-Modus – meldet Tippfehler und Lücken sofort in der Konsole.
if (import.meta.env.DEV) {
  const ids = new Set<string>()
  for (const s of szenarien) {
    if (ids.has(s.id)) console.error(`[Leitstelle] Doppelte Szenario-ID: ${s.id}`)
    ids.add(s.id)
    for (const { id } of SLOTS) {
      const f = s.fakten[id]
      if (!f?.sage || !f.kachel?.text || !f.kachel?.emoji) console.error(`[Leitstelle] ${s.id}: Fakt "${id}" unvollständig`)
    }
    for (const a of s.ablenker ?? []) {
      if (a.kachel.text === s.fakten[a.slot].kachel.text) console.error(`[Leitstelle] ${s.id}: Ablenker "${a.kachel.text}" ist gleich der richtigen Antwort`)
    }
  }
}

import type { Szenario } from '../types'

export default {
  id: 'fahrrad',
  titel: 'Fahrradsturz',
  emoji: '🚲',
  fakten: {
    wo: { sage: 'Ich bin im Stadtpark, direkt beim Teich.', kachel: { emoji: '🦆', text: 'Stadtpark am Teich' } },
    was: { sage: 'Ein Junge ist mit dem Fahrrad gestürzt.', kachel: { emoji: '🚲💥', text: 'Fahrradsturz' } },
    wieviele: { sage: 'Es ist nur ein Junge verletzt.', kachel: { emoji: '👦', text: 'Ein Junge' } },
    verletzung: { sage: 'Sein Knie blutet stark und er kann nicht aufstehen.', kachel: { emoji: '🦵🩸', text: 'Blutendes Knie' } },
    warten: { sage: 'Ich bleibe bei ihm und warte auf Ihre Fragen.', kachel: { emoji: '👂📞', text: 'Bleibt am Telefon' } },
  },
  ablenker: [
    { slot: 'wo', kachel: { emoji: '🚉', text: 'Bahnhof' } },
    { slot: 'was', kachel: { emoji: '🧗💥', text: 'Sturz vom Klettergerüst' } },
    { slot: 'wieviele', kachel: { emoji: '🧒🧒', text: 'Zwei Kinder' }, sage: 'Sein Freund ist auch dabei, dem geht es aber gut.' },
    { slot: 'verletzung', kachel: { emoji: '💪🩹', text: 'Arm verletzt' } },
  ],
  stoerinfos: [
    { sage: 'Auf dem Teich schwimmen viele Enten.' },
    { sage: 'Sein Fahrrad ist grün.' },
    { sage: 'Wir wollten danach ein Eis essen.' },
  ],
} satisfies Szenario

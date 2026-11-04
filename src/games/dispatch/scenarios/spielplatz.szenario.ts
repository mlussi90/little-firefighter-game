import type { Szenario } from '../types'

export default {
  id: 'spielplatz',
  titel: 'Sturz auf dem Spielplatz',
  emoji: '🛝',
  fakten: {
    wo: { sage: 'Ich bin auf dem Spielplatz am Lindenweg.', kachel: { emoji: '🛝', text: 'Spielplatz Lindenweg' } },
    was: { sage: 'Ein Kind ist vom Klettergerüst gefallen.', kachel: { emoji: '🧗💥', text: 'Sturz vom Klettergerüst' } },
    wieviele: { sage: 'Es ist nur ein Kind verletzt.', kachel: { emoji: '🧒', text: 'Ein Kind' } },
    verletzung: { sage: 'Das Kind hat starke Schmerzen am Arm und weint ganz laut.', kachel: { emoji: '💪🩹', text: 'Arm verletzt' } },
    warten: { sage: 'Ich bleibe bei dem Kind und warte auf Ihre Fragen.', kachel: { emoji: '👂📞', text: 'Bleibt am Telefon' } },
  },
  ablenker: [
    { slot: 'wo', kachel: { emoji: '🌳', text: 'Park' }, sage: 'Vorhin waren wir noch im Park.' },
    { slot: 'was', kachel: { emoji: '🚲💥', text: 'Fahrradsturz' }, sage: 'Neben dem Spielplatz ist ein Fahrradweg.' },
    { slot: 'wieviele', kachel: { emoji: '🧒🧒', text: 'Zwei Kinder' } },
    { slot: 'verletzung', kachel: { emoji: '🤕', text: 'Kopfverletzung' } },
  ],
  stoerinfos: [
    { sage: 'Die anderen Kinder spielen gerade Fangen.' },
    { sage: 'Wir hatten Eis dabei.' },
    { sage: 'Heute ist es richtig heiß.' },
  ],
} satisfies Szenario

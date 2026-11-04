import type { Szenario } from '../types'

export default {
  id: 'treppenhaus',
  titel: 'Rauch im Treppenhaus',
  emoji: '🏢',
  fakten: {
    wo: { sage: 'Ich bin im Mehrfamilienhaus in der Gartenstraße 12.', kachel: { emoji: '🏢', text: 'Gartenstraße 12' } },
    was: { sage: 'Im Treppenhaus qualmt es und der Rauchmelder piept!', kachel: { emoji: '🚨', text: 'Rauch im Treppenhaus' } },
    wieviele: { sage: 'Zwei Nachbarn stehen am Fenster und rufen um Hilfe.', kachel: { emoji: '🙋', text: 'Zwei Personen' } },
    verletzung: { sage: 'Sie bekommen schlecht Luft.', kachel: { emoji: '😮‍💨', text: 'Atemnot' } },
    warten: { sage: 'Ich bleibe am Telefon und warte auf Ihre Fragen.', kachel: { emoji: '👂', text: 'Bleibt am Telefon' } },
  },
  ablenker: [
    { slot: 'wo', kachel: { emoji: '🛒', text: 'Supermarkt' }, sage: 'Ich komme gerade vom Supermarkt.' },
    { slot: 'was', kachel: { emoji: '🐱', text: 'Katze auf dem Baum' } },
    { slot: 'wieviele', kachel: { emoji: '👤', text: 'Eine Person' } },
    { slot: 'verletzung', kachel: { emoji: '🦴', text: 'Knochenbruch' } },
  ],
  stoerinfos: [
    { sage: 'Im Erdgeschoss wohnt ein Hund.' },
    { sage: 'Das Haus ist ganz neu gestrichen.' },
    { sage: 'Ich habe meinen Schlüssel vergessen.' },
  ],
} satisfies Szenario

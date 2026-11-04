import type { Szenario } from '../types'

export default {
  id: 'unfall',
  titel: 'Autounfall',
  emoji: '🚗',
  fakten: {
    wo: { sage: 'Wir sind an der Kreuzung Hauptstraße und Bahnhofstraße.', kachel: { emoji: '🚦', text: 'Kreuzung Hauptstraße' } },
    was: { sage: 'Zwei Autos sind zusammengestoßen!', kachel: { emoji: '🚗💥', text: 'Autounfall' } },
    wieviele: { sage: 'Es sind drei Personen in den Autos.', kachel: { emoji: '🧑🧑🧑', text: 'Drei Personen' } },
    verletzung: { sage: 'Ein Mann blutet am Kopf und ist ganz benommen.', kachel: { emoji: '🤕', text: 'Kopfverletzung' } },
    warten: { sage: 'Ich bleibe an der Unfallstelle und warte auf Ihre Fragen.', kachel: { emoji: '👂📞', text: 'Bleibt am Telefon' } },
  },
  ablenker: [
    { slot: 'wo', kachel: { emoji: '🌳', text: 'Park' }, sage: 'Hinter uns ist ein schöner Park.' },
    { slot: 'was', kachel: { emoji: '🔥', text: 'Brand' } },
    { slot: 'wieviele', kachel: { emoji: '🧑', text: 'Eine Person' } },
    { slot: 'verletzung', kachel: { emoji: '😷💨', text: 'Rauch eingeatmet' } },
  ],
  stoerinfos: [
    { sage: 'Ich war gerade auf dem Weg zum Einkaufen.' },
    { sage: 'Die Sonne scheint heute so schön.' },
    { sage: 'Mein Handy hat nur noch wenig Akku.' },
  ],
} satisfies Szenario

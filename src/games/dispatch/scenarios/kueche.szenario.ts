import type { Szenario } from '../types'

export default {
  id: 'kueche',
  titel: 'Küchenbrand',
  emoji: '🍳',
  fakten: {
    wo: { sage: 'Ich wohne in der Blumenstraße 5.', kachel: { emoji: '🏠🌸', text: 'Blumenstraße 5' } },
    was: { sage: 'Bei uns brennt es in der Küche, der Herd hat Feuer gefangen!', kachel: { emoji: '🍳🔥', text: 'Küchenbrand' } },
    wieviele: { sage: 'Meine Oma ist noch in der Wohnung, sonst ist niemand da.', kachel: { emoji: '👵', text: 'Eine Person' } },
    verletzung: { sage: 'Sie muss ganz doll husten, weil so viel Rauch in der Luft ist.', kachel: { emoji: '😷💨', text: 'Rauch eingeatmet' } },
    warten: { sage: 'Ich bleibe am Telefon und warte auf Ihre Fragen.', kachel: { emoji: '👂📞', text: 'Bleibt am Telefon' } },
  },
  ablenker: [
    { slot: 'wo', kachel: { emoji: '🏫', text: 'Schule' }, sage: 'Meine Schwester ist gerade in der Schule.' },
    { slot: 'was', kachel: { emoji: '🚗💥', text: 'Autounfall' }, sage: 'Draußen auf der Straße ist gerade ein Auto vorbeigefahren.' },
    { slot: 'verletzung', kachel: { emoji: '🦴💥', text: 'Knochenbruch' } },
    { slot: 'wieviele', kachel: { emoji: '🧑🧑🧑', text: 'Drei Personen' } },
  ],
  stoerinfos: [
    { sage: 'Es regnet draußen ganz doll.' },
    { sage: 'Ich habe heute Geburtstag.' },
    { sage: 'Unsere Katze Mimi schläft auf dem Sofa.' },
  ],
} satisfies Szenario

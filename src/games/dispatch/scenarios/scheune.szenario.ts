import type { Szenario } from '../types'

export default {
  id: 'scheune',
  titel: 'Scheunenbrand',
  emoji: '🚜',
  fakten: {
    wo: { sage: 'Wir sind auf dem Bauernhof in Obersdorf.', kachel: { emoji: '🚜', text: 'Bauernhof Obersdorf' } },
    was: { sage: 'In der Scheune brennt das Heu!', kachel: { emoji: '🌾🔥', text: 'Heu brennt' } },
    wieviele: { sage: 'Mein Opa war in der Scheune, er ist jetzt draußen.', kachel: { emoji: '👴', text: 'Eine Person' } },
    verletzung: { sage: 'Er hat sich die Hand verbrannt.', kachel: { emoji: '🖐️🔥', text: 'Verbrannte Hand' } },
    warten: { sage: 'Ich bleibe am Telefon und warte auf Ihre Fragen.', kachel: { emoji: '👂📞', text: 'Bleibt am Telefon' } },
  },
  ablenker: [
    { slot: 'wo', kachel: { emoji: '🏙️', text: 'Stadt' } },
    { slot: 'was', kachel: { emoji: '🌊', text: 'Hochwasser' }, sage: 'Gestern hat es auch ganz viel geregnet.' },
    { slot: 'wieviele', kachel: { emoji: '🧑🧑🧑🧑', text: 'Vier Personen' } },
    { slot: 'verletzung', kachel: { emoji: '🦶🩹', text: 'Verstauchter Fuß' } },
  ],
  stoerinfos: [
    { sage: 'Wir haben sieben Hühner.' },
    { sage: 'Unser Traktor ist blau.' },
    { sage: 'Morgen wollen wir Kuchen backen.' },
  ],
} satisfies Szenario

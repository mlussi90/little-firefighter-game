// Vorlesen per Browser-Sprachausgabe – der Sohn kann noch nicht lesen.
export function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'de-DE'
  u.rate = 0.9
  u.pitch = 1.1
  window.speechSynthesis.speak(u)
}

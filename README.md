# 🚒 Feuerwehr Abenteuer

Ein kleines Lernspiel für Kinder (Vorschul- und Grundschulalter) rund um Brandschutz und richtiges Verhalten im Notfall. Das Spiel läuft komplett im Browser, braucht keinen Server und sammelt keine Daten. Fast alles wird vorgelesen, damit auch Kinder spielen können, die noch nicht lesen.

*English version: see [below](#english).*

## Die Minispiele

| Spiel | Worum geht's? |
| --- | --- |
| 📞 **Leitstelle** | Du nimmst Notrufe an und musst gut zuhören. Beantworte die fünf W-Fragen: **Wo** ist es passiert? **Was** ist passiert? **Wie viele** Personen sind betroffen? **Welche Verletzungen** gibt es? Und: Der Anrufer **wartet auf Rückfragen**. Tippe jeweils die passende Kachel an. |
| ✋🧸 **Gefahr oder sicher?** | Gegenstände wie Kerze, Streichhölzer oder Teddybär werden vorgelesen. Sortiere sie: Ist das zum Spielen (sicher) oder nur für Erwachsene (gefährlich)? |
| 🏃🔥 **Der Weg ins Freie** | Es brennt und es qualmt! Hilf dem Kind, richtig zu handeln: Rauch steigt nach oben, also unten bleiben und krabbeln, zur Tür gehen und zum Sammelplatz laufen. |

## So wird gespielt

1. **Startseite:** Gib optional deinen Namen ein (du musst nicht) und wähle die Schwierigkeit:
   - 🐣 **Leicht**: zum Anfangen, mit Hilfestellungen
   - 🚒 **Mittel**: schon etwas knifflig
   - 🔥 **Schwer**: für echte Profis
2. Tippe auf **„Los geht's!“** und wähle auf der Spieleseite ein Minispiel.
3. Für richtige Antworten gibt es **Punkte** (und in der Leitstelle ⭐ Sterne). Die Punkte aller Minispiele werden zusammengezählt. Sie bleiben beim Neuladen und Spielwechsel erhalten und sind weg, sobald der Browser-Tab geschlossen wird.
4. Mit **⬅️ Zurück** kommst du jederzeit zur Spieleauswahl.

Tipps:
- Mit dem 🔊-Knopf lässt sich Vorgelesenes erneut anhören.
- In der **Leitstelle** zeigt **„📖 Text anzeigen“** den Anruf als Text, für Kinder, die schon lesen können. Die Einstellung wird im Browser gemerkt.
- Schalte den Ton am Gerät ein, die Sprachausgabe nutzt die Stimme des Browsers (Deutsch).

## Entwicklung

Voraussetzungen: [Node.js](https://nodejs.org) 22 (wie in der CI) und npm.

```bash
npm install       # Abhängigkeiten installieren
npm run dev       # Entwicklungsserver starten (Vite)
npm run build     # Typprüfung (tsc) und Produktions-Build nach dist/
npm run preview   # Produktions-Build lokal ansehen
```

Technik: React 19, TypeScript und Vite. Der Build nutzt `base: './'` und einen Hash-Router, daher lässt er sich auf jedem statischen Hosting (z. B. GitHub Pages) ohne Serverkonfiguration betreiben. Die CI (`.github/workflows/ci.yml`) prüft bei Pull Requests Typen und Build.

### Projektstruktur

```
src/
├── games/
│   ├── registry.ts        # Liste aller Minispiele
│   ├── dispatch/          # Leitstelle (Engine, Szenarien, Anruf-Wiedergabe)
│   ├── danger-sort/       # Gefahr oder sicher?
│   └── escape-route/      # Der Weg ins Freie
├── pages/                 # Startseite, Spieleauswahl, Spielseite
├── score.tsx              # Punkte über alle Spiele
├── speech.ts, sound.ts    # Sprachausgabe und Soundeffekte
└── router.ts              # Minimaler Hash-Router
```

### Neues Minispiel hinzufügen

1. Ordner `src/games/<name>/` anlegen, mit einer Komponente (default export), die `GameProps` annimmt (Spieler, `onExit`).
2. Einen Eintrag in `src/games/registry.ts` ergänzen. Die Spieleauswahl zeigt es automatisch an.
3. Punkte vergibst du über `useScore().addPoints(n, '<spiel-id>')`.

### Inhalte erweitern

- **Leitstelle:** neue Datei `src/games/dispatch/scenarios/<name>.szenario.ts` nach dem Typ `Szenario` (siehe `types.ts`) anlegen und in `scenarios/index.ts` eintragen. Fehlende Ablenker-Kacheln werden automatisch aus anderen Szenarien aufgefüllt.
- **Gefahr oder sicher?:** neue Gegenstände in `src/games/danger-sort/items.ts` ergänzen.

---

<a id="english"></a>

# 🚒 Firefighter Adventure (English)

A small educational game for children (preschool and primary school age) about fire safety and how to behave correctly in an emergency. It runs entirely in the browser, needs no server and collects no data. Almost everything is read aloud, so children who cannot read yet can play too. The game's interface and spoken content are in German.

## Mini-games

| Game | What is it about? |
| --- | --- |
| 📞 **Leitstelle** (Dispatch) | You answer emergency calls and have to listen carefully. Answer the five W-questions: **where** did it happen, **what** happened, **how many** people are affected, **which injuries** are there, and the caller **waits for follow-up questions**. Tap the matching tile for each. |
| ✋🧸 **Gefahr oder sicher?** (Dangerous or safe?) | Items such as a candle, matches or a teddy bear are read aloud. Sort them: is it safe to play with, or for adults only (dangerous)? |
| 🏃🔥 **Der Weg ins Freie** (The way out) | There is a fire and smoke! Help the child act correctly: smoke rises, so stay low and crawl, go to the door and run to the assembly point. |

## How to play

1. **Start page:** optionally enter your name, then pick a difficulty: 🐣 Easy (with hints), 🚒 Medium, or 🔥 Hard.
2. Tap **"Los geht's!"** (Let's go!) and choose a mini-game.
3. Correct answers earn **points** (and ⭐ stars in the dispatch game). Points from all mini-games add up. They survive page reloads and switching games, and are cleared when the browser tab is closed.
4. Use **⬅️ Zurück** (Back) to return to the game selection at any time.

Tips: the 🔊 button replays what was read aloud; in the dispatch game, "📖 Text anzeigen" shows the call as text for children who can already read; make sure your device sound is on, since speech uses the browser's German voice.

## Development

Requirements: Node.js 22 (as in CI) and npm.

```bash
npm install       # install dependencies
npm run dev       # start the dev server (Vite)
npm run build     # type check (tsc) and production build into dist/
npm run preview   # preview the production build locally
```

Built with React 19, TypeScript and Vite. The build uses `base: './'` and a hash router, so it can be hosted on any static host (e.g. GitHub Pages) without server configuration.

To add a mini-game, create a folder under `src/games/<name>/` with a default-exported component taking `GameProps`, and register it in `src/games/registry.ts`. To add dispatch scenarios, add a `*.szenario.ts` file in `src/games/dispatch/scenarios/` and register it in `index.ts`. To add items for the sorting game, extend `src/games/danger-sort/items.ts`.

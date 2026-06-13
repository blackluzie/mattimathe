# Mattis Mathe – Klasse 9 (Gymnasium NRW)

Ein kleines Lernprojekt zum Üben für die nächste Mathe-Arbeit. Es deckt die Themen
der **Klasse 9 (Gymnasium NRW, Lambacher Schweizer 9)** ab – mit dem Schwerpunkt auf
**interaktiven App-Übungen**; Arbeitsblätter gibt es zu jedem Thema zusätzlich. Themen:

- √ **Reelle Zahlen & Wurzeln** – Quadratwurzeln, rationale/irrationale Zahlen, Wurzelgesetze, teilweises Wurzelziehen
- 🔢 **Potenzen & Potenzgesetze** – Rechnen mit Potenzen, negative Exponenten, wissenschaftliche Schreibweise
- ⚖️ **Quadratische Gleichungen** – Wurzelziehen, Ausklammern, p-q-Formel, Diskriminante
- 📈 **Funktionen** – lineare und quadratische Funktionen: Steigung, Parabel, Scheitelpunkt, Nullstellen (p-q-Formel)
- 📐 **Flächenberechnung** – Dreieck, Parallelogramm, Trapez, Kreis, Kreissektor und zusammengesetzte Flächen
- 📐 **Satz des Pythagoras** – fehlende Seiten im rechtwinkligen Dreieck (a² + b² = c²)
- 🔺 **Ähnlichkeit & Strahlensätze** – zentrische Streckung, Streckfaktor, Strahlensätze, Maßstab
- 📏 **Trigonometrie** – Sinus, Kosinus, Tangens im rechtwinkligen Dreieck (SOH CAH TOA)
- 🧊 **Körper** – Volumen und Oberfläche von Prisma, Zylinder, Pyramide, Kegel und Kugel
- 🎲 **Wahrscheinlichkeit** – Laplace-Formel, Gegenwahrscheinlichkeit, Baumdiagramme, Pfadregeln

Es gibt **dreierlei**: eine interaktive Lern-Webseite (Erklärungen + sofortiges
Feedback), druckbare Arbeitsblätter mit Lösungen **und** eine
📸 **Foto-Korrektur**: Matti füllt ein Arbeitsblatt mit Stift aus, fotografiert es
ab, und eine KI (Claude) liest seine Handschrift, vergleicht sie mit den
Musterlösungen und gibt eine Rückmeldung pro Aufgabe. Die Seite ist als PWA
installierbar und funktioniert nach dem ersten Laden auch offline (die
Foto-Korrektur braucht natürlich Internet).

Veröffentlicht unter **https://matti.hoffknecht.de** – geschützt durch ein Passwort-Login.

---

## Aufbau

```
public/                     ← die eigentliche Webseite (statisch)
  index.html                  Startseite – baut sich aus js/topics.js auf
  flaeche.html                Lernseite + interaktive Übungen
  funktionen.html             Lernseite + interaktive Übungen
  korrektur.html              📸 Foto-Korrektur (Blatt fotografieren → Rückmeldung)
  arbeitsblatt-*.html         druckbare Arbeitsblätter (mit Lösungen)
  css/style.css               Design (Petrol/Teal-Akzent)
  js/topics.js                THEMEN-REGISTER (zentrale Themenliste)
  js/quiz.js                  Übungs-Engine (Feedback, Tipps)
  js/korrektur.js             Foto-Korrektur: Bild verkleinern + Ergebnis anzeigen
  manifest.webmanifest, sw.js PWA (installierbar, offline)
  icons/                      App-Icons
worker/index.js             Cloudflare Worker: Login-Schutz, Ausliefern,
                            /api/check-worksheet (Foto-Korrektur per Claude Vision)
                            + WORKSHEETS (Lösungsschlüssel pro Arbeitsblatt)
wrangler.toml               Deployment-Konfiguration
tools/generate-icons.js     erzeugt die Icons neu (node tools/generate-icons.js)
```

---

## 🧩 Ein neues Thema hinzufügen

Die App ist bewusst so gebaut, dass immer neue Themen dazukommen können. Für ein
neues Thema (z. B. „Trigonometrie") sind nur wenige Schritte nötig:

1. **Lernseite** anlegen: `public/trigonometrie.html`
   (am einfachsten `flaeche.html` kopieren und Inhalt + Quiz-Aufgaben ersetzen).
2. **Arbeitsblatt** anlegen: `public/arbeitsblatt-trigonometrie.html`
   (Vorlage: ein vorhandenes `arbeitsblatt-*.html`).
3. **Im Themen-Register eintragen:** in `public/js/topics.js` einen Eintrag ins
   Array `THEMEN` ergänzen (`id`, `emoji`, `titel`, `kurz`, `lernseite`,
   `arbeitsblatt`). Startseite und Foto-Auswahl aktualisieren sich automatisch.
4. **Lösungsschlüssel** für die Foto-Korrektur in `worker/index.js` ergänzen
   (Objekt `WORKSHEETS`, gleiche `id` wie in Schritt 3).
5. **Offline-Cache:** die neuen Dateinamen in `public/sw.js` (Liste `ASSETS`)
   ergänzen und die Versionsnummer `CACHE` erhöhen.

Mehr ist nicht nötig – kein Umbau an der Engine, kein neues Routing.

---

## Veröffentlichen (Cloudflare)

Voraussetzung: Node ist installiert und die Zone `hoffknecht.de` liegt in eurem
Cloudflare-Konto.

Im Repository ist ein **GitHub-Actions-Workflow** hinterlegt
(`.github/workflows/deploy.yml`): Bei jedem Push auf den Entwicklungs- oder
`main`-Branch wird automatisch deployt. Benötigte Repo-Secrets:
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` und (für die Foto-Korrektur)
`ANTHROPIC_API_KEY`. Der Workflow setzt `ANTHROPIC_API_KEY` nach dem Deploy
automatisch als Worker-Secret.

Manuell geht es mit dem Skript (lädt den Worker hoch *und* setzt die Secrets):

```bash
export CLOUDFLARE_API_TOKEN="dein-token"
export CLOUDFLARE_ACCOUNT_ID="deine-account-id"
export SITE_PASSWORD="das-login-passwort"
export ANTHROPIC_API_KEY="dein-anthropic-key"   # optional
npm install
bash tools/deploy.sh
```

Das Skript erzeugt `AUTH_SECRET` automatisch, falls es nicht gesetzt ist.
Alternativ einzeln: `npm run deploy` und danach
`npx wrangler secret put SITE_PASSWORD` / `AUTH_SECRET` / `ANTHROPIC_API_KEY`.

`ANTHROPIC_API_KEY` ist nur für die Foto-Korrektur nötig (Schlüssel aus der
[Claude-Console](https://console.anthropic.com)). Ohne ihn funktionieren Üben und
Drucken normal weiter; die Foto-Korrektur meldet dann freundlich, dass sie noch
nicht eingerichtet ist.

### Lokal ausprobieren

```bash
cp .dev.vars.example .dev.vars   # Passwort + Secrets eintragen
npm install
npm run dev
```

---

## Wie der Login-Schutz funktioniert

- Jede Anfrage läuft zuerst durch den Worker (`run_worker_first = true`).
- Ohne gültiges Cookie erscheint die Login-Seite.
- Nach richtigem Passwort wird ein mit `AUTH_SECRET` **signiertes** Cookie gesetzt
  (HMAC-SHA256, 30 Tage gültig). Das Passwort selbst wird nicht im Cookie gespeichert.
- Abmelden: `https://matti.hoffknecht.de/logout`.

Das ist bewusst einfach gehalten (ein gemeinsames Familien-Passwort) – derselbe
Mechanismus wird auch bei „Jettes Mathe" verwendet.

Viel Erfolg für die Arbeit! 💪

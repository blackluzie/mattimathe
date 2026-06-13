/* =====================================================================
   THEMEN-REGISTER für Mattis Mathe (Klasse 9, Gymnasium NRW)

   Das ist die EINZIGE Stelle im Frontend, an der Themen eingetragen
   werden. Startseite und Foto-Korrektur lesen diese Liste aus und
   bauen sich daraus automatisch zusammen.

   So fügst du ein neues Thema hinzu:
   1. Lege eine Lernseite an (z. B. "trigonometrie.html") – optional.
   2. Lege ein Arbeitsblatt an (z. B. "arbeitsblatt-trigonometrie.html")
      – optional.
   3. Trage das Thema hier unten ins Array THEMEN ein.
   4. Trage den Lösungsschlüssel im Worker ein (worker/index.js → WORKSHEETS),
      damit die Foto-Korrektur das Blatt kennt.
   5. Ergänze die neuen Dateinamen in public/sw.js (ASSETS-Liste),
      damit die App offline funktioniert.

   Felder eines Themas:
     id           eindeutiger Schlüssel (muss zum Worker-WORKSHEETS passen)
     emoji        kleines Bild für die Karte
     titel        Anzeigename
     kurz         ein Satz Beschreibung
     lernseite    Dateiname der Lern-/Übungsseite  (oder null)
     arbeitsblatt Dateiname des Druck-Arbeitsblatts (oder null)
   ===================================================================== */
window.THEMEN = [
  {
    id: "wurzeln",
    emoji: "√",
    titel: "Reelle Zahlen & Wurzeln",
    kurz: "Quadratwurzeln, rationale und irrationale Zahlen, Wurzelgesetze und teilweises Wurzelziehen.",
    lernseite: "wurzeln.html",
    arbeitsblatt: "arbeitsblatt-wurzeln.html",
  },
  {
    id: "potenzen",
    emoji: "🔢",
    titel: "Potenzen & Potenzgesetze",
    kurz: "Rechnen mit Potenzen, negative Exponenten und die wissenschaftliche Schreibweise.",
    lernseite: "potenzen.html",
    arbeitsblatt: "arbeitsblatt-potenzen.html",
  },
  {
    id: "quadratische-gleichungen",
    emoji: "⚖️",
    titel: "Quadratische Gleichungen",
    kurz: "Wurzelziehen, Ausklammern, p-q-Formel und die Diskriminante.",
    lernseite: "quadratische-gleichungen.html",
    arbeitsblatt: "arbeitsblatt-quadratische-gleichungen.html",
  },
  {
    id: "funktionen",
    emoji: "📈",
    titel: "Funktionen",
    kurz: "Lineare und quadratische Funktionen: Steigung, Parabel, Scheitelpunkt und Nullstellen.",
    lernseite: "funktionen.html",
    arbeitsblatt: "arbeitsblatt-funktionen.html",
  },
  {
    id: "flaeche",
    emoji: "📐",
    titel: "Flächenberechnung",
    kurz: "Dreieck, Parallelogramm, Trapez, Kreis, Kreissektor und zusammengesetzte Flächen.",
    lernseite: "flaeche.html",
    arbeitsblatt: "arbeitsblatt-flaeche.html",
  },
  {
    id: "pythagoras",
    emoji: "📐",
    titel: "Satz des Pythagoras",
    kurz: "Im rechtwinkligen Dreieck fehlende Seiten berechnen – a² + b² = c².",
    lernseite: "pythagoras.html",
    arbeitsblatt: "arbeitsblatt-pythagoras.html",
  },
  {
    id: "aehnlichkeit",
    emoji: "🔺",
    titel: "Ähnlichkeit & Strahlensätze",
    kurz: "Zentrische Streckung, Streckfaktor, Strahlensätze und Maßstab.",
    lernseite: "aehnlichkeit.html",
    arbeitsblatt: "arbeitsblatt-aehnlichkeit.html",
  },
  {
    id: "trigonometrie",
    emoji: "📏",
    titel: "Trigonometrie",
    kurz: "Sinus, Kosinus und Tangens im rechtwinkligen Dreieck (SOH CAH TOA).",
    lernseite: "trigonometrie.html",
    arbeitsblatt: "arbeitsblatt-trigonometrie.html",
  },
  {
    id: "koerper",
    emoji: "🧊",
    titel: "Körper: Volumen & Oberfläche",
    kurz: "Prisma, Zylinder, Pyramide, Kegel und Kugel – Volumen und Oberfläche.",
    lernseite: "koerper.html",
    arbeitsblatt: "arbeitsblatt-koerper.html",
  },
  {
    id: "wahrscheinlichkeit",
    emoji: "🎲",
    titel: "Wahrscheinlichkeit",
    kurz: "Laplace-Formel, Gegenwahrscheinlichkeit, Baumdiagramme und Pfadregeln.",
    lernseite: "wahrscheinlichkeit.html",
    arbeitsblatt: "arbeitsblatt-wahrscheinlichkeit.html",
  },
];

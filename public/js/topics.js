/* =====================================================================
   THEMEN-REGISTER für Mattis Mathe (Gymnasium NRW)

   Das ist die EINZIGE Stelle im Frontend, an der Themen eingetragen
   werden. Startseite (Schuljahr-Übersicht), die Jahresseiten
   (klasse9.html / klasse10.html) und die Foto-Korrektur lesen diese
   Liste aus und bauen sich daraus automatisch zusammen.

   So fügst du ein neues Thema hinzu:
   1. Lege eine Lernseite an (z. B. "trigonometrie.html") – optional.
   2. Lege ein Arbeitsblatt an (z. B. "arbeitsblatt-trigonometrie.html")
      – optional.
   3. Trage das Thema hier unten ins Array THEMEN ein (mit der richtigen
      "klasse" – danach erscheint es automatisch auf der Jahresseite).
   4. Trage den Lösungsschlüssel im Worker ein (worker/index.js → WORKSHEETS),
      damit die Foto-Korrektur das Blatt kennt.

   Die Reihenfolge im Array bestimmt die Reihenfolge auf der Jahresseite –
   am besten in der Reihenfolge der Kapitel im Buch (Lambacher Schweizer).

   Felder eines Themas:
     id           eindeutiger Schlüssel (muss zum Worker-WORKSHEETS passen)
     klasse       Schuljahr (9 oder 10) – steuert die Jahres-Übersicht
     emoji        kleines Bild für die Karte
     titel        Anzeigename
     kurz         ein Satz Beschreibung
     lernseite    Dateiname der Lern-/Übungsseite  (oder null)
     arbeitsblatt Dateiname des Druck-Arbeitsblatts (oder null)
   ===================================================================== */
window.THEMEN = [
  /* ---------------- Klasse 9 (Lambacher Schweizer 9) ---------------- */
  {
    id: "wurzeln",
    klasse: 9,
    emoji: "√",
    titel: "Reelle Zahlen & Wurzeln",
    kurz: "Quadratwurzeln, rationale und irrationale Zahlen, Wurzelgesetze und teilweises Wurzelziehen.",
    lernseite: "wurzeln.html",
    arbeitsblatt: "arbeitsblatt-wurzeln.html",
  },
  {
    id: "potenzen",
    klasse: 9,
    emoji: "🔢",
    titel: "Potenzen & Potenzgesetze",
    kurz: "Rechnen mit Potenzen, negative Exponenten und die wissenschaftliche Schreibweise.",
    lernseite: "potenzen.html",
    arbeitsblatt: "arbeitsblatt-potenzen.html",
  },
  {
    id: "quadratische-gleichungen",
    klasse: 9,
    emoji: "⚖️",
    titel: "Quadratische Gleichungen",
    kurz: "Wurzelziehen, Ausklammern, p-q-Formel und die Diskriminante.",
    lernseite: "quadratische-gleichungen.html",
    arbeitsblatt: "arbeitsblatt-quadratische-gleichungen.html",
  },
  {
    id: "funktionen",
    klasse: 9,
    emoji: "📈",
    titel: "Funktionen",
    kurz: "Lineare und quadratische Funktionen: Steigung, Parabel, Scheitelpunkt und Nullstellen.",
    lernseite: "funktionen.html",
    arbeitsblatt: "arbeitsblatt-funktionen.html",
  },
  {
    id: "flaeche",
    klasse: 9,
    emoji: "📐",
    titel: "Flächenberechnung",
    kurz: "Dreieck, Parallelogramm, Trapez, Kreis, Kreissektor und zusammengesetzte Flächen.",
    lernseite: "flaeche.html",
    arbeitsblatt: "arbeitsblatt-flaeche.html",
  },
  {
    id: "pythagoras",
    klasse: 9,
    emoji: "📐",
    titel: "Satz des Pythagoras",
    kurz: "Im rechtwinkligen Dreieck fehlende Seiten berechnen – a² + b² = c².",
    lernseite: "pythagoras.html",
    arbeitsblatt: "arbeitsblatt-pythagoras.html",
  },
  {
    id: "aehnlichkeit",
    klasse: 9,
    emoji: "🔺",
    titel: "Ähnlichkeit & Strahlensätze",
    kurz: "Zentrische Streckung, Streckfaktor, Strahlensätze und Maßstab.",
    lernseite: "aehnlichkeit.html",
    arbeitsblatt: "arbeitsblatt-aehnlichkeit.html",
  },
  {
    id: "trigonometrie",
    klasse: 9,
    emoji: "📏",
    titel: "Trigonometrie",
    kurz: "Sinus, Kosinus und Tangens im rechtwinkligen Dreieck (SOH CAH TOA).",
    lernseite: "trigonometrie.html",
    arbeitsblatt: "arbeitsblatt-trigonometrie.html",
  },
  {
    id: "koerper",
    klasse: 9,
    emoji: "🧊",
    titel: "Körper: Volumen & Oberfläche",
    kurz: "Prisma, Zylinder, Pyramide, Kegel und Kugel – Volumen und Oberfläche.",
    lernseite: "koerper.html",
    arbeitsblatt: "arbeitsblatt-koerper.html",
  },
  {
    id: "wahrscheinlichkeit",
    klasse: 9,
    emoji: "🎲",
    titel: "Wahrscheinlichkeit",
    kurz: "Laplace-Formel, Gegenwahrscheinlichkeit, Baumdiagramme und Pfadregeln.",
    lernseite: "wahrscheinlichkeit.html",
    arbeitsblatt: "arbeitsblatt-wahrscheinlichkeit.html",
  },

  /* ---------------- Klasse 10 (Lambacher Schweizer 10) -------------- */
  {
    id: "potenzfunktionen",
    klasse: 10,
    emoji: "🧮",
    titel: "Potenz- & ganzrationale Funktionen",
    kurz: "Potenzfunktionen xⁿ, Symmetrie (gerade/ungerade), Grad und Verlauf von Polynomen.",
    lernseite: "potenzfunktionen.html",
    arbeitsblatt: "arbeitsblatt-potenzfunktionen.html",
  },
  {
    id: "exponentialfunktionen",
    klasse: 10,
    emoji: "🚀",
    titel: "Exponentialfunktionen & Wachstum",
    kurz: "Wachstums- und Zerfallsprozesse, Wachstumsfaktor, exponentielles Wachstum.",
    lernseite: "exponentialfunktionen.html",
    arbeitsblatt: "arbeitsblatt-exponentialfunktionen.html",
  },
  {
    id: "logarithmen",
    klasse: 10,
    emoji: "🔁",
    titel: "Logarithmen",
    kurz: "Der Logarithmus als Umkehrung des Potenzierens – Exponentialgleichungen lösen.",
    lernseite: "logarithmen.html",
    arbeitsblatt: "arbeitsblatt-logarithmen.html",
  },
  {
    id: "sinusfunktion",
    klasse: 10,
    emoji: "〰️",
    titel: "Sinus- & Kosinusfunktion",
    kurz: "Trigonometrische Funktionen: Periode, Amplitude und Werte am Einheitskreis.",
    lernseite: "sinusfunktion.html",
    arbeitsblatt: "arbeitsblatt-sinusfunktion.html",
  },
  {
    id: "sinus-kosinus-satz",
    klasse: 10,
    emoji: "🧭",
    titel: "Sinus- & Kosinussatz",
    kurz: "Trigonometrie in beliebigen Dreiecken – fehlende Seiten und Winkel berechnen.",
    lernseite: "sinus-kosinus-satz.html",
    arbeitsblatt: "arbeitsblatt-sinus-kosinus-satz.html",
  },
  {
    id: "bedingte-wahrscheinlichkeit",
    klasse: 10,
    emoji: "🎯",
    titel: "Bedingte Wahrscheinlichkeit",
    kurz: "Vierfeldertafel, Baumdiagramme und die Formel P(A|B).",
    lernseite: "bedingte-wahrscheinlichkeit.html",
    arbeitsblatt: "arbeitsblatt-bedingte-wahrscheinlichkeit.html",
  },
  {
    id: "statistik",
    klasse: 10,
    emoji: "📊",
    titel: "Beschreibende Statistik",
    kurz: "Mittelwert, Median, Modalwert, Spannweite, Quartile und Boxplot.",
    lernseite: "statistik.html",
    arbeitsblatt: "arbeitsblatt-statistik.html",
  },
];

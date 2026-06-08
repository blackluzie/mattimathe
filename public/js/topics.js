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
    id: "flaeche",
    emoji: "📐",
    titel: "Flächenberechnung",
    kurz: "Dreieck, Parallelogramm, Trapez, Kreis, Kreissektor und zusammengesetzte Flächen.",
    lernseite: "flaeche.html",
    arbeitsblatt: "arbeitsblatt-flaeche.html",
  },
  {
    id: "funktionen",
    emoji: "📈",
    titel: "Funktionen",
    kurz: "Lineare und quadratische Funktionen: Steigung, Parabel, Scheitelpunkt und Nullstellen.",
    lernseite: "funktionen.html",
    arbeitsblatt: "arbeitsblatt-funktionen.html",
  },
];

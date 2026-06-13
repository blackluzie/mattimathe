/* =====================================================================
   Jahres-Übersicht für Mattis Mathe
   Baut die Themenliste EINES Schuljahres aus dem Themen-Register
   (js/topics.js) zusammen – in Buch-Reihenfolge.

   Die Seite (klasse9.html / klasse10.html) setzt vorher
   window.JAHR_KLASSE = 9 bzw. 10.
   ===================================================================== */
(function () {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var klasse = window.JAHR_KLASSE;
  var themen = (window.THEMEN || []).filter(function (t) { return t.klasse === klasse; });

  var lern = themen.filter(function (t) { return t.lernseite; }).map(function (t) {
    return '<a class="card" href="' + esc(t.lernseite) + '">' +
      '<span class="emoji">' + esc(t.emoji || "📘") + "</span>" +
      "<h2>" + esc(t.titel) + "</h2>" +
      "<p>" + esc(t.kurz || "") + "</p></a>";
  }).join("");
  var elThemen = document.getElementById("themenKarten");
  if (elThemen) {
    elThemen.innerHTML = lern ||
      '<p class="lead">Für dieses Schuljahr kommen die Themen bald dazu.</p>';
  }

  var blaetter = themen.filter(function (t) { return t.arbeitsblatt; }).map(function (t) {
    return '<a class="card" href="' + esc(t.arbeitsblatt) + '">' +
      '<span class="emoji">🖨️</span>' +
      "<h2>Arbeitsblatt " + esc(t.titel) + "</h2>" +
      "<p>Aufgaben + Lösungen. Über den Drucken-Knopf als PDF speichern.</p></a>";
  }).join("");
  var elBlaetter = document.getElementById("arbeitsblattKarten");
  if (elBlaetter) {
    elBlaetter.innerHTML = blaetter ||
      '<p class="lead">Noch keine Arbeitsblätter vorhanden.</p>';
  }

  // Alten Service-Worker abmelden (er ist absichtlich deaktiviert).
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      regs.forEach(function (r) { r.unregister(); });
    });
  }
})();

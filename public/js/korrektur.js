/* =====================================================================
   Foto-Korrektur für Mattis Mathe
   1. Arbeitsblatt wählen (Auswahl kommt aus js/topics.js → window.THEMEN)
   2. Foto aufnehmen (wird verkleinert, damit es schnell hochlädt)
   3. An den Worker schicken → Claude liest die Handschrift und gibt
      eine freundliche, ermutigende Rückmeldung zurück.
   ===================================================================== */
(function () {
  "use strict";

  var state = { worksheet: null, imageData: null };

  var blattWahl   = document.getElementById("blattWahl");
  var schrittFoto = document.getElementById("schrittFoto");
  var fotoInput   = document.getElementById("fotoInput");
  var fotoBtn     = document.getElementById("fotoBtn");
  var fotoFeld    = document.getElementById("fotoFeld");
  var fotoHinweis = document.getElementById("fotoHinweis");
  var checkBtn    = document.getElementById("checkBtn");
  var neuBtn      = document.getElementById("neuBtn");
  var lade        = document.getElementById("lade");
  var fehlerBox   = document.getElementById("fehlerBox");
  var fehlerText  = document.getElementById("fehlerText");
  var ergebnis    = document.getElementById("ergebnis");

  /* ---- Schritt 1: Arbeitsblatt-Knöpfe aus dem Themen-Register bauen ---- */
  (window.THEMEN || [])
    .filter(function (t) { return t.arbeitsblatt; })
    .forEach(function (t) {
      var btn = document.createElement("button");
      btn.className = "blatt-option";
      btn.dataset.id = t.id;
      var jahr = t.klasse ? '<small style="color:var(--ink-soft)"> · Kl. ' + escapeHtml(t.klasse) + "</small>" : "";
      btn.innerHTML = '<span class="em">' + (t.emoji || "📄") + "</span> " + escapeHtml(t.titel) + jahr;
      blattWahl.appendChild(btn);
    });

  blattWahl.querySelectorAll(".blatt-option").forEach(function (btn) {
    btn.addEventListener("click", function () {
      blattWahl.querySelectorAll(".blatt-option").forEach(function (b) { b.classList.remove("aktiv"); });
      btn.classList.add("aktiv");
      state.worksheet = btn.dataset.id;
      schrittFoto.style.opacity = "1";
      schrittFoto.style.pointerEvents = "auto";
    });
  });

  /* ---- Schritt 2: Foto ---- */
  fotoBtn.addEventListener("click", function () { fotoInput.click(); });

  fotoInput.addEventListener("change", function () {
    var file = fotoInput.files && fotoInput.files[0];
    if (!file) return;
    versteckeFehler();
    verkleinereBild(file, function (dataUrl) {
      state.imageData = dataUrl;
      zeigeVorschau(dataUrl);
      checkBtn.disabled = false;
      neuBtn.classList.remove("hidden");
    });
  });

  neuBtn.addEventListener("click", function () {
    fotoInput.value = "";
    fotoInput.click();
  });

  checkBtn.addEventListener("click", function () {
    if (!state.worksheet || !state.imageData) return;
    starteKorrektur();
  });

  /* ---- Bild verkleinern (max. 1500px lange Kante, JPEG) ---- */
  function verkleinereBild(file, fertig) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var max = 1500;
        var w = img.width, h = img.height;
        if (w > max || h > max) {
          if (w >= h) { h = Math.round(h * max / w); w = max; }
          else        { w = Math.round(w * max / h); h = max; }
        }
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        fertig(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = function () { fertig(e.target.result); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function zeigeVorschau(dataUrl) {
    var alt = fotoFeld.querySelector("img");
    if (alt) alt.remove();
    var img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "Vorschau deines Arbeitsblatts";
    fotoFeld.appendChild(img);
    fotoHinweis.textContent = "Foto ausgewählt. Sieht es gut lesbar aus? Dann auf „Kontrollieren lassen“.";
  }

  /* ---- Korrektur anfragen ---- */
  function starteKorrektur() {
    versteckeFehler();
    ergebnis.classList.add("hidden");
    schrittFoto.classList.add("hidden");
    lade.classList.remove("hidden");
    checkBtn.disabled = true;

    fetch("/api/check-worksheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worksheet: state.worksheet, image: state.imageData })
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (r) {
        lade.classList.add("hidden");
        if (!r.ok || r.data.error) {
          zeigeFehler((r.data && r.data.error) || "Etwas ist schiefgelaufen. Bitte versuch es noch einmal.");
          schrittFoto.classList.remove("hidden");
          checkBtn.disabled = false;
          return;
        }
        zeigeErgebnis(r.data);
      })
      .catch(function () {
        lade.classList.add("hidden");
        zeigeFehler("Ich konnte das Foto gerade nicht prüfen. Bist du online? Versuch es bitte noch einmal.");
        schrittFoto.classList.remove("hidden");
        checkBtn.disabled = false;
      });
  }

  /* ---- Ergebnis anzeigen ---- */
  var EMOJI = { richtig: "✅", fast: "🟡", falsch: "❌", leer: "⬜", unklar: "❓" };
  var LABEL = { richtig: "Richtig", fast: "Fast", falsch: "Schau nochmal", leer: "Leer", unklar: "Unklar" };

  function zeigeErgebnis(data) {
    var liste = document.getElementById("korrekturListe");
    liste.innerHTML = "";

    var richtige = 0, gesamt = 0;
    (data.aufgaben || []).forEach(function (a) {
      if (a.status === "richtig") richtige++;
      if (a.status !== "leer") gesamt++;

      var div = document.createElement("div");
      div.className = "korrektur-item " + (a.status || "");
      var kopf = document.createElement("div");
      kopf.className = "kopf";
      kopf.innerHTML = '<span class="nr">Aufgabe ' + escapeHtml(a.nr) + "</span> " +
        (EMOJI[a.status] || "") + " " + (LABEL[a.status] || "");
      var p = document.createElement("p");
      p.textContent = a.rueckmeldung || "";
      div.appendChild(kopf);
      div.appendChild(p);
      liste.appendChild(div);
    });

    if (gesamt > 0) {
      var summe = document.createElement("div");
      summe.className = "box zusammenfassung";
      summe.innerHTML = '<span class="punkte">' + richtige + " / " + gesamt + "</span>" +
        "<span>Aufgaben richtig 🎉</span>";
      liste.insertBefore(summe, liste.firstChild);
    }

    document.getElementById("lobText").textContent = data.lob || "Stark, dass du geübt hast!";
    document.getElementById("tippText").textContent = data.tipp || "Übe ruhig in kleinen Häppchen weiter.";
    ergebnis.classList.remove("hidden");
    ergebnis.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function zeigeFehler(text) {
    fehlerText.textContent = text;
    fehlerBox.classList.remove("hidden");
    fehlerBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function versteckeFehler() { fehlerBox.classList.add("hidden"); }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();

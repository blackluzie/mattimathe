/* =====================================================================
   Übungs-Engine für Mattis Mathe
   - ein Schritt nach dem anderen, Tipps, sofortiges Feedback.
   - Aufgaben werden als Daten-Array übergeben (siehe Lernseiten).

   Aufgaben-Typen:
   1) "mc"    Multiple Choice
        { typ:"mc", frage, optionen:[...], richtig:Index,
          tipp:"...", erklaerung:"..." }
   2) "input" freie (Text-)Eingabe, mehrere richtige Schreibweisen erlaubt
        { typ:"input", frage, loesungen:["12","12cm^2"], platzhalter:"z. B. 12",
          tipp:"...", erklaerung:"..." }

   Aufruf:  starteQuiz("#quiz", aufgabenArray);
   ===================================================================== */

function starteQuiz(containerSelector, aufgaben) {
  const root = document.querySelector(containerSelector);
  if (!root) return;

  let index = 0;
  let punkte = 0;
  let beantwortet = false;

  root.innerHTML = `
    <div class="quiz-kopf">
      <span class="fortschritt"></span>
      <span class="fortschritt punktestand"></span>
    </div>
    <div class="balken"><span></span></div>
    <div class="aufgabe-host"></div>
  `;

  const elFortschritt = root.querySelector(".fortschritt:not(.punktestand)");
  const elPunkte      = root.querySelector(".punktestand");
  const elBalken      = root.querySelector(".balken > span");
  const host          = root.querySelector(".aufgabe-host");

  function normalisiere(s) {
    return (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")          // Leerzeichen weg
      .replace(/,/g, ".")            // 0,5 -> 0.5
      .replace(/÷/g, "/")
      .replace(/·/g, "*")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .replace(/:/g, "/");           // 1:6 -> 1/6
  }

  function zeigeAufgabe() {
    beantwortet = false;
    const a = aufgaben[index];
    elFortschritt.textContent = `Aufgabe ${index + 1} von ${aufgaben.length}`;
    elPunkte.textContent = `★ ${punkte} richtig`;
    elBalken.style.width = `${(index / aufgaben.length) * 100}%`;

    if (a.typ === "mc")    return zeigeMC(a);
    if (a.typ === "input") return zeigeInput(a);
  }

  function feedbackBlock(richtig, a) {
    const fb = document.createElement("div");
    fb.className = "feedback " + (richtig ? "gut" : "schlecht");
    fb.innerHTML =
      (richtig ? "<b>✓ Super, das stimmt!</b>" : "<b>Noch nicht ganz – schau mal:</b>") +
      (a.erklaerung ? `<div>${a.erklaerung}</div>` : "");
    return fb;
  }

  function naechsterButton(host) {
    const aktionen = document.createElement("div");
    aktionen.className = "aktionen";
    const next = document.createElement("button");
    next.className = "btn";
    next.textContent = index + 1 < aufgaben.length ? "Weiter →" : "Fertig! Ergebnis zeigen";
    next.onclick = () => {
      index++;
      if (index < aufgaben.length) zeigeAufgabe();
      else zeigeErgebnis();
    };
    aktionen.appendChild(next);
    host.appendChild(aktionen);
    next.focus();
  }

  function tippKnopf(host, a) {
    if (!a.tipp) return;
    const aktionen = document.createElement("div");
    aktionen.className = "aktionen";
    const t = document.createElement("button");
    t.className = "btn sekundaer";
    t.textContent = "💡 Tipp anzeigen";
    t.onclick = () => {
      t.disabled = true;
      const tb = document.createElement("div");
      tb.className = "tippbox";
      tb.innerHTML = "💡 " + a.tipp;
      host.insertBefore(tb, host.querySelector(".tipp-anker"));
    };
    aktionen.appendChild(t);
    host.appendChild(aktionen);
  }

  function zeigeMC(a) {
    host.innerHTML = `
      <div class="aufgabe">
        <div class="frage"><span class="nr">${index + 1}</span>${a.frage}</div>
        ${a.figur ? a.figur : ""}
        <div class="optionen"></div>
        <div class="tipp-anker"></div>
      </div>`;
    const opt = host.querySelector(".optionen");
    const buchstaben = ["A", "B", "C", "D", "E", "F"];

    a.optionen.forEach((text, i) => {
      const b = document.createElement("button");
      b.className = "option";
      b.innerHTML = `<span class="mark">${buchstaben[i]}</span><span>${text}</span>`;
      b.onclick = () => {
        if (beantwortet) return;
        beantwortet = true;
        const richtig = i === a.richtig;
        if (richtig) punkte++;
        // alle Optionen einfärben
        [...opt.children].forEach((c, j) => {
          c.disabled = true;
          if (j === a.richtig) c.classList.add("richtig");
          if (j === i && !richtig) c.classList.add("falsch");
        });
        const aufg = host.querySelector(".aufgabe");
        aufg.appendChild(feedbackBlock(richtig, a));
        naechsterButton(aufg);
        elPunkte.textContent = `★ ${punkte} richtig`;
      };
      opt.appendChild(b);
    });

    tippKnopf(host.querySelector(".aufgabe"), a);
  }

  function zeigeInput(a) {
    host.innerHTML = `
      <div class="aufgabe">
        <div class="frage"><span class="nr">${index + 1}</span>${a.frage}</div>
        ${a.figur ? a.figur : ""}
        <div class="eingabe-zeile">
          <input type="text" autocomplete="off" placeholder="${a.platzhalter || "Antwort eingeben"}">
          <button class="btn pruefen">Prüfen</button>
        </div>
        <div class="tipp-anker"></div>
      </div>`;
    const aufg  = host.querySelector(".aufgabe");
    const input = aufg.querySelector("input");
    const knopf = aufg.querySelector(".pruefen");

    function pruefen() {
      if (beantwortet) return;
      const eingabe = normalisiere(input.value);
      if (eingabe === "") { input.focus(); return; }
      const richtig = a.loesungen.map(normalisiere).includes(eingabe);
      beantwortet = true;
      if (richtig) punkte++;
      input.classList.add(richtig ? "richtig" : "falsch");
      input.disabled = true;
      knopf.disabled = true;
      aufg.appendChild(feedbackBlock(richtig, a));
      naechsterButton(aufg);
      elPunkte.textContent = `★ ${punkte} richtig`;
    }
    knopf.onclick = pruefen;
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") pruefen(); });
    input.focus();
    tippKnopf(aufg, a);
  }

  function zeigeErgebnis() {
    elBalken.style.width = "100%";
    elFortschritt.textContent = "Geschafft!";
    const prozent = Math.round((punkte / aufgaben.length) * 100);
    let lob = "Klasse gemacht! 🌟";
    if (prozent < 50) lob = "Guter Anfang – Wiederholen hilft! 💪";
    else if (prozent < 80) lob = "Schon richtig gut! 👍";
    host.innerHTML = `
      <div class="ergebnis">
        <span class="gross">${punkte} / ${aufgaben.length}</span>
        ${lob}
        <div style="margin-top:14px">
          <button class="btn nochmal">🔁 Nochmal üben</button>
        </div>
      </div>`;
    host.querySelector(".nochmal").onclick = () => {
      index = 0; punkte = 0; zeigeAufgabe();
    };
  }

  zeigeAufgabe();
}

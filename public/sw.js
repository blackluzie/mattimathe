/* Service-Worker: macht die Lern-App offline nutzbar.
   Strategie: statische Dateien beim ersten Besuch cachen,
   danach "cache-first" mit Netz-Aktualisierung im Hintergrund.
   Wichtig: Login-/Auth-Antworten werden NICHT gecacht.

   Beim Hinzufügen eines neuen Themas: neue HTML-Dateien unten in ASSETS
   ergänzen und die Versionsnummer (CACHE) erhöhen.                       */
const CACHE = "mattis-mathe-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./flaeche.html",
  "./funktionen.html",
  "./korrektur.html",
  "./arbeitsblatt-flaeche.html",
  "./arbeitsblatt-funktionen.html",
  "./css/style.css",
  "./js/topics.js",
  "./js/quiz.js",
  "./js/korrektur.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // Nur GET; Navigation + Login/Logout immer direkt zum Server – der CF-Worker
  // macht dort die Auth. fetch(navigate-mode-Request) würde in Chrome fehlschlagen.
  if (req.method !== "GET" || req.mode === "navigate" || req.url.includes("/login") || req.url.includes("/logout")) return;

  e.respondWith(
    caches.match(req).then((hit) => {
      const netz = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || netz;
    })
  );
});

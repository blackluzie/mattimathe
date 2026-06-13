/* Leerer Service-Worker: übernimmt sofort, löscht alle alten Caches.
   Kein fetch-Handler → jede Anfrage geht direkt ans Netz.
   Die HTML-Seiten melden ihn via getRegistrations() wieder ab. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

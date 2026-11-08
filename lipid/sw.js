/* このアプリ単独の service worker は廃止。
   ward-apps 直下の共通 service worker（../sw.js）に一本化したため、
   古い登録とキャッシュを自分で消して解除する。 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  const slug = self.location.pathname.split("/").slice(-2, -1)[0];
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(slug + "-")).map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((cs) => cs.forEach((c) => c.navigate(c.url)))
  );
});

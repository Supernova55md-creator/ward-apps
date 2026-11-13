/* 病棟アプリ（ward-apps）共通 service worker
   アプリを更新・追加したら VERSION を必ず変える（例 a→b、日付更新）。
   新しいアプリを足すときは APPS に slug を追加する。
   画面（HTML）は no-cache で毎回サーバーに確認する（GitHub Pages の10分キャッシュで古い版が出るのを防ぐ）。 */
const VERSION = "ward-2026-11-14d";
const APPS = ["dm", "htn", "lipid", "loc", "nih", "referral", "updrs", "dementia", "mmt", "inf", "kampo", "imm", "enc", "atn", "aed", "ha", "nan", "qc", "exam", "iken", "shi", "ext", "er", "rpt", "ltr", "preg"];
const ROOT = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "share.js"];
const PER_APP = ["", "index.html", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const ASSETS = ROOT.concat(...APPS.map((a) => PER_APP.map((f) => a + "/" + f)));

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.allSettled(ASSETS.map((u) => c.add(new Request(u, { cache: "reload" })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) =>
        (k.startsWith("ward-") && k !== VERSION) || APPS.some((a) => k.startsWith(a + "-"))
      ).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/sw.js")) return;
  if (url.pathname.endsWith(".enc")) return; // 暗号化データ（ext/data.enc）は常にサーバーから取る
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req.url, { cache: "no-cache", credentials: "same-origin" })
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })
        .catch(async () => {
          const c = await caches.open(VERSION);
          const base = url.pathname.endsWith("/") ? url.pathname : url.pathname.replace(/[^/]*$/, "");
          return (await c.match(req, { ignoreSearch: true })) || (await c.match(base + "index.html")) || (await c.match(base)) || (await c.match("./"));
        })
    );
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});

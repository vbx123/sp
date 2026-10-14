// يخلي تطبيق البائع يفتح حتى لو النت قاطع (بعد أول فتح بنت)
var CACHE = 'pos-v1';

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.add('./seller.html'); }).catch(function () {}));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var host = new URL(req.url).hostname;
  // طلبات السيرفر (جوجل) ما بتتخزنش هنا، التطبيق بيحتفظ بنسخته بنفسه
  if (host === 'script.google.com' || /googleusercontent\.com$/.test(host)) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match('./seller.html'); });
    })
  );
});

// Service worker d'IRIS : le jeu fonctionne hors ligne une fois visité (PWA). Repris de LA CAGE.
// Modules et pages : réseau d'abord (pour les mises à jour) ; gros fichiers (modèles, animations, textures, vendor) :
// cache d'abord, puis revalidés en tâche de fond.
// À CHANGER DÈS QUE index.html, style.css, le manifeste OU UN FICHIER LOURD changent : index.html est aussi pré-caché
// (CORE), et un fichier lourd corrigé n'est servi frais qu'au lancement suivant sans changement de version. Changer la
// version purge les anciens caches à l'activation : c'est la seule garantie. (Le numéro est aussi celui qu'affiche
// l'écran de chargement, js/chargement.js, et le nom du cache qu'il remplit.)
const VERSION = 'iris-v1.0';
const CORE = ['./', './index.html', './css/style.css', './manifest.webmanifest', './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-192.png', './assets/icons/icon-maskable-512.png', './assets/chargement/logo_iris.webp'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  // (seulement les caches d'IRIS : un autre jeu servi à la même adresse garde les siens)
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k.startsWith('iris-')).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const heavy = /\.(glb|gltf|fbx|png|jpg|jpeg|webp|woff2?|ttf|hdr|bin)$/i.test(url.pathname) || url.pathname.includes('/vendor/') || url.hostname.includes('gstatic');
  if (heavy) {
    // CACHE D'ABORD, PUIS REVALIDATION EN TÂCHE DE FOND : on sert le cache tout de suite (jouable hors ligne, rien de
    // retéléchargé à chaque lancement), et on va rechercher le fichier derrière ; s'il a changé, l'entrée du cache est
    // remplacée (l'image affichée reste l'ancienne pour cette session). Sauf une copie de moins de dix minutes (son
    // en-tête Date) : elle vient d'arriver, rangée par l'écran de chargement.
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const hit = await c.match(req);
      if (hit && Math.abs(Date.now() - Date.parse(hit.headers.get('date') || '')) < 600000) return hit;
      const frais = fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; })
                              .catch(() => null);
      if (hit) { e.waitUntil(frais); return hit; }
      return (await frais) || Response.error();
    }));
  } else if (url.origin === location.origin) {
    // (la copie se fait TOUT DE SUITE, avant que la page ne commence à lire la réponse)
    e.respondWith(fetch(req).then((res) => {
      if (res && res.ok) { const copie = res.clone(); caches.open(VERSION).then((c) => c.put(req, copie)); }
      return res;
    }).catch(() => caches.match(req)));
  }
});

// =====================================================================
//  LE CACHE DE LA NAVIGATION (lot L-D, 23/10 ; spec § 4.9)
// =====================================================================
// Le graphe gardé dans IndexedDB (base 'iris.nav', magasin 'graphes') sous l'EMPREINTE du monde (js/jeu/nav.js) : relu en
// quelques dizaines de ms au lieu de 0,7 s de génération par graphe. Les tableaux typés y entrent tels quels (clonage
// structuré : ni JSON, ni copie). On ne garde que les GARDER dernières empreintes (une retouche de la carte en fait une
// nouvelle ; l'ancienne ne resservira plus). Tout est sous try/catch et sous un délai : navigation privée, quota, base
// bloquée par un autre onglet — `lireNav` rend alors null et `ecrireNav` ne fait rien : le jeu régénère et tourne sans.
// (`indexedDB` est relu à chaque appel : un test peut le remplacer par un faux qui lève.)

const BASE = 'iris.nav', MAGASIN = 'graphes', VERSION_BASE = 1, GARDER = 4, DELAI = 2500, INDEX = '__index';

let _base = null;
function ouvrir() {
  if (_base) return _base;
  _base = new Promise((ok) => {
    let fini = false;
    const finir = (v) => { if (!fini) { fini = true; clearTimeout(to); ok(v); } };
    const to = setTimeout(() => finir(null), DELAI);
    try {
      const idb = globalThis.indexedDB;
      if (!idb) { finir(null); return; }
      const req = idb.open(BASE, VERSION_BASE);
      req.onupgradeneeded = () => { try { const db = req.result; if (!db.objectStoreNames.contains(MAGASIN)) db.createObjectStore(MAGASIN); } catch (e) { /* rien */ } };
      req.onsuccess = () => { const db = req.result; try { db.onversionchange = () => { db.close(); _base = null; }; } catch (e) { /* rien */ } finir(db); };
      req.onerror = () => finir(null);
      req.onblocked = () => finir(null);
    } catch (e) { finir(null); }
  });
  _base.then((db) => { if (!db) _base = null; });
  return _base;
}
// une transaction sur le magasin : `f(magasin, fin)` ; la promesse rend ce que `fin(v)` reçoit (null en cas de faute)
function transaction(mode, f) {
  return ouvrir().then((db) => new Promise((ok) => {
    if (!db) { ok(null); return; }
    let fini = false;
    const fin = (v) => { if (!fini) { fini = true; clearTimeout(to); ok(v); } };
    const to = setTimeout(() => fin(null), DELAI);
    try {
      const tx = db.transaction(MAGASIN, mode), M = tx.objectStore(MAGASIN);
      tx.onerror = () => fin(null); tx.onabort = () => fin(null);
      f(M, fin, tx);
    } catch (e) { fin(null); }
  })).catch(() => null);
}

// le graphe gardé sous `cle`, ou null
export function lireNav(cle) {
  return transaction('readonly', (M, fin) => {
    const r = M.get(cle);
    r.onsuccess = () => fin(r.result && r.result.donnees ? r.result.donnees : null);
    r.onerror = () => fin(null);
  });
}
// garde le graphe sous `cle` ; une petite entrée « index » ([clé, date]) dit lesquels sont les GARDER derniers
export function ecrireNav(cle, donnees) {
  return transaction('readwrite', (M, fin, tx) => {
    M.put({ quand: Date.now(), donnees }, cle);
    const r = M.get(INDEX);
    r.onsuccess = () => {
      const L = (Array.isArray(r.result) ? r.result : []).filter(([k]) => k !== cle);
      L.unshift([cle, Date.now()]);
      for (const [k] of L.slice(GARDER)) M.delete(k);
      M.put(L.slice(0, GARDER), INDEX);
    };
    tx.oncomplete = () => fin(true);
  }).then(() => undefined);
}
// (les tests : la base vidée)
export function viderNav() { return transaction('readwrite', (M, fin, tx) => { M.clear(); tx.oncomplete = () => fin(true); }); }
// (les tests : la base refermée — la prochaine lecture rouvre `indexedDB`, peut-être un faux qui lève)
export function oublierBase() { const b = _base; _base = null; if (b) b.then((db) => { try { if (db) db.close(); } catch (e) { /* rien */ } }); }

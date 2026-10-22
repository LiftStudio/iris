// =====================================================================
//  LE HASARD À GRAINE (socle S0, 22/10 ; spec § 4.5.3)
// =====================================================================
// La simulation d'une partie ne tire JAMAIS Math.random (spec § 4.1, règle 4) : elle tire dans `partie.rng`, ou dans un
// Rng semé par `melanger(...)` — un tir = melanger(graine, idActeur, tirSeq) —, le même sur l'hôte et sur l'invité de
// demain. Le générateur est le xorshift32 de LA CAGE (js/net.js l. 224-238), recopié, plus son ÉTAT lisible et posable
// (il entre dans l'état sérialisable de la partie, § 4.7).

export class Rng {
  constructor(seed = 1) { this.seed(seed); }
  seed(s) { this.s = (s >>> 0) || 1; return this; }
  next() {
    let x = this.s;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    this.s = x;
    return x / 4294967296;
  }
  range(a, b) { return a + this.next() * (b - a); }
  int(n) { return Math.floor(this.next() * n); }
  pick(arr) { return arr[this.int(arr.length)]; }
  // (une loi normale centrée réduite, Box-Muller : deux tirages)
  normale() { const u = Math.max(1e-12, this.next()), v = this.next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  get etat() { return this.s >>> 0; }
  set etat(v) { this.s = (v >>> 0) || 1; }
}

// UNE GRAINE DÉRIVÉE de plusieurs entiers (mélange de type murmur3 : deux suites voisines ne se ressemblent pas)
export function melanger(...entiers) {
  let h = 0x9e3779b9;
  for (const e of entiers) {
    let k = Math.imul((e | 0) >>> 0, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return (h >>> 0) || 1;
}

// L'EMPREINTE d'un objet : FNV-1a sur son JSON, nombres arrondis à `precision` (les tests de déterminisme la comparent)
export function hacher(objet, precision = 1e-4) {
  const s = JSON.stringify(objet, (k, v) => (typeof v === 'number' ? (Number.isFinite(v) ? Math.round(v / precision) * precision : String(v)) : v));
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

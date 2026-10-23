// =====================================================================
//  LES TESTS DU LOT L-A — armes et balistique (23/10 ; spec § 5.5.1, acceptation 1 à 18, et ce qui reste à F2)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-A` (window.__rapport). Les tests ne cliquent jamais : ils lancent
// une partie d'essai VIDE (`humain: false`, aucun mannequin) et y posent leurs acteurs — un TIREUR mené par un cerveau
// scripté (`Script` : la commande champ par champ, la visée posée exactement, le recul pris et mis de côté pour qu'on le
// mesure) et des CIBLES immobiles —, puis font avancer la simulation pas à pas. Les références des tests 1 à 3 sont
// BRUTES (un pas de 1 cm le long du segment, chaque forme, chaque sol ; le lanceur de rayons de three sur la scène, permis
// ici seulement). Un test rend { ok, attendu, obtenu }.
import * as THREE from 'three';
import { Rng, melanger, hacher } from '../rng.js';
import { PAS, NIVEAUX } from '../constantes.js';
import { viderFronts } from '../commande.js';
import { ARMES, degatsDe, tirage, Arsenal } from '../armes.js';
import { FICHES_BOTS } from '../avatars.js';
import { Balistique, MODE, EXCEPTIONS_PREFILTRE, nomZone } from '../balistique.js';
import { capsules, teteSimulee } from '../touches.js';
import { BORNES_NAV } from '../nav.js';
import { zoneDe } from '../../ecole_visibilite.js';

const DEG = Math.PI / 180;
const r3 = (v) => Math.round(v * 1000) / 1000;
const mediane = (L) => { const s = L.slice().sort((a, b) => a - b); return s.length ? s[s.length >> 1] : NaN; };
const centile = (L, p) => { const s = L.slice().sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : NaN; };
const moyenne = (L) => (L.length ? L.reduce((s, v) => s + v, 0) / L.length : NaN);

// ---------------------------------------------------------------- le monde solide, lu à la main (les références brutes)
const cleCase = (i, k) => (i + 32768) * 65536 + (k + 32768);
// le point est-il DANS la forme ?
function contient(s, x, y, z) {
  if (y < s.y0 || y > s.y1) return false;
  if (s.t === 'c') return (x - s.x) * (x - s.x) + (z - s.z) * (z - s.z) <= s.r * s.r;
  if (s.t === 'b') return x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1;
  const px = x - s.cx, pz = z - s.cz, lx = px * s.c + pz * s.s, lz = -px * s.s + pz * s.c;
  return Math.abs(lx) <= s.hx && Math.abs(lz) <= s.hz;
}
// les formes des cases qui touchent le rectangle (un Set : chacune une fois)
function formesPres(C, x0, z0, x1, z1) {
  const S = new Set();
  for (let i = Math.floor(x0 / 2); i <= Math.floor(x1 / 2); i++) for (let k = Math.floor(z0 / 2); k <= Math.floor(z1 / 2); k++) {
    const l = C.grille.get(cleCase(i, k)); if (l) for (const s of l) S.add(s);
  }
  return S;
}
const dansUneForme = (C, x, y, z) => { for (const s of formesPres(C, x, z, x, z)) if (!s.off && contient(s, x, y, z)) return true; return false; };
// la forme passe-t-elle le filtre du mode ? (les règles de js/jeu/balistique.js, écrites ici une seconde fois)
function compte(s, mode) {
  if (s.off || s.balle === false) return false;
  if (mode === 'balle') return !s.vitre;
  if (mode === 'vue') return s.camera && !(s.vitre && !s.depoli);
  return true;
}
// LA RÉFÉRENCE BRUTE : le premier point du segment A → B (pas de 1 cm) dans une forme comptée, ou qui passe un sol (dalle,
// rampe, plan y = 0 là où solEn(x, z, 0,1) le rend) ; rend la distance (L : rien)
function brut(C, ax, ay, az, bx, by, bz, mode = 'balle') {
  const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz), ux = dx / L, uy = dy / L, uz = dz / L;
  let best = L;
  const intervalle = (x0, x1, z0, z1, y0, y1) => {
    let t0 = 0, t1 = best;
    for (const [o, d, lo, hi] of [[ax, ux, x0, x1], [az, uz, z0, z1], [ay, uy, y0, y1]]) {
      if (Math.abs(d) < 1e-12) { if (o < lo || o > hi) return null; continue; }
      let a = (lo - o) / d, b = (hi - o) / d; if (a > b) { const q = a; a = b; b = q; }
      t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    }
    return t0 <= t1 ? [t0, t1] : null;
  };
  for (const s of formesPres(C, Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz))) {
    if (!compte(s, mode) || contient(s, ax, ay, az)) continue;
    const I = intervalle(s.bx0, s.bx1, s.bz0, s.bz1, s.y0, s.y1); if (!I) continue;
    for (let t = Math.max(0, I[0] - 0.01); t <= Math.min(best, I[1] + 0.01); t += 0.01) if (contient(s, ax + ux * t, ay + uy * t, az + uz * t)) { best = Math.min(best, t); break; }
  }
  for (const r of C.sols) {
    const I = intervalle(r.x0, r.x1, r.z0, r.z1, -Infinity, Infinity); if (!I) continue;
    let fA = null;
    const fin = Math.min(best, I[1]);
    for (let t = I[0]; ; t += 0.01) {
      if (t > fin) t = fin;                                          // (le dernier échantillon : le bord même du sol)
      const x = ax + ux * t, z = az + uz * t, f = ay + uy * t - C._hSol(r, Math.min(r.x1, Math.max(r.x0, x)), Math.min(r.z1, Math.max(r.z0, z)));
      if (fA !== null && t > 1e-6 && ((fA < 0 && f >= 0) || (fA > 0 && f <= 0))) { best = Math.min(best, t); break; }
      fA = f;
      if (t >= fin) break;
    }
  }
  if (Math.abs(uy) > 1e-12) {
    const t = -ay / uy;
    if (t > 1e-6 && t < best && C.solEn(ax + ux * t, az + uz * t, 0.1) === 0) best = t;
  }
  return best;
}
// DES POINTS LIBRES tirés sur les sols (C.sols) à 1,0-1,7 m au-dessus : le sol effectif sous eux est ce sol, le disque du
// joueur y est libre, le point n'est dans aucune forme et sous son plafond ; `dedans` : dans l'école (pas la rue)
function pointsLibres(C, n, rng, { hMin = 1.0, hMax = 1.7, dedans = true } = {}) {
  const S = C.sols.map((r) => ({ r, w: Math.min(60, (r.x1 - r.x0) * (r.z1 - r.z0)) })).filter((q) => q.w > 0.2);
  const W = S.reduce((s, q) => s + q.w, 0), L = [];
  for (let essai = 0; L.length < n && essai < n * 400; essai++) {
    let u = rng.next() * W, q = S[0];
    for (const e of S) { u -= e.w; if (u <= 0) { q = e; break; } }
    const r = q.r, x = r.x0 + rng.next() * (r.x1 - r.x0), z = r.z0 + rng.next() * (r.z1 - r.z0);
    if (x < BORNES_NAV.xMin || x > BORNES_NAV.xMax || z < BORNES_NAV.zMin || z > BORNES_NAV.zMax) continue;
    if (dedans && z > 0.35) continue;
    const h = C._hSol(r, x, z), sol = C.solEn(x, z, h + 0.05);
    if (Math.abs(sol - h) > 0.02 || !C.libre(x, z, 0.3, sol)) continue;
    const y = sol + hMin + rng.next() * (hMax - hMin);
    if (dansUneForme(C, x, y, z) || C.plafondEn(x, z, sol) < y + 0.1) continue;
    L.push({ x, y, z, sol });
  }
  return L;
}
// des points libres de l'EMPRISE de l'école à un niveau (le rez-de-chaussée sans dalle compris : le plan y = 0)
function pointsNiveau(C, n, niveau, rng, { hMin = 1.0, hMax = 1.7, plafond = true } = {}) {
  const N = NIVEAUX.find((q) => q.n === niveau), L = [];
  for (let essai = 0; L.length < n && essai < n * 400; essai++) {
    const x = -0.2 + rng.next() * 20.2, z = -24.3 + rng.next() * 24.5;
    const sol = C.solEn(x, z, N.sol + 0.3);
    if (Math.abs(sol - N.sol) > 0.3 || !C.libre(x, z, 0.3, sol)) continue;
    const y = sol + hMin + rng.next() * (hMax - hMin);
    if (dansUneForme(C, x, y, z)) continue;
    if (plafond && C.plafondEn(x, z, sol) > sol + 3.4) continue;
    L.push({ x, y, z, sol });
  }
  return L;
}

// ---------------------------------------------------------------- le cerveau scripté
// La commande champ par champ (`c` : les tenus et les nombres gardés d'un pas à l'autre ; `fronts` : pour UN pas), la
// visée posée exactement sur `vise` ({ x, y, z } ou une fonction qui le rend), le recul pris à chaque pas et noté
// (`reculs` : [{ t, v, h }] non nuls ; il ne dérange pas la visée — sauf `subirRecul`, qui l'ajoute à la visée), `chaque`
// appelé à la fin de chaque commande.
class Script {
  constructor(a, p) { this.a = a; this.p = p; this.c = {}; this.fronts = null; this.vise = null; this.r = { v: 0, h: 0 }; this.reculs = []; this.chaque = null; this.subirRecul = false; this.lt = { l: 0, t: 0 }; }
  get etat() { return 'script'; }
  commande(dt, cmd) {
    const a = this.a;
    viderFronts(cmd);
    Object.assign(cmd, this.c);
    if (this.fronts) { Object.assign(cmd, this.fronts); this.fronts = null; }
    if (a.arsenal) { a.arsenal.prendreRecul(this.r); if (this.r.v || this.r.h) this.reculs.push({ t: this.p.t, v: this.r.v, h: this.r.h }); }
    const V = typeof this.vise === 'function' ? this.vise() : this.vise;
    if (V && a.corps) {
      const o = a.oeil(new THREE.Vector3());
      this.lt.l = Math.atan2(-(V.x - o.x), -(V.z - o.z)); this.lt.t = Math.atan2(-(V.y - o.y), Math.hypot(V.x - o.x, V.z - o.z));
      cmd.lacet = this.lt.l; cmd.tangage = this.lt.t;
    } else if (this.subirRecul) { this.lt.t -= this.r.v; this.lt.l -= this.r.h; cmd.lacet = this.lt.l; cmd.tangage = this.lt.t; }
    if (this.chaque) this.chaque(cmd);
  }
}

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-A', nom, fn, opts);
  const C = () => game.collisions;
  const nouvelleBalistique = () => new Balistique(game.collisions);

  // UNE PARTIE D'ESSAI VIDE : pas de Haythem, aucun mannequin ; les acteurs posés par le test
  const essaiVide = async (graine = 1, o = {}) => { await jeu.lancer('essai', { graine, mannequins: [], humain: false, ...o }); return game.partie; };
  // une ligne libre de la rue (bornée en partie) de `d` m : deux points qui se voient (œil → buste)
  const ligneLibre = (p, d = 10, extra = 0) => {
    const C0 = C();
    for (const z of [4.5, 3.5, 5.5, 2.5, 5.0, 4.0, 3.0]) for (const x0 of [2, 4, 6, 8, 10, 0, 1, 3, 5]) {
      const a = { x: x0, z }, b = { x: x0 + d, z };
      if (b.x + extra > 22.5) continue;
      a.y = C0.solEn(a.x, a.z, 0.3); b.y = C0.solEn(b.x, b.z, 0.3);
      if (Math.abs(a.y - b.y) > 0.05) continue;
      let ok = true;
      for (let s = 0; s <= d + extra; s += 0.5) { const x = x0 + s, y = C0.solEn(x, z, a.y + 0.3); if (!C0.libre(x, z, 0.4, y) || Math.abs(y - a.y) > 0.05) { ok = false; break; } }
      if (!ok) continue;
      if (p.balistique.vue(a.x, a.y + 1.62, a.z, b.x, b.y + 1.27, b.z) && p.balistique.libre(a.x, a.y + 1.62, a.z, b.x + extra, b.y + 1.0, b.z)) return [a, b];
    }
    return null;
  };
  // un tireur scripté et ses cibles
  const tireur = (p, x, y, z, classe = 'assaut', id = 1, lacet = -Math.PI / 2) => {
    const a = p.ajouterActeur({ id, nom: 'Tireur', equipe: 'A', x, y, z, lacet, classe, cerveau: null });
    const s = new Script(a, p); a.cerveau = s; return [a, s];
  };
  const cible = (p, x, y, z, id = 2, vie = 100, equipe = 'B') => {
    const b = p.ajouterActeur({ id, nom: 'Cible ' + id, equipe, x, y, z, lacet: Math.PI / 2, cerveau: null });
    b.vie = b.vieMax = vie; b.protegeT = 0; return b;
  };
  const avancer = (p, s) => { const n = Math.round(s / PAS); for (let i = 0; i < n && game.partie === p; i++) p.pas(PAS); };
  const jusqua = (p, f, sMax = 10) => { for (let i = 0; i < sMax / PAS && game.partie === p; i++) { if (f()) return true; p.pas(PAS); } return f(); };
  const ecoute = (p, types) => { const L = []; const d = p.sur('*', (e) => { if (!types || types.includes(e.type)) L.push(e); }); return { L, fin: d }; };

  // 1. LE DDA contre la référence brute : 2 000 segments entre points libres des sols, premier impact à ≤ 2 cm
  T('1 DDA : 2 000 segments contre la référence brute (1 cm)', async (t) => {
    jeu.quitter('balade');
    const C0 = C(), B = nouvelleBalistique(), rng = new Rng(7), P = pointsLibres(C0, 600, rng), h = {};
    let ok = 0, n = 0, pire = 0, rien = 0;
    const fautes = [];
    for (let k = 0; k < 2000 && P.length > 1; k++) {
      const a = P[rng.int(P.length)], b = P[rng.int(P.length)];
      const L = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z); if (L < 0.5) { k--; continue; }
      const tb = B.rayon(a.x, a.y, a.z, (b.x - a.x) / L, (b.y - a.y) / L, (b.z - a.z) / L, L, MODE.balle, h);
      const tr = brut(C0, a.x, a.y, a.z, b.x, b.y, b.z, 'balle');
      n++; const e = Math.abs(tb - tr); if (e <= 0.02) ok++; else if (fautes.length < 5) fautes.push(`(${r3(a.x)}, ${r3(a.y)}, ${r3(a.z)}) → (${r3(b.x)}, ${r3(b.y)}, ${r3(b.z)}) : ${r3(tb)} / ${r3(tr)}`);
      pire = Math.max(pire, Math.min(e, L)); if (tr >= L - 1e-6) rien++;
      if (k % 200 === 199) await t.attendre(0);
    }
    return { ok: n >= 2000 && ok / n >= 0.995, attendu: '≥ 99,5 % des 2 000 segments à ≤ 2 cm de la référence', obtenu: `${ok}/${n} (${(100 * ok / n).toFixed(2)} %) · ${rien} sans obstacle · ${P.length} points${fautes.length ? ' · écarts : ' + fautes.join(' ; ') : ''}` };
  }, { delai: 300 });

  // 2. CONTRE LE LANCEUR DE RAYONS de three sur la scène (les maillages) : 100 rayons, ≥ 97 % à ≤ 10 cm (hors verre et décor
  // sans forme : feuillage, rampes, lampes, câbles — comptés à part)
  T('2 balle() contre les maillages de la scène (100 rayons)', async (t) => {
    jeu.quitter('balade');
    const C0 = C(), B = nouvelleBalistique(), rng = new Rng(7), P = pointsLibres(C0, 300, rng), h = {}, m = {};
    const exclus = (o) => { for (let q = o; q; q = q.parent) { if (q === game.user.mesh || q.userData.dynamique) return true; } return false; };
    const maillages = [];
    game.scene.traverse((o) => { if ((o.isMesh || o.isInstancedMesh) && !o.isSkinnedMesh && !o.userData.suite && !exclus(o)) maillages.push(o); });
    // (les faces vues de dos comptent : les matériaux passés en double face le temps des rayons, rendus aussitôt — aucun rendu entre)
    const cotes = new Map();
    for (const o of maillages) for (const M of [].concat(o.material)) if (M && !cotes.has(M)) { cotes.set(M, M.side); M.side = THREE.DoubleSide; }
    const rc = new THREE.Raycaster();
    let ok = 0, n = 0, verre = 0, sansForme = 0;
    const fautes = [];
    const presDuneForme = (x, y, z) => {
      for (const s of formesPres(C0, x - 0.2, z - 0.2, x + 0.2, z + 0.2)) {
        if (s.off || y < s.y0 - 0.15 || y > s.y1 + 0.15) continue;
        for (const [ex, ez] of [[0, 0], [0.15, 0], [-0.15, 0], [0, 0.15], [0, -0.15]]) if (contient({ ...s, y0: -Infinity, y1: Infinity }, x + ex, 0, z + ez)) return true;
      }
      for (const r of C0.sols) if (x >= r.x0 - 0.15 && x <= r.x1 + 0.15 && z >= r.z0 - 0.15 && z <= r.z1 + 0.15 && Math.abs(y - C0._hSol(r, x, z)) < 0.15) return true;
      return Math.abs(y) < 0.15 && C0.solEn(x, z, 0.1) === 0;
    };
    try {
      for (let k = 0; n + verre + sansForme < 100 && k < 400; k++) {
        const a = P[rng.int(P.length)], b = P[rng.int(P.length)];
        const L = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z); if (L < 1) continue;
        const d = new THREE.Vector3((b.x - a.x) / L, (b.y - a.y) / L, (b.z - a.z) / L);
        rc.set(new THREE.Vector3(a.x, a.y, a.z), d); rc.near = 0; rc.far = L;
        const H = rc.intersectObjects(maillages, false)[0] || null;
        if (H) {
          const M = Array.isArray(H.object.material) ? H.object.material[H.face ? H.face.materialIndex : 0] : H.object.material;
          if (M && (M.transparent || M.opacity < 1 || M.alphaTest > 0 || M.visible === false || M.colorWrite === false)) { verre++; continue; }
          if (!presDuneForme(H.point.x, H.point.y, H.point.z)) { sansForme++; continue; }
        }
        B.balle(a.x, a.y, a.z, d.x, d.y, d.z, L, m);
        const tR = H ? H.distance : L;
        n++;
        if (Math.abs(tR - m.t) <= 0.10) ok++; else if (fautes.length < 6) fautes.push(`(${r3(a.x)}, ${r3(a.y)}, ${r3(a.z)}) → (${r3(b.x)}, ${r3(b.y)}, ${r3(b.z)}) : maillage ${r3(tR)} « ${H ? H.object.name || H.object.parent?.name || '?' : 'rien'} », balle ${r3(m.t)} (${m.mat})`);
      }
    } finally { for (const [M, s] of cotes) M.side = s; }
    void h; await t.attendre(0);
    return { ok: n >= 60 && ok / n >= 0.97, attendu: '≥ 97 % des rayons comparés à ≤ 10 cm du premier maillage (verre et décor sans forme exclus)',
      obtenu: `${ok}/${n} (${(100 * ok / Math.max(1, n)).toFixed(1)} %) · exclus : ${verre} verre, ${sansForme} sans forme${fautes.length ? ' · écarts : ' + fautes.join(' ; ') : ''}` };
  }, { delai: 300 });

  // 3. 400 RAYONS VERTICAUX : arrêtés par un sol ou un plafond avant le niveau voisin
  T('3 rayons verticaux arrêtés avant le niveau voisin (400)', async () => {
    jeu.quitter('balade');
    const C0 = C(), B = nouvelleBalistique(), rng = new Rng(3), m = {};
    let ok = 0, n = 0; const fautes = [];
    for (const niv of [-1, 0, 1, 2]) {
      const P = pointsNiveau(C0, 50, niv, rng), N = NIVEAUX.findIndex((q) => q.n === niv);
      for (const q of P) {
        // vers le bas : au sol de son niveau (à 0,35 m près : l'épaisseur d'une dalle) ; vers le haut : avant le sol du dessus
        B.balle(q.x, q.y, q.z, 0, -1, 0, 8, m); n++;
        if (m.mat !== 'rien' && m.y >= q.sol - 0.35) ok++; else if (fautes.length < 6) fautes.push(`bas (${r3(q.x)}, ${r3(q.y)}, ${r3(q.z)}) : ${m.mat} ${r3(m.y)}`);
        B.balle(q.x, q.y, q.z, 0, 1, 0, 8, m); n++;
        const haut = N < NIVEAUX.length - 1 ? NIVEAUX[N + 1].sol + 0.05 : q.sol + 4;
        if (m.mat !== 'rien' && m.y <= haut) ok++; else if (fautes.length < 6) fautes.push(`haut (${r3(q.x)}, ${r3(q.y)}, ${r3(q.z)}) : ${m.mat} ${r3(m.y)}`);
      }
    }
    return { ok: n >= 400 && ok === n, attendu: '100 % des 400 rayons arrêtés par un sol ou un plafond avant le niveau voisin',
      obtenu: `${ok}/${n}${fautes.length ? ' · ' + fautes.join(' ; ') : ''}` };
  });

  // 4. VITRES, DÉPOLIS, FORMES « joueur seul », FORMES `balle: false`
  T('4 vitres claires et dépolies, formes camera:false et balle:false', async () => {
    const p = await essaiVide(4), C0 = C(), B = p.balistique, m = {};
    // les vitres dont les deux côtés sont libres sur 0,8 m (le tir part d'un côté, la cible est de l'autre)
    const vitres = C0.formes.filter((s) => s.vitre && !s.off && s.t !== 'c' && Number.isFinite(s.y1));
    const essais = [];
    for (const s of vitres) {
      let cx, cz, nx, nz;
      if (s.t === 'b') { cx = (s.x0 + s.x1) / 2; cz = (s.z0 + s.z1) / 2; if (s.x1 - s.x0 < s.z1 - s.z0) { nx = 1; nz = 0; } else { nx = 0; nz = 1; } }
      else { cx = s.cx; cz = s.cz; if (s.hx < s.hz) { nx = s.c; nz = s.s; } else { nx = -s.s; nz = s.c; } }
      const y = (Math.max(s.y0, s.y0 + 0.1) + Math.min(s.y1, s.y0 + 1.5)) / 2;
      for (const sg of [1, -1]) {
        const ax = cx - sg * nx * 0.9, az = cz - sg * nz * 0.9, bx = cx + sg * nx * 1.5, bz = cz + sg * nz * 1.5;
        if (dansUneForme(C0, ax, y, az) || dansUneForme(C0, bx, y, bz)) continue;
        const L = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / L, dz = (bz - az) / L;
        B.balle(ax, y, az, dx, 0, dz, L, m);
        if (m.vitre !== s || m.mat !== 'rien') continue;            // (rien d'autre que cette vitre entre les deux)
        essais.push({ s, ax, az, bx, bz, y, dx, dz, L }); break;
      }
      if (essais.length >= 20) break;
    }
    // (a) claires : la balle traverse, la cible derrière prend × 0,8 ; la vue passe
    const cib = cible(p, 0, 0, 0, 9, 1e9), [tir] = tireur(p, 0, 0, 0, 'assaut', 8);
    let claires = 0, vuesClaires = 0, depolies = 0, vuesDepolies = 0;
    const touches = [];
    const d0 = p.sur('touche', (e) => touches.push(e.degats));
    for (const E of essais) {
      jeu.teleporter(cib.id, E.bx + E.dx * 0.3, E.y - 1.27, E.bz + E.dz * 0.3);
      const r = B.tirer(p, tir, E.ax, E.y, E.az, E.dx, 0, E.dz, 10, {});
      touches.length = 0;
      p.resoudreTir(tir, ARMES.fa24, E.ax, E.y, E.az, E.dx, 0, E.dz, r, 0); p.appliquerEffets();
      const attendu = degatsDe(ARMES.fa24, r.t, r.zone) * 0.8;
      if (r.acteur === cib && r.traverse && touches.length === 1 && Math.abs(touches[0] - attendu) < 1e-9) claires++;
      if (B.vue(E.ax, E.y, E.az, E.bx, E.y, E.bz)) vuesClaires++;
    }
    // (b) dépolies (marquées le temps du test, la table de L-M n'étant pas là) : traversées aussi, la vue arrêtée
    for (const E of essais) E.s.depoli = true;
    try {
      for (const E of essais) {
        jeu.teleporter(cib.id, E.bx + E.dx * 0.3, E.y - 1.27, E.bz + E.dz * 0.3);
        const r = B.tirer(p, tir, E.ax, E.y, E.az, E.dx, 0, E.dz, 10, {});
        if (r.acteur === cib && r.traverse) depolies++;
        if (!B.vue(E.ax, E.y, E.az, E.bx, E.y, E.bz)) vuesDepolies++;
      }
    } finally { for (const E of essais) delete E.s.depoli; d0(); }
    // (c) les formes « joueur seul » (camera: false) arrêtent les balles ; (d) une forme `balle: false` les laisse passer
    const joueurSeul = C0.formes.filter((s) => !s.camera && !s.off && s.balle !== false && Number.isFinite(s.y1) && s.y1 - s.y0 > 0.25);
    let arretees = 0, passees = 0, nC = 0, nB = 0;
    const tirSur = (s) => {
      const cx = s.t === 'c' ? s.x : s.t === 'b' ? (s.x0 + s.x1) / 2 : s.cx, cz = s.t === 'c' ? s.z : s.t === 'b' ? (s.z0 + s.z1) / 2 : s.cz;
      const y = (s.y0 + s.y1) / 2, ext = Math.max(s.bx1 - s.bx0, s.bz1 - s.bz0) / 2 + 0.6;
      for (let k = 0; k < 8; k++) {
        const an = k * Math.PI / 4, ax = cx + Math.cos(an) * ext, az = cz + Math.sin(an) * ext;
        if (dansUneForme(C0, ax, y, az)) continue;
        const dx = -Math.cos(an), dz = -Math.sin(an);
        // (la forme seule entre l'origine et son centre : sans elle, rien jusqu'au centre)
        s.off = true; const libre = B.balle(ax, y, az, dx, 0, dz, ext, m).t >= ext - 1e-6; s.off = false;
        if (libre) return { ax, az, y, dx, dz, ext };
      }
      return null;
    };
    for (const s of joueurSeul) {
      if (nC >= 20) break;
      const q = tirSur(s); if (!q) continue;
      nC++; if (B.balle(q.ax, q.y, q.az, q.dx, 0, q.dz, q.ext, m).forme === s) arretees++;
    }
    const autres = C0.formes.filter((s) => s.camera && s.joueur && !s.vitre && !s.off && Number.isFinite(s.y1) && s.y1 - s.y0 > 0.4 && s.y1 - s.y0 < 2.2);
    for (let k = 0; k < autres.length && nB < 20; k += 7) {
      const s = autres[k], q = tirSur(s); if (!q) continue;
      s.balle = false;
      try { nB++; const r = B.balle(q.ax, q.y, q.az, q.dx, 0, q.dz, q.ext, m); if (r.forme !== s && r.t >= q.ext - 0.3 - 1e-6) passees++; } finally { delete s.balle; }
    }
    jeu.quitter('balade');
    const n = essais.length;
    return { ok: n >= 20 && claires === n && vuesClaires === n && depolies === n && vuesDepolies === n && nC >= 20 && arretees === nC && nB >= 20 && passees === nB,
      attendu: '20 vitres claires traversées (× 0,8, vue libre) ; 20 dépolies traversées, vue arrêtée ; 20 formes camera:false arrêtent ; 20 balle:false laissent passer',
      obtenu: `claires ${claires}/${n} (vue ${vuesClaires}) · dépolies ${depolies}/${n} (vue arrêtée ${vuesDepolies}) · camera:false ${arretees}/${nC} · balle:false ${passees}/${nB}` };
  });

  // 5. LES TEMPS : balle() à 30 m (médiane, 99e centile), tirer avec 8 acteurs (chaque rayon répété 10 fois : l'horloge du
  // navigateur est grossière)
  T('5 balle() ≤ 30 µs (médiane) / 120 µs (99e) à 30 m ; tirer à 8 acteurs ≤ 0,1 ms', async (t) => {
    const p = await essaiVide(5), C0 = C(), B = p.balistique, rng = new Rng(5), m = {}, P = pointsLibres(C0, 400, rng, { dedans: false });
    const L = [];
    for (let k = 0; k < 1500; k++) {
      const q = P[rng.int(P.length)], l = rng.next() * 2 * Math.PI, tg = (rng.next() - 0.5) * 0.4;
      const dx = -Math.sin(l) * Math.cos(tg), dy = -Math.sin(tg), dz = -Math.cos(l) * Math.cos(tg);
      const t0 = performance.now(); for (let r = 0; r < 10; r++) B.balle(q.x, q.y, q.z, dx, dy, dz, 30, m); L.push((performance.now() - t0) / 10 * 1000);
    }
    // tirer : 7 cibles autour d'un tireur, dans la rue
    const LL = ligneLibre(p, 10) || [{ x: 2, y: 0, z: 4.5 }, { x: 12, y: 0, z: 4.5 }];
    const [a] = tireur(p, LL[0].x, LL[0].y, LL[0].z);
    for (let k = 0; k < 7; k++) cible(p, LL[0].x + 2 + k * 1.2, LL[0].y, LL[0].z + (k % 2 ? 0.8 : -0.8), 10 + k, 1e9);
    const o = a.oeil(new THREE.Vector3()), M = [];
    for (let k = 0; k < 400; k++) {
      const l = -Math.PI / 2 + (rng.next() - 0.5) * 0.6, dx = -Math.sin(l), dz = -Math.cos(l);
      const t0 = performance.now(); for (let r = 0; r < 10; r++) B.tirer(p, a, o.x, o.y, o.z, dx, -0.03, dz, 100, m); M.push((performance.now() - t0) / 10);
    }
    jeu.quitter('balade');
    const med = mediane(L), p99 = centile(L, 0.99), mt = mediane(M);
    const v = !document.hidden;
    const ok1 = t.temps('balle médiane (µs)', med, 30, v), ok2 = t.temps('balle 99e centile (µs)', p99, 120, v), ok3 = t.temps('tirer 8 acteurs (ms)', mt, 0.1, v);
    return { ok: ok1 && ok2 && ok3, attendu: 'balle ≤ 30 µs médiane, ≤ 120 µs au 99e centile (30 m) ; tirer ≤ 0,1 ms (8 acteurs)',
      obtenu: `balle ${med.toFixed(1)} µs / ${p99.toFixed(1)} µs · tirer ${(mt * 1000).toFixed(1)} µs` };
  });

  // 6. MANNEQUIN À 10 m, tireur immobile en visée (dispersion 0) : 100 balles à la tête, 100 au torse, 100 aux jambes
  T('6 visée exacte à 10 m : tête, torse, jambes (100 chacune)', async () => {
    const p = await essaiVide(6), LL = ligneLibre(p, 10);
    if (!LL) return { ok: false, attendu: 'une ligne libre de 10 m', obtenu: 'aucune' };
    const [a, s] = tireur(p, LL[0].x, LL[0].y, LL[0].z), b = cible(p, LL[1].x, LL[1].y, LL[1].z, 2, 1e9), e = b.h / 1.73;
    const zones = { tete: 0, torse: 0, jambes: 0 }, comptes = {};
    const d0 = p.sur('touche', (ev) => { if (ev.par === a.id) comptes[ev.zone] = (comptes[ev.zone] || 0) + 1; });
    const H = new THREE.Vector3();
    for (const z of Object.keys(zones)) {
      a.arsenal.remplir(); s.c = { visee: true, tir: false };
      s.vise = () => (z === 'tete' ? teteSimulee(b, H) : { x: b.pos.x, y: b.pos.y + (z === 'torse' ? 1.27 : 0.5) * e, z: b.pos.z });
      avancer(p, 0.5);
      for (const k in comptes) delete comptes[k];
      let n = 0; const s0 = a.arsenal.tirSeq;
      s.c.tir = true;
      jusqua(p, () => a.arsenal.tirSeq - s0 >= 100, 30);
      s.c.tir = false; avancer(p, 0.1); n = a.arsenal.tirSeq - s0;
      zones[z] = comptes[z] || 0;
      if (n !== 100) zones[z] = -n;
      a.arsenal.remplir();
    }
    d0(); jeu.quitter('balade');
    return { ok: zones.tete === 100 && zones.torse === 100 && zones.jambes === 100, attendu: '100 tête, 100 torse, 100 jambes',
      obtenu: `tête ${zones.tete} · torse ${zones.torse} · jambes ${zones.jambes} (FA-24 en visée, 10 m)` };
  }, { delai: 180 });

  // 7. LES CADENCES (report du reste) et le tampon des semi-automatiques
  T('7 cadences : FA-24, PM-9, FP-12, TP-50, P-17, tampon, reprise', async () => {
    const p = await essaiVide(7), LL = ligneLibre(p, 10) || [{ x: 2, y: 0, z: 4.5 }], o = LL[0];
    let id = 30;
    // un tireur de l'arme seule, vers le ciel (son chargeur porté à 99 : la cadence sans recharge)
    const seul = (arme, plein = true) => {
      const [a, s] = tireur(p, o.x, o.y, o.z, null, id++);
      a.arsenal = new Arsenal(a, { principale: arme, secondaire: null, letale: null, tactique: null, couteau: false });
      if (plein) a.arsenal.ch[0] = 99;
      s.vise = { x: o.x - 20, y: o.y + 6, z: o.z };
      const T0 = [], d = p.sur('tir', (e) => { if (e.a === a.id) T0.push(e.t); });
      return { a, s, T0, fin: () => { d(); p.retirerActeur(a); } };
    };
    const serie = (arme, n, tenu) => {
      const q = seul(arme); let k = 0;
      q.s.chaque = (cmd) => { cmd.tir = tenu ? true : (k++ % 2 === 0); };
      jusqua(p, () => q.T0.length >= n, 40);
      q.fin(); return q.T0;
    };
    const fa = serie('fa24', 30, true), pm = serie('pm9', 32, true), fp = serie('fp12', 10, false), tp = serie('tp50', 2, false);
    const res = { fa: fa[29] - fa[0], pm: pm[31] - pm[0], fp: fp[9] - fp[0], tp: tp[1] - tp[0] };
    // P-17 : un front toutes les 50 ms pendant 3 s
    let q = seul('p17'), k = 0;
    q.s.chaque = (cmd) => { cmd.tir = k++ % 6 === 0; };
    avancer(p, 3.0); const n17 = q.T0.length; q.fin();
    // le tampon : un front 50 ms après un coup (100 ms avant la fin de la cadence) part à la fin de la cadence
    q = seul('p17'); k = 0;
    q.s.chaque = (cmd) => { cmd.tir = k === 0 || k === 6; k++; };
    avancer(p, 0.5); const tampon = q.T0.length === 2 ? q.T0[1] - q.T0[0] : -1; q.fin();
    // la reprise : après 2 s sans tirer, la FA-24 ne rattrape pas le temps perdu
    q = seul('fa24', false);
    q.s.c.tir = true; avancer(p, 0.3); q.s.c.tir = false; avancer(p, 2.0);
    const i0 = q.T0.length; q.s.c.tir = true; avancer(p, 0.2); q.s.c.tir = false;
    const reprise = q.T0.length >= i0 + 2 ? q.T0[i0 + 1] - q.T0[i0] : -1; q.fin();
    jeu.quitter('balade');
    const P1 = PAS + 1e-6;
    const ok = Math.abs(res.fa - 2.32) <= P1 && Math.abs(res.pm - 31 * 60 / 900) <= P1 && Math.abs(res.fp - 9 * 60 / 70) <= P1 && Math.abs(res.tp - 60 / 45) <= P1
      && Math.abs(n17 - 20) <= 1 && Math.abs(tampon - 0.15) <= P1 && reprise >= 0.08 - P1;
    return { ok, attendu: 'FA-24 30e à 2,32 s ± 1 pas · PM-9 32e à 2,067 s · FP-12 10 coups en 7,714 s · TP-50 1,333 s · P-17 20 ± 1 coups en 3 s · tampon ≈ 150 ms · reprise ≥ 80 ms − 1 pas',
      obtenu: `FA-24 ${res.fa.toFixed(4)} · PM-9 ${res.pm.toFixed(4)} · FP-12 ${res.fp.toFixed(4)} · TP-50 ${res.tp.toFixed(4)} · P-17 ${n17} · tampon ${tampon.toFixed(4)} · reprise ${reprise.toFixed(4)} s` };
  }, { delai: 180 });

  // 8. LES TEMPS POUR TUER (100 PV au torse, en visée)
  T('8 temps pour tuer : FA-24, PM-9, P-17, FP-12, TP-50', async () => {
    const p = await essaiVide(8), LL = ligneLibre(p, 10);
    if (!LL) return { ok: false, attendu: 'une ligne libre', obtenu: 'aucune' };
    let id = 50;
    const ttk = (arme, d, zone = 'torse') => {
      const a0 = LL[0];
      const [a, s] = tireur(p, a0.x, a0.y, a0.z, null, id++);
      a.arsenal = new Arsenal(a, { principale: arme, secondaire: null, letale: null, tactique: null, couteau: false });
      const b = cible(p, a0.x + d, a0.y, a0.z, id++, 100), e = b.h / 1.73;
      const y = zone === 'torse' ? 1.27 : zone === 'ventre' ? 1.0 : 0.5;
      s.vise = { x: b.pos.x, y: b.pos.y + y * e, z: b.pos.z }; s.c.visee = true;
      avancer(p, 0.6);
      const T0 = [], E = []; let k = 0;
      const dd = p.sur('*', (ev) => { if (ev.type === 'tir' && ev.a === a.id) T0.push(ev.t); else if (ev.type === 'elim' && ev.cible === b.id) E.push(ev.t); });
      s.chaque = (cmd) => { cmd.tir = ARMES[arme].auto ? true : k++ % 2 === 0; };
      jusqua(p, () => E.length > 0, 6);
      s.chaque = null; s.c.tir = false; dd();
      const r = { balles: T0.length, ms: E.length ? (E[0] - T0[0]) * 1000 : -1 };
      p.retirerActeur(a); p.retirerActeur(b);
      return r;
    };
    const fa = ttk('fa24', 10), pm = ttk('pm9', 6), p17 = ttk('p17', 8), fp = ttk('fp12', 4), tpT = ttk('tp50', 10), tpV = ttk('tp50', 10, 'ventre'), tpJ = ttk('tp50', 10, 'jambes');
    jeu.quitter('balade');
    const pas = PAS * 1000 + 1e-3;
    const ok = fa.balles === 4 && Math.abs(fa.ms - 240) <= pas && pm.balles === 4 && Math.abs(pm.ms - 200) <= pas && p17.balles === 3 && Math.abs(p17.ms - 300) <= pas
      && fp.balles === 1 && tpT.balles === 1 && tpV.balles === 2 && tpJ.balles === 2;
    return { ok, attendu: 'FA-24 10 m : 4 balles, 240 ms ± 1 pas · PM-9 6 m : 200 ms · P-17 8 m : 300 ms · FP-12 4 m : 1 coup · TP-50 : 1 au-dessus du ventre, 2 au ventre ou aux jambes',
      obtenu: `FA-24 ${fa.balles} / ${fa.ms.toFixed(1)} ms · PM-9 ${pm.balles} / ${pm.ms.toFixed(1)} · P-17 ${p17.balles} / ${p17.ms.toFixed(1)} · FP-12 ${fp.balles} · TP-50 torse ${tpT.balles}, ventre ${tpV.balles}, jambes ${tpJ.balles}` };
  }, { delai: 180 });

  // 9. degatsDe : la table du § 3.3, valeur par valeur
  T('9 degatsDe : la table du § 3.3', async () => {
    const TABLE = {
      fa24: { paliers: [[10, 30], [20, 24], [40, 20]], zones: { tete: 1.4, cou: 1.2, torse: 1.1, ventre: 1.0, jambes: 0.9 } },
      pm9: { paliers: [[5, 26], [12, 20], [30, 15]], zones: { tete: 1.25, cou: 1.1, torse: 1.0, ventre: 1.0, jambes: 0.9 } },
      fp12: { paliers: [[3, 18], [7, 11], [12, 6], [20, 0]], zones: { tete: 1, cou: 1, torse: 1, ventre: 1, jambes: 1 } },
      tp50: { paliers: [[5, 105], [50, 105]], zones: { tete: 2.0, cou: 1.5, torse: 1.0, ventre: 0.9, jambes: 0.75 } },
      p17: { paliers: [[5, 34], [15, 25], [30, 20]], zones: { tete: 1.5, cou: 1.2, torse: 1.0, ventre: 1.0, jambes: 0.9 } },
    };
    let n = 0, ok = 0; const fautes = [];
    for (const [id, Tb] of Object.entries(TABLE)) for (const [d, v] of Tb.paliers) for (const [z, k] of Object.entries(Tb.zones)) {
      n++; const g = degatsDe(ARMES[id], d, z);
      if (Math.abs(g - v * k) < 1e-9) ok++; else fautes.push(`${id} ${d} m ${z} : ${g} au lieu de ${v * k}`);
    }
    // (les bornes des paliers : ≤ 15 compte encore au 1er palier)
    for (const [id, d, v] of [['fa24', 15, 30], ['fa24', 15.01, 24], ['fa24', 30, 24], ['pm9', 8, 26], ['pm9', 16, 20], ['fp12', 5, 18], ['fp12', 14, 6], ['fp12', 14.01, 0], ['p17', 10, 34], ['p17', 20, 25]]) {
      n++; const g = degatsDe(ARMES[id], d, 'ventre'); if (Math.abs(g - v) < 1e-9) ok++; else fautes.push(`${id} ${d} m : ${g} au lieu de ${v}`);
    }
    return { ok: n >= 40 && ok === n, attendu: `${n} valeurs exactes`, obtenu: `${ok}/${n}${fautes.length ? ' · ' + fautes.slice(0, 4).join(' ; ') : ''}` };
  });

  // 10. LES RECHARGES : tactique, à vide, annulée par le sprint avant l'entrée des balles, FP-12 cartouche par cartouche
  // (et interrompue par un tir), conservation des balles sur 1 000 actions au hasard
  T('10 recharges : tactique, à vide, sprint, FP-12, conservation', async () => {
    const p = await essaiVide(10), LL = ligneLibre(p, 10) || [{ x: 2, y: 0, z: 4.5 }];
    const o = LL[0], ciel = { x: o.x - 20, y: o.y + 6, z: o.z };
    let id = 60;
    const nouveau = (arme) => {
      const [a, s] = tireur(p, o.x, o.y, o.z, null, id++);
      a.arsenal = new Arsenal(a, { principale: arme, secondaire: arme === 'fa24' ? 'p17' : null, letale: null, tactique: null, couteau: false });
      s.vise = ciel; return [a, s];
    };
    const duree = (a, s, avant) => {
      const R = []; const d = p.sur('recharge', (e) => { if (e.a === a.id) R.push(e); });
      if (avant) avant();
      jusqua(p, () => R.some((e) => e.phase === 'fin' || e.phase === 'annulee' || e.phase === 'interrompue'), 6);
      d();
      const deb = R.find((e) => e.phase === 'debut'), fin = R.find((e) => e.phase === 'fin');
      return deb && fin ? fin.t - deb.t : -1;
    };
    const tirerN = (a, s, n) => { const s0 = a.arsenal.tirSeq; let k = 0; s.chaque = (cmd) => { cmd.tir = a.arsenal.arme.auto ? a.arsenal.tirSeq - s0 < n : (k++ % 2 === 0 && a.arsenal.tirSeq - s0 < n); }; jusqua(p, () => a.arsenal.tirSeq - s0 >= n, 10); s.chaque = null; s.c.tir = false; avancer(p, 0.12); };
    // FA-24 tactique (25 → 31) et à vide (0 → 30)
    let [a, s] = nouveau('fa24');
    tirerN(a, s, 5);
    const dTact = duree(a, s, () => { s.fronts = { recharger: true }; }), chTact = a.arsenal.chargeur;
    tirerN(a, s, 31);
    const dVide = duree(a, s), chVide = a.arsenal.chargeur;
    p.retirerActeur(a);
    // le sprint à 1,30 s : annulée (chargeur inchangé) ; à 1,40 s : gardée
    const sprintA = (k) => {
      const [b, sb] = nouveau('fa24'); tirerN(b, sb, 5);
      const ch0 = b.arsenal.chargeur; let t0 = -1;
      sb.fronts = { recharger: true }; p.pas(PAS); t0 = p.t;
      jusqua(p, () => p.t - t0 >= k - 1e-9, 3);
      sb.c.sprint = true; sb.c.ay = 1; sb.vise = null; avancer(p, 0.3); sb.c.sprint = false; sb.c.ay = 0; avancer(p, 1.5);
      const r = { avant: ch0, apres: b.arsenal.chargeur };
      p.retirerActeur(b); return r;
    };
    const s130 = sprintA(1.30), s140 = sprintA(1.40);
    // FP-12 : 3 cartouches (4 → 7) en 0,35 + 3 × 0,42 + 0,30 ; puis interrompue par un tir après la 1re cartouche
    [a, s] = nouveau('fp12'); tirerN(a, s, 3);
    const dFp = duree(a, s, () => { s.fronts = { recharger: true }; }), chFp = a.arsenal.chargeur;
    tirerN(a, s, 3);
    const s0 = a.arsenal.tirSeq; s.fronts = { recharger: true }; avancer(p, 0.35 + 0.42 + 0.05);
    const chMilieu = a.arsenal.chargeur; s.fronts = { tir: true }; avancer(p, 0.2);
    const interrompue = a.arsenal.tirSeq === s0 + 1 && a.arsenal.etatArme !== 'recharge' && chMilieu === 5;
    p.retirerActeur(a);
    // la conservation : chargeur + réserve + balles tirées, constant, sur 1 000 actions tirées au hasard (graine 3)
    [a, s] = nouveau('fa24');
    const rng = new Rng(3), tirs = { fa24: 0, p17: 0 }, total = () => a.arsenal.ch.reduce((x, v) => x + v, 0) + a.arsenal.res.reduce((x, v) => x + v, 0) + tirs.fa24 + tirs.p17;
    const dT = p.sur('tir', (e) => { if (e.a === a.id) tirs[e.arme]++; });
    const t0 = total(); let faux = 0;
    for (let k = 0; k < 1000; k++) {
      const q = rng.int(7);
      if (q === 0) s.c.tir = !s.c.tir; else if (q === 1) s.fronts = { recharger: true }; else if (q === 2) s.fronts = { armeN: 1 + rng.int(2) };
      else if (q === 3) { s.c.sprint = !s.c.sprint; s.c.ay = s.c.sprint ? 1 : 0; } else if (q === 4) s.fronts = { tir: true }; else if (q === 5) s.c.visee = !s.c.visee;
      avancer(p, PAS * (1 + rng.int(20)));
      if (total() !== t0) faux++;
    }
    dT(); jeu.quitter('balade');
    const P1 = PAS + 1e-6;
    const ok = Math.abs(dTact - 1.90) <= P1 && chTact === 31 && Math.abs(dVide - 2.45) <= P1 && chVide === 30 && s130.apres === s130.avant && s140.apres === 31
      && Math.abs(dFp - (0.35 + 0.42 * 3 + 0.30)) <= P1 && chFp === 7 && interrompue && faux === 0;
    return { ok, attendu: 'tactique 1,90 s → 31 · à vide 2,45 s → 30 · sprint à 1,30 annule, à 1,40 garde · FP-12 1,91 s → 7, interrompue par un tir · conservation sur 1 000 actions',
      obtenu: `tactique ${dTact.toFixed(4)} → ${chTact} · vide ${dVide.toFixed(4)} → ${chVide} · sprint 1,30 : ${s130.avant} → ${s130.apres} · 1,40 : ${s140.avant} → ${s140.apres} · FP-12 ${dFp.toFixed(4)} → ${chFp}, interrompue ${interrompue} · conservation ${faux} écart(s) (${t0} balles)` };
  }, { delai: 180 });

  // 11. LE RECUL de la FA-24 : le motif (6,76° de montée en 12 balles), × 0,8 en visée, × 0,85 accroupi, la boucle, le
  // rappel ; camPitch qui BAISSE pour Haythem ; le ressort visuel qui se cabre
  T('11 recul FA-24 : motif, visée, accroupi, boucle, rappel, camPitch', async () => {
    const p = await essaiVide(11), LL = ligneLibre(p, 10) || [{ x: 2, y: 0, z: 4.5 }];
    const o = LL[0], M = ARMES.fa24.recul;
    let id = 70;
    const rafale = (n, { visee = false, accroupi = false } = {}) => {
      const [a, s] = tireur(p, o.x, o.y, o.z, 'assaut', id++);
      s.vise = { x: o.x - 20, y: o.y + 4, z: o.z }; s.c.visee = visee; s.c.accroupi = accroupi;
      avancer(p, 0.6); s.reculs.length = 0;
      const s0 = a.arsenal.tirSeq; s.c.tir = true;
      jusqua(p, () => a.arsenal.tirSeq - s0 >= n, 5); s.c.tir = false;
      const tDernier = p.t; let cabre = a.arsenal.reculV;
      p.pas(PAS); cabre = Math.max(cabre, a.arsenal.reculV);
      const montee = s.reculs.reduce((x, r) => x + r.v, 0), cote = s.reculs.reduce((x, r) => x + r.h, 0), parTir = s.reculs.map((r) => r.v / DEG);
      s.reculs.length = 0; avancer(p, 0.29);
      const avantRappel = s.reculs.reduce((x, r) => x + r.v, 0);
      s.reculs.length = 0; avancer(p, 0.36);
      const rappel = s.reculs.reduce((x, r) => x + r.v, 0);
      void tDernier;
      p.retirerActeur(a);
      return { montee, cote, parTir, avantRappel, rappel, cabre };
    };
    const base = rafale(12), vis = rafale(12, { visee: true }), acc = rafale(12, { accroupi: true }), longue = rafale(18);
    const somV = M.v.reduce((x, v) => x + v, 0), somH = M.h.reduce((x, v) => x + v, 0);
    let boucle = true;
    for (let i = 12; i < 18; i++) { const j = 12 - M.boucle + ((i - 12) % M.boucle); if (Math.abs(longue.parTir[i] - M.v[j]) > M.alea + 1e-6) boucle = false; }
    // Haythem (acteur local) : camPitch baisse de la montée (lireCommande applique le recul avant de copier le regard)
    jeu.quitter('balade');
    await jeu.lancer('essai', { graine: 11, mannequins: [] });
    const q = game.partie, u = q.local;
    game.camYaw = 0; game.camPitch = -0.3; const pitch0 = game.camPitch;
    const s0 = u.arsenal.tirSeq;
    for (let i = 0; i < 400 && u.arsenal.tirSeq - s0 < 12; i++) { jeu.commande(0, { tir: true }, PAS * 2); q.pas(PAS); }
    jeu.commande(0, { tir: false }, PAS * 4); q.pas(PAS); q.pas(PAS);
    const dPitch = pitch0 - game.camPitch;
    jeu.quitter('balade');
    const e = 0.01 * DEG;
    const ok = Math.abs(base.montee - somV * DEG) <= e && Math.abs(base.cote - somH * DEG) <= e && Math.abs(vis.montee - somV * 0.8 * DEG) <= e
      && Math.abs(acc.montee - somV * 0.85 * DEG) <= e && boucle && Math.abs(base.avantRappel) < 1e-9 && Math.abs(base.rappel + 0.4 * base.montee) <= e
      && Math.abs(dPitch - somV * DEG) <= e && base.cabre > 0;
    return { ok, attendu: `montée ${somV.toFixed(2)}° (0,118 rad), côté ${somH.toFixed(2)}° · × 0,8 visée · × 0,85 accroupi · boucle ± 0,08° · rien avant 300 ms puis − 40 % en 0,30 s · camPitch − 0,118 · cabré > 0`,
      obtenu: `montée ${(base.montee / DEG).toFixed(3)}° (${base.montee.toFixed(4)} rad), côté ${(base.cote / DEG).toFixed(3)}° · visée ${(vis.montee / DEG).toFixed(3)}° · accroupi ${(acc.montee / DEG).toFixed(3)}° · boucle ${boucle} · avant ${base.avantRappel.toExponential(1)} · rappel ${(base.rappel / DEG).toFixed(3)}° · camPitch −${dPitch.toFixed(4)} · cabré ${base.cabre.toFixed(2)}°` };
  });

  // 12. LA DISPERSION de la FA-24 (repos, course, saut), 10 000 tirages dans le disque, la gerbe du FP-12
  T('12 dispersion : FA-24 repos / course / saut, tirages, gerbe du FP-12', async () => {
    const p = await essaiVide(12), LL = ligneLibre(p, 12) || [{ x: 2, y: 0, z: 4.5 }];
    const o = LL[0];
    const [a, s] = tireur(p, o.x, o.y, o.z, 'assaut', 80);
    s.vise = null; s.c.lacet = -Math.PI / 2; s.c.tangage = 0;
    avancer(p, 0.6); const repos = a.arsenal.dispersion / DEG;
    s.c.ay = 1; avancer(p, 0.9); const course = a.arsenal.dispersion / DEG; s.c.ay = 0; avancer(p, 0.8);
    s.fronts = { saut: true }; avancer(p, 0.2); const enAir = a.corps.airborne, saut = a.arsenal.dispersion / DEG;
    avancer(p, 1.0);
    // 10 000 tirages (le tirage même du tir)
    const R = new Rng(1), t = { r: 0, th: 0 }, sD = 2.2 * DEG; let dans = 0, somme = 0;
    for (let i = 1; i <= 10000; i++) { R.seed(melanger(42, 1, i)); tirage(R, sD, t); if (t.r <= sD + 1e-12) dans++; somme += t.r; }
    const rapport = somme / 10000 / sD;
    // la gerbe du FP-12, à la hanche, vers le ciel : les angles des plombs autour de l'axe du tir
    a.arsenal = new Arsenal(a, { principale: 'fp12', secondaire: null, letale: null, tactique: null, couteau: false });
    s.c.lacet = -Math.PI / 2; s.c.tangage = -0.9; avancer(p, 0.4);
    const ax = [], tr = [];
    const d = p.sur('*', (e) => { if (e.a !== a.id) return; if (e.type === 'tir') ax.push(e); else if (e.type === 'trajet') tr.push(e); });
    let k = 0; s.chaque = (cmd) => { cmd.tir = k++ % 2 === 0; };
    jusqua(p, () => ax.length >= 4, 6); s.chaque = null; d();
    let centre = 0, couronne = 0, nC = 0, nR = 0;
    for (const e of tr) {
      const A = ax.find((q) => Math.abs(q.t - e.t) < 1e-9); if (!A) continue;
      const vx = e.x - e.ox, vy = e.y - e.oy, vz = e.z - e.oz, L = Math.hypot(vx, vy, vz), ang = Math.acos(Math.min(1, (vx * A.dx + vy * A.dy + vz * A.dz) / L)) / DEG;
      if (e.plomb === 0) { nC++; if (ang <= 0.3 + 1e-6) centre++; } else { nR++; if (Math.abs(ang - 0.6 * 5.0) <= 0.3 + 1e-6) couronne++; }
    }
    jeu.quitter('balade');
    const ok = Math.abs(repos - 2.2) <= 0.05 && Math.abs(course - 4.6) <= 0.05 && enAir && Math.abs(saut - 8.0) <= 0.05 && dans === 10000 && Math.abs(rapport - 2 / 3) <= 0.02
      && nC >= 4 && centre === nC && nR >= 28 && couronne === nR;
    return { ok, attendu: 'repos 2,2° · course 4,6° · saut 8,0° (± 0,05) · 10 000 tirages dans le disque, rayon moyen 2/3 ± 0,02 · FP-12 : centre ≤ 0,3°, couronne à 3,0 ± 0,3°',
      obtenu: `repos ${repos.toFixed(3)}° · course ${course.toFixed(3)}° · saut ${saut.toFixed(3)}° (en l'air ${enAir}) · ${dans} dans le disque, rapport ${rapport.toFixed(4)} · centre ${centre}/${nC} · couronne ${couronne}/${nR}` };
  });

  // 13. LE COUTEAU : tue à 1,6 m ; la fente jusqu'à 2,4 m dans le cône de 25° ; rien hors du cône ni au-delà ; 0,60 s par
  // coup, la touche à 0,12 s
  T('13 couteau : 1,6 m, fente à 2,4 m, cône, cadence, touche à 0,12 s', async () => {
    const p = await essaiVide(13), LL = ligneLibre(p, 10) || [{ x: 2, y: 0, z: 4.5 }];
    const o = LL[0];
    let id = 90;
    const coup = (dist, angleDeg) => {
      const [a, s] = tireur(p, o.x, o.y, o.z, 'assaut', id++);
      const an = -angleDeg * DEG, bx = o.x + Math.cos(an) * dist, bz = o.z + Math.sin(an) * dist;
      const b = cible(p, bx, o.y, bz, id++, 100);
      s.vise = null; s.c.lacet = -Math.PI / 2; s.c.tangage = 0.1;
      avancer(p, 0.3);
      const K = [], E = []; const d = p.sur('*', (e) => { if (e.type === 'couteau' && e.a === a.id) K.push(e.t); else if (e.type === 'elim' && e.cible === b.id) E.push(e.t); });
      const x0 = a.pos.x; s.fronts = { couteau: true }; p.pas(PAS); const t0 = p.t;
      avancer(p, 0.3); s.fronts = { couteau: true }; avancer(p, 0.2);              // (un 2e appui pendant le coup : sans effet)
      avancer(p, 0.2); s.fronts = { couteau: true }; avancer(p, 0.3);              // (après 0,60 s : un 2e coup)
      d();
      const r = { tue: E.length > 0, touche: K.length ? K[0] - t0 : -1, n: K.length, ecart: K.length > 1 ? K[1] - K[0] : -1, fente: a.pos.x - x0 };
      p.retirerActeur(a); p.retirerActeur(b); return r;
    };
    const pres = coup(1.6, 0), fente = coup(2.4, 10), cote = coup(2.0, 40), loin = coup(3.0, 0);
    jeu.quitter('balade');
    const P1 = PAS + 1e-6;
    const ok = pres.tue && Math.abs(pres.touche - 0.12) <= P1 && fente.tue && fente.fente > 0.3 && !cote.tue && !loin.tue && pres.n === 2 && pres.ecart >= 0.60 - P1;
    return { ok, attendu: 'tue à 1,6 m (touche à 0,12 s) ; fente à 2,4 m dans le cône ; rien à 40° ni à 3 m ; 2e coup après 0,60 s',
      obtenu: `1,6 m : ${pres.tue} (touche ${pres.touche.toFixed(4)} s, ${pres.n} coups, écart ${pres.ecart.toFixed(3)} s) · 2,4 m : ${fente.tue} (fente ${fente.fente.toFixed(2)} m) · 40° : ${cote.tue} · 3 m : ${loin.tue}` };
  });

  // 14. LES GRENADES : 50 lancers qui finissent hors des formes et sur un sol ; dégâts 160 / 92,5 / 25 / 0 derrière un mur ;
  // la frag cuite explose en main à 3,5 s ; la flash : la formule, 0 derrière un mur
  T('14 grenades : rebonds, dégâts, mur, cuisson, flash', async () => {
    const p = await essaiVide(14), C0 = C(), rng = new Rng(5);
    const P = pointsLibres(C0, 60, rng, { hMin: 0, hMax: 0.01 });
    // (a) 50 lancers : l'arrêt de chaque grenade (posée, ou là où elle explose)
    let horsFormes = 0, surSol = 0, n = 0; const fautes = [];
    const [a, s] = tireur(p, 0, 0, 0, 'assaut', 100);
    a.vie = a.vieMax = 1e9;
    for (const q of P) {
      if (n >= 50) break;
      jeu.teleporter(a.id, q.x, q.sol, q.z, rng.next() * 2 * Math.PI);
      a.arsenal.remplir(); s.vise = null; s.c.lacet = a.cmd.lacet; s.c.tangage = -0.6 + rng.next() * 0.8;
      avancer(p, 0.05);
      s.c.letale = true; avancer(p, 0.3); s.c.letale = false;
      let g = null;
      for (let i = 0; i < 600 && game.partie === p; i++) { p.pas(PAS); g = p.grenades.liste.find((x) => x.a === a.id) || g; if (!p.grenades.liste.length) break; if (g && g.posee) break; }
      if (!g) continue;
      n++;
      const libre = C0.libre(g.x, g.z, 0.03, g.y, 0.03, -0.03), sol = g.y >= C0.solEn(g.x, g.z, g.y) - 0.05;
      if (libre) horsFormes++; if (sol) surSol++;
      if ((!libre || !sol) && fautes.length < 4) fautes.push(`(${r3(g.x)}, ${r3(g.y)}, ${r3(g.z)}) libre ${libre} sol ${sol}`);
      p.grenades.appliquer([]);
    }
    p.retirerActeur(a);
    // (b) les dégâts : une frag posée au sol de la rue, des cibles à 1,5 / 4,25 / 6,5 m
    const LL = ligneLibre(p, 8) || [{ x: 2, y: 0, z: 4.5 }];
    const o = LL[0], frag = (x, y, z, t = PAS) => { p.grenades._liste.push({ id: 900 + rng.int(99999), a: 999, type: 'frag', x, y, z, vx: 0, vy: 0, vz: 0, t, posee: true, rb: 0 }); };
    const deg = {};
    for (const [k, d] of [['1,5', 1.5], ['4,25', 4.25], ['6,5', 6.5]]) {
      const b = cible(p, o.x + d, o.y, o.z, 200 + Math.round(d * 10), 1e9);
      let v = 0; const dd = p.sur('touche', (e) => { if (e.cible === b.id) v += e.degats; });
      frag(o.x, o.y + 0.04, o.z); p.pas(PAS); p.pas(PAS); dd();
      deg[k] = v; p.retirerActeur(b);
    }
    // (c) derrière un mur : une cible à 3 m, le souffle coupé (ni buste ni tête en ligne libre)
    let mur = -1;
    for (const q of P) {
      for (let k = 0; k < 8 && mur < 0; k++) {
        const an = k * Math.PI / 4, x = q.x + Math.cos(an) * 3, z = q.z + Math.sin(an) * 3, y = C0.solEn(x, z, q.sol + 0.3);
        if (Math.abs(y - q.sol) > 0.05 || !C0.libre(x, z, 0.3, y)) continue;
        if (p.balistique.libre(q.x, q.sol + 0.34, q.z, x, y + 1.27, z) || p.balistique.libre(q.x, q.sol + 0.34, q.z, x, y + 1.635, z)) continue;
        const b = cible(p, x, y, z, 300, 1e9);
        let v = 0; const dd = p.sur('touche', (e) => { if (e.cible === b.id) v += e.degats; });
        frag(q.x, q.sol + 0.04, q.z); p.pas(PAS); p.pas(PAS); dd(); p.retirerActeur(b);
        mur = v;
      }
      if (mur >= 0) break;
    }
    // (d) la frag cuite : tenue 3,6 s, elle explose EN MAIN à 3,5 s (et blesse le lanceur)
    const [c, sc] = tireur(p, o.x, o.y, o.z, 'assaut', 110);
    c.vie = c.vieMax = 1e9; sc.vise = null; sc.c.lacet = -Math.PI / 2;
    const X = [], D = []; const dx = p.sur('*', (e) => { if (e.type === 'explosion' && e.a === c.id) X.push(e.t); else if (e.type === 'touche' && e.cible === c.id) D.push(e.degats); });
    sc.c.letale = true; p.pas(PAS); const tg = p.t; avancer(p, 3.7); sc.c.letale = false; avancer(p, 0.1); dx();
    const enMain = X.length ? X[0] - tg : -1, soi = D.reduce((x, v) => x + v, 0);
    p.retirerActeur(c);
    // (e) la flash à 7 m : de face 0,8 + 3,2 × (1 − 7/14) = 2,4 s ; de dos 0,8 s ; derrière un mur, rien
    const flash = (x, y, z, b) => { p.grenades._liste.push({ id: 950 + rng.int(99999), a: 999, type: 'flash', x, y, z, vx: 0, vy: 0, vz: 0, t: PAS, posee: true, rb: 0 }); let v = -1; const dd = p.sur('flash', (e) => { if (e.cible === b.id) v = e.duree; }); p.pas(PAS); p.pas(PAS); dd(); return v; };
    const b = cible(p, o.x + 7, o.y, o.z, 400, 1e9);
    b.cmd.lacet = Math.PI / 2; b.cmd.tangage = 0;                  // (il regarde vers −x : la grenade, posée à 7 m, à hauteur d'œil)
    const face = flash(o.x, b.oeil(new THREE.Vector3()).y, o.z, b);
    b.cmd.lacet = -Math.PI / 2; const dos = flash(o.x, b.oeil(new THREE.Vector3()).y, o.z, b);
    let flashMur = -2;
    for (const q of P) {
      for (let k = 0; k < 8; k++) {
        const an = k * Math.PI / 4, x = q.x + Math.cos(an) * 3, z = q.z + Math.sin(an) * 3, y = C0.solEn(x, z, q.sol + 0.3);
        if (Math.abs(y - q.sol) > 0.05 || !C0.libre(x, z, 0.3, y)) continue;
        if (p.balistique.vue(q.x, q.sol + 0.19, q.z, x, y + 1.62, z)) continue;
        jeu.teleporter(b.id, x, y, z);
        flashMur = flash(q.x, q.sol + 0.04, q.z, b); break;
      }
      if (flashMur > -2) break;
    }
    jeu.quitter('balade');
    const okA = n >= 50 && horsFormes === n && surSol === n, okB = Math.abs(deg['1,5'] - 160) < 1e-6 && Math.abs(deg['4,25'] - 92.5) <= 0.5 && Math.abs(deg['6,5'] - 25) < 1e-6;
    const okC = mur === 0, okD = Math.abs(enMain - 3.5) <= PAS + 1e-6 && soi > 0, okE = Math.abs(face - 2.4) <= 0.05 && Math.abs(dos - 0.8) <= 0.05 && flashMur === -1;
    return { ok: okA && okB && okC && okD && okE,
      attendu: '50 lancers : 0 dans une forme, 0 sous un sol · 160 / 92,5 / 25 · 0 derrière un mur · en main à 3,5 s · flash 2,4 s de face, 0,8 s de dos, rien derrière un mur',
      obtenu: `${horsFormes}/${n} hors des formes, ${surSol}/${n} sur un sol${fautes.length ? ' (' + fautes.join(' ; ') + ')' : ''} · ${r3(deg['1,5'])} / ${r3(deg['4,25'])} / ${r3(deg['6,5'])} · mur ${mur} · en main ${enMain.toFixed(4)} s (${r3(soi)} à soi) · flash ${r3(face)} / ${r3(dos)} / mur ${flashMur}` };
  }, { delai: 180 });

  // 15. LES CAPSULES contre l'os de la tête : un errant qui court 10 s, images faites à la main (les poses) — mesuré et
  // noté (≤ 6 cm en moyenne, ≤ 10 cm au 95e centile ; au-delà : une demande à L-C, bloquante à F2 seulement)
  const mesurerTete = async (t, fiche = null) => {
    const p = await essaiVide(15, fiche ? { avatars: [fiche] } : {});
    const Z = (pointsLibres(C(), 1, new Rng(15), { hMin: 0, hMax: 0.01, dedans: true })[0]) || { x: 12, sol: 0, z: -5 };
    const F = fiche ? FICHES_BOTS.find((f) => f.id === fiche) : undefined;
    const a = p.ajouterActeur({ id: 1, nom: 'Errant', equipe: 'A', x: Z.x, y: Z.sol, z: Z.z, lacet: 0, classe: 'assaut', cerveau: 'errant', fiche: F });
    for (let i = 0; i < 300 && !(a.joueur.avatar && a.joueur.avatar.bone && a.joueur.avatar.bone('Head')); i++) await t.attendre(0.05);
    const os = a.joueur.avatar && a.joueur.avatar.bone && a.joueur.avatar.bone('Head');
    const E = [], H = new THREE.Vector3(), Y = new THREE.Vector3(), Q = new THREE.Quaternion(), S = {};
    if (os) {
      for (let i = 0; i < 1200 && game.partie === p; i++) {
        p.pas(PAS);
        if (i % 2 === 1) {
          game.interpoler(); game.updateCamera(1 / 60); p.image(1 / 60);
          const v = a.corps.vel ? Math.hypot(a.corps.vel.x, a.corps.vel.z) : 0;
          if (v < 3) continue;                                        // (en course)
          os.updateWorldMatrix(true, false); os.getWorldPosition(H); os.getWorldQuaternion(Q);
          Y.set(0, 1, 0).applyQuaternion(Q); H.addScaledVector(Y, 0.085 * a.h / 1.73);
          teteSimulee(a, S, true);
          E.push(Math.hypot(H.x - S.x, H.y - S.y, H.z - S.z));
        }
      }
    }
    jeu.quitter('balade');
    return { os: !!os, n: E.length, moy: moyenne(E), p95: centile(E, 0.95) };
  };
  T('15 capsules : tête simulée contre l’os Head d’un coureur (noté)', async (t) => {
    const r = await mesurerTete(t);
    t.note('tête : écart moyen (cm)', r.moy * 100); t.note('tête : 95e centile (cm)', r.p95 * 100);
    const dansLesSeuils = r.moy <= 0.06 && r.p95 <= 0.10;
    return { ok: r.os && r.n >= 100, attendu: 'mesuré et noté (seuils ≤ 6 cm moyen, ≤ 10 cm au 95e centile ; bloquant à F2)',
      obtenu: `${r.n} images en course · moyen ${(r.moy * 100).toFixed(1)} cm · 95e ${(r.p95 * 100).toFixed(1)} cm · ${dansLesSeuils ? 'dans les seuils' : 'HORS des seuils (demande à L-C)'}` };
  }, { delai: 120 });

  // 16. LE DÉTERMINISME (4 bots qui tirent) et L'ÉTAT en pleine recharge, une grenade en vol
  T('16 déterminisme (4 bots) ; état en pleine recharge et grenade en vol', async () => {
    const D = await jeu.verifierDeterminisme(42, 30, { bots: 4 });
    const etatEnVol = async () => {
      const p = await essaiVide(16, { mannequins: 2, bots: 2 });
      const [a, s] = tireur(p, 12.0, 0, -4.4, 'assaut', 77, Math.PI);
      s.vise = null; s.c.lacet = Math.PI / 2; s.c.tangage = -0.4;
      return { p, a, s };
    };
    let { p, a, s } = await etatEnVol();
    s.c.tir = true; avancer(p, 0.5); s.c.tir = false; avancer(p, 0.1);
    s.fronts = { recharger: true }; avancer(p, 0.4);
    s.c.letale = true; avancer(p, 0.3); s.c.letale = false; avancer(p, 0.3);
    const enRecharge = a.arsenal.etatArme === 'lancer' || a.arsenal.etatArme === 'recharge', enVol = p.grenades.liste.length > 0;
    // (la grenade a annulé la recharge ; l'arme remontée, on en relance une, la grenade toujours là)
    avancer(p, 0.35); s.fronts = { recharger: true }; avancer(p, 0.35);
    const recharge2 = a.arsenal.etatArme === 'recharge';
    const e1 = p.etat();
    jeu.quitter('balade');
    ({ p, a, s } = await etatEnVol());
    p.appliquer(JSON.parse(JSON.stringify(e1)));
    const e2 = p.etat();
    jeu.quitter('balade');
    const egal = hacher(e1, 1e-9) === hacher(e2, 1e-9);
    return { ok: D.egal && egal && recharge2 && enVol && enRecharge, attendu: 'verifierDeterminisme(42, 30) égal avec 4 bots ; etat → appliquer → etat identique, recharge en cours et grenade en vol',
      obtenu: `déterminisme ${D.a} / ${D.b} · état ${egal} (recharge ${recharge2}, grenade en vol ${enVol})` };
  }, { delai: 240 });

  // 17. LES ÉVÉNEMENTS portent les champs du § 4.6 ; la PURETÉ des quatre fichiers (le vérificateur, lu ici)
  T('17 schéma des événements ; pureté des fichiers', async () => {
    const p = await essaiVide(17), LL = ligneLibre(p, 10) || [{ x: 2, y: 0, z: 4.5 }], o = LL[0];
    const [a, s] = tireur(p, o.x, o.y, o.z, 'assaut', 120);
    a.vie = a.vieMax = 1e9;
    const b = cible(p, o.x + 6, o.y, o.z, 121, 1e9);
    s.vise = { x: o.x - 15, y: o.y + 2, z: o.z };
    const E = []; const d = p.sur('*', (e) => E.push(e));
    s.c.tir = true; avancer(p, 0.4); s.c.tir = false;
    s.fronts = { recharger: true }; avancer(p, 2.2);
    s.fronts = { armeN: 2 }; avancer(p, 0.6);
    a.arsenal.ch[a.arsenal.i] = 0; a.arsenal.res[a.arsenal.i] = 0; s.fronts = { tir: true }; s.c.tir = true; avancer(p, 0.05); s.c.tir = false;
    s.vise = { x: b.pos.x, y: b.pos.y + 1, z: b.pos.z };
    s.c.letale = true; avancer(p, 0.2); s.c.letale = false; avancer(p, 3.6);
    s.fronts = { tactique: true }; avancer(p, 2.2);
    d(); jeu.quitter('balade');
    const SCHEMA = { tir: ['a', 'arme', 'ox', 'oy', 'oz', 'dx', 'dy', 'dz', 'n', 'seq'], recharge: ['a', 'phase', 'tactique'], arme: ['a', 'id'], vide: ['a'],
      grenade: ['a', 'arme', 'x', 'y', 'z', 'vx', 'vy', 'vz'], explosion: ['x', 'y', 'z', 'r', 'arme'], flash: ['cible', 'duree'] };
    const vus = {}, fautes = [];
    for (const e of E) {
      const S = SCHEMA[e.type]; if (!S) continue;
      vus[e.type] = (vus[e.type] || 0) + 1;
      for (const k of S) if (!(k in e) || (typeof e[k] !== 'number' && typeof e[k] !== 'string' && typeof e[k] !== 'boolean')) fautes.push(`${e.type}.${k}`);
      for (const [k, v] of Object.entries(e)) if (v !== null && typeof v === 'object' && !Array.isArray(v)) fautes.push(`${e.type}.${k} objet`);
    }
    const manquants = Object.keys(SCHEMA).filter((k) => !vus[k]);
    // la pureté : les jetons interdits hors commentaires (tools/verifier_proprietaires.py, relu)
    const JETONS = [/Math\.random/, /performance\.now/, /Date\.now/, new RegExp('Ray' + 'caster'), /DecalGeometry/, new RegExp('Lig' + 'ht\\('), /\.input\./, /\bInput\b/];
    const impurs = [];
    for (const f of ['armes.js', 'balistique.js', 'touches.js', 'grenade.js']) {
      const texte = await fetch(new URL('../' + f, import.meta.url), { cache: 'no-cache' }).then((r) => r.text());
      let bloc = false;
      texte.split('\n').forEach((ligne, n) => {
        let code = '', q = null;
        for (let i = 0; i < ligne.length; i++) {
          const c = ligne[i];
          if (bloc) { if (ligne.startsWith('*/', i)) { bloc = false; i++; } continue; }
          if (q) { code += c; if (c === '\\') { code += ligne[i + 1] || ''; i++; } else if (c === q) q = null; continue; }
          if (c === '"' || c === '\'' || c === '`') { q = c; code += c; continue; }
          if (ligne.startsWith('//', i)) break;
          if (ligne.startsWith('/*', i)) { bloc = true; i++; continue; }
          code += c;
        }
        for (const j of JETONS) if (j.test(code)) impurs.push(`${f}:${n + 1}`);
      });
    }
    return { ok: !fautes.length && !manquants.length && !impurs.length, attendu: 'tir, recharge, arme, vide, grenade, explosion, flash émis avec leurs champs (nombres et chaînes) ; 0 faute de pureté',
      obtenu: `${Object.entries(vus).map(([k, v]) => `${k} ${v}`).join(', ')}${manquants.length ? ' · manquants : ' + manquants.join(', ') : ''}${fautes.length ? ' · fautes : ' + fautes.slice(0, 6).join(', ') : ''} · pureté ${impurs.length ? impurs.join(', ') : '0 faute'}` };
  });

  // 18. ajouterChargeur : + 30 à la réserve de la FA-24, jamais au-delà de 90 ; la secondaire n'y gagne rien
  T('18 ajouterChargeur : + 30, plafond 90, secondaire intacte', async () => {
    const p = await essaiVide(18), [a] = tireur(p, 12, 0, -4.4, 'assaut', 130), A = a.arsenal;
    const plein = A.ajouterChargeur(), r0 = A.res[0];
    A.res[0] = 50; const sec0 = A.res[1];
    const un = A.ajouterChargeur(), r1 = A.res[0], deux = A.ajouterChargeur(), r2 = A.res[0];
    A.i = 1; A.ajouterChargeur(); const r3b = A.res[0], sec = A.res[1];
    jeu.quitter('balade');
    return { ok: !plein && r0 === 90 && un && r1 === 80 && deux && r2 === 90 && r3b === 90 && sec === sec0, attendu: '90 → 90 (faux) ; 50 → 80 → 90 ; secondaire inchangée (même l’arme en main)',
      obtenu: `plein ${plein} ${r0} · ${r1} · ${r2} · ${r3b} · secondaire ${sec0} → ${sec}` };
  });

  // 19. LE PRÉ-FILTRE de la vue, validé : sur 10 000 paires de points libres que le parcours brut (pré-filtre coupé) dit
  // visibles, il ne dit JAMAIS « caché » (portes automatiques ouvertes, comme au combat) — les paires de zones qui le
  // démentaient sont dans EXCEPTIONS_PREFILTRE
  T('19 pré-filtre des zones validé (10 000 paires visibles)', async (t) => {
    jeu.quitter('balade');
    const C0 = C(), B = nouvelleBalistique(), rng = new Rng(19);
    const P = [...pointsLibres(C0, 500, rng, { dedans: false }), ...[-1, 0, 1, 2].flatMap((n) => pointsNiveau(C0, 150, n, rng, { plafond: false }))];
    const mobiles = C0.formes.filter((s) => s.mobile && !s.off);
    for (const s of mobiles) s.off = true;
    let vues = 0, menti = 0; const paires = new Map();
    try {
      for (let k = 0; vues < 10000 && k < 200000; k++) {
        const a = P[rng.int(P.length)], b = P[rng.int(P.length)];
        if (Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) > 50) continue;
        B.prefiltre = false; const v = B.vue(a.x, a.y, a.z, b.x, b.y, b.z); B.prefiltre = true;
        if (!v) continue;
        vues++;
        if (B.cacheParZones(a.x, a.y, a.z, b.x, b.y, b.z)) {
          menti++; const cle = nomZone(zoneDe(a.x, -a.z, a.y)) + '|' + nomZone(zoneDe(b.x, -b.z, b.y)); paires.set(cle, (paires.get(cle) || 0) + 1);
        }
        if (k % 5000 === 4999) await t.attendre(0);
      }
    } finally { for (const s of mobiles) s.off = false; }
    t.note('pré-filtre : paires fautives', [...paires.keys()].join(' '));
    return { ok: vues >= 10000 && menti === 0, attendu: '10 000 paires visibles, 0 dite cachée par le pré-filtre (exceptions : ' + EXCEPTIONS_PREFILTRE.size + ')',
      obtenu: `${vues} visibles, ${menti} dites cachées${paires.size ? ' · paires : ' + [...paires.entries()].map(([k, v]) => `${k} (${v})`).join(', ') : ''}` };
  }, { delai: 300 });

  // ---------------------------------------------------------------- À F2 (les vrais modules des autres lots)
  // la vue sur 10 000 paires de nœuds du VRAI graphe (L-D) : 0 à travers un mur (référence brute) ; le pré-filtre dans
  // l'autre sens (100 fois sur 100 « peut-être visible ») ; les dépolis de TABLE_DEPOLIS (L-M) arrêtent la vue
  T('F2 · vue sur le vrai graphe, pré-filtre, dépolis de L-M', async (t) => {
    const p = await essaiVide(20), N = p.nav, C0 = C(), B = p.balistique, rng = new Rng(20);
    if (!N || !N.nb) { jeu.quitter('balade'); return { ok: false, attendu: 'le vrai graphe (L-D)', obtenu: 'nb = 0' }; }
    let vues = 0, mur = 0, menti = 0, n = 0;
    for (let k = 0; n < 10000 && k < 100000; k++) {
      const i = rng.int(N.nb), j = rng.int(N.nb);
      const ax = N.px[i], ay = N.ph[i] + 1.6, az = N.pz[i], bx = N.px[j], by = N.ph[j] + 1.6, bz = N.pz[j];
      if (Math.hypot(bx - ax, by - ay, bz - az) > 50) continue;
      n++;
      const v = B.vue(ax, ay, az, bx, by, bz);
      const L = Math.hypot(bx - ax, by - ay, bz - az), libre = brut(C0, ax, ay, az, bx, by, bz, 'vue') >= L - 0.02;
      if (v && !libre) mur++;
      if (libre) { vues++; if (B.cacheParZones(ax, ay, az, bx, by, bz)) menti++; }
      if (k % 500 === 499) await t.attendre(0);
    }
    const { TABLE_DEPOLIS } = await import('../monde_partie.js');
    let depolis = 0, arretes = 0;
    for (const q of TABLE_DEPOLIS || []) {
      const s = C0.formes.find((f) => f.vitre && Math.abs(((f.t === 'b' ? (f.x0 + f.x1) / 2 : f.cx) - q.x)) < 0.05 && Math.abs(((f.t === 'b' ? (f.z0 + f.z1) / 2 : f.cz) - q.z)) < 0.05);
      if (!s) continue;
      depolis++; if (s.depoli) arretes++;
    }
    jeu.quitter('balade');
    return { ok: mur === 0 && menti === 0 && depolis > 0 && arretes === depolis, attendu: '0 vue à travers un mur ; pré-filtre 100 % « peut-être visible » ; dépolis de L-M marqués',
      obtenu: `${n} paires · ${mur} à travers un mur · ${menti}/${vues} dites cachées · dépolis ${arretes}/${depolis}` };
  }, { delai: 600, apresFusion: true });
  // les capsules contre les VRAIS corps de L-C (un ami de Haythem, en course) : ≤ 6 cm en moyenne, ≤ 10 cm au 95e centile
  T('F2 · capsules contre les vrais corps de L-C', async (t) => {
    const r = await mesurerTete(t, 'gabriel');
    return { ok: r.os && r.n >= 100 && r.moy <= 0.06 && r.p95 <= 0.10, attendu: '≤ 6 cm moyen, ≤ 10 cm au 95e centile',
      obtenu: `${r.n} images · moyen ${(r.moy * 100).toFixed(1)} cm · 95e ${(r.p95 * 100).toFixed(1)} cm` };
  }, { delai: 120, apresFusion: true });
}

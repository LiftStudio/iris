// =====================================================================
//  LA NAVIGATION DES BOTS (lot L-D, 23/10 ; spec §§ 4.5.11, 4.9 ; carte_monde §§ 7-8 ; vague 3 : L-J)
// =====================================================================
// Le graphe des déplacements, GÉNÉRÉ au lancement de la 1re partie (sous l'écran de préparation) depuis le monde solide
// lui-même (js/collisions.js), puis gardé dans IndexedDB sous une EMPREINTE du monde (js/jeu/nav_cache.js) : un fichier
// précalculé deviendrait faux à la première retouche de la carte (le lot R refait le −1 en ce moment même).
// LA MÉTHODE B de carte_monde § 7 (la A, centre de case seul, perdait 22 m² du 1er derrière les portes étroites) :
//   - une case de 0,25 m ; son REPRÉSENTANT est son centre POUSSÉ hors des formes par `C.resoudre` (un disque de 0,3 m ne
//     passe la porte de 0,75 m du bureau B qu'à ± 7,5 cm de son axe : aucun centre de case n'y tombe, le poussé si), gardé
//     s'il reste dans sa case, sur le même sol, et `libre` ;
//   - un nœud par case ET PAR SOL (clé : case + hauteur au demi-mètre) : sous la volée 2 de l'escalier principal passe la
//     volée de tôle, 1 943 cases ont 2 à 4 nœuds superposés ; les sols suivent `solEn` depuis la hauteur du nœud (marche
//     0,45) — les volées sont des rampes continues ; une descente de plus de 0,6 m (un bord de palier) n'est pas un lien ;
//   - un LIEN vers chacune des 8 voisines si `C.deplacer` y mène VRAIMENT, à 3 cm près : la même physique que les corps ;
//   - remplissage DEPUIS DES GRAINES (le départ de Haythem et les 20 lieux d'apparition) : sinon on navigue derrière les
//     mitoyens ; bornes BORNES_NAV (la rue à 6 m de la façade : 8 956 nœuds au lieu de 13 875, la moitié était dehors) ;
//   - pendant la génération, les portes automatiques et les passages d'ascenseur (`mobile`) et les barrières des zones de
//     jeu (`limite`, js/jeu/monde_partie.js) ÉTEINTS, les boîtes des vantaux ouverts du combat (`vantail`) ALLUMÉES (le
//     graphe les contourne : il sert à tous les modes), puis chaque forme rendue à son état exact ; la cabine d'ascenseur
//     exclue (plan x > 17,95, y 7,7-9,05 : un cul-de-sac de 17 nœuds par niveau, l'ascenseur est coupé en partie).
// DEUX GRAPHES, chacun sous sa clé : celui des HUMAINS (rayon 0,3, plus les liens « franchir » : `franchissable` de
// js/jeu/mouvement.js, la MÊME fonction que le mouvement — un bot ne planifie jamais un franchissement que le mouvement
// refuserait ; coût 2 × la distance) et celui des PROPS (rayon 0,2, sans franchissement : ils passent entre les rangs, sous
// les tablettes, carte_monde § 10.1).
// Les données sont des TABLEAUX TYPÉS (positions, zone, niveau, dégagement, liens en CSR) : relues d'IndexedDB telles
// quelles (clonage structuré), partagées par toutes les parties de la session ; chaque partie a SA `Nav` (masque de la
// zone, file des chemins, liens pénalisés, champs en cache) : rien de ce qui change en partie ne fuit d'une partie à l'autre.
// Les chemins : A* (tas binaire en tableaux, heuristique euclidienne — admissible, donc le plus court), d'un bloc
// (`chemin`) ou FRACTIONNABLE (`demander` / `pasFile`, appelé à l'étape 9 de Partie.pas : 1 500 nœuds ouverts par
// tranche, UN calcul à la fois) — les deux rendent la MÊME liste (même code, mêmes départages). Distances en Float64Array
// (en Float32Array, le test « déjà mieux » de la file paresseuse se trompe par arrondi : l'exploration s'arrêtait à
// 1 700 nœuds sur 13 875, piège de carte_monde). Fichier de SIMULATION : ni hasard du navigateur, ni horloge, ni entrées.
import { PIECES, niveauDe } from './constantes.js';
import { franchissable } from './mouvement.js';
import { Balistique } from './balistique.js';
import { hacher } from './rng.js';
import { lireNav, ecrireNav } from './nav_cache.js';

export const BORNES_NAV = { xMin: -3, xMax: 23, zMin: -24.5, zMax: 6 };
export const VERSION_NAV = 2;                       // (F2 : 2 — franchissable jusqu'à 1,20 m, le comptoir de l'accueil)

const NIVEAU_RUE = 3;
const DEGAGES = [0.5, 0.75, 1, 1.5, 2];                 // les rayons libres essayés (m) ; en deçà, le rayon du graphe
const CABINE = { x0: 17.95, z0: -9.05, z1: -7.7 };     // la cabine d'ascenseur (MONDE : plan y 7,7-9,05)
const TRANCHE = 1500;                                  // nœuds ouverts par tranche de la file (≈ 1,5 ms au pire)
const COUT_FRANCHIR = 2;                               // un franchissement coûte deux fois sa longueur
const PENALITE = 10;                                   // un lien où l'on s'est coincé : × 10 pendant 10 s
// (un CHEMIN préfère le milieu : entrer sur un nœud collé à un mur — dégagement = le rayon — coûte 30 % de plus ; le plus
// court chemin longeait les murs et rasait chaque coin, un bot raclait les chambranles. Les champs de distance, eux, restent
// des distances à pied vraies)
const COUT_BORD = 1.3;
const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const INDEX_PIECE = new Map(PIECES.map((p, i) => [p, i]));
// les 20 lieux d'apparition de carte_monde § 8 (les graines du remplissage ; les mêmes que js/jeu/apparitions.js — recopiés
// ici : apparitions.js importe ce module)
const GRAINES = [[9.38, -3.06, -9.37], [9.63, -3.06, -22.62], [15.63, -3.06, -9.62], [1.38, -3.06, -10.87], [14.88, 0, -3.12],
  [11.63, 0, -4.62], [4.63, 0, -6.87], [5.38, 0, -15.12], [3.63, 0, -3.87], [15.63, 0, -9.87], [12.38, 0, -11.37], [12.63, 3.5, -7.87],
  [8.13, 3.5, -22.62], [2.88, 3.5, -3.37], [15.88, 3.5, -9.87], [14.63, 6.6, -5.87], [4.63, 6.6, -7.87], [17.13, 6.6, -2.37],
  [15.63, 6.6, -9.87], [13.13, -0.12, 4.88]];

// ---- les données d'un graphe, partagées par la session (empreinte → données) ----
const MEMOIRE = new Map();
const argNav = () => { try { return new URLSearchParams(globalThis.location ? location.search : '').get('nav'); } catch (e) { return null; } };
let _refaitCetteSession = new Set();

// L'EMPREINTE du monde solide pour ces options : FNV-1a sur les formes (type, coordonnées au mm, hauteurs, drapeaux — et
// `off` des formes ni mobiles ni vantaux : celles que la génération lit telles quelles), les sols, les plafonds, les
// rectangles des 47 zones, puis le pas, le rayon, les bornes et la version. Les barrières (`limite`) n'y entrent pas : elles
// sont éteintes pendant la génération (le graphe ne change pas d'une zone de jeu à l'autre : `restreindre`).
// (F2, raccord L-D / L-M : les boîtes des vantaux ouverts du combat sont rangées HORS du monde solide par L-M hors partie —
// l'école de la balade au bit près — ; elles y sont remises le temps — synchrone — de l'empreinte et de la génération, par
// game.mondePartie.avecVantaux : le graphe les contourne, son empreinte les compte. Sans monde des parties : tel quel.)
function avecVantaux(game) {
  const M = game && game.mondePartie;
  return (fn) => (M && M.avecVantaux ? M.avecVantaux(fn) : fn());
}
function empreinteDe(C, Lu, { pas, rayon, franchir, bornes }) {
  let h = 0x811c9dc5, n = 0;
  const m = (v) => { const k = Number.isFinite(v) ? Math.round(v * 1000) : 2147483647; h = Math.imul(h ^ (k & 0xffff), 0x01000193) >>> 0; h = Math.imul(h ^ ((k >>> 16) & 0xffff), 0x01000193) >>> 0; };
  for (const f of C.formes) {
    if (f.limite) continue;
    n++;
    m(f.t === 'b' ? 1 : f.t === 'o' ? 2 : 3);
    if (f.t === 'b') { m(f.x0); m(f.z0); m(f.x1); m(f.z1); } else if (f.t === 'o') { m(f.cx); m(f.cz); m(f.hx); m(f.hz); m(f.a); } else { m(f.x); m(f.z); m(f.r); }
    m(f.y0); m(f.y1); m((f.joueur ? 1 : 0) + (f.camera ? 2 : 0) + (f.mobile ? 4 : 0) + (f.vantail ? 8 : 0) + (!f.mobile && !f.vantail && f.off ? 16 : 0));
  }
  const hf = h; h = 0x811c9dc5;
  for (const r of C.sols) { m(r.x0); m(r.z0); m(r.x1); m(r.z1); if (r.axe) { m(r.axe === 'x' ? 1 : 2); m(r.a0); m(r.h0); m(r.a1); m(r.h1); } else m(r.h); }
  const hs = h; h = 0x811c9dc5;
  for (const p of C.plafonds) { m(p.x0); m(p.z0); m(p.x1); m(p.z1); m(p.y); }
  const hp = h; h = 0x811c9dc5;
  for (const Z of (Lu && Lu.zones) || []) { for (const r of Z.rects) for (const v of r) m(v); }
  const hz = h;
  return 'nav:' + hacher([n, hf, C.sols.length, hs, C.plafonds.length, hp, hz, pas, rayon, franchir ? 1 : 0, bornes.xMin, bornes.xMax, bornes.zMin, bornes.zMax, VERSION_NAV], 1e-6) +
    ':r' + rayon + (franchir ? ':f' : '') + ':v' + VERSION_NAV;
}

// y a-t-il, devant (x, z) vers (ux, uz), à moins de 0,9 m, une forme BASSE (dessus entre 0,4 et 1,2 m au-dessus des pieds) ?
// (le tri d'avant `franchissable` : la plupart des liens qui échouent butent sur un mur, et `franchissable` coûte
// 9 sondes ; une boîte englobante qui ne touche aucune forme basse ne peut rien franchir)
function basDevant(C, x, h, z, ux, uz) {
  const ex = x + ux * 0.9, ez = z + uz * 0.9;
  let bas = false;
  C._parcourir(Math.min(x, ex) - 0.35, Math.min(z, ez) - 0.35, Math.max(x, ex) + 0.35, Math.max(z, ez) + 0.35, (s) => {
    if (bas || s.off || !s.joueur) return;
    const y1 = s.y1 - h;
    if (y1 >= 0.4 && y1 <= 1.25 && s.y0 - h < 0.45) bas = true;
  });
  return bas;
}

// les deux conditions NÉCESSAIRES les moins chères de `franchissable` (js/jeu/mouvement.js, recopiées à l'identique : la
// sonde au ras du sol bute, et l'une des arrivées est libre sur ce sol) : un tri sans faux négatif — 3 essais sur 10
// échouaient là après les 9 sondes de la hauteur
const _f = { x: 0, z: 0 };
function arriveeLibre(C, x, y, z, ux, uz) {
  const R = 0.3;
  _f.x = x; _f.z = z; C.deplacer(_f, ux * 0.5, uz * 0.5, R, null, y, 1.6, 0.25);
  const a0 = (_f.x - x) * ux + (_f.z - z) * uz;
  if (a0 >= 0.48) return false;
  const face = Math.max(0, a0) + R;
  for (let s = 0.9; s <= 1.3001; s += 0.1) {
    const ax = x + ux * (face + s), az = z + uz * (face + s);
    const sol = C.solEn(ax, az, y);
    if (Math.abs(sol - y) < 0.3 && C.libre(ax, az, R, sol)) return true;
  }
  return false;
}

// la distance de (x, z) à la plus proche forme qui heurte un corps dont les pieds sont à h (bande 0,25-1,6 m, celle de
// `C.resoudre`), cherchée jusqu'à `rMax` (au-delà : rMax)
function clairance(C, x, z, h, rMax) {
  const yb = h + 0.25, yh = h + 1.6;
  let d = rMax;
  C._parcourir(x - rMax, z - rMax, x + rMax, z + rMax, (s) => {
    if (s.off || !s.joueur || s.y0 >= yh || s.y1 <= yb) return;
    let e;
    if (s.t === 'c') e = Math.hypot(x - s.x, z - s.z) - s.r;
    else if (s.t === 'b') { const ex = Math.max(s.x0 - x, 0, x - s.x1), ez = Math.max(s.z0 - z, 0, z - s.z1); e = Math.hypot(ex, ez); }
    else { const dx = x - s.cx, dz = z - s.cz, lx = dx * s.c + dz * s.s, lz = -dx * s.s + dz * s.c; e = Math.hypot(Math.max(Math.abs(lx) - s.hx, 0), Math.max(Math.abs(lz) - s.hz, 0)); }
    if (e < d) d = e;
  });
  return Math.max(0, d);
}

// LA GÉNÉRATION (synchrone : une seule tâche — la carte vivante d'une image ouvrirait ou fermerait des portes au milieu)
function generer(C, Lu, { pas, rayon, franchir, bornes: B, graines, chrono = null }) {
  const ch = chrono || (() => {});          // (les étapes chronométrées par l'appelant : le harnais, les tests)
  // les formes mises dans l'état de la génération, rendues à la fin quoi qu'il arrive
  const garde = [];
  for (const f of C.formes) {
    if (f.mobile || f.limite) { garde.push(f, f.off); f.off = true; }
    else if (f.vantail) { garde.push(f, f.off); f.off = false; }
  }
  try {
    const NI = Math.ceil((B.xMax - B.xMin) / pas), NK = Math.ceil((B.zMax - B.zMin) / pas);
    const X = (i) => B.xMin + (i + 0.5) * pas, Z = (k) => B.zMin + (k + 0.5) * pas;
    const cle = (i, k, h) => (i * NK + k) * 64 + ((Math.round(h * 2) + 32) & 63);
    const memo = new Map(), index = new Map();
    const Rx = [], Rz = [], Rh = [];
    const px = [], pz = [], ph = [], ci = [], ck = [], vois = [], rate = [], rn = [];
    const liensVus = new Map(), cleLien = (r1, r2) => r1 * 65536 + r2;
    const P = { x: 0, z: 0 }, Q = { x: 0, z: 0 };
    // le représentant de la case (i, k) pour des pieds à h0 : son indice dans R, ou −1 (et la clé dans `rep.c`)
    const rep = (i, k, h0) => {
      const x = X(i), z = Z(k), h = C.solEn(x, z, h0);
      if (h < h0 - 0.6) return -1;                          // une chute : pas de lien
      const c = cle(i, k, h);
      rep.c = c;
      const m = memo.get(c);
      if (m !== undefined) return m;
      let r = -1;
      if (!(x > CABINE.x0 && z > CABINE.z0 && z < CABINE.z1)) {
        P.x = x; P.z = z; C.resoudre(P, rayon, null, h);
        if (Math.abs(P.x - x) <= pas / 2 && Math.abs(P.z - z) <= pas / 2 && !(P.x > CABINE.x0 && P.z > CABINE.z0 && P.z < CABINE.z1)) {
          const h2 = C.solEn(P.x, P.z, h0);
          if (Math.abs(h2 - h) < 0.3 && C.libre(P.x, P.z, rayon, h2)) { r = Rx.length; Rx.push(P.x); Rz.push(P.z); Rh.push(h2); }
        }
      }
      memo.set(c, r);
      return r;
    };
    const ajouter = (i, k, r, c) => {
      let id = index.get(c);
      if (id !== undefined) return id;
      id = px.length; px.push(Rx[r]); pz.push(Rz[r]); ph.push(Rh[r]); ci.push(i); ck.push(k); vois.push([]); rate.push(0); rn.push(r);
      index.set(c, id);
      return id;
    };
    const mene = (ax, az, h, bx, bz) => { Q.x = ax; Q.z = az; C.deplacer(Q, bx - ax, bz - az, rayon, null, h); return Math.hypot(Q.x - bx, Q.z - bz) < 0.03; };
    for (const [x, y, z] of graines) {
      const i = Math.floor((x - B.xMin) / pas), k = Math.floor((z - B.zMin) / pas);
      if (i < 0 || k < 0 || i >= NI || k >= NK) continue;
      const r = rep(i, k, y);
      if (r >= 0) ajouter(i, k, r, rep.c);
    }
    // le remplissage, en largeur depuis les graines
    for (let a = 0; a < px.length; a++) {
      for (let d = 0; d < 8; d++) {
        const i = ci[a] + D8[d][0], k = ck[a] + D8[d][1];
        if (i < 0 || k < 0 || i >= NI || k >= NK) { rate[a] |= 1 << d; continue; }
        const r = rep(i, k, ph[a]);
        if (r < 0) { rate[a] |= 1 << d; continue; }
        // (le lien dans l'autre sens, s'il a déjà été balayé : la même réponse — `deplacer` est symétrique à quelques
        // liens près sur 97 274, carte_monde § 7 ; la moitié des balayages évitée)
        const ra = rn[a], dj = cleLien(r, ra), m = liensVus.get(dj);
        const ok = m !== undefined ? m : mene(px[a], pz[a], ph[a], Rx[r], Rz[r]);
        if (m === undefined) liensVus.set(cleLien(ra, r), ok);
        if (ok) vois[a].push(ajouter(i, k, r, rep.c));
        else rate[a] |= 1 << d;
      }
    }
    const nb = px.length;
    ch('remplissage');
    // la grille des cases → nœuds (noeudPres, franchissements, anneaux)
    const NC = NI * NK, caseDebut = new Int32Array(NC + 1), caseNoeuds = new Int32Array(nb);
    for (let a = 0; a < nb; a++) caseDebut[ci[a] * NK + ck[a] + 1]++;
    for (let c = 0; c < NC; c++) caseDebut[c + 1] += caseDebut[c];
    const rempli = caseDebut.slice(0, NC);
    for (let a = 0; a < nb; a++) caseNoeuds[rempli[ci[a] * NK + ck[a]]++] = a;
    // LES LIENS « FRANCHIR » (le graphe des humains) : là où la marche échoue, la fonction du mouvement
    const fr = [];
    const essais = new Set();
    if (franchir) {
      const proche = (x, y, z) => {
        const i0 = Math.floor((x - B.xMin) / pas), k0 = Math.floor((z - B.zMin) / pas);
        let best = -1, bd = 0.3;
        for (let i = i0 - 2; i <= i0 + 2; i++) for (let k = k0 - 2; k <= k0 + 2; k++) {
          if (i < 0 || k < 0 || i >= NI || k >= NK) continue;
          const c = i * NK + k;
          for (let j = caseDebut[c]; j < caseDebut[c + 1]; j++) {
            const b = caseNoeuds[j];
            if (Math.abs(ph[b] - y) > 0.3) continue;
            const d = Math.hypot(px[b] - x, pz[b] - z);
            if (d <= bd) { bd = d; best = b; }
          }
        }
        return best;
      };
      for (let a = 0; a < nb; a++) {
        if (!rate[a]) continue;
        for (let d = 0; d < 8; d++) {
          if (!(rate[a] & (1 << d))) continue;
          const L = Math.hypot(D8[d][0], D8[d][1]), ux = D8[d][0] / L, uz = D8[d][1] / L;
          // (l'arrivée de `franchissable` est un nœud du graphe à 1,2-2,1 m devant, sur ce sol : s'il n'y en a aucun, inutile
          // de sonder — c'est le tri qui compte, `franchissable` coûte 9 sondes)
          // (un essai par bloc de 4 × 4 cases, par direction et par sol : le long d'un bord de table, un lien par mètre
          // suffit au chemin, et les voisins d'un essai raté butent sur le même obstacle)
          const bloc = ((((ci[a] >> 2) * NK + (ck[a] >> 2)) * 64 + ((Math.round(ph[a] * 2) + 32) & 63)) * 8) + d;
          if (essais.has(bloc)) continue;
          if (!basDevant(C, px[a], ph[a], pz[a], ux, uz)) continue;
          essais.add(bloc);
          if (!arriveeLibre(C, px[a], ph[a], pz[a], ux, uz)) continue;
          const F = franchissable(C, px[a], ph[a], pz[a], ux, uz);
          if (!F) continue;
          const b = proche(F.x, F.y, F.z);
          if (b < 0 || b === a || vois[a].includes(b)) continue;
          fr.push(a, b);
        }
      }
    }
    ch('franchir');
    // LE CSR : la marche d'abord, puis les franchissements de chaque nœud
    const nFr = new Int32Array(nb);
    for (let j = 0; j < fr.length; j += 2) nFr[fr[j]]++;
    const debut = new Int32Array(nb + 1);
    for (let a = 0; a < nb; a++) debut[a + 1] = debut[a] + vois[a].length + nFr[a];
    const nl = debut[nb], liens = new Int32Array(nl), cout = new Float32Array(nl), typeLien = new Uint8Array(nl);
    const pos = debut.slice(0, nb);
    for (let a = 0; a < nb; a++) for (const b of vois[a]) { const j = pos[a]++; liens[j] = b; cout[j] = Math.hypot(px[b] - px[a], pz[b] - pz[a], ph[b] - ph[a]); }
    for (let j = 0; j < fr.length; j += 2) {
      const a = fr[j], b = fr[j + 1], q = pos[a]++;
      liens[q] = b; typeLien[q] = 1; cout[q] = COUT_FRANCHIR * Math.hypot(px[b] - px[a], pz[b] - pz[a], ph[b] - ph[a]);
    }
    // LA ZONE de chaque nœud (la pièce de js/carte_ecole.js, 255 : aucune), son NIVEAU (3 : la rue), et sa RÉGION (la zone,
    // ou celle de la pièce la plus proche par le graphe pour un nœud sur un seuil que les rectangles des pièces laissent
    // entre eux : c'est elle que lisent les masques des zones de jeu — un seuil sans pièce couperait le chemin d'une porte)
    const zone = new Uint8Array(nb).fill(255), niveau = new Int8Array(nb), region = new Uint8Array(nb).fill(255);
    for (let a = 0; a < nb; a++) {
      const Zn = Lu && Lu.zoneEn ? Lu.zoneEn(px[a], pz[a], ph[a] + 0.1) : null;
      const zi = Zn ? INDEX_PIECE.get(Zn.id) : undefined;
      if (zi !== undefined) zone[a] = zi;
      niveau[a] = (Zn ? Zn.id === 'rue' : pz[a] > 0.3 && ph[a] > -0.5 && ph[a] < 0.5) ? NIVEAU_RUE : niveauDe(ph[a] + 0.5);
    }
    {
      const file = [];
      for (let a = 0; a < nb; a++) if (zone[a] !== 255) { region[a] = zone[a]; file.push(a); }
      for (let q = 0; q < file.length; q++) {
        const u = file[q];
        for (let j = debut[u]; j < debut[u + 1]; j++) { const v = liens[j]; if (region[v] === 255) { region[v] = region[u]; file.push(v); } }
      }
    }
    ch('zones');
    // LE DÉGAGEMENT : le plus grand des rayons libres essayés (en deçà, le rayon du graphe) = la distance du nœud à la plus
    // proche forme de la bande du corps (exactement le critère de `C.libre` : libre au rayon r ⟺ toutes les formes à ≥ r),
    // lue d'une seule visite de la grille — d'abord à 1 m, à 2 m seulement si rien n'est à moins de 1 m (libre(…, 2)
    // coûte 64 µs, ses quatre passes de résolution)
    const degage = new Float32Array(nb);
    for (let a = 0; a < nb; a++) {
      let c = clairance(C, px[a], pz[a], ph[a], 1);
      if (c >= 1) c = clairance(C, px[a], pz[a], ph[a], 2);
      let k = -1;
      for (let j = 0; j < DEGAGES.length; j++) if (DEGAGES[j] <= c + 1e-6) k = j;
      degage[a] = k >= 0 ? DEGAGES[k] : rayon;
    }
    ch('degage');
    return { v: VERSION_NAV, pas, rayon, franchir, bornes: { ...B }, NI, NK, nb,
      px: Float32Array.from(px), pz: Float32Array.from(pz), ph: Float32Array.from(ph), ci: Int16Array.from(ci), ck: Int16Array.from(ck),
      zone, region, niveau, degage, debut, liens, cout, typeLien, caseDebut, caseNoeuds, nFranchir: fr.length / 2 };
  } finally {
    for (let j = 0; j < garde.length; j += 2) garde[j].off = garde[j + 1];
  }
}

// LA RECHERCHE A* (ou Dijkstra sans cible) — ses tableaux à elle : la file de la partie et `chemin` en ont chacune une, on
// peut appeler `chemin` pendant qu'une demande de la file est à moitié faite
class Recherche {
  constructor(nav) {
    const n = nav.nb;
    this.nav = nav; this.g = new Float64Array(n); this.pere = new Int32Array(n); this.vu = new Uint32Array(n); this.ferme = new Uint32Array(n);
    this.tas = new Int32Array(256); this.tf = new Float64Array(256); this.n = 0; this.tour = 0;
    this.de = -1; this.a = -1; this.fini = true; this.ok = false; this.ouverts = 0; this.pur = false; this.marche = false;
    this.inv = false;                // (vrai : le graphe À REBOURS — les distances de chaque nœud VERS le départ ; avec `pur`)
  }
  _pousser(v, f) {
    if (this.n >= this.tas.length) { const t = new Int32Array(this.tas.length * 2); t.set(this.tas); this.tas = t; const u = new Float64Array(this.tf.length * 2); u.set(this.tf); this.tf = u; }
    const T = this.tas, F = this.tf;
    let i = this.n++;
    while (i > 0) { const p = (i - 1) >> 1; if (F[p] <= f) break; T[i] = T[p]; F[i] = F[p]; i = p; }
    T[i] = v; F[i] = f;
  }
  _tirer() {
    const T = this.tas, F = this.tf, v = T[0], n = --this.n;
    if (n > 0) {
      const x = T[n], fx = F[n];
      let i = 0;
      for (;;) {
        let c = 2 * i + 1; if (c >= n) break;
        if (c + 1 < n && F[c + 1] < F[c]) c++;
        if (F[c] >= fx) break;
        T[i] = T[c]; F[i] = F[c]; i = c;
      }
      T[i] = x; F[i] = fx;
    }
    return v;
  }
  _h(v) { const N = this.nav, a = this.a; return a < 0 ? 0 : Math.hypot(N.px[v] - N.px[a], N.pz[v] - N.pz[a], N.ph[v] - N.ph[a]); }
  debut(de, a) {
    this.tour = (this.tour + 1) >>> 0; if (this.tour === 0) { this.vu.fill(0); this.ferme.fill(0); this.tour = 1; }
    this.de = de; this.a = a; this.n = 0; this.ouverts = 0; this.fini = false; this.ok = false;
    const N = this.nav;
    // (le départ peut être hors de la zone — le bot y est ; l'arrivée, jamais)
    if (de < 0 || de >= N.nb || a >= N.nb || (a >= 0 && !N.permis(a))) { this.fini = true; return; }
    this.g[de] = 0; this.pere[de] = -1; this.vu[de] = this.tour;
    this._pousser(de, this._h(de));
  }
  // `budget` nœuds ouverts au plus ; vrai quand c'est fini (trouvé ou impossible)
  avancer(budget = Infinity) {
    if (this.fini) return true;
    const N = this.nav, M = N.masque, P = N._penal, tour = this.tour, g = this.g, a = this.a, inv = this.inv;
    const D = inv ? N.debutInv : N.debut, L = inv ? N.liensInv : N.liens, K = inv ? N.coutInv : N.cout, T = inv ? N.typeInv : N.typeLien;
    // (`pur` : la distance à pied vraie — ni bords, ni pénalités : distancePied)
    const pur = this.pur, pen = P.size > 0 && !pur, frMal = N.franchirMauvais && !pur, G = N.degage, bord = pur ? -1 : N.rayon + 0.01, marche = this.marche;
    let n = 0;
    while (this.n > 0) {
      if (n >= budget) return false;
      const u = this._tirer();
      if (this.ferme[u] === tour) continue;
      this.ferme[u] = tour; n++; this.ouverts++;
      if (u === a) { this.fini = true; this.ok = true; return true; }
      const gu = g[u];
      for (let j = D[u]; j < D[u + 1]; j++) {
        const v = L[j];
        if (M && !M[v]) continue;
        if (this.ferme[v] === tour || (marche && T[j])) continue;
        let c = K[j];
        if (pen) { const f = P.get(j); if (f !== undefined && N.t < f) c *= PENALITE; }
        if (frMal && T[j]) c *= PENALITE;
        if (G[v] <= bord && !T[j]) c *= COUT_BORD;           // (la marche seulement : un franchissement garde son « 2 × »)
        const gv = gu + c;
        if (this.vu[v] === tour && gv >= g[v]) continue;
        this.vu[v] = tour; g[v] = gv; this.pere[v] = u;
        this._pousser(v, gv + this._h(v));
      }
    }
    this.fini = true; this.ok = a < 0;
    return true;
  }
  liste(out) {
    out = out || [];
    out.length = 0;
    if (!this.ok || this.a < 0) return out;
    for (let v = this.a; v >= 0; v = this.pere[v]) out.push(v);
    out.reverse();
    return out;
  }
}

export class Nav {
  // la navigation (le cache, sinon la génération) ; `o` = { pas = 0,25, rayon = 0,3, franchir = vrai, bornes = BORNES_NAV,
  // progres, refaire } — `refaire` (ou ?nav=refaire, une fois par session) : génération forcée, le cache réécrit
  static async obtenir(game, o) {
    const { pas = 0.25, rayon = 0.3, franchir = true, bornes = BORNES_NAV, progres = null, refaire = false, chrono = null } = o || {};
    const pr = progres || (() => {});
    const C = game.collisions, Lu = game.carte && game.carte.lumieres;
    const n = new Nav();
    if (!C) { n.pas = pas; n.rayon = rayon; n.franchir = franchir; n.bornes = bornes; return n; }
    const opts = { pas, rayon, franchir: !!franchir && rayon >= 0.25, bornes }, V = avecVantaux(game);
    const emp = V(() => empreinteDe(C, Lu, opts));
    const forcer = refaire || (argNav() === 'refaire' && !_refaitCetteSession.has(emp));
    pr('Plan de l’école', 0.05);
    let D = forcer ? null : MEMOIRE.get(emp) || null, cache = !!D;
    if (!D && !forcer) {
      const L = await lireNav(emp);
      if (L && L.v === VERSION_NAV && L.empreinte === emp && L.nb === (L.px && L.px.length) && L.debut && L.debut.length === L.nb + 1) { D = L; cache = true; }
    }
    if (!D) {
      pr('Plan de l’école', 0.15);
      // (une image pour que l'écran de préparation montre l'étape avant les 0,7 s de calcul d'un bloc)
      await new Promise((r) => setTimeout(r, 0));
      const graines = [];
      const dep = game.carte && game.carte.depart;
      if (dep) graines.push([dep.x, C.solEn(dep.x, dep.z, dep.y || 0), dep.z]);
      for (const g of GRAINES) graines.push(g);
      D = V(() => generer(C, Lu, { ...opts, graines, chrono }));
      D.empreinte = emp;
      _refaitCetteSession.add(emp);
      // (l'écriture n'est pas attendue : sur une machine chargée, IndexedDB a mis 1,4 s à écrire le Mo du graphe ; une
      // lecture qui suit attend d'elle-même la fin de cette transaction — même magasin)
      Nav.ecriture = ecrireNav(emp, D);
    }
    MEMOIRE.set(emp, D);
    n._charger(D, C);
    n.depuisCache = cache;
    pr('Plan de l’école', 0.95);
    return n;
  }
  // (les données de la session oubliées : la prochaine `obtenir` relit IndexedDB ou régénère — les tests du cache)
  static oublier() { MEMOIRE.clear(); }
  // la génération d'un bloc, sans cache ni attente (les tests : rien d'autre ne tourne pendant — l'instantané d'avant et
  // celui d'après se comparent dans la même tâche) ; `o` comme `obtenir`
  static genererSync(game, o) {
    const { pas = 0.25, rayon = 0.3, franchir = true, bornes = BORNES_NAV } = o || {};
    const C = game.collisions, Lu = game.carte && game.carte.lumieres, opts = { pas, rayon, franchir: !!franchir && rayon >= 0.25, bornes };
    const dep = game.carte && game.carte.depart, graines = dep ? [[dep.x, C.solEn(dep.x, dep.z, dep.y || 0), dep.z], ...GRAINES] : GRAINES;
    const V = avecVantaux(game), D = V(() => generer(C, Lu, { ...opts, graines })); D.empreinte = V(() => empreinteDe(C, Lu, opts));
    const n = new Nav(); n._charger(D, C); return n;
  }
  // l'empreinte qu'aurait le graphe de ces options, sans le générer (les tests ; `o` comme `obtenir`)
  static empreinteDe(game, o) {
    const { pas = 0.25, rayon = 0.3, franchir = true, bornes = BORNES_NAV } = o || {};
    return avecVantaux(game)(() => empreinteDe(game.collisions, game.carte && game.carte.lumieres, { pas, rayon, franchir: !!franchir && rayon >= 0.25, bornes }));
  }
  // (`pas`, `rayon`, `franchir`, `bornes` : les options du graphe ; `depuisCache` : relu d'un cache plutôt que généré — lus
  // par js/jeu/harnais.js verifierNav)
  constructor() {
    this.pas = 0.25; this.rayon = 0.3; this.franchir = true; this.bornes = BORNES_NAV; this.depuisCache = false;
    this.nb = 0;
    this.px = new Float32Array(0); this.pz = new Float32Array(0); this.ph = new Float32Array(0);
    this.zone = new Uint8Array(0); this.region = new Uint8Array(0); this.niveau = new Int8Array(0); this.degage = new Float32Array(0);
    this.debut = new Int32Array(1); this.liens = new Int32Array(0); this.cout = new Float32Array(0); this.typeLien = new Uint8Array(0);
    this.empreinte = 'vide'; this.masque = null;
    this.C = null; this.t = 0;                  // (t : l'horloge de la partie, posée par le pilote — les liens pénalisés expirent)
    this._penal = new Map(); this._file = []; this._champs = new Map(); this._parZone = null; this._frOk = 0; this._frRate = 0;
    this._r1 = null; this._r2 = null; this._rC = null; this._fond = null;
  }
  _charger(D, C) {
    this.C = C;
    this.pas = D.pas; this.rayon = D.rayon; this.franchir = D.franchir; this.bornes = D.bornes; this.empreinte = D.empreinte;
    this.nb = D.nb; this.px = D.px; this.pz = D.pz; this.ph = D.ph; this.zone = D.zone; this.region = D.region || D.zone; this.niveau = D.niveau;
    this.degage = D.degage; this.debut = D.debut; this.liens = D.liens; this.cout = D.cout; this.typeLien = D.typeLien;
    this.NI = D.NI; this.NK = D.NK; this.ci = D.ci; this.ck = D.ck; this.caseDebut = D.caseDebut; this.caseNoeuds = D.caseNoeuds;
    this.nFranchir = D.nFranchir || 0;
    this._r1 = new Recherche(this); this._r2 = new Recherche(this); this._rC = new Recherche(this); this._rP = new Recherche(this); this._rP.pur = true;
    this.balistique = new Balistique(C);
  }

  // ---------------------------------------------------------------- la zone de jeu
  // le masque des nœuds permis (Uint8Array de `nb`, 1 = permis) : la zone de jeu moins les pièces fermées (js/jeu/
  // monde_partie.js noeudsAutorises) ; null : tout. Les champs en cache sont oubliés ; les demandes de la file sont
  // REPRISES sous le nouveau masque (relecture : vidée sans rappel, un pilote qui attendait son chemin restait figé pour
  // toujours — une arrivée devenue interdite rend null, le pilote passe à autre chose)
  restreindre(masque) {
    this.masque = masque && masque.length === this.nb ? masque : null;
    if (this.masque && this.masque.every((v) => v)) this.masque = null;
    this._champs.clear(); this._parZone = null; this._fond = null;
    for (const q of this._file) q.parti = false;
    if (this._r2) this._r2.fini = true;
    if (this.rayon >= 0.25) Nav.derniere = this;            // (le graphe des humains de la partie qui se prépare : js/jeu/apparitions.js departs)
  }
  permis(i) { return !this.masque || this.masque[i] === 1; }
  // le masque des nœuds dont la RÉGION est l'une de ces pièces (Set ou tableau d'id) — de quoi bâtir `noeudsAutorises`
  masquePieces(pieces) {
    const S = new Set([...pieces].map((p) => INDEX_PIECE.get(p)).filter((v) => v !== undefined)), M = new Uint8Array(this.nb);
    for (let i = 0; i < this.nb; i++) M[i] = S.has(this.region[i]) ? 1 : 0;
    return M;
  }
  // l'id de pièce d'un nœud (sa zone, ou à défaut sa région) ; null
  pieceDe(i) { const z = this.zone[i] !== 255 ? this.zone[i] : this.region[i]; return z === 255 || z === undefined ? null : PIECES[z]; }

  // ---------------------------------------------------------------- les nœuds
  // le nœud le plus proche de (x, y, z) à ≤ rayonMax, sur le même sol (± 1 m, la hauteur comptée double) et permis ; −1
  noeudPres(x, y, z, rayonMax = 1.5) {
    if (!this.nb) return -1;
    const B = this.bornes, p = this.pas, NI = this.NI, NK = this.NK, cD = this.caseDebut, cN = this.caseNoeuds, M = this.masque;
    const i0 = Math.floor((x - B.xMin) / p), k0 = Math.floor((z - B.zMin) / p), R = Math.ceil(rayonMax / p) + 1;
    let best = -1, bs = Infinity;
    for (let r = 0; r <= R; r++) {
      if (r > 1 && best >= 0 && ((r - 1) * p) ** 2 > bs) break;
      for (let i = i0 - r; i <= i0 + r; i++) {
        if (i < 0 || i >= NI) continue;
        const bord = i === i0 - r || i === i0 + r;
        for (let k = k0 - r; k <= k0 + r; k += bord ? 1 : 2 * r || 1) {
          if (k < 0 || k >= NK) continue;
          const c = i * NK + k;
          for (let j = cD[c]; j < cD[c + 1]; j++) {
            const b = cN[j];
            if (M && !M[b]) continue;
            const dy = this.ph[b] - y;
            if (dy > 1 || dy < -1) continue;
            const dx = this.px[b] - x, dz = this.pz[b] - z, d2 = dx * dx + dz * dz;
            if (d2 > rayonMax * rayonMax) continue;
            const s = d2 + 4 * dy * dy;
            if (s < bs) { bs = s; best = b; }
          }
        }
      }
    }
    return best;
  }
  // les nœuds permis dont le centre est à ≤ r de (x, z), sur le même sol (± dyMax) — `out` rempli
  dans(x, y, z, r, out, dyMax = 1) {
    out = out || []; out.length = 0;
    if (!this.nb) return out;
    const B = this.bornes, p = this.pas, NI = this.NI, NK = this.NK, cD = this.caseDebut, cN = this.caseNoeuds, M = this.masque;
    const i0 = Math.max(0, Math.floor((x - r - B.xMin) / p)), i1 = Math.min(NI - 1, Math.floor((x + r - B.xMin) / p));
    const k0 = Math.max(0, Math.floor((z - r - B.zMin) / p)), k1 = Math.min(NK - 1, Math.floor((z + r - B.zMin) / p));
    for (let i = i0; i <= i1; i++) for (let k = k0; k <= k1; k++) {
      const c = i * NK + k;
      for (let j = cD[c]; j < cD[c + 1]; j++) {
        const b = cN[j];
        if (M && !M[b]) continue;
        if (Math.abs(this.ph[b] - y) > dyMax) continue;
        if (Math.hypot(this.px[b] - x, this.pz[b] - z) <= r) out.push(b);
      }
    }
    return out;
  }
  // le lien de u vers v (son indice dans `liens`), ou −1
  lien(u, v) { for (let j = this.debut[u]; j < this.debut[u + 1]; j++) if (this.liens[j] === v) return j; return -1; }
  // LES FRANCHISSEMENTS RATÉS de la partie (le pilote les compte) : à 3 ratés, et plus de deux fois plus de ratés que de
  // réussis, tous les liens « franchir » coûtent × 10 — un bot ne s'acharne pas sur une table que son corps ne passe pas
  // (le mouvement du squelette ne fait qu'un saut de 0,5 m ; celui de L-B franchit)
  noterFranchir(reussi) { if (reussi) this._frOk++; else this._frRate++; }
  get franchirMauvais() { return this._frRate >= 3 && this._frRate > 2 * this._frOk; }
  // un lien où un bot s'est coincé : coûte × 10 jusqu'à `jusqua` (temps de la partie) — dans les deux sens
  penaliser(u, v, jusqua) {
    const a = this.lien(u, v), b = this.lien(v, u);
    if (a >= 0) this._penal.set(a, jusqua);
    if (b >= 0) this._penal.set(b, jusqua);
    if (this._penal.size > 64) for (const [j, f] of this._penal) if (f <= this.t) this._penal.delete(j);
  }
  // (un nœud ou un point { x, y, z } : le nœud)
  _noeud(p, r = 3) {
    if (typeof p === 'number') return p >= 0 && p < this.nb ? p : -1;
    if (!p) return -1;
    let n = this.noeudPres(p.x, p.y ?? 0, p.z, 1.5);
    if (n < 0 && r > 1.5) n = this.noeudPres(p.x, p.y ?? 0, p.z, r);
    return n;
  }

  // ---------------------------------------------------------------- les chemins
  // A* d'un bloc : `out` reçoit la liste des nœuds (de … a) ; faux s'il n'y a pas de chemin dans la zone
  chemin(de, a, out) {
    if (out) out.length = 0;
    const u = this._noeud(de), v = this._noeud(a);
    if (u < 0 || v < 0 || !this._r1) return false;
    const R = this._r1;
    R.debut(u, v); R.avancer(Infinity);
    if (out) R.liste(out);
    return R.ok;
  }
  // A* FRACTIONNABLE en file : `rappel(liste | null, cle)` à l'étape 9 du pas qui l'a fini ; une demande de même `cle`
  // remplace la précédente (le bot a changé d'avis)
  // (`o` facultatif : { franchir: faux } — par la marche seule)
  demander(cle, de, a, rappel, o = null) {
    const u = this._noeud(de), v = this._noeud(a);
    const F = this._file;
    for (let i = 0; i < F.length; i++) if (F[i].cle === cle) { F.splice(i, 1); if (i === 0 && this._r2) this._r2.fini = true; break; }
    if (u < 0 || v < 0 || !this._r2) { if (rappel) rappel(null, cle); return; }
    F.push({ cle, de: u, a: v, rappel, parti: false, marche: !!(o && o.franchir === false) });
  }
  // une tranche de la demande en tête (Partie.pas, étape 9) : 1 500 nœuds ouverts au plus, une demande à la fois
  pasFile() {
    const F = this._file;
    if (!F.length) { if (this._fond && this._fond.next().done) this._fond = null; return; }
    const q = F[0], R = this._r2;
    if (!q.parti) { R.marche = q.marche; R.debut(q.de, q.a); q.parti = true; }
    if (!R.avancer(TRANCHE)) return;
    F.shift();
    if (q.rappel) q.rappel(R.ok ? R.liste([]) : null, q.cle);
  }
  get enFile() { return this._file.length; }
  // une demande retirée de la file (le bot s'est arrêté)
  annuler(cle) { const F = this._file; for (let i = 0; i < F.length; i++) if (F[i].cle === cle) { F.splice(i, 1); if (i === 0 && this._r2) this._r2.fini = true; return; } }
  // DIJKSTRA COMPLET depuis un nœud (la distance à pied de tous les nœuds de la zone : Infinity hors d'atteinte), en
  // cache tant que le masque ne change pas (les points d'apparition). Les champs sont des distances à pied VRAIES : ni les
  // bords ni les liens pénalisés d'un coincement n'y entrent (sinon, 10 s durant, un ennemi derrière un lien pénalisé
  // semblait à 10 × sa distance — une réapparition à côté de lui)
  champDepuis(id) {
    const u = this._noeud(id);
    if (u < 0) return new Float64Array(this.nb).fill(Infinity);
    let c = this._champs.get(u);
    if (c) return c;
    c = this._champ([u], Infinity, new Float64Array(this.nb));
    this._champs.set(u, c);
    if (this._champs.size > 96) this._champs.delete(this._champs.keys().next().value);
    return c;
  }
  // DIJKSTRA DEPUIS PLUSIEURS NŒUDS, borné à `max` mètres : la distance de chaque nœud au plus proche de `sources`
  // (Infinity au-delà) — une réapparition (js/jeu/apparitions.js) en fait deux, ennemis et alliés, au lieu d'un champ par
  // point ; `out` (Float64Array de nb) réutilisable
  champMulti(sources, max = Infinity, out = null) {
    out = out && out.length === this.nb ? out : new Float64Array(this.nb);
    const L = [];
    for (const s of sources) { const u = this._noeud(s); if (u >= 0) L.push(u); }
    return this._champ(L, max, out);
  }
  _champ(L, max, out) {
    const R = this._rC, g = R.g;
    out.fill(Infinity);
    R.tour = (R.tour + 1) >>> 0; if (R.tour === 0) { R.vu.fill(0); R.ferme.fill(0); R.tour = 1; }
    const tour = R.tour, D = this.debut, Li = this.liens, K = this.cout, M = this.masque;
    R.n = 0; R.a = -1;
    for (const u of L) { if (R.vu[u] === tour) continue; g[u] = 0; R.vu[u] = tour; R._pousser(u, 0); }
    while (R.n > 0) {
      const u = R._tirer();
      if (R.ferme[u] === tour) continue;
      R.ferme[u] = tour;
      const gu = g[u];
      if (gu > max) break;
      out[u] = gu;
      for (let j = D[u]; j < D[u + 1]; j++) {
        const v = Li[j];
        if ((M && !M[v]) || R.ferme[v] === tour) continue;
        const gv = gu + K[j];
        if (R.vu[v] === tour && gv >= g[v]) continue;
        R.vu[v] = tour; g[v] = gv; R._pousser(v, gv);
      }
    }
    return out;
  }
  // un nœud permis de la zone (id de pièce ou son indice), au hasard de `rng` ; −1
  aleatoireDans(zoneId, rng) {
    if (!this.nb) return -1;
    const zi = typeof zoneId === 'number' ? zoneId : INDEX_PIECE.get(zoneId);
    if (zi === undefined) return -1;
    if (!this._parZone) {
      this._parZone = new Map();
      for (let i = 0; i < this.nb; i++) {
        if (!this.permis(i) || this.zone[i] === 255) continue;
        let A = this._parZone.get(this.zone[i]); if (!A) this._parZone.set(this.zone[i], A = []); A.push(i);
      }
    }
    const A = this._parZone.get(zi);
    if (!A || !A.length) return -1;
    return A[rng ? rng.int(A.length) : 0];
  }
  // les pièces (indices) qui ont des nœuds permis
  piecesPermises() { this.aleatoireDans(0, null); return [...this._parZone.keys()].sort((a, b) => a - b); }
  // LES COUVERTS (§ 3.7) : 12 nœuds tirés dans un anneau de 2 à 8 m autour de (x, y, z) (le bot), gardés s'ils sont CACHÉS
  // de chaque menace à 1,0 m au-dessus de leur sol (accroupi) et en VOIENT une à 1,6 m (debout : il peut riposter) ; les `n`
  // plus proches. `menaces` : [{ x, y, z }] = les YEUX des menaces.
  couverts(x, y, z, menaces, rng, n) {
    const L = this.dans(x, y, z, 8, this._tmpC || (this._tmpC = []), 1.2), cands = [];
    for (const b of L) { const d = Math.hypot(this.px[b] - x, this.pz[b] - z); if (d >= 2) cands.push(b); }
    const pris = [], B = this.balistique, M = menaces || [];
    for (let k = 0; k < 12 && cands.length; k++) {
      const j = rng ? rng.int(cands.length) : 0, b = cands[j];
      cands[j] = cands[cands.length - 1]; cands.pop();
      const bx = this.px[b], bz = this.pz[b], by = this.ph[b];
      let cache = true, voit = !M.length;
      for (const m of M) {
        if (B.vue(m.x, m.y, m.z, bx, by + 1.0, bz)) { cache = false; break; }
        if (!voit && B.vue(bx, by + 1.6, bz, m.x, m.y, m.z)) voit = true;
      }
      if (cache && voit) pris.push(b);
    }
    pris.sort((a, b) => Math.hypot(this.px[a] - x, this.pz[a] - z) - Math.hypot(this.px[b] - x, this.pz[b] - z) || a - b);
    return pris.slice(0, n ?? 12);
  }
  // la distance À PIED de a à b (nœuds ou points { x, y, z }) : un champ en cache si l'un des deux en a un, sinon un A* ;
  // Infinity hors d'atteinte ; −1 sans nœud. Sans graphe (nb = 0) : la distance droite.
  distancePied(a, b) {
    if (!this.nb) {
      if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return -1;
      return Math.hypot(a.x - b.x, (a.y || 0) - (b.y || 0), a.z - b.z);
    }
    const u = this._noeud(a), v = this._noeud(b);
    if (u < 0 || v < 0) return -1;
    if (u === v) return 0;
    const cu = this._champs.get(u); if (cu) return cu[v];
    const cv = this._champs.get(v); if (cv) return cv[u];
    const R = this._rP;
    R.debut(u, v); R.avancer(Infinity);
    return R.ok ? R.g[v] : Infinity;
  }
  // LE GRAPHE À REBOURS (les liens retournés, CSR : fait une fois par graphe, à la première demande — 60 000 liens, ≈ 2 ms)
  _inverser() {
    if (this.debutInv) return;
    const n = this.nb, D = this.debut, Li = this.liens, nl = Li.length, debut = new Int32Array(n + 1);
    for (let j = 0; j < nl; j++) debut[Li[j] + 1]++;
    for (let v = 0; v < n; v++) debut[v + 1] += debut[v];
    const pos = debut.slice(0, n), liens = new Int32Array(nl), cout = new Float32Array(nl), type = new Uint8Array(nl);
    for (let u = 0; u < n; u++) for (let j = D[u]; j < D[u + 1]; j++) { const q = pos[Li[j]]++; liens[q] = u; cout[q] = this.cout[j]; type[q] = this.typeLien[j]; }
    this.debutInv = debut; this.liensInv = liens; this.coutInv = cout; this.typeInv = type;
  }
  // LE CHAMP VERS un nœud : la distance à pied VRAIE (ni bords, ni pénalités) de chaque nœud permis JUSQU'À `id` — celle
  // qu'un acteur posé là ferait pour y venir (Float64Array, Infinity hors d'atteinte). Itérateur : `tranche` nœuds ouverts par
  // pas (la tâche de fond), la valeur rendue à la fin ; `champVers` le fait d'un bloc (ses tableaux à lui)
  *champVersPar(id, tranche = TRANCHE) {
    this._inverser();
    const R = this._rV || (this._rV = new Recherche(this)); R.pur = true; R.inv = true;
    R.debut(id, -1);
    while (!R.avancer(tranche)) yield null;
    const out = new Float64Array(this.nb).fill(Infinity);
    for (let v = 0; v < this.nb; v++) if (R.ferme[v] === R.tour) out[v] = R.g[v];
    return out;
  }
  champVers(id) {
    this._inverser();
    const R = this._rW || (this._rW = new Recherche(this)); R.pur = true; R.inv = true;
    R.debut(id, -1); R.avancer(Infinity);
    const out = new Float64Array(this.nb).fill(Infinity);
    for (let v = 0; v < this.nb; v++) if (R.ferme[v] === R.tour) out[v] = R.g[v];
    return out;
  }
  // LA TÂCHE DE FOND : un itérateur avancé d'un cran par pasFile où la file des chemins est vide (les champs des points de
  // réapparition, js/jeu/apparitions.js, calculés pendant la présentation et le décompte) ; déterministe (au pas, jamais au
  // temps) ; oubliée par `restreindre`
  fond(it) { this._fond = it || null; }
  get enFond() { return !!this._fond; }
  // la longueur d'une liste de nœuds (m)
  longueur(L) { let s = 0; for (let i = 1; i < L.length; i++) s += Math.hypot(this.px[L[i]] - this.px[L[i - 1]], this.pz[L[i]] - this.pz[L[i - 1]], this.ph[L[i]] - this.ph[L[i - 1]]); return s; }
}
Nav.derniere = null;
Nav.ecriture = Promise.resolve();

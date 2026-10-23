// =====================================================================
//  LES APPARITIONS (lot L-D, 23/10 ; spec §§ 2.4-2.5, 3.8, 4.5.11 ; carte_monde § 8)
// =====================================================================
// Où l'on apparaît, toujours sur un NŒUD du graphe des humains (js/jeu/nav.js) : là, un corps tient et repart.
//   - LES 20 LIEUX de carte_monde § 8 (le nœud le plus dégagé de chaque pièce) : indicatifs, ramenés au graphe ;
//   - LES DÉPARTS d'un camp (`departs`) : les points de ZONES_JEU (js/jeu/constantes.js) ramenés au nœud dégagé
//     (≥ 0,75 m) le plus proche, puis les suivants en largeur dans le graphe, à 1,5 m les uns des autres, sur le même sol,
//     sans avancer vers le camp d'en face ; chacun REGARDE vers où il ira — le premier bout de son chemin à pied vers le
//     camp adverse (on part en courant dans le bon couloir, pas face au mur) ;
//   - LA RÉAPPARITION en cours de partie (`choisirApparition`, § 3.8) : les candidats sont les 20 lieux et des nœuds
//     échantillonnés du graphe (≈ 12 par niveau, les plus éloignés les uns des autres, dégagement ≥ 0,75 m, hors volées,
//     dans la zone de jeu) ; note = 1,0 × proximité des alliés (≤ 15 m à pied) − 3,0 × danger (ennemis à ≤ 20 m à pied,
//     × 3 s'ils VOIENT le point ; morts récentes à ≤ 8 m) ; jamais un point à moins de 20 m à pied d'un ennemi qui le voit ;
//     tirage parmi les 3 meilleurs (la graine). CHACUN POUR SOI : le point qui maximise la distance à pied au plus proche
//     ennemi et que personne ne voit, exactement. Les distances à pied : des Dijkstra BORNÉS depuis les acteurs (un par
//     ennemi, à 20 m ; un depuis tous les alliés, à 15 m ; un complet depuis tous les ennemis en chacun pour soi) — au
//     lieu d'un champ par candidat (70 champs de 15 ms) : quelques ms par réapparition ;
//   - LES ANNEAUX de domination ramenés au nœud de dégagement ≥ 1,5 m le plus proche, à ≤ 3 m (`ramenerPoint`).
// Sans graphe (le vol d'oiseau du squelette : nb = 0), le repli d'avant : les points posés au monde solide.
// Fichier de SIMULATION : le hasard est celui qu'on passe (la graine de la partie).
import { ZONES_JEU, PIECES } from './constantes.js';
import { Player } from '../player.js';
import { Nav } from './nav.js';

// (zone, x, y, z, dégagement) — MONDE
export const POINTS_APPARITION = [
  { zone: 'pauseSS', x: 9.38, y: -3.06, z: -9.37, degage: 1.0 },
  { zone: 'salleSS', x: 9.63, y: -3.06, z: -22.62, degage: 0.75 },
  { zone: 'sasSS', x: 15.63, y: -3.06, z: -9.62, degage: 1.0 },
  { zone: 'hallSS', x: 1.38, y: -3.06, z: -10.87, degage: 0.75 },
  { zone: 'hall', x: 14.88, y: 0, z: -3.12, degage: 1.5 },
  { zone: 'attente', x: 11.63, y: 0, z: -4.62, degage: 1.5 },
  { zone: 'hallO', x: 4.63, y: 0, z: -6.87, degage: 1.5 },
  { zone: 'dc', x: 5.38, y: 0, z: -15.12, degage: 1.0 },
  { zone: 'passage', x: 3.63, y: 0, z: -3.87, degage: 1.0 },
  { zone: 'couloirEst', x: 15.63, y: 0, z: -9.87, degage: 0.75 },
  { zone: 'c01', x: 12.38, y: 0, z: -11.37, degage: 0.75 },
  { zone: 'e1pause', x: 12.63, y: 3.5, z: -7.87, degage: 1.0 },
  { zone: 'e1kahn', x: 8.13, y: 3.5, z: -22.62, degage: 1.0 },
  { zone: 'e1salle', x: 2.88, y: 3.5, z: -3.37, degage: 1.0 },
  { zone: 'e1est', x: 15.88, y: 3.5, z: -9.87, degage: 0.75 },
  { zone: 'e2couloir', x: 14.63, y: 6.6, z: -5.87, degage: 1.0 },
  { zone: 'e2s1', x: 4.63, y: 6.6, z: -7.87, degage: 1.0 },
  { zone: 'e2s2', x: 17.13, y: 6.6, z: -2.37, degage: 0.75 },
  { zone: 'e2palier', x: 15.63, y: 6.6, z: -9.87, degage: 0.75 },
  // (la rue : carte_monde § 8 met le point au milieu de la rue, (15,63 ; 0 ; 9,38) — hors de la rue BORNÉE du jeu, zMax 6,
  // donc sans nœud ; il est ramené au plus dégagé de la rue bornée, la chaussée devant la porte 6 : dégagement 2 m)
  { zone: 'rue', x: 13.13, y: -0.12, z: 4.88, degage: 2.0 },
];
// § 3.8
export const REGLES_APPARITION = {
  degageMin: 0.75, espacement: 1.5, parNiveau: 12,
  allies: { poids: 1.0, portee: 15 }, danger: { poids: 3.0, portee: 20, vue: 3, morts: 8, mortsT: 10 },
  meilleurs: 3, interditVu: 20, vueMax: 50,
};
// les pièces d'une zone de jeu (Set), et les lieux qui y sont
export function piecesDe(zoneJeu) {
  const Z = ZONES_JEU[zoneJeu];
  return new Set(!Z || Z.pieces === '*' ? PIECES : Z.pieces);
}
export function pointsDe(zoneJeu) { const P = piecesDe(zoneJeu); return POINTS_APPARITION.filter((p) => P.has(p.zone)); }

// ---------------------------------------------------------------- sans graphe (le repli)
// sorti des murs (le disque du joueur poussé par le monde solide) ; null s'il n'y tient pas, ou s'il tombe sur un autre
// sol que celui du point (une volée d'escalier à côté d'un palier)
function poser(x, y, z) {
  const C = Player.collisions;
  if (!C) return { x, y, z };
  const sol = C.solEn(x, z, y + 0.3), p = { x, z };
  if (Math.abs(sol - y) > 0.3) return null;
  C.resoudre(p, 0.3, null, sol);
  const s2 = C.solEn(p.x, p.z, sol + 0.3);
  return C.libre(p.x, p.z, 0.3, sol) && Math.abs(s2 - y) <= 0.3 ? { x: p.x, y: s2, z: p.z } : null;
}
const OFFSETS = [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5], [1.5, 1.5], [-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [3, 0], [-3, 0], [0, 3], [0, -3]];
function departsSansGraphe(Z, equipe, n) {
  const base = (Z.departs && Z.departs[equipe]) || (Z.departs && (Z.departs.A || Z.departs.chasseurs)) || [[14.88, 0, -3.12]];
  const autre = Z.departs && (equipe === 'A' ? Z.departs.B : Z.departs.A), vise = autre && autre[0] ? autre[0] : null;
  const out = [];
  for (let k = 0; out.length < n && k < OFFSETS.length * base.length; k++) {
    const b = base[k % base.length], o = OFFSETS[Math.floor(k / base.length)];
    const p = poser(b[0] + o[0], b[1], b[2] + o[1]);
    if (!p || out.some((q) => Math.hypot(q.x - p.x, q.z - p.z) < 1.2)) continue;
    out.push({ x: p.x, y: p.y, z: p.z, lacet: vise ? Math.atan2(-(vise[0] - p.x), -(vise[2] - p.z)) : 0 });
  }
  while (out.length < n) { const b = base[out.length % base.length]; out.push({ x: b[0], y: b[1], z: b[2], lacet: 0 }); }
  return out;
}

// ---------------------------------------------------------------- les outils du graphe
const navDe = (nav) => (nav && nav.nb ? nav : Nav.derniere && Nav.derniere.nb ? Nav.derniere : null);
// le nœud permis le plus proche de (x, y, z), à ≤ rayon, de dégagement ≥ degMin, sur ce sol ; −1
function noeudDegage(N, x, y, z, rayon, degMin) {
  const L = N.dans(x, y, z, rayon, [], 0.6);
  let best = -1, bd = Infinity;
  for (const v of L) { if (N.degage[v] < degMin) continue; const d = Math.hypot(N.px[v] - x, N.pz[v] - z) + Math.abs(N.ph[v] - y); if (d < bd) { bd = d; best = v; } }
  return best;
}
// le nœud sur une volée (une rampe du monde solide sous lui) ?
function surVolee(C, x, y, z) {
  if (!C) return false;
  for (const r of C.sols) {
    if (!r.axe || x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
    const a = r.axe === 'x' ? x : z, t = Math.max(0, Math.min(1, (a - r.a0) / (r.a1 - r.a0)));
    if (Math.abs(r.h0 + (r.h1 - r.h0) * t - y) < 0.2) return true;
  }
  return false;
}
// le lacet vers où mène le champ (descente : `pasMax` nœuds vers le plus proche des sources) ; null si rien
function lacetVers(N, champ, u, pasMax = 18) {
  if (!champ || !Number.isFinite(champ[u])) return null;
  let v = u;
  for (let s = 0; s < pasMax; s++) {
    let best = v, bd = champ[v];
    for (let j = N.debut[v]; j < N.debut[v + 1]; j++) { const w = N.liens[j]; if (champ[w] < bd) { bd = champ[w]; best = w; } }
    if (best === v) break;
    v = best;
  }
  if (v === u) return null;
  return Math.atan2(-(N.px[v] - N.px[u]), -(N.pz[v] - N.pz[u]));
}
// l'œil d'un acteur (simulé, debout)
const _o = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } };

// ---------------------------------------------------------------- LES DÉPARTS
// `n` points d'un camp, à 1,5 m l'un de l'autre, dégagés, ramenés aux nœuds, tournés vers le chemin du camp d'en face.
// (`nav` facultatif : à défaut, le graphe des humains de la partie qui se prépare)
export function departs(zoneJeu, equipe, n, rng, nav = null) {
  const Z = ZONES_JEU[zoneJeu] || ZONES_JEU.ecole, N = navDe(nav);
  if (!N) return departsSansGraphe(Z, equipe, n);
  const R = REGLES_APPARITION;
  const base = (Z.departs && Z.departs[equipe]) || (Z.departs && (Z.departs.A || Z.departs.chasseurs)) || [[14.88, 0, -3.12]];
  const autre = Z.departs && (equipe === 'A' ? Z.departs.B : equipe === 'B' ? Z.departs.A : null);
  // les nœuds de base (le plus proche qui soit dégagé, à 4 m au plus, sinon le plus proche tout court)
  const bases = [];
  for (const b of base) {
    let v = noeudDegage(N, b[0], b[1], b[2], 4, R.degageMin);
    if (v < 0) v = N.noeudPres(b[0], b[1], b[2], 4);
    if (v >= 0 && !bases.includes(v)) bases.push(v);
  }
  if (!bases.length) return departsSansGraphe(Z, equipe, n);
  // le champ du camp d'en face (vers où l'on regarde ; on ne s'avance pas vers lui)
  let champE = null;
  if (autre && autre.length) {
    const E = [];
    for (const b of autre) { const v = N.noeudPres(b[0], b[1], b[2], 4); if (v >= 0) E.push(v); }
    if (E.length) champE = N.champMulti(E, Infinity);
  }
  // en largeur depuis chaque base, à tour de rôle : les nœuds dégagés, sur le sol de la base, à 1,5 m des autres
  const files = bases.map((v) => ({ file: [v], vu: new Set([v]), i: 0, h: N.ph[v], e0: champE ? champE[v] : 0 }));
  const pris = [];
  const prend = (v) => pris.every((w) => Math.hypot(N.px[w] - N.px[v], N.pz[w] - N.pz[v]) >= R.espacement || Math.abs(N.ph[w] - N.ph[v]) > 1.5);
  for (let tour = 0; pris.length < n && tour < 4000; tour++) {
    let avance = false;
    for (const F of files) {
      if (pris.length >= n) break;
      while (F.i < F.file.length && F.i < 3000) {
        const v = F.file[F.i++];
        for (let j = N.debut[v]; j < N.debut[v + 1]; j++) {
          const w = N.liens[j];
          if (N.typeLien[j] || F.vu.has(w) || !N.permis(w) || Math.abs(N.ph[w] - F.h) > 0.3) continue;
          F.vu.add(w); F.file.push(w);
        }
        avance = true;
        if (N.degage[v] < R.degageMin || !prend(v) || (champE && champE[v] < F.e0 - 1)) continue;
        pris.push(v);
        break;
      }
    }
    if (!avance) break;
  }
  // (pas assez de place dégagée : on complète au dégagement du graphe, puis en reprenant les premiers)
  if (pris.length < n) for (const F of files) for (const v of F.file) { if (pris.length >= n) break; if (!pris.includes(v) && prend(v)) pris.push(v); }
  while (pris.length < n) pris.push(pris[pris.length % Math.max(1, pris.length)] ?? bases[0]);
  const out = [];
  for (let k = 0; k < n; k++) {
    const v = pris[k];
    let lacet = champE ? lacetVers(N, champE, v) : null;
    if (lacet === null && autre && autre[0]) lacet = Math.atan2(-(autre[0][0] - N.px[v]), -(autre[0][2] - N.pz[v]));
    if (lacet === null) lacet = lacetOuvert(N, v, rng);
    out.push({ x: N.px[v], y: N.ph[v], z: N.pz[v], lacet });
  }
  return out;
}
// (sans camp d'en face : vers le plus long dégagement du graphe autour de lui — on regarde la pièce, pas le mur)
function lacetOuvert(N, v, rng) {
  let best = 0, bd = -1;
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, dx = -Math.sin(a), dz = -Math.cos(a);
    let n = 0;
    for (let s = 1; s <= 16; s++) { if (N.noeudPres(N.px[v] + dx * s * 0.5, N.ph[v], N.pz[v] + dz * s * 0.5, 0.3) < 0) break; n = s; }
    if (n > bd) { bd = n; best = a; }
  }
  return best;
}

// ---------------------------------------------------------------- LES CANDIDATS d'une zone (par graphe et par masque)
const _cands = new WeakMap();
function candidats(N) {
  let K = _cands.get(N);
  if (K && K.masque === N.masque) return K.L;
  const R = REGLES_APPARITION, C = N.C, L = [];
  // les 20 lieux (ramenés au nœud dégagé à ≤ 3 m)
  for (const q of POINTS_APPARITION) {
    let v = noeudDegage(N, q.x, q.y, q.z, 3, R.degageMin);
    if (v < 0) v = N.noeudPres(q.x, q.y, q.z, 3);
    if (v >= 0 && N.permis(v) && !L.includes(v)) L.push(v);
  }
  // ≈ 12 par niveau, les plus éloignés des candidats déjà pris (l'échantillonnage du plus loin d'abord)
  const parN = new Map();
  for (let v = 0; v < N.nb; v++) {
    if (!N.permis(v) || N.degage[v] < R.degageMin || surVolee(C, N.px[v], N.ph[v], N.pz[v])) continue;
    const k = N.niveau[v]; let A = parN.get(k); if (!A) parN.set(k, A = []); A.push(v);
  }
  for (const k of [...parN.keys()].sort((a, b) => a - b)) {
    const A = parN.get(k), dmin = new Float64Array(A.length).fill(Infinity);
    const maj = (w) => { for (let i = 0; i < A.length; i++) { const v = A[i], d = Math.hypot(N.px[v] - N.px[w], N.pz[v] - N.pz[w], (N.ph[v] - N.ph[w]) * 2); if (d < dmin[i]) dmin[i] = d; } };
    for (const w of L) if (N.niveau[w] === k) maj(w);
    for (let n = 0; n < R.parNiveau; n++) {
      let bi = -1, bd = 3;                                     // (rien à moins de 3 m d'un autre candidat)
      for (let i = 0; i < A.length; i++) if (dmin[i] > bd) { bd = dmin[i]; bi = i; }
      if (bi < 0) break;
      L.push(A[bi]); maj(A[bi]);
    }
  }
  _cands.set(N, { masque: N.masque, L });
  return L;
}

// ---------------------------------------------------------------- LA RÉAPPARITION (§ 3.8)
const _buf = new WeakMap();
export function choisirApparition(partie, acteur) {
  const N = navDe(partie.nav), R = REGLES_APPARITION;
  if (!N) return choisirSansGraphe(partie, acteur);
  const L = candidats(N);
  if (!L.length) return choisirSansGraphe(partie, acteur);
  const ennemis = partie.acteurs.filter((b) => b !== acteur && b.vivant && b.corps && b.role !== 'cible' && partie.ennemis(acteur, b));
  const allies = acteur.equipe ? partie.acteurs.filter((b) => b !== acteur && b.vivant && b.corps && b.equipe === acteur.equipe) : [];
  let B = _buf.get(N); if (!B) _buf.set(N, B = { a: new Float64Array(N.nb), b: new Float64Array(N.nb) });
  const B_ = partie.balistique || N.balistique;
  const yeux = ennemis.map((e) => { e.oeil(_o); return { x: _o.x, y: _o.y, z: _o.z, e }; });
  const voit = (v, o) => Math.hypot(o.x - N.px[v], o.z - N.pz[v]) <= R.vueMax && B_.vue(o.x, o.y, o.z, N.px[v], N.ph[v] + 1.6, N.pz[v]);
  const vuDeQuelquun = (v) => yeux.some((o) => voit(v, o));
  const melee = !acteur.equipe;
  // les distances à pied : depuis tous les ennemis (complet en chacun pour soi : on maximise le plus proche)
  const champE = ennemis.length ? N.champMulti(ennemis.map((e) => e.pos), melee ? Infinity : R.danger.portee + 10, B.a).slice() : null;
  if (melee) {
    // CHACUN POUR SOI : le plus loin à pied du plus proche ennemi, que personne ne voit — exactement (départage : l'ordre)
    const tri = L.map((v, i) => ({ v, i, d: champE ? champE[v] : Infinity })).sort((p, q) => (q.d === p.d ? p.i - q.i : (q.d > p.d ? 1 : -1)));
    for (const c of tri) if (!vuDeQuelquun(c.v)) return sortie(N, c.v, champE);
    return sortie(N, tri[0].v, champE);
  }
  // LES ÉQUIPES : la note
  const note = new Float64Array(L.length), interdit = new Uint8Array(L.length);
  if (allies.length) {
    const cA = N.champMulti(allies.map((b) => b.pos), R.allies.portee, B.b);
    for (let i = 0; i < L.length; i++) { const d = cA[L[i]]; if (d <= R.allies.portee) note[i] += R.allies.poids * (1 - d / R.allies.portee); }
  }
  for (let k = 0; k < ennemis.length; k++) {
    const cE = N.champMulti([ennemis[k].pos], R.danger.portee, B.b), o = yeux[k];
    for (let i = 0; i < L.length; i++) {
      const v = L[i], d = cE[v];
      if (!(d <= R.danger.portee)) continue;
      const vu = voit(v, o);
      if (vu && d < R.interditVu) interdit[i] = 1;
      note[i] -= R.danger.poids * (1 - d / R.danger.portee) * (vu ? R.danger.vue : 1);
    }
  }
  // les morts récentes (les événements de la partie : la place est chaude)
  for (const e of partie.evenements || []) {
    if (e.type !== 'elim' || partie.t - e.t > R.danger.mortsT) continue;
    for (let i = 0; i < L.length; i++) { const v = L[i], d = Math.hypot(N.px[v] - e.x, N.pz[v] - e.z, N.ph[v] - e.y); if (d <= R.danger.morts) note[i] -= R.danger.poids * (1 - d / R.danger.morts); }
  }
  const ordre = L.map((v, i) => i).filter((i) => !interdit[i] && !(champE && champE[L[i]] < 6));
  const pool = ordre.length ? ordre : L.map((v, i) => i).sort((p, q) => (champE ? champE[L[q]] - champE[L[p]] : 0)).slice(0, 1);
  pool.sort((p, q) => note[q] - note[p] || p - q);
  const top = pool.slice(0, R.meilleurs), i = top[partie.rng ? partie.rng.int(top.length) : 0];
  return sortie(N, L[i], champE);
}
function sortie(N, v, champE) {
  let lacet = champE ? lacetVers(N, champE, v) : null;
  if (lacet === null) lacet = lacetOuvert(N, v, null);
  return { x: N.px[v], y: N.ph[v], z: N.pz[v], lacet };
}
// (sans graphe : le lieu de la zone le plus loin, à vol d'oiseau, du plus proche ennemi vivant)
function choisirSansGraphe(partie, acteur) {
  const cands = pointsDe(partie.zone || 'ecole');
  const L = cands.length ? cands : POINTS_APPARITION;
  const ennemis = partie.acteurs.filter((b) => b !== acteur && b.vivant && b.corps && partie.ennemis(acteur, b));
  let best = L[0], bd = -1;
  for (const p of L) {
    let d = Infinity;
    for (const e of ennemis) d = Math.min(d, Math.hypot(e.pos.x - p.x, (e.pos.y - p.y) * 2, e.pos.z - p.z));
    if (d > bd) { bd = d; best = p; }
  }
  const q = poser(best.x, best.y, best.z) || best;
  return { x: q.x, y: q.y, z: q.z, lacet: 0 };
}

// ---------------------------------------------------------------- LES ANNEAUX de domination (§ 2.5)
// le nœud le plus proche de (x, y, z), à ≤ rayonMax, de dégagement ≥ degageMin, sur ce sol ; null s'il n'y en a pas
// (sans graphe : le point tel quel)
export function ramenerPoint(nav, x, y, z, o) {
  const { rayonMax = 3, degageMin = 1.5 } = o || {};
  const N = navDe(nav);
  if (!N) return { x, y, z };
  const v = noeudDegage(N, x, y, z, rayonMax, degageMin);
  return v >= 0 ? { x: N.px[v], y: N.ph[v], z: N.pz[v] } : null;
}

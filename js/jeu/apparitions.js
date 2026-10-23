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
//     × 3 s'ils VOIENT le point ; morts récentes à ≤ 8 m) ; jamais un point à moins de 20 m à pied d'un ennemi qui le voit,
//     ni à 6 m d'un ennemi, et de préférence un point qu'AUCUN ennemi ne voit (à 50 m : la tête ou le buste) ;
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
  meilleurs: 3, interditVu: 20, vueMax: 50, procheMin: 6,
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
// les nœuds des pièces de la zone de jeu (par leur RÉGION : un seuil suit sa pièce), en cache par graphe — en plus du masque
// du graphe : un départ ou une réapparition n'est jamais hors de la zone, même quand le masque permet plus (relecture : sous
// le monde du squelette, tout permis, les bots du −1 réapparaissaient au 2e)
const _zones = new WeakMap();
function dansZone(N, zoneJeu) {
  let M = _zones.get(N); if (!M) _zones.set(N, M = new Map());
  let Z = M.get(zoneJeu || 'ecole');
  if (!Z) { Z = N.masquePieces(piecesDe(zoneJeu || 'ecole')); M.set(zoneJeu || 'ecole', Z); }
  return Z;
}
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
// `n` points d'un camp, à 1,5 m l'un de l'autre, dégagés (≥ 0,75 m), sur des nœuds hors des volées, tournés vers le chemin
// du camp d'en face. Les deux camps sont tirés ENSEMBLE (à tour de rôle, le meilleur candidat de chacun : le plus proche
// à pied de la base de son camp, pénalisé de 1,5 × ce dont il s'avance vers la base adverse), chaque point à 15 m à pied
// au moins de tous ceux de l'autre camp — un appel pour A et un pour B rendent donc les mêmes deux camps (le tirage ne
// dépend que de la zone et du graphe ; au moins DEPARTS_N points par camp, les `n` premiers rendus). Une salle de classe
// pleine de tables (la S 1.3 des étages, la salle 1 du 2e) n'a qu'un nœud dégagé : le camp déborde alors dans le couloir
// voisin. Les passes : PASSES (dégagés près de la base d'abord), essayées à CHAQUE prise : les k premières prises de chaque
// camp ne dépendent pas du nombre tiré, un appel à 4 et un à 9 rendent deux camps qui se tiennent (relecture : le nombre
// était dans la clé du cache, deux appels de `n` différents au-delà de 6 tiraient deux fois — deux camps de deux tirages,
// sans garantie des 15 m). (`nav` facultatif : à défaut, le graphe des humains de la partie qui se prépare ; `rng` : la
// graine de la partie — le tirage est déterministe, il n'en tire rien.)
const DEPARTS_N = 6, SEPARATION = 15;
const _departs = new WeakMap();
export function departs(zoneJeu, equipe, n, rng, nav = null) {
  const Z = ZONES_JEU[zoneJeu] || ZONES_JEU.ecole, N = navDe(nav);
  if (!N) return departsSansGraphe(Z, equipe, n);
  const D = Z.departs || {}, deux = (equipe === 'A' || equipe === 'B') && D.A && D.B;
  const K = Math.max(DEPARTS_N, n);
  let pris;
  if (deux) {
    let M = _departs.get(N); if (!M) _departs.set(N, M = new Map());
    let J = M.get(zoneJeu);
    if (!J || J.masque !== N.masque || J.K < K) { J = departsDeux(N, D, K, dansZone(N, zoneJeu)); if (J) { J.masque = N.masque; J.K = K; M.set(zoneJeu, J); } }
    pris = J ? J[equipe] : null;
    // (un combat à deux camps : les champs des points de réapparition calculés en tâche de fond dès maintenant — pendant la
    // présentation et le décompte, avant la première mort)
    preparerChamps(N, candidats(N, zoneJeu));
  } else pris = departsUn(N, (D[equipe] || D.A || D.chasseurs || [[14.88, 0, -3.12]]), K, dansZone(N, zoneJeu));
  if (!pris || !pris.length) return departsSansGraphe(Z, equipe, n);
  pris = pris.slice(0, n);
  while (pris.length < n) pris.push(pris[pris.length % Math.max(1, pris.length)]);
  const autre = equipe === 'A' ? D.B : equipe === 'B' ? D.A : null;
  let champE = null;
  if (autre && autre.length) { const E = autre.map((b) => N.noeudPres(b[0], b[1], b[2], 4)).filter((v) => v >= 0); if (E.length) champE = N.champMulti(E, Infinity); }
  return pris.map((v) => {
    let lacet = champE ? lacetVers(N, champE, v) : null;
    if (lacet === null && autre && autre[0]) lacet = Math.atan2(-(autre[0][0] - N.px[v]), -(autre[0][2] - N.pz[v]));
    if (lacet === null) lacet = lacetOuvert(N, v, rng);
    return { x: N.px[v], y: N.ph[v], z: N.pz[v], lacet };
  });
}
// les nœuds de base d'un camp (le plus proche dégagé à ≤ 4 m, sinon le plus proche)
function basesDe(N, base) {
  const R = REGLES_APPARITION, L = [];
  for (const b of base) {
    let v = noeudDegage(N, b[0], b[1], b[2], 4, R.degageMin);
    if (v < 0) v = N.noeudPres(b[0], b[1], b[2], 4);
    if (v >= 0 && !L.includes(v)) L.push(v);
  }
  return L;
}
// les candidats d'un camp, triés : à ≤ 30 m à pied de sa base, la distance plus 1,5 × l'avance vers la base adverse
function candidatsCamp(N, bases, adverses, Z) {
  const P = N.champMulti(bases, 30).slice();
  let E = null, e0 = 0;
  if (adverses && adverses.length) { E = N.champMulti(adverses, Infinity).slice(); e0 = Math.min(...bases.map((v) => E[v])); }
  const L = [];
  for (let v = 0; v < N.nb; v++) if (P[v] <= 30 && Z[v] && !surVolee(N.C, N.px[v], N.ph[v], N.pz[v])) L.push([P[v] + (E && Number.isFinite(E[v]) ? 1.5 * Math.max(0, e0 - E[v]) : 0), v]);
  L.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const R = L.map((c) => c[1]); R.P = P;
  return R;
}
// les passes : dégagés de 0,75 m à ≤ 12 m à pied de la base, puis de 0,5 m à ≤ 12 m (près de sa base plutôt que dégagé au
// loin : dans la sas du −1, deux nœuds seulement ont 0,75 m), puis jusqu'à 30 m, puis n'importe quel nœud
const PASSES = [[0.75, 12], [0.5, 12], [0.75, 30], [0.5, 30], [0, 30]];
const espaceOk = (N, pris, v) => pris.every((w) => Math.hypot(N.px[w] - N.px[v], N.pz[w] - N.pz[v]) >= REGLES_APPARITION.espacement || Math.abs(N.ph[w] - N.ph[v]) > 1.5);
// UN camp seul (les chasseurs du prop hunt)
function departsUn(N, base, K, Z) {
  const B = basesDe(N, base); if (!B.length) return null;
  const L = candidatsCamp(N, B, null, Z), pris = [];
  for (const [dMin, rMax] of PASSES) {
    for (const v of L) { if (pris.length >= K) break; if (N.degage[v] >= dMin && L.P[v] <= rMax && !pris.includes(v) && espaceOk(N, pris, v)) pris.push(v); }
    if (pris.length >= K) break;
  }
  return pris;
}
// LES DEUX camps, à tour de rôle, à ≥ 15 m à pied l'un de l'autre ; chaque prise prend le premier candidat de la première
// passe qui en a un (une prise ne dépend que des prises d'avant : les k premières sont les mêmes quel que soit K)
function departsDeux(N, D, K, Z) {
  const bA = basesDe(N, D.A), bB = basesDe(N, D.B);
  if (!bA.length || !bB.length) return null;
  const S = { A: { L: candidatsCamp(N, bA, bB, Z), pris: [] }, B: { L: candidatsCamp(N, bB, bA, Z), pris: [] } };
  // (la distance à pied aux points déjà pris de chaque camp, bornée à 15 m, tenue à jour à chaque prise)
  const pres = { A: new Float64Array(N.nb).fill(Infinity), B: new Float64Array(N.nb).fill(Infinity) }, tmp = new Float64Array(N.nb);
  const prendre = (cote, v) => {
    S[cote].pris.push(v);
    const F = N.champMulti([v], SEPARATION, tmp), M = pres[cote];
    for (let i = 0; i < N.nb; i++) if (F[i] < M[i]) M[i] = F[i];
  };
  // (F2, le test F2 de L-D, la vraie vue de L-A : un départ que voit un départ de l'autre camp — œil à œil, 1,62 m — n'est pris
  // qu'en dernier recours ; au RDC + rue, deux paires se voyaient à travers le hall)
  const B_ = N.balistique || null, H = 1.62;
  const vuDe = (v, L) => !!B_ && L.some((w) => B_.vue(N.px[v], N.ph[v] + H, N.pz[v], N.px[w], N.ph[w] + H, N.pz[w]));
  for (let tour = 0; tour < K; tour++) {
    for (const cote of ['A', 'B']) {
      const c = S[cote], autre = pres[cote === 'A' ? 'B' : 'A'], prisAutre = S[cote === 'A' ? 'B' : 'A'].pris;
      let v0 = -1, vVu = -1;
      for (const [dMin, rMax] of PASSES) {
        for (const v of c.L) {
          if (N.degage[v] < dMin || c.L.P[v] > rMax || c.pris.includes(v) || !(autre[v] >= SEPARATION) || !espaceOk(N, c.pris, v)) continue;
          if (vuDe(v, prisAutre)) { if (vVu < 0) vVu = v; continue; }
          v0 = v; break;
        }
        if (v0 >= 0) break;
      }
      if (v0 < 0) v0 = vVu;
      if (v0 >= 0) prendre(cote, v0);
    }
  }
  return { A: S.A.pris, B: S.B.pris };
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
// L'entrée du cache : { masque, L (les nœuds), champs (le champ VERS chacun, quand il est calculé), complet }
const _cands = new WeakMap();
function candidats(N, zoneJeu) {
  let M = _cands.get(N); if (!M) _cands.set(N, M = new Map());
  const K = M.get(zoneJeu || 'ecole');
  if (K && K.masque === N.masque) return K;
  const R = REGLES_APPARITION, C = N.C, L = [], Z = dansZone(N, zoneJeu);
  // les 20 lieux (ramenés au nœud dégagé à ≤ 3 m)
  for (const q of POINTS_APPARITION) {
    let v = noeudDegage(N, q.x, q.y, q.z, 3, R.degageMin);
    if (v < 0) v = N.noeudPres(q.x, q.y, q.z, 3);
    if (v >= 0 && N.permis(v) && Z[v] && !L.includes(v)) L.push(v);
  }
  // ≈ 12 par niveau, les plus éloignés des candidats déjà pris (l'échantillonnage du plus loin d'abord)
  const parN = new Map();
  for (let v = 0; v < N.nb; v++) {
    if (!N.permis(v) || !Z[v] || N.degage[v] < R.degageMin || surVolee(C, N.px[v], N.ph[v], N.pz[v])) continue;
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
  const E = { masque: N.masque, L, champs: new Array(L.length).fill(null), complet: false };
  M.set(zoneJeu || 'ecole', E);
  return E;
}

// LES CHAMPS DES CANDIDATS (§ 3.8 : « champs de Dijkstra par point, en cache ») : pour chaque candidat, la distance à pied
// de chaque nœud JUSQU'À lui (Nav.champVers, le graphe à rebours : le chemin qu'un ennemi posé là ferait pour y venir) —
// une réapparition ne fait plus que LIRE (relecture : six Dijkstra et ≈ 150 rayons par réapparition, 10 à 25 ms d'un seul
// pas : un à-coup à chaque mort). Calculés EN TÂCHE DE FOND (Nav.fond : 1 500 nœuds par pas, à l'étape 9) dès que la partie
// tire ses départs, donc pendant la présentation et le décompte (52 champs, ≈ 300 pas) ; avant qu'ils soient tous là, la
// réapparition calcule comme avant (Dijkstra bornés depuis les acteurs). ≈ 3,7 Mo par graphe (52 × 8 904 × 8 octets).
function* calculerChamps(N, K) {
  for (let i = 0; i < K.L.length; i++) {
    if (K.champs[i]) continue;
    const it = N.champVersPar(K.L[i]);
    let r = it.next();
    while (!r.done) { yield; r = it.next(); }
    if (K.masque !== N.masque) return;
    K.champs[i] = r.value;
    yield;
  }
  K.complet = true;
}
function preparerChamps(N, K) { if (!K.complet && !N.enFond) N.fond(calculerChamps(N, K)); }
// (les tests, et qui veut les champs tout de suite : calculés d'un bloc)
export function completerChampsApparition(nav, zoneJeu = 'ecole') {
  const N = navDe(nav); if (!N) return 0;
  const K = candidats(N, zoneJeu);
  for (let i = 0; i < K.L.length; i++) if (!K.champs[i]) K.champs[i] = N.champVers(K.L[i]);
  K.complet = true;
  return K.L.length;
}

// (les candidats de la réapparition du graphe, de son masque et de la zone de jeu : nœuds — les tests)
export function candidatsApparition(nav, zoneJeu = 'ecole') { const N = navDe(nav); return N ? candidats(N, zoneJeu).L.slice() : []; }

// ---------------------------------------------------------------- LA RÉAPPARITION (§ 3.8)
const _buf = new WeakMap();
export function choisirApparition(partie, acteur) {
  const N = navDe(partie.nav), R = REGLES_APPARITION;
  if (!N) return choisirSansGraphe(partie, acteur);
  const K = candidats(N, partie.zone), L = K.L;
  if (!L.length) return choisirSansGraphe(partie, acteur);
  preparerChamps(N, K);
  const ennemis = partie.acteurs.filter((b) => b !== acteur && b.vivant && b.corps && b.role !== 'cible' && partie.ennemis(acteur, b));
  const allies = acteur.equipe ? partie.acteurs.filter((b) => b !== acteur && b.vivant && b.corps && b.equipe === acteur.equipe) : [];
  const B_ = partie.balistique || N.balistique;
  const yeux = ennemis.map((e) => { e.oeil(_o); return { x: _o.x, y: _o.y, z: _o.z, e }; });
  // (« voit » : l'œil d'un ennemi, à ≤ 50 m, voit la tête (1,6 m) ou le buste (0,9 m) d'un acteur posé là — ce que la partie
  // vérifie avant de prendre le point, js/jeu/partie_fps.js : un point vu au buste seul était refusé par elle)
  const voit = (v, o) => Math.hypot(o.x - N.px[v], o.z - N.pz[v]) <= R.vueMax &&
    (B_.vue(o.x, o.y, o.z, N.px[v], N.ph[v] + 1.6, N.pz[v]) || B_.vue(o.x, o.y, o.z, N.px[v], N.ph[v] + 0.9, N.pz[v]));
  const vuDeQuelquun = (v) => yeux.some((o) => voit(v, o));
  // (un ennemi à moins de 6 m à vol d'oiseau, la hauteur comptée double — un autre étage est loin)
  const colle = (v) => ennemis.some((e) => Math.hypot(e.pos.x - N.px[v], (e.pos.y - N.ph[v]) * 2, e.pos.z - N.pz[v]) < R.procheMin);
  const melee = !acteur.equipe, nC = L.length;
  // LES DISTANCES À PIED : dE[i] celle du plus proche ennemi, dA[i] celle du plus proche allié, dK(i, k) celle de l'ennemi k
  // (au-delà de 20 m, Infinity suffit) — lues dans les champs des candidats quand ils sont là, sinon calculées comme avant
  const dE = new Float64Array(nC).fill(Infinity), dA = new Float64Array(nC).fill(Infinity);
  let dK, lacetDe;
  if (K.complet) {
    const nE = ennemis.map((e) => N._noeud(e.pos)), nA = allies.map((b) => N._noeud(b.pos));
    for (let i = 0; i < nC; i++) {
      const F = K.champs[i];
      for (const u of nE) if (u >= 0 && F[u] < dE[i]) dE[i] = F[u];
      for (const u of nA) if (u >= 0 && F[u] < dA[i]) dA[i] = F[u];
    }
    dK = (i, k) => (nE[k] >= 0 ? K.champs[i][nE[k]] : Infinity);
    lacetDe = (i) => lacetVersEnnemi(N, K.champs[i], L[i], nE);
  } else {
    let B = _buf.get(N); if (!B) _buf.set(N, B = { a: new Float64Array(N.nb), b: new Float64Array(N.nb) });
    // (depuis tous les ennemis — complet en chacun pour soi, on y maximise le plus proche ; un champ par ennemi, borné à 20 m)
    const champE = ennemis.length ? N.champMulti(ennemis.map((e) => e.pos), melee ? Infinity : R.danger.portee + 10, B.a).slice() : null;
    if (champE) for (let i = 0; i < nC; i++) dE[i] = champE[L[i]];
    if (allies.length) { const cA = N.champMulti(allies.map((b) => b.pos), R.allies.portee, B.b); for (let i = 0; i < nC; i++) dA[i] = cA[L[i]]; }
    const parE = melee ? [] : ennemis.map((e) => { const c = N.champMulti([e.pos], R.danger.portee, B.b); return L.map((v) => c[v]); });
    dK = (i, k) => parE[k][i];
    lacetDe = (i) => (champE ? lacetVers(N, champE, L[i]) : null);
  }
  const sortie = (i) => {
    const v = L[i];
    let lacet = lacetDe(i);
    if (lacet === null) lacet = lacetOuvert(N, v, null);
    return { x: N.px[v], y: N.ph[v], z: N.pz[v], lacet };
  };
  if (melee) {
    // CHACUN POUR SOI : le plus loin à pied du plus proche ennemi, que personne ne voit — exactement (départage : l'ordre)
    const tri = L.map((v, i) => i).sort((p, q) => (dE[q] === dE[p] ? p - q : (dE[q] > dE[p] ? 1 : -1)));
    for (const i of tri) if (!vuDeQuelquun(L[i])) return sortie(i);
    return sortie(tri[0]);
  }
  // LES ÉQUIPES : la note
  const note = new Float64Array(nC), interdit = new Uint8Array(nC);
  for (let i = 0; i < nC; i++) if (dA[i] <= R.allies.portee) note[i] += R.allies.poids * (1 - dA[i] / R.allies.portee);
  for (let k = 0; k < ennemis.length; k++) {
    const o = yeux[k];
    for (let i = 0; i < nC; i++) {
      const d = dK(i, k);
      if (!(d <= R.danger.portee)) continue;
      const vu = voit(L[i], o);
      if (vu && d < R.interditVu) interdit[i] = 1;
      note[i] -= R.danger.poids * (1 - d / R.danger.portee) * (vu ? R.danger.vue : 1);
    }
  }
  // les morts récentes (la place est chaude)
  for (const e of mortsDe(partie)) {
    for (let i = 0; i < nC; i++) { const v = L[i], d = Math.hypot(N.px[v] - e.x, N.pz[v] - e.z, N.ph[v] - e.y); if (d <= R.danger.morts) note[i] -= R.danger.poids * (1 - d / R.danger.morts); }
  }
  const ordre = L.map((v, i) => i).filter((i) => !interdit[i] && !(dE[i] < R.procheMin) && !colle(L[i]));
  ordre.sort((p, q) => note[q] - note[p] || p - q);
  // (et de ceux-là, les 3 mieux notés qu'AUCUN ennemi ne voit, même à plus de 20 m à pied — vu de loin, on meurt en
  // apparaissant ; la règle du § 3.8 reste le plancher quand tout est vu. La vue n'est essayée que dans l'ordre des notes,
  // jusqu'à 3 : une cinquantaine de rayons au lieu de 400)
  const caches = [];
  for (const i of ordre) { if (!vuDeQuelquun(L[i])) { caches.push(i); if (caches.length >= R.meilleurs) break; } }
  const loin = (p, q) => (dE[p] === dE[q] ? p - q : dE[q] > dE[p] ? 1 : -1);
  const pool = caches.length ? caches : ordre.length ? ordre : L.map((v, i) => i).sort(loin).slice(0, 1);
  const top = pool.slice(0, R.meilleurs), i = top[partie.rng ? partie.rng.int(top.length) : 0];
  return sortie(i);
}
// le lacet du candidat v vers le plus proche ennemi, par le chemin : de l'ennemi, en descendant le champ VERS v, jusqu'à
// 4,5 m de v — on regarde d'où il viendra ; null si aucun ennemi n'est atteignable
function lacetVersEnnemi(N, F, v, nE) {
  let u = -1, du = Infinity;
  for (const w of nE) if (w >= 0 && F[w] < du) { du = F[w]; u = w; }
  if (u < 0 || u === v) return null;
  for (let s = 0; s < 4000 && F[u] > 4.5; s++) {
    let best = u;
    for (let j = N.debut[u]; j < N.debut[u + 1]; j++) { const w = N.liens[j]; if (F[w] < F[best]) best = w; }
    if (best === u) break;
    u = best;
  }
  if (Math.hypot(N.px[u] - N.px[v], N.pz[u] - N.pz[v]) < 1e-6) return null;
  return Math.atan2(-(N.px[u] - N.px[v]), -(N.pz[u] - N.pz[v]));
}
// les morts récentes d'une partie (relecture : l'anneau de 256 événements de la partie ne couvre que 3 s d'un combat nourri
// — tirs, pas, impacts —, pas les 10 s du § 3.8) : abonnées à 'elim' au premier appel, amorcées par ce que l'anneau garde
const _morts = new WeakMap();
function mortsDe(partie) {
  let M = _morts.get(partie);
  if (!M) {
    M = (partie.evenements || []).filter((e) => e.type === 'elim').map((e) => ({ x: e.x, y: e.y, z: e.z, t: e.t }));
    if (partie.sur) partie.sur('elim', (e) => { M.push({ x: e.x, y: e.y, z: e.z, t: e.t }); });
    _morts.set(partie, M);
  }
  while (M.length && partie.t - M[0].t > REGLES_APPARITION.danger.mortsT) M.shift();
  return M;
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
// Les pauses du −1 et du 1er (les anneaux B et C) sont meublées : aucun nœud n'y a 1,5 m de dégagement à 8 m à la ronde
// (mesuré : 1,0 au mieux). Plutôt que null (une domination sans anneau), le dégagement demandé est alors RELÂCHÉ — le nœud
// le plus dégagé à ≤ rayonMax, le plus proche à dégagement égal — et le rendu le dit : { x, y, z, degage, releve: vrai }.
// null seulement s'il n'y a aucun nœud à ≤ rayonMax.
export function ramenerPoint(nav, x, y, z, o) {
  const { rayonMax = 3, degageMin = 1.5 } = o || {};
  const N = navDe(nav);
  if (!N) return { x, y, z };
  let v = noeudDegage(N, x, y, z, rayonMax, degageMin), releve = false;
  if (v < 0) {
    let bd = -1, bdist = Infinity;
    for (const w of N.dans(x, y, z, rayonMax, [], 0.6)) {
      const d = Math.hypot(N.px[w] - x, N.pz[w] - z);
      if (N.degage[w] > bd || (N.degage[w] === bd && d < bdist)) { bd = N.degage[w]; bdist = d; v = w; }
    }
    releve = true;
  }
  return v >= 0 ? { x: N.px[v], y: N.ph[v], z: N.pz[v], degage: N.degage[v], releve } : null;
}

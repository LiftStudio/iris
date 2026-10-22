// =====================================================================
//  LES APPARITIONS — squelette du socle S0 (22/10), rempli par le lot L-D
// =====================================================================
// Où l'on apparaît (spec §§ 3.8, 4.5.11) : les 20 lieux de carte_monde § 8 (le nœud le plus dégagé de chaque zone), les
// départs des camps (ZONES_JEU, js/jeu/constantes.js) espacés de 1,5 m, la réapparition en cours de partie (près des
// alliés, loin des ennemis à pied, vue de personne ; chacun pour soi : le plus loin à pied du plus proche ennemi), les
// anneaux de domination ramenés au graphe. Le squelette : départs aux points des zones (décalés de 1,5 m, sortis des murs),
// réapparition au point de la zone le plus loin À VOL D'OISEAU des ennemis, `ramenerPoint` = le point tel quel.
import { ZONES_JEU, PIECES } from './constantes.js';
import { Player } from '../player.js';

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
  { zone: 'rue', x: 15.63, y: 0, z: 9.38, degage: 2.0 },
];
// les pièces d'une zone de jeu (Set), et les lieux qui y sont
export function piecesDe(zoneJeu) {
  const Z = ZONES_JEU[zoneJeu];
  return new Set(!Z || Z.pieces === '*' ? PIECES : Z.pieces);
}
export function pointsDe(zoneJeu) { const P = piecesDe(zoneJeu); return POINTS_APPARITION.filter((p) => P.has(p.zone)); }

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

// LES DÉPARTS d'un camp : `n` points espacés de 1,5 m autour des points de la zone, tournés vers le camp d'en face
export function departs(zoneJeu, equipe, n, rng) {
  const Z = ZONES_JEU[zoneJeu] || ZONES_JEU.ecole;
  const base = (Z.departs && Z.departs[equipe]) || (Z.departs && (Z.departs.A || Z.departs.chasseurs)) || [[14.88, 0, -3.12]];
  const autre = Z.departs && (equipe === 'A' ? Z.departs.B : Z.departs.A);
  const vise = autre && autre[0] ? autre[0] : null;
  const out = [];
  for (let k = 0; out.length < n && k < OFFSETS.length * base.length; k++) {
    const b = base[k % base.length], o = OFFSETS[Math.floor(k / base.length)];
    const p = poser(b[0] + o[0], b[1], b[2] + o[1]);
    if (!p || out.some((q) => Math.hypot(q.x - p.x, q.z - p.z) < 1.2)) continue;
    const lacet = vise ? Math.atan2(-(vise[0] - p.x), -(vise[2] - p.z)) : 0;
    out.push({ x: p.x, y: p.y, z: p.z, lacet });
  }
  while (out.length < n) { const b = base[out.length % base.length]; out.push({ x: b[0], y: b[1], z: b[2], lacet: 0 }); }
  return out;
}

// LA RÉAPPARITION (squelette) : le lieu de la zone le plus loin, à vol d'oiseau, du plus proche ennemi vivant
export function choisirApparition(partie, acteur) {
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

// un anneau de domination ramené au nœud le plus proche (squelette : le point tel quel)
export function ramenerPoint(nav, x, y, z, o) { return { x, y, z }; }
